import {
  and,
  eq
} from 'drizzle-orm';
import { db } from '@/db';
import {
  classCourses,
  classes
} from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';
import type {
  CreateClassCourseDto,
  CreateClassDto,
  UpdateClassDto
} from './classes.schema';

export type ClassRecord = typeof classes.$inferSelect;
export type ClassCourseRecord = typeof classCourses.$inferSelect;

export class ClassesService {
  async findAll(subSchoolId: string): Promise<ClassRecord[]> {
    return db
      .select()
      .from(classes)
      .where(eq(classes.subSchoolId, subSchoolId));
  }

  async findByClass(classId: string): Promise<ClassCourseRecord[]> {
    return db.select().from(classCourses).where(eq(classCourses.classId, classId));
  }

  async findById(id: string, subSchoolId: string): Promise<ClassRecord> {
    const [classRecord] = await db
      .select()
      .from(classes)
      .where(
        and(
          eq(classes.id, id),
          eq(classes.subSchoolId, subSchoolId),
        ),
      );

    if (!classRecord) {
      throw new AppError('NOT_FOUND', 'Classe introuvable', 404);
    }

    return classRecord;
  }

  async create(input: CreateClassDto): Promise<ClassRecord> {
    const [classRecord] = await db
      .insert(classes)
      .values({
        name: input.name,
        gradeLevel: input.gradeLevel,
        capacity: input.capacity,
        subSchoolId: input.subSchoolId,
      })
      .returning();

    return classRecord;
  }

  async createClassCourse(input: CreateClassCourseDto): Promise<ClassCourseRecord> {
    const [record] = await db
        .insert(classCourses)
        .values({ classId: input.classId, courseId: input.courseId })
        .returning();

    return record;
  }

  async update(
    id: string,
    subSchoolId: string,
    input: UpdateClassDto,
  ): Promise<ClassRecord> {
    await this.findById(id, subSchoolId);

    const [classRecord] = await db
      .update(classes)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(classes.id, id),
          eq(classes.subSchoolId, subSchoolId),
        ),
      )
      .returning();

    return classRecord;
  }

  async remove(id: string, subSchoolId: string): Promise<void> {
    await this.findById(id, subSchoolId);
    await db.delete(classes).where(
      and(
        eq(classes.id, id),
        eq(classes.subSchoolId, subSchoolId),
      ),
    );
  }

  async removeClassCourse(id: string): Promise<void> {
    const [existing] = await db.select().from(classCourses).where(eq(classCourses.id, id));
    if (!existing) {
      throw new AppError('NOT_FOUND', 'Association classe-cours introuvable', 404);
    }

    await db.delete(classCourses).where(eq(classCourses.id, id));
  }

  async getExpectedCourseIds(classId: string): Promise<string[]> {
    const rows = await this.findByClass(classId);
    return rows.map((r) => r.courseId);
  }
}
