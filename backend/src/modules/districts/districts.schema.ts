import { z } from 'zod';

export const districtListQuerySchema = z.object({
  cityId: z.string().uuid('Identifiant ville invalide').optional(),
});

export const createDistrictSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  cityId: z.string().uuid('Identifiant ville invalide'),
});

export const updateDistrictSchema = createDistrictSchema.partial();

export const districtParamsSchema = z.object({
  id: z.string().uuid('Identifiant quartier invalide'),
});

export type DistrictListQueryDto = z.infer<typeof districtListQuerySchema>;
export type CreateDistrictDto = z.infer<typeof createDistrictSchema>;
export type UpdateDistrictDto = z.infer<typeof updateDistrictSchema>;
export type DistrictParamsDto = z.infer<typeof districtParamsSchema>;
