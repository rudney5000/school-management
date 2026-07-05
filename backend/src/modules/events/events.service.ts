import {and, eq} from 'drizzle-orm';
import { db } from '@/db';
import { events } from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';
import type {CreateEventDto, UpdateEventDto} from './events.schema';

export type EventRecord = typeof events.$inferSelect;

export class EventsService {
  async findAll(subSchoolId: string): Promise<EventRecord[]> {
      return db
          .select()
          .from(events)
          .where(
              and(
                  eq(events.subSchoolId, subSchoolId),
              )
          );
  }

  async findById(id: string, subSchoolId: string): Promise<EventRecord> {
    const [enrollment] = await db
      .select()
      .from(events)
      .where(
          and(
              eq(events.id, id),
              eq(events.subSchoolId, subSchoolId),
          )
      );

    if (!enrollment) {
      throw new AppError('NOT_FOUND', 'Inscription introuvable', 404);
    }

    return enrollment;
  }

  async create(input: CreateEventDto, createdByUserId: string): Promise<EventRecord> {
    const [event] = await db
        .insert(events)
        .values({
          title: input.title,
          description: input.description,
          type: input.type,
          startDate: new Date(input.startDate),
          endDate: input.endDate ? new Date(input.endDate) : null,
          location: input.location,
          isPublic: input.isPublic,
          subSchoolId: input.subSchoolId,
          isLiveEvent: input.isLiveEvent,
          liveUrl: input.liveUrl,
          createdBy: createdByUserId,
        })
        .returning();

    return event;
  }

  async update(
      id: string,
      subSchoolId: string,
      input: UpdateEventDto
  ): Promise<EventRecord> {

    await this.findById(id, subSchoolId);

    const [event] = await db
        .update(events)
        .set({
          ...input,
          startDate: input.startDate ? new Date(input.startDate) : undefined,
          endDate: input.endDate ? new Date(input.endDate) : undefined,
          updatedAt: new Date(),
        })
        .where(
            and(
                eq(events.id, id),
                eq(events.subSchoolId, subSchoolId)
            )
        )
        .returning();

    return event;
  }
  async remove(id: string, subSchoolId: string): Promise<void> {
    await this.findById(id, subSchoolId);

    await db
        .delete(events)
        .where(
            and(
                eq(events.id, id),
                eq(events.subSchoolId, subSchoolId)
            )
        );
  }
}
