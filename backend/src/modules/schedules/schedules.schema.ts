import { z } from 'zod';

export const createScheduleSchema = z.object({
  classId: z.string().uuid('Invalid class ID'),
  courseId: z.string().uuid('Invalid course ID'),
  teacherId: z.string().uuid('Invalid teacher ID'),
  dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM'),
  room: z.string().max(50).optional(),
  academicYear: z.string().min(1, 'Academic year is required').max(20),
});

export const updateScheduleSchema = createScheduleSchema.partial();

export const scheduleParamsSchema = z.object({
  id: z.string().uuid('Invalid schedule ID'),
});

export type CreateScheduleDto = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleDto = z.infer<typeof updateScheduleSchema>;
export type ScheduleParamsDto = z.infer<typeof scheduleParamsSchema>;
