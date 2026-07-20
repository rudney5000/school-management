import {
    and,
    count,
    eq,
    isNotNull,
    sql
} from 'drizzle-orm'
import { db } from '@/db'
import { AppError } from '@/shared/errors/app-error'
import {
    examResults,
    exams
} from "@/db/schema/exam";
import {
    BulkUpsertExamResultsInput,
    CreateExamInput,
    UpdateExamInput
} from "@/modules/exams/exams.schema";
import {enrollments} from "@/db/schema";

export type ExamRecord = typeof exams.$inferSelect
export type ExamResultRecord = typeof examResults.$inferSelect

export class ExamsService {

    async findAll(subSchoolId: string): Promise<ExamRecord[]> {
        return db
            .select()
            .from(exams)
            .where(eq(exams.subSchoolId, subSchoolId))
    }

    async findById(id: string, subSchoolId: string): Promise<ExamRecord> {
        const [exam] = await db
            .select()
            .from(exams)
            .where(
                and(
                    eq(exams.id, id),
                    eq(exams.subSchoolId, subSchoolId),
                )
            )

        if (!exam) {
            throw new AppError('NOT_FOUND', 'Examen introuvable', 404)
        }

        return exam
    }

    async create(input: CreateExamInput & { subSchoolId: string; createdBy: string }): Promise<ExamRecord> {
        const [exam] = await db
            .insert(exams)
            .values({
                title: input.title,
                type: input.type,
                courseId: input.courseId,
                classId: input.classId,
                subSchoolId: input.subSchoolId,
                examDate: input.examDate,
                durationMinutes: input.durationMinutes,
                maxScore: String(input.maxScore),
                coefficient: String(input.coefficient),
                isLiveSession: input.isLiveExam,
                liveUrl: input.liveUrl,
                createdBy: input.createdBy,
                retakeOfExamId: input.retakeOfExamId ?? null,
            })
            .returning()

        return exam
    }

    async update(id: string, subSchoolId: string, input: UpdateExamInput): Promise<ExamRecord> {
        await this.findById(id, subSchoolId)

        const [exam] = await db
            .update(exams)
            .set({
                ...input,
                ...(input.maxScore !== undefined && { maxScore: String(input.maxScore) }),
                ...(input.coefficient !== undefined && { coefficient: String(input.coefficient) }),
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(exams.id, id),
                    eq(exams.subSchoolId, subSchoolId),
                )
            )
            .returning()

        return exam
    }

    async delete(id: string, subSchoolId: string): Promise<void> {
        await this.findById(id, subSchoolId)

        await db
            .delete(exams)
            .where(
                and(
                    eq(exams.id, id),
                    eq(exams.subSchoolId, subSchoolId),
                )
            )
    }
}

export class ExamResultsService {

    async findByExam(examId: string, subSchoolId: string): Promise<ExamResultRecord[]> {
        const [exam] = await db
            .select()
            .from(exams)
            .where(
                and(
                    eq(exams.id, examId),
                    eq(exams.subSchoolId, subSchoolId),
                )
            )

        if (!exam) {
            throw new AppError('NOT_FOUND', 'Examen introuvable', 404)
        }

        return db
            .select()
            .from(examResults)
            .where(eq(examResults.examId, examId))
    }

    async findByStudent(studentId: string, subSchoolId: string): Promise<ExamResultRecord[]> {
        return db
            .select({
                id: examResults.id,
                examId: examResults.examId,
                studentId: examResults.studentId,
                score: examResults.score,
                comment: examResults.comment,
                gradedBy: examResults.gradedBy,
                gradedAt: examResults.gradedAt,
                createdAt: examResults.createdAt,
                updatedAt: examResults.updatedAt,
                examTitle: exams.title,
                examType: exams.type,
                examDate: exams.examDate,
                maxScore: exams.maxScore,
                coefficient: exams.coefficient,
                courseId: exams.courseId,
            })
            .from(examResults)
            .innerJoin(exams, eq(examResults.examId, exams.id))
            .where(
                and(
                    eq(examResults.studentId, studentId),
                    eq(exams.subSchoolId, subSchoolId),
                )
            )
    }

    async bulkUpsert(
        input: BulkUpsertExamResultsInput,
        subSchoolId: string,
        gradedBy: string,
        userRole: string
    ): Promise<ExamResultRecord[]> {
        const [exam] = await db
            .select()
            .from(exams)
            .where(
                and(
                    eq(exams.id, input.examId),
                    eq(exams.subSchoolId, subSchoolId),
                )
            )

        if (!exam) {
            throw new AppError('NOT_FOUND', 'Examen introuvable', 404)
        }

        const isRetake = exam.retakeOfExamId !== null
        const staffRoles = ['admin', 'director', 'worker', 'super_admin']

        if (isRetake && !staffRoles.includes(userRole)) {
            throw new AppError(
                'FORBIDDEN',
                'Seul le staff peut saisir les notes d\'un examen de rattrapage',
                403,
            )
        }

        if (!isRetake && userRole !== 'teacher') {
            throw new AppError(
                'FORBIDDEN',
                'Seul le professeur peut saisir les notes de cet examen',
                403,
            )
        }

        const max = Number(exam.maxScore)
        for (const r of input.results) {
            if (r.score !== null && r.score > max) {
                throw new AppError(
                    'VALIDATION_ERROR',
                    `Score ${r.score} dépasse le maximum autorisé (${max})`,
                    422,
                )
            }
        }

        const rows = input.results.map(r => ({
            examId: input.examId,
            studentId: r.studentId,
            score: r.score !== null ? String(r.score) : null,
            comment: r.comment ?? null,
            gradedBy,
            gradedAt: new Date(),
        }))

        const results = await db
            .insert(examResults)
            .values(rows)
            .onConflictDoUpdate({
                target: [examResults.examId, examResults.studentId],
                set: {
                    score: sql`excluded.score`,
                    comment: sql`excluded."comment"`,
                    gradedBy: sql`excluded.graded_by`,
                    gradedAt: sql`excluded.graded_at`,
                    updatedAt: new Date(),
                },
            })
            .returning()

        await this.syncExamCompletionStatus(exam.id, exam.classId, exam.status)

        return results
    }

    private async syncExamCompletionStatus(
        examId: string,
        classId: string,
        currentStatus: string,
    ): Promise<void> {
        if (currentStatus === 'cancelled') return

        const [rosterCount] = await db
            .select({ value: count() })
            .from(enrollments)
            .where(eq(enrollments.classId, classId))

        const [gradedCount] = await db
            .select({ value: count() })
            .from(examResults)
            .where(and(
                eq(examResults.examId, examId),
                isNotNull(examResults.score),
            ))

        const totalStudents = rosterCount?.value ?? 0
        const totalGraded   = gradedCount?.value ?? 0

        if (totalStudents === 0) return

        const isFullyGraded = totalGraded >= totalStudents

        if (isFullyGraded && currentStatus !== 'completed') {
            await db.update(exams)
                .set({ status: 'completed', updatedAt: new Date() })
                .where(eq(exams.id, examId))
        } else if (!isFullyGraded && currentStatus === 'completed') {
            await db.update(exams)
                .set({ status: 'ongoing', updatedAt: new Date() })
                .where(eq(exams.id, examId))
        }
    }
}