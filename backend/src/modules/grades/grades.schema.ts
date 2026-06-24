import { z } from 'zod'

export const gradeTypeSchema = z.enum(['homework', 'participation', 'project', 'oral'])

export const createGradeSchema = z.object({
    subSchoolId:      z.string().uuid('Invalid sub-school ID'),
    studentId:        z.string().uuid('Invalid student ID'),
    courseId:         z.string().uuid('Invalid course ID'),
    classId:          z.string().uuid('Invalid class ID'),
    academicPeriodId: z.string().uuid('Invalid academic period ID'),
    gradeType:        gradeTypeSchema,
    score:            z.coerce.number().min(0).transform(v => String(v)),
    maxScore:         z.coerce.number().positive().default(20).transform(v => String(v)),
    coefficient:      z.coerce.number().positive().default(1).transform(v => String(v)),
    comment:          z.string().max(500).optional().nullable(),
    gradedAt:         z.coerce.date().optional(),
})

export const gradesParamsSchema = z.object({
    id: z.string().uuid('Invalid student ID'),
});

export const updateGradeSchema = createGradeSchema
    .partial()
    .omit({ studentId: true, courseId: true, academicPeriodId: true })

export const bulkCreateGradesSchema = z.object({
    courseId:         z.string().uuid(),
    classId:          z.string().uuid(),
    academicPeriodId: z.string().uuid(),
    gradeType:        gradeTypeSchema,
    maxScore:         z.coerce.number().positive().default(20),
    coefficient:      z.coerce.number().positive().default(1),
    results: z.array(z.object({
        studentId: z.string().uuid(),
        score:     z.coerce.number().min(0).nullable(),
        comment:   z.string().max(500).optional().nullable(),
    })).min(1),
})

export type CreateGradeInput         = z.infer<typeof createGradeSchema>
export type UpdateGradeInput         = z.infer<typeof updateGradeSchema>
export type BulkCreateGradesInput    = z.infer<typeof bulkCreateGradesSchema>