import { z } from 'zod'

export const academicPeriodTypeSchema = z.enum(['trimester', 'semester', 'annual'])

export const createAcademicPeriodSchema = z.object({
    subSchoolId: z.string().uuid('Invalid subSchool ID '),
    name:      z.string().min(2).max(100),
    type:      academicPeriodTypeSchema,
    startDate: z.coerce.date(),
    endDate:   z.coerce.date(),
    isCurrent: z.boolean().default(false),
}).refine(d => d.endDate > d.startDate, {
    message: 'La date de fin doit être après la date de début',
    path: ['endDate'],
})

export const updateAcademicPeriodSchema = z.object({
    name:      z.string().min(2).max(100).optional(),
    type:      academicPeriodTypeSchema.optional(),
    startDate: z.coerce.date().optional(),
    endDate:   z.coerce.date().optional(),
    isCurrent: z.boolean().optional(),
}).refine(d => {
    if (d.startDate && d.endDate) return d.endDate > d.startDate
    return true
}, {
    message: 'La date de fin doit être après la date de début',
    path: ['endDate'],
})

export const academicPeriodsParamsSchema = z.object({
    id: z.string().uuid('Invalid student ID'),
});


export type CreateAcademicPeriodInput = z.infer<typeof createAcademicPeriodSchema>
export type UpdateAcademicPeriodInput = z.infer<typeof updateAcademicPeriodSchema>