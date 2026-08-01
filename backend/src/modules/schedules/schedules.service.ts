import {
    eq,
    and,
    inArray
} from 'drizzle-orm';
import { db } from '@/db';
import {
    enrollments,
    parentStudents,
    schedules,
    users
} from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';
import type {
    CreateScheduleDto,
    UpdateScheduleDto
} from './schedules.schema';

export type ScheduleRecord = typeof schedules.$inferSelect;

export class SchedulesService {
  async findAll(subSchoolId: string): Promise<ScheduleRecord[]> {
    return db
        .select()
        .from(schedules)
        .where(
            and(
                eq(schedules.subSchoolId, subSchoolId),
            )
        );
  }

    async findById(id: string, subSchoolId: string): Promise<ScheduleRecord> {
        const [schedule] = await db
            .select()
            .from(schedules)
            .where(
                and(
                    eq(schedules.id, id),
                    eq(schedules.subSchoolId, subSchoolId)
                )
            );

        if (!schedule) {
            throw new AppError(
                'NOT_FOUND',
                'Emploi du temps introuvable',
                404
            );
        }
        return schedule;
    }

  async create(input: CreateScheduleDto): Promise<ScheduleRecord> {
    const [schedule] = await db
      .insert(schedules)
      .values({
        subSchoolId: input.subSchoolId,
        classId: input.classId,
        courseId: input.courseId,
        teacherId: input.teacherId,
        dayOfWeek: input.dayOfWeek,
        startTime: input.startTime,
        endTime: input.endTime,
        room: input.room,
        academicYear: input.academicYear,
        isLiveSession: input.isLiveSession,
        liveUrl: input.liveUrl,
      })
      .returning();

    return schedule;
  }

  async update(
      id: string,
      subSchoolId: string,
      input: UpdateScheduleDto
  ): Promise<ScheduleRecord> {
    await this.findById(id, subSchoolId);

    const [schedule] = await db
      .update(schedules)
      .set({
        ...input,
      })
      .where(
          and(
            eq(schedules.id, id),
            eq(schedules.subSchoolId, subSchoolId)
          ),
      )
      .returning();

    return schedule;
  }

  async remove(id: string, subSchoolId: string): Promise<void> {
    await this.findById(id, subSchoolId);

    await db
        .delete(schedules)
        .where(
            and(
                eq(schedules.id, id),
                eq(schedules.subSchoolId, subSchoolId)
            )
        );
  }

    async resolveSchedulesForParent(userId: string, subSchoolId: string): Promise<ScheduleRecord[]> {
        const [userRecord] = await db
            .select({ parentId: users.parentId })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (!userRecord?.parentId) {
            throw new AppError(
                'FORBIDDEN',
                'Aucun profil parent associé à ce compte',
                403
            );
        }

        const childLinks = await db
            .select({ studentId: parentStudents.studentId })
            .from(parentStudents)
            .where(eq(parentStudents.parentId, userRecord.parentId));

        const studentIds = childLinks.map((l) => l.studentId);
        if (studentIds.length === 0) return [];

        const childEnrollments = await db
            .select({ classId: enrollments.classId })
            .from(enrollments)
            .where(inArray(enrollments.studentId, studentIds));

        const classIds = [...new Set(childEnrollments.map((e) => e.classId))];
        if (classIds.length === 0) return [];

        return db
            .select()
            .from(schedules)
            .where(
                and(
                    inArray(schedules.classId, classIds),
                    eq(schedules.subSchoolId, subSchoolId),
                ),
            );
    }
}
