import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { courses } from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';
import type { CreateCourseDto, UpdateCourseDto } from './courses.schema';

export type CourseRecord = typeof courses.$inferSelect;

export class CoursesService {
  async findAll(subSchoolId: string): Promise<CourseRecord[]> {
    return db
      .select()
      .from(courses)
      .where(eq(courses.subSchoolId, subSchoolId));
  }

  async findById(id: string, subSchoolId: string): Promise<CourseRecord> {
    const [course] = await db
      .select()
      .from(courses)
      .where(
        and(
          eq(courses.id, id),
          eq(courses.subSchoolId, subSchoolId),
        ),
      );

    if (!course) {
      throw new AppError('NOT_FOUND', 'Cours introuvable', 404);
    }

    return course;
  }

  async create(input: CreateCourseDto): Promise<CourseRecord> {
    const [course] = await db
      .insert(courses)
      .values({
        name: input.name,
        code: input.code,
        description: input.description,
        credits: input.credits,
        subSchoolId: input.subSchoolId,
      })
      .returning();

    return course;
  }

  async update(
    id: string,
    subSchoolId: string,
    input: UpdateCourseDto,
  ): Promise<CourseRecord> {
    await this.findById(id, subSchoolId);

    const [course] = await db
      .update(courses)
      .set({
        ...input,
      })
      .where(
        and(
          eq(courses.id, id),
          eq(courses.subSchoolId, subSchoolId),
        ),
      )
      .returning();

    return course;
  }

  async remove(id: string, subSchoolId: string): Promise<void> {
    await this.findById(id, subSchoolId);
    await db.delete(courses).where(
      and(
        eq(courses.id, id),
        eq(courses.subSchoolId, subSchoolId),
      ),
    );
  }
}
