import { z } from 'zod';

export const reportCategorySchema = z.enum([
  'harassment',
  'behavior',
  'material',
  'security',
  'teacher_absence',
  'other',
]);

export const reportStatusSchema = z.enum(['new', 'in_review', 'resolved', 'dismissed']);

export const involvedPersonRoleSchema = z.enum([
  'teacher',
  'staff',
  'director',
  'student',
  'other',
]);

export const createReportSchema = z
  .object({
    category: reportCategorySchema,
    otherCategoryLabel: z.string().max(120).optional(),
    description: z.string().min(10).max(2000),
    involvedPersonName: z.string().max(120).optional(),
    involvedPersonRole: involvedPersonRoleSchema.optional(),
    relatedStudentId: z.string().uuid().optional(),
    isAnonymous: z.boolean().default(false),
  })
  .refine((data) => data.category !== 'other' || !!data.otherCategoryLabel, {
    message: 'otherCategoryLabel requis quand category = other',
    path: ['otherCategoryLabel'],
  });

export const updateReportStatusSchema = z.object({
  status: reportStatusSchema,
  note: z.string().max(1000).optional(),
});

export const assignReportSchema = z.object({
  assignedToId: z.string().uuid(),
});

export const reportParamsSchema = z.object({
  id: z.string().uuid(),
});

export const trackReportParamsSchema = z.object({
  token: z.string().uuid(),
});

export const reportFiltersSchema = z.object({
  status: reportStatusSchema.optional(),
  category: reportCategorySchema.optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export type CreateReportDto = z.infer<typeof createReportSchema>;
export type UpdateReportStatusDto = z.infer<typeof updateReportStatusSchema>;
export type AssignReportDto = z.infer<typeof assignReportSchema>;
export type ReportFiltersDto = z.infer<typeof reportFiltersSchema>;
