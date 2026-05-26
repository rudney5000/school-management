import { z } from 'zod';

export const createCountrySchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  code: z
    .string()
    .min(2, 'Le code doit contenir au moins 2 caractères')
    .max(3, 'Le code ne peut pas dépasser 3 caractères'),
});

export const updateCountrySchema = createCountrySchema.partial();

export const countryParamsSchema = z.object({
  id: z.string().uuid('Identifiant pays invalide'),
});

export type CreateCountryDto = z.infer<typeof createCountrySchema>;
export type UpdateCountryDto = z.infer<typeof updateCountrySchema>;
export type CountryParamsDto = z.infer<typeof countryParamsSchema>;
