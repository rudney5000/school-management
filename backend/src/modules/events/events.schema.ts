import { z } from 'zod';
import {EventTypeEnum} from "@/db/schema";

export const createEventSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),

  type: z.enum(EventTypeEnum.enumValues),

  startDate: z.string(),

  endDate: z.string().optional(),

  location: z.string().optional(),

  isPublic: z.boolean().default(true),

  subSchoolId: z.string().uuid(),
});

export const eventParamsSchema = z.object({
  id: z.string().uuid('Invalid event ID'),
});

export const updateEventSchema = createEventSchema
    .omit({ subSchoolId: true })
    .partial();

export type UpdateEventDto = z.infer<typeof updateEventSchema>;
export type CreateEventDto = z.infer<typeof createEventSchema>;
export type EventParamsDto = z.infer<typeof eventParamsSchema>;
