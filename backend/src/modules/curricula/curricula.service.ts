import { and, desc, eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { attachments, classes, courses, curricula, curriculumClasses } from '@/db/schema';
import {
  curriculaOfClasses,
  filesOf,
  findAccessibleCurriculum,
  visibilityConditions,
} from './curricula.access';
import { CurriculumFilesService } from './curricula.files.service';
import { assertClassesInSubSchool, assertCourseInSubSchool } from './curricula.validation';
import type {
  CreateCurriculumDto,
  ListCurriculaQuery,
  UpdateCurriculumDto,
} from './curricula.schema';
import type {
  CurriculumClass,
  CurriculumDetail,
  CurriculumRecord,
  CurriculumSummary,
  CurriculumViewer,
} from './curricula.types';

export class CurriculaService {
  private readonly files = new CurriculumFilesService();

  async list(
    viewer: CurriculumViewer,
    filters: ListCurriculaQuery = {},
  ): Promise<CurriculumSummary[]> {
    const conditions = visibilityConditions(viewer);
    if (!conditions) return [];

    // Only managers see drafts, so only they may filter on the status.
    if (viewer.kind === 'manager' && filters.status) {
      conditions.push(eq(curricula.status, filters.status));
    }
    if (filters.classId) {
      conditions.push(inArray(curricula.id, curriculaOfClasses([filters.classId])));
    }
    if (filters.courseId) conditions.push(eq(curricula.courseId, filters.courseId));
    if (filters.schoolYear) conditions.push(eq(curricula.schoolYear, filters.schoolYear));
    if (filters.type) conditions.push(eq(curricula.type, filters.type));

    const rows = await db
      .select()
      .from(curricula)
      .where(and(...conditions))
      .orderBy(desc(curricula.schoolYear), curricula.title);

    const [summaries, fileCounts] = await Promise.all([
      this.withLinks(rows),
      this.files.countByCurriculum(rows.map((row) => row.id)),
    ]);

    return summaries.map((summary) => ({
      ...summary,
      fileCount: fileCounts.get(summary.id) ?? 0,
    }));
  }

  async findById(id: string, viewer: CurriculumViewer): Promise<CurriculumDetail> {
    const record = await findAccessibleCurriculum(id, viewer);
    const [[summary], files] = await Promise.all([this.withLinks([record]), this.files.list(id)]);

    return { ...summary, fileCount: files.length, files };
  }

  async create(
    subSchoolId: string,
    userId: string,
    input: CreateCurriculumDto,
  ): Promise<CurriculumDetail> {
    const created = await db.transaction(async (tx) => {
      await assertClassesInSubSchool(tx, subSchoolId, input.classIds);
      if (input.courseId) await assertCourseInSubSchool(tx, subSchoolId, input.courseId);

      const [record] = await tx
        .insert(curricula)
        .values({
          subSchoolId,
          title: input.title,
          description: input.description,
          type: input.type,
          courseId: input.courseId,
          schoolYear: input.schoolYear,
          createdBy: userId,
        })
        .returning();

      await tx
        .insert(curriculumClasses)
        .values(input.classIds.map((classId) => ({ curriculumId: record.id, classId })));

      return record;
    });

    return this.findById(created.id, { kind: 'manager', subSchoolId });
  }

  async update(
    id: string,
    subSchoolId: string,
    input: UpdateCurriculumDto,
  ): Promise<CurriculumDetail> {
    await findAccessibleCurriculum(id, { kind: 'manager', subSchoolId });

    await db.transaction(async (tx) => {
      if (input.classIds) await assertClassesInSubSchool(tx, subSchoolId, input.classIds);
      if (input.courseId) await assertCourseInSubSchool(tx, subSchoolId, input.courseId);

      const { classIds, ...fields } = input;

      await tx
        .update(curricula)
        .set({ ...fields, updatedAt: new Date() })
        .where(and(eq(curricula.id, id), eq(curricula.subSchoolId, subSchoolId)));

      if (classIds) {
        await tx.delete(curriculumClasses).where(eq(curriculumClasses.curriculumId, id));
        await tx
          .insert(curriculumClasses)
          .values(classIds.map((classId) => ({ curriculumId: id, classId })));
      }
    });

    return this.findById(id, { kind: 'manager', subSchoolId });
  }

  async setStatus(
    id: string,
    subSchoolId: string,
    status: CurriculumRecord['status'],
  ): Promise<CurriculumDetail> {
    const record = await findAccessibleCurriculum(id, { kind: 'manager', subSchoolId });

    // Publishing twice must keep the original publication date.
    if (record.status !== status) {
      await db
        .update(curricula)
        .set({
          status,
          publishedAt: status === 'published' ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(and(eq(curricula.id, id), eq(curricula.subSchoolId, subSchoolId)));
    }

    return this.findById(id, { kind: 'manager', subSchoolId });
  }

  async remove(id: string, subSchoolId: string): Promise<void> {
    await findAccessibleCurriculum(id, { kind: 'manager', subSchoolId });

    // `attachments` is polymorphic, so no foreign key cascades to it: its rows
    // go in the same transaction, and the S3 objects once the rows are gone.
    const keys = await db.transaction(async (tx) => {
      const removed = await tx
        .delete(attachments)
        .where(filesOf(id))
        .returning({ key: attachments.key });
      await tx
        .delete(curricula)
        .where(and(eq(curricula.id, id), eq(curricula.subSchoolId, subSchoolId)));
      return removed.map((row) => row.key);
    });

    await this.files.deleteObjects(keys);
  }

  /** Adds the linked classes and course, which every screen shows next to the title. */
  private async withLinks(
    rows: CurriculumRecord[],
  ): Promise<Omit<CurriculumSummary, 'fileCount'>[]> {
    if (rows.length === 0) return [];

    const ids = rows.map((row) => row.id);
    const courseIds = [
      ...new Set(rows.map((row) => row.courseId).filter((id): id is string => !!id)),
    ];

    const [classLinks, courseRows] = await Promise.all([
      db
        .select({
          curriculumId: curriculumClasses.curriculumId,
          id: classes.id,
          name: classes.name,
          gradeLevel: classes.gradeLevel,
        })
        .from(curriculumClasses)
        .innerJoin(classes, eq(classes.id, curriculumClasses.classId))
        .where(inArray(curriculumClasses.curriculumId, ids))
        .orderBy(classes.name),
      courseIds.length
        ? db
            .select({ id: courses.id, name: courses.name, code: courses.code })
            .from(courses)
            .where(inArray(courses.id, courseIds))
        : Promise.resolve([]),
    ]);

    const classesByCurriculum = new Map<string, CurriculumClass[]>();
    for (const { curriculumId, ...klass } of classLinks) {
      const list = classesByCurriculum.get(curriculumId) ?? [];
      list.push(klass);
      classesByCurriculum.set(curriculumId, list);
    }

    return rows.map((row) => ({
      ...row,
      classes: classesByCurriculum.get(row.id) ?? [],
      course: courseRows.find((course) => course.id === row.courseId) ?? null,
    }));
  }
}
