import { z } from 'zod'
import { getErrorMessage } from '@shared/lib'

const teacherIdentitySchema = z.object({
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

    dateOfBirth: z
        .string()
        .min(1, getErrorMessage('validation.dateOfBirthRequired')),
})

const teacherAssignmentSchema = z.object({
    subSchoolId: z.string().uuid(),

    hireDate: z
        .string()
        .min(1, getErrorMessage('validation.hireDateRequired')),

    qualification: z
        .string()
        .optional()
        .or(z.literal('')),

    specialization: z
        .string()
        .optional()
        .or(z.literal('')),
})

export const createTeacherSchema = teacherIdentitySchema.merge(teacherAssignmentSchema)

export const updateTeacherSchema = teacherIdentitySchema.partial()

export const updateAssignmentSchema = teacherAssignmentSchema
    .partial()
    .omit({ subSchoolId: true })

export type CreateTeacherDto    = z.infer<typeof createTeacherSchema>
export type UpdateTeacherDto    = z.infer<typeof updateTeacherSchema>
export type UpdateAssignmentDto = z.infer<typeof updateAssignmentSchema>
export type AssignTeacherDto = z.infer<typeof teacherAssignmentSchema>