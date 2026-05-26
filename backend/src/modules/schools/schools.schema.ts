import { z } from 'zod';

export const districtQuerySchema = z.object({
  districtId: z.string().uuid('Invalid district ID'),
});

export const createSchoolSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  code: z.string().min(1, 'Code is required').max(50),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().max(20).optional(),
  address: z.string().optional(),
  logo: z.string().optional(),
  districtId: z.string().uuid('Invalid district ID'),
});

export const updateSchoolSchema = createSchoolSchema.partial().omit({ districtId: true });

export const schoolParamsSchema = z.object({
  id: z.string().uuid('Invalid school ID'),
});

export type DistrictQueryDto = z.infer<typeof districtQuerySchema>;
export type CreateSchoolDto = z.infer<typeof createSchoolSchema>;
export type UpdateSchoolDto = z.infer<typeof updateSchoolSchema>;
export type SchoolParamsDto = z.infer<typeof schoolParamsSchema>;
