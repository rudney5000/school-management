import { z } from "zod"

export const examTypeSchema = z.enum(["quiz", "midterm", "final", "homework", "oral"])
export const examStatusSchema = z.enum(["scheduled", "ongoing", "completed", "cancelled"])

export const createExamSchema = z.object({
    subSchoolId:       z.string().uuid('Invalid sub-school ID'),
    title: z.string().min(2, "Too short").max(255),
    type: examTypeSchema,
    courseId: z.string().uuid('Invalid course ID'),
    classId: z.string().uuid('Invalid class ID'),
    examDate: z.coerce.date(),
    durationMinutes: z.number().int().positive().default(60),
    maxScore: z.coerce.number().positive().default(20).transform(v => String(v)),
    coefficient: z.coerce.number().positive().default(1).transform(v => String(v)),
    isLiveExam: z.boolean().optional().default(false),
    retakeOfExamId: z.string().uuid('Invalid exam ID').optional(),
    liveUrl: z.string().url('Invalid URL').optional(),
})

export const examParamsSchema = z.object({
    id: z.string().uuid('Invalid student ID'),
});

export const examResultsParamsSchema = z.object({
    examId: z.string().uuid('Invalid exam ID'),
})

export const studentResultsParamsSchema = z.object({
    studentId: z.string().uuid('Invalid student ID'),
})

export const updateExamSchema = createExamSchema
    .partial()
    .omit({ subSchoolId: true })
    .extend({
        status: examStatusSchema.optional(),
    })

export const upsertExamResultSchema = z.object({
    examId: z.string().uuid('Invalid exam ID'),
    studentId: z.string().uuid('Invalid student ID'),
    score: z.coerce.number().min(0).nullable(),
    comment: z.string().max(500).optional().nullable(),
})

export const bulkUpsertExamResultsSchema = z.object({
    examId: z.string().uuid(),
    results: z.array(
        z.object({
            studentId: z.string().uuid(),
            score: z.number().min(0).nullable(),
            comment: z.string().max(500).optional().nullable(),
        })
    ).min(1),
})

export type CreateExamInput = z.infer<typeof createExamSchema>
export type UpdateExamInput = z.infer<typeof updateExamSchema>
export type UpsertExamResultInput = z.infer<typeof upsertExamResultSchema>
export type BulkUpsertExamResultsInput = z.infer<typeof bulkUpsertExamResultsSchema>