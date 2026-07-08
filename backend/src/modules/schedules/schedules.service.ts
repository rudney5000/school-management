import {
    eq,
    and
} from 'drizzle-orm';
import { db } from '@/db';
import { schedules } from '@/db/schema';
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
            throw new AppError('NOT_FOUND', 'Emploi du temps introuvable', 404);
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
}
