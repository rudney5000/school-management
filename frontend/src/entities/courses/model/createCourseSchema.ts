import { z } from 'zod'
import { getErrorMessage } from '@shared/lib'
import {
    COURSE_COLORS,
    COURSE_ICONS,
    COURSE_STATUSES
} from "@entities/courses/model/constants";

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
        .positive(),

    icon: z
        .enum(COURSE_ICONS)
        .optional(),

    color: z
        .enum(COURSE_COLORS)
        .optional(),

    teacherId: z
        .string()
        .uuid()
        .optional(),

    totalLessons: z
        .coerce
        .number({ invalid_type_error: getErrorMessage('validation.capacityInvalid') })
        .int()
        .nonnegative()
        .optional(),

    totalHours: z
        .coerce
        .number({ invalid_type_error: getErrorMessage('validation.capacityInvalid') })
        .int()
        .nonnegative()
        .optional(),

    status: z
        .enum(COURSE_STATUSES)
        .optional(),

    subSchoolId: z
        .string()
        .uuid('Invalid sub-school ID'),

    isDistanceCourse: z
        .boolean()
        .optional(),

    liveScheduledAt: z
        .string()
        .optional(),

    liveUrl: z
        .string()
        .url(getErrorMessage('validation.invalidUrl'))
        .optional(),
})

export const updateCourseSchema = createCourseSchema
    .partial()
    .omit({ subSchoolId: true })

export type CreateCourseDto    = z.infer<typeof createCourseSchema>
export type UpdateCourseDto    = z.infer<typeof updateCourseSchema>