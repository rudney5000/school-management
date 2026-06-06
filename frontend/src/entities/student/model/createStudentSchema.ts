import { z } from 'zod'
import {getErrorMessage} from "@shared/lib";

export const studentBaseSchema = z.object({
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

    email: z
        .string()
        .trim()
        .email(getErrorMessage('validation.emailInvalid')),

    phone: z
        .string()
        .max(20, getErrorMessage('validation.maxLength20'))
        .optional()
        .or(z.literal('')),

    address: z
        .string()
        .max(255)
        .optional()
        .or(z.literal('')),

    gender: z.enum(['male', 'female'], {
        message: getErrorMessage('validation.genderRequired'),
    }),

    image: z
        .string()
        .url()
        .optional()
        .or(z.literal('')),

    dateOfBirth: z
        .string()
        .min(1, getErrorMessage('validation.dateOfBirthRequired')),

    enrollmentDate: z
        .string()
        .min(1, getErrorMessage('validation.enrollmentDateRequired')),

    isActive: z
        .boolean()
        .optional()

})

export const createStudentSchema = studentBaseSchema.extend({
    subSchoolId: z.string().uuid(),
    parentId: z.string().uuid().optional().or(z.literal('')),
});

export const updateStudentSchema = createStudentSchema
    .partial()

export type CreateStudentDto = z.infer<typeof createStudentSchema>
export type UpdateStudentDto = z.infer<typeof updateStudentSchema>
