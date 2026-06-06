import { z } from 'zod';

const optionalString = (maxLength?: number) =>
    z.preprocess(
        (val) => (val === "" ? undefined : val),
        z.string().max(maxLength ?? 255, `Maximum ${maxLength ?? 255} caractères`).optional()
    );

const optionalEmail = z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().email('Adresse email invalide').optional()
);


export const createSubSchoolSchema = z.object({
    name: z.string().min(1, 'Le nom est requis').max(255, 'Le nom est trop long'),
    code: z.string().min(1, 'Le code est requis').max(50, 'Le code est trop long'),

    email: optionalEmail,
    phone: optionalString(20),
    address: optionalString(),
    logo: optionalString(),

    schoolId: z.string().uuid('ID de l\'école invalide'),
});

export type CreateSubSchoolDto = z.infer<typeof createSubSchoolSchema>;


export const updateSubSchoolSchema = createSubSchoolSchema.partial().extend({
    id: z.string().uuid('ID de la sous-école invalide'),
}).omit({ schoolId: true });

export type UpdateSubSchoolDto = z.infer<typeof updateSubSchoolSchema>;


export const subSchoolResponseSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    code: z.string(),
    email: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    logo: z.string().optional(),
    schoolId: z.string().uuid(),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
});

export type SubSchoolResponseDto = z.infer<typeof subSchoolResponseSchema>;