import { z } from 'zod'
import { getErrorMessage } from '@shared/lib'
import {ExamStatus, ExamType} from "@entities/exams";

export const createExamSchema = z.object({
    title: z.string().min(50, getErrorMessage('validation.maxLength50')).max(255, getErrorMessage('validation.maxLength255')),
    type: z.nativeEnum(ExamType, {
        errorMap: () => ({ message: getErrorMessage('validation.invalidType') })
    }),
    courseId: z.string().uuid(getErrorMessage('validation.invalidUuid')),
    classId: z.string().uuid(getErrorMessage('validation.invalidUuid')),
    subSchoolId: z.string().uuid(getErrorMessage('validation.invalidUuid')),
    examDate: z.string().min(1, getErrorMessage('validation.enrollmentDateRequired')),
    durationMinutes: z.coerce.number().int().positive().default(60),
    maxScore: z.coerce.number().positive().default(20).transform(v => String(v)),
    coefficient: z.coerce.number().positive().default(1).transform(v => String(v)),
})

export const updateExamSchema = createExamSchema
    .omit({ subSchoolId: true })
    .partial()
    .extend({
        status: z.nativeEnum(ExamStatus, {
            errorMap: () => ({ message: getErrorMessage('validation.invalidType') })
        }).optional(),
    })

export const upsertExamResultSchema = z.object({
    examId: z.string().uuid(getErrorMessage('validation.invalidUuid')),
    studentId: z.string().uuid(getErrorMessage('validation.invalidUuid')),
    score: z.coerce.number().min(0).nullable(),
    comment: z.string().max(500, getErrorMessage('validation.maxLength255')).optional().nullable(),
})

export const bulkUpsertExamResultsSchema = z.object({
    examId: z.string().uuid(getErrorMessage('validation.invalidUuid')),
    results: z.array(
        z.object({
            studentId: z.string().uuid(getErrorMessage('validation.invalidUuid')),
            score: z.coerce.number().min(0).nullable(),
            comment: z.string().max(500).optional().nullable(),
        })
    ).min(1),
})

export type CreateExamDto = z.infer<typeof createExamSchema>
export type UpdateExamDto = z.infer<typeof updateExamSchema>
export type UpsertExamResultDto = z.infer<typeof upsertExamResultSchema>
export type BulkUpsertExamResultsDto = z.infer<typeof bulkUpsertExamResultsSchema>