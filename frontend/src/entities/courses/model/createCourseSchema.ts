import { z } from 'zod'
import { getErrorMessage } from '@shared/lib'

export const createCourseSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, getErrorMessage('validation.name'))
        .max(100, getErrorMessage('validation.maxLength100')),

    code: z
        .string()
        .trim()
        .min(1, getErrorMessage('validation.code'))
        .max(20, getErrorMessage('validation.maxLength20')),

    description: z
        .string()
        .trim()
        .optional(),

    credits: z
        .coerce
        .number( { invalid_type_error: getErrorMessage('validation.credits')})
        .int()
        .positive()
        .optional(),

    subSchoolId: z.string().uuid('Invalid sub-school ID'),
})

export const updateCourseSchema = createCourseSchema
    .partial()
    .omit({ subSchoolId: true })

export type CreateCourseDto    = z.infer<typeof createCourseSchema>
export type UpdateCourseDto    = z.infer<typeof updateCourseSchema>