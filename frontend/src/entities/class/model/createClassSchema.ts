import { z } from 'zod'
import { getErrorMessage } from '@shared/lib'

export const createClassSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, getErrorMessage('validation.name'))
        .max(100, getErrorMessage('validation.maxLength100')),

    gradeLevel: z
        .string()
        .trim()
        .max(100, getErrorMessage('validation.maxLength100'))
        .optional()
        .or(z.literal('')),

    capacity: z
        .coerce
        .number({ invalid_type_error: getErrorMessage('validation.capacityInvalid') })
        .int()
        .positive()
        .optional(),

    subSchoolId: z.string().uuid('Invalid sub-school ID'),
})

export const updateClassSchema = createClassSchema
    .partial()
    .omit({ subSchoolId: true })

export type CreateClassDto = z.infer<typeof createClassSchema>
export type UpdateClassDto    = z.infer<typeof updateClassSchema>