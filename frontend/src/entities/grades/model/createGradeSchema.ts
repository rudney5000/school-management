import { z } from 'zod'
import {GradeType} from './types'
import {getErrorMessage} from "@shared/lib";

export const createGradeSchema = z.object({
    subSchoolId: z.string().uuid(getErrorMessage('validation.invalidUuid')),
    studentId:        z.string().uuid(getErrorMessage('validation.invalidUuid')),
    courseId:         z.string().uuid(getErrorMessage('validation.invalidUuid')),
    classId:          z.string().uuid(getErrorMessage('validation.invalidUuid')),
    academicPeriodId: z.string().uuid(getErrorMessage('validation.invalidUuid')),
    gradeType:        z.nativeEnum(GradeType, { message: getErrorMessage('validation.invalidType') }),
    score:            z.coerce.number({ invalid_type_error: 'Invalid score' }).min(0, 'Score minimum 0'),
    maxScore:         z.coerce.number().positive().default(20),
    coefficient:      z.coerce.number().positive().default(1),
    comment:          z.string().max(500).optional().nullable(),
})

export const updateGradeSchema = createGradeSchema
    .partial()
    .omit({ studentId: true, courseId: true, academicPeriodId: true })

export const bulkCreateGradesSchema = z.object({
    courseId:         z.string().uuid(getErrorMessage('validation.invalidUuid')),
    classId:          z.string().uuid(getErrorMessage('validation.invalidUuid')),
    academicPeriodId: z.string().uuid(getErrorMessage('validation.invalidUuid')),
    gradeType:        z.nativeEnum(GradeType, { message: getErrorMessage('validation.invalidType') }),
    maxScore:         z.coerce.number().positive().default(20),
    coefficient:      z.coerce.number().positive().default(1),
    results: z.array(z.object({
        studentId: z.string().uuid(getErrorMessage('validation.invalidUuid')),
        score:     z.coerce.number().min(0).nullable(),
        comment:   z.string().max(500).optional().nullable(),
    })).min(1),
})

export type CreateGradeDto       = z.infer<typeof createGradeSchema>
export type UpdateGradeDto       = z.infer<typeof updateGradeSchema>
export type BulkCreateGradesDto  = z.infer<typeof bulkCreateGradesSchema>