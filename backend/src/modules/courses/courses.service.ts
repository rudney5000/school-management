import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import {courseResources, courses} from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';
import type {CreateCourseDto, CreateCourseResourceDto, UpdateCourseDto} from './courses.schema';

export type CourseRecord = typeof courses.$inferSelect;
export type CourseResourceRecord = typeof courseResources.$inferSelect;

export class CoursesService {
  async findAll(subSchoolId: string): Promise<CourseRecord[]> {
    return db
      .select()
      .from(courses)
      .where(eq(courses.subSchoolId, subSchoolId));
  }

  async findAllByCourse(courseId: string): Promise<CourseResourceRecord[]> {
    return db
        .select()
        .from(courseResources)
        .where(
            eq(courseResources.courseId, courseId)
        );
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
        icon: input.icon,
        color: input.color,
        teacherId: input.teacherId,
        totalLessons: input.totalLessons,
        totalHours: input.totalHours,
        status: input.status,
        subSchoolId: input.subSchoolId,
      })
      .returning();

    return course;
  }

  async createCourseResource(
      courseId: string,
      input: CreateCourseResourceDto & { url: string },
  ): Promise<CourseResourceRecord> {
    const [resource] = await db
        .insert(courseResources)
        .values({
          courseId,
          type: input.type,
          title: input.title,
          url: input.url,
        })
        .returning();

    return resource;
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

  async removeCourseResource(id: string, courseId: string): Promise<void> {
    const [existing] = await db
        .select()
        .from(courseResources)
        .where(
            and(
                eq(courseResources.id, id),
                eq(courseResources.courseId, courseId)
            )
        );

    if (!existing) {
      throw new AppError('NOT_FOUND', 'Ressource introuvable', 404);
    }

    await db
        .delete(courseResources)
        .where(
            eq(courseResources.id, id)
        );
  }
}
