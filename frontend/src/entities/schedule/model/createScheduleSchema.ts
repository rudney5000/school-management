import { z } from 'zod'
import { getErrorMessage } from '@shared/lib'

const DAY_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const

export const createScheduleSchema = z.object({
    classId: z.string().uuid(getErrorMessage('validation.invalidUuid')),
    courseId: z.string().uuid(getErrorMessage('validation.invalidUuid')),
    teacherId: z.string().uuid(getErrorMessage('validation.invalidUuid')),
    dayOfWeek: z.enum(DAY_OF_WEEK, {
        errorMap: () => ({ message: getErrorMessage('validation.dayOfWeekRequired') }),
    }),
    startTime: z
        .string()
        .regex(/^\d{2}:\d{2}$/, getErrorMessage('validation.timeFormat')),
    endTime: z
        .string()
        .regex(/^\d{2}:\d{2}$/, getErrorMessage('validation.timeFormat')),
    room: z
        .string()
        .max(50, getErrorMessage('validation.maxLength50'))
        .optional()
        .or(z.literal('')),
    academicYear: z
        .string()
        .min(1, getErrorMessage('validation.academicYearRequired'))
        .max(20, getErrorMessage('validation.maxLength20')),
    subSchoolId: z.string().uuid(),
    isLiveSession: z
        .boolean()
        .optional(),
    liveUrl: z
        .string()
        .url(getErrorMessage('validation.invalidUrl'))
        .optional(),

})

export const updateScheduleSchema = createScheduleSchema.partial()

export type CreateScheduleDto = z.infer<typeof createScheduleSchema>
export type UpdateScheduleDto = z.infer<typeof updateScheduleSchema>

export type DayOfWeek = typeof DAY_OF_WEEK[number]
