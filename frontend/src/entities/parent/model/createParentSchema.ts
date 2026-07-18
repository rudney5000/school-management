import { z } from 'zod'
import { getErrorMessage } from '@shared/lib'

export const createParentSchema = z.object({
    firstName: z
        .string()
        .trim()
        .min(1, getErrorMessage('validation.firstNameRequired'))
        .max(100, getErrorMessage('validation.maxLength100')),

    lastName: z
        .string()
        .trim()
        .min(1, getErrorMessage('validation.lastNameRequired'))
        .max(100, getErrorMessage('validation.maxLength100')),

    gender: z.enum(['male', 'female']),

    email: z
        .string()
        .trim()
        .email(getErrorMessage('validation.emailInvalid')),

    phone: z
        .string()
        .max(20, getErrorMessage('validation.maxLength20'))
        .optional()
        .or(z.literal('')),

    subSchoolId: z.string().uuid(),

    studentIds: z
        .array(z.string().uuid())
        .optional(),
})

export const updateParentSchema = createParentSchema
    .partial()
    .omit({ subSchoolId: true })

export type CreateParentDto    = z.infer<typeof createParentSchema>
export type UpdateParentDto    = z.infer<typeof updateParentSchema>