import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { schedules } from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';
import type { CreateScheduleDto, UpdateScheduleDto } from './schedules.schema';

export type ScheduleRecord = typeof schedules.$inferSelect;

export class SchedulesService {
  async findAll(): Promise<ScheduleRecord[]> {
    return db.select().from(schedules);
  }

  async findById(id: string): Promise<ScheduleRecord> {
    const [schedule] = await db
      .select()
      .from(schedules)
      .where(eq(schedules.id, id));

    if (!schedule) {
      throw new AppError('NOT_FOUND', 'Emploi du temps introuvable', 404);
    }

    return schedule;
  }

  async create(input: CreateScheduleDto): Promise<ScheduleRecord> {
    const [schedule] = await db
      .insert(schedules)
      .values({
        classId: input.classId,
        courseId: input.courseId,
        teacherId: input.teacherId,
        dayOfWeek: input.dayOfWeek,
        startTime: input.startTime,
        endTime: input.endTime,
        room: input.room,
        academicYear: input.academicYear,
      })
      .returning();

    return schedule;
  }

  async update(id: string, input: UpdateScheduleDto): Promise<ScheduleRecord> {
    await this.findById(id);

    const [schedule] = await db
      .update(schedules)
      .set({
        ...input,
      })
      .where(eq(schedules.id, id))
      .returning();

    return schedule;
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await db.delete(schedules).where(eq(schedules.id, id));
  }
}
