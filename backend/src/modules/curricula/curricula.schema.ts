import { z } from 'zod';
import { curriculumStatusEnum, curriculumTypeEnum } from '@/db/schema';
import type { UploadMimeType } from '@/config/storage';

const CURRICULUM_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const satisfies readonly UploadMimeType[];
const MAX_CURRICULUM_FILE_SIZE = 25 * 1024 * 1024;

/** "2026-2027": two consecutive years. */
const schoolYearSchema = z
  .string()
  .regex(/^\d{4}-\d{4}$/, 'Expected a school year such as 2026-2027')
  .refine((value) => Number(value.slice(5)) === Number(value.slice(0, 4)) + 1, {
    message: 'The second year must follow the first',
  });

const classIdsSchema = z
  .array(z.string().uuid('Invalid class ID'))
  .min(1, 'At least one class is required')
  .max(100)
  .transform((ids) => [...new Set(ids)]);

export const createCurriculumSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(150),
  description: z.string().trim().max(5000).optional(),
  type: z.enum(curriculumTypeEnum.enumValues),
  courseId: z.string().uuid('Invalid course ID').optional(),
  schoolYear: schoolYearSchema,
  classIds: classIdsSchema,
});

export const updateCurriculumSchema = z.object({
  title: z.string().trim().min(1).max(150).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  type: z.enum(curriculumTypeEnum.enumValues).optional(),
  courseId: z.string().uuid('Invalid course ID').nullable().optional(),
  schoolYear: schoolYearSchema.optional(),
  classIds: classIdsSchema.optional(),
});

export const listCurriculaQuerySchema = z.object({
  subSchoolId: z.string().uuid('Invalid sub-school ID').optional(),
  classId: z.string().uuid().optional(),
  courseId: z.string().uuid().optional(),
  schoolYear: z.string().max(9).optional(),
  type: z.enum(curriculumTypeEnum.enumValues).optional(),
  status: z.enum(curriculumStatusEnum.enumValues).optional(),
});

export const subSchoolQuerySchema = z.object({
  subSchoolId: z.string().uuid('Invalid sub-school ID').optional(),
});

export const curriculumParamsSchema = z.object({
  id: z.string().uuid('Invalid curriculum ID'),
});

export const curriculumAttachmentParamsSchema = z.object({
  id: z.string().uuid('Invalid curriculum ID'),
  attachmentId: z.string().uuid('Invalid attachment ID'),
});

export const presignCurriculumFileSchema = z.object({
  filename: z.string().trim().min(1).max(255),
  mimeType: z.enum(CURRICULUM_MIME_TYPES),
  size: z.number().int().positive().max(MAX_CURRICULUM_FILE_SIZE, 'Fichier trop volumineux'),
});

export const confirmCurriculumFileSchema = presignCurriculumFileSchema.extend({
  key: z.string().min(1).max(512),
});

export type CreateCurriculumDto = z.infer<typeof createCurriculumSchema>;
export type UpdateCurriculumDto = z.infer<typeof updateCurriculumSchema>;
export type ListCurriculaQuery = z.infer<typeof listCurriculaQuerySchema>;
export type PresignCurriculumFileDto = z.infer<typeof presignCurriculumFileSchema>;
export type ConfirmCurriculumFileDto = z.infer<typeof confirmCurriculumFileSchema>;
