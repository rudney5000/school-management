import { z } from 'zod';
import {COURSE_COLORS, COURSE_ICONS, COURSE_RESOURCE_TYPES, COURSE_STATUSES} from "@/db/schema";

export const subSchoolQuerySchema = z.object({
  subSchoolId: z.string().uuid('Invalid sub-school ID'),
});

export const createCourseSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  code: z.string().min(1, 'Code is required').max(20),
  description: z.string().optional(),
  credits: z.number().int().nonnegative().optional().default(0),
  icon: z.enum(COURSE_ICONS).optional().default('book-open'),
  color: z.enum(COURSE_COLORS).optional().default('blue'),
  teacherId: z.string().uuid().optional(),
  totalLessons: z.number().int().nonnegative().optional().default(0),
  totalHours: z.number().int().nonnegative().optional().default(0),
  status: z.enum(COURSE_STATUSES).optional().default('active'),
  subSchoolId: z.string().uuid('Invalid sub-school ID'),
  isDistanceCourse: z.boolean().optional().default(false),
  liveScheduledAt: z.coerce.date().optional(),
  liveUrl: z.string().url('Invalid URL').optional(),
});

export const createCourseResourceSchema = z.object({
  type: z.enum(COURSE_RESOURCE_TYPES),
  title: z.string().min(1, 'Title is required').max(150),
  url: z.string().url('Invalid URL').optional(),
});

export const updateCourseSchema = createCourseSchema
  .partial()
  .omit({ subSchoolId: true });

export const courseParamsSchema = z.object({
  id: z.string().uuid('Invalid course ID'),
});

export const courseIdParamsSchema = z.object({
  id: z.string().uuid('Invalid course ID'),
});

export const courseResourceParamsSchema = z.object({
  id: z.string().uuid('Invalid course ID'),
  resourceId: z.string().uuid('Invalid resource ID'),
});

export type SubSchoolQueryDto = z.infer<typeof subSchoolQuerySchema>;
export type CreateCourseDto = z.infer<typeof createCourseSchema>;
export type UpdateCourseDto = z.infer<typeof updateCourseSchema>;
export type CourseParamsDto = z.infer<typeof courseParamsSchema>;
export type CreateCourseResourceDto = z.infer<typeof createCourseResourceSchema>;
