import { z } from 'zod';

export const departmentListQuerySchema = z.object({
  countryId: z.string().uuid('Identifiant pays invalide').optional(),
});

export const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  code: z.string().min(1, 'Le code est requis').max(10),
  countryId: z.string().uuid('Identifiant pays invalide'),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();

export const departmentParamsSchema = z.object({
  id: z.string().uuid('Identifiant département invalide'),
});

export type DepartmentListQueryDto = z.infer<typeof departmentListQuerySchema>;
export type CreateDepartmentDto = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentDto = z.infer<typeof updateDepartmentSchema>;
export type DepartmentParamsDto = z.infer<typeof departmentParamsSchema>;
