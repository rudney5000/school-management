import { and, eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import { grades } from '@/db/schema/grades'
import { AppError } from '@/shared/errors/app-error'
import type {
    CreateGradeInput,
    UpdateGradeInput,
    BulkCreateGradesInput,
} from './grades.schema'
import {academicPeriods} from "@/db/schema/academicPeriod";

export type GradeRecord = typeof grades.$inferSelect

export class GradesService {

    async findAll(subSchoolId: string, filters?: {
        classId?: string
        courseId?: string
        academicPeriodId?: string
        studentId?: string
    }): Promise<GradeRecord[]> {
        return db
            .select()
            .from(grades)
            .innerJoin(academicPeriods, eq(grades.academicPeriodId, academicPeriods.id))
            .where(
                and(
                    eq(academicPeriods.subSchoolId, subSchoolId),
                    filters?.classId          ? eq(grades.classId, filters.classId)                   : undefined,
                    filters?.courseId         ? eq(grades.courseId, filters.courseId)                 : undefined,
                    filters?.academicPeriodId ? eq(grades.academicPeriodId, filters.academicPeriodId) : undefined,
                    filters?.studentId        ? eq(grades.studentId, filters.studentId)               : undefined,
                )
            )
            .then(rows => rows.map(r => r.grades))
    }

    async findById(id: string, subSchoolId: string): Promise<GradeRecord> {
        const [row] = await db
            .select()
            .from(grades)
            .innerJoin(academicPeriods, eq(grades.academicPeriodId, academicPeriods.id))
            .where(
                and(
                    eq(grades.id, id),
                    eq(academicPeriods.subSchoolId, subSchoolId),
                )
            )

        if (!row) {
            throw new AppError('NOT_FOUND', 'Note introuvable', 404)
        }

        return row.grades
    }

    async create(input: CreateGradeInput & { gradedBy: string }): Promise<GradeRecord> {
        const [period] = await db
            .select()
            .from(academicPeriods)
            .where(
                and(
                    eq(academicPeriods.id, input.academicPeriodId),
                    eq(academicPeriods.subSchoolId, input.subSchoolId),
                )
            )

        if (!period) {
            throw new AppError('NOT_FOUND', 'Période académique introuvable', 404)
        }

        const [grade] = await db
            .insert(grades)
            .values({
                subSchoolId:      input.subSchoolId,
                studentId:        input.studentId,
                courseId:         input.courseId,
                classId:          input.classId,
                academicPeriodId: input.academicPeriodId,
                gradeType:        input.gradeType,
                score:            String(input.score),
                maxScore:         String(input.maxScore ?? 20),
                coefficient:      String(input.coefficient ?? 1),
                comment:          input.comment ?? null,
                gradedBy:         input.gradedBy,
                gradedAt:         input.gradedAt ?? new Date(),
            })
            .returning()

        return grade
    }

    async bulkCreate(
        input: BulkCreateGradesInput,
        subSchoolId: string,
        gradedBy: string,
    ): Promise<GradeRecord[]> {
        const [period] = await db
            .select()
            .from(academicPeriods)
            .where(
                and(
                    eq(academicPeriods.id, input.academicPeriodId),
                    eq(academicPeriods.subSchoolId, subSchoolId),
                )
            )

        if (!period) {
            throw new AppError('NOT_FOUND', 'Période académique introuvable', 404)
        }

        const rows = input.results.map(r => ({
            subSchoolId:      subSchoolId,
            studentId:        r.studentId,
            courseId:         input.courseId,
            classId:          input.classId,
            academicPeriodId: input.academicPeriodId,
            gradeType:        input.gradeType,
            score:            r.score !== null ? String(r.score) : null,
            maxScore:         String(input.maxScore ?? 20),
            coefficient:      String(input.coefficient ?? 1),
            comment:          r.comment ?? null,
            gradedBy,
            gradedAt:         new Date(),
        }))

        return db
            .insert(grades)
            .values(rows)
            .onConflictDoUpdate({
                target: [grades.studentId, grades.courseId, grades.academicPeriodId, grades.gradeType],
                set: {
                    score:     sql`excluded.score`,
                    comment:   sql`excluded."comment"`,
                    gradedBy:  sql`excluded.graded_by`,
                    gradedAt:  sql`excluded.graded_at`,
                    updatedAt: new Date(),
                },
            })
            .returning()
    }

    async update(id: string, subSchoolId: string, input: UpdateGradeInput): Promise<GradeRecord> {
        await this.findById(id, subSchoolId)

        const [grade] = await db
            .update(grades)
            .set({
                ...input,
                updatedAt: new Date(),
            })
            .where(eq(grades.id, id))
            .returning()

        return grade
    }

    async delete(id: string, subSchoolId: string): Promise<void> {
        await this.findById(id, subSchoolId)

        await db
            .delete(grades)
            .where(eq(grades.id, id))
    }
}