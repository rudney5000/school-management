import { z } from 'zod';

export const cityListQuerySchema = z.object({
  departmentId: z.string().uuid('Identifiant département invalide').optional(),
});

export const createCitySchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  departmentId: z.string().uuid('Identifiant département invalide'),
});

export const updateCitySchema = createCitySchema.partial();

export const cityParamsSchema = z.object({
  id: z.string().uuid('Identifiant ville invalide'),
});

export type CityListQueryDto = z.infer<typeof cityListQuerySchema>;
export type CreateCityDto = z.infer<typeof createCitySchema>;
export type UpdateCityDto = z.infer<typeof updateCitySchema>;
export type CityParamsDto = z.infer<typeof cityParamsSchema>;
