import { createHash } from 'crypto'
import {
    and,
    eq
} from 'drizzle-orm'
import { db } from '@/db'
import type {
    BulletinSignDto,
    DocumentSignatureStrategy
} from '@/modules/signature/document-signature.schema'
import {AppError} from "@/shared/errors/app-error";
import {grades} from "@/db/schema";

export const bulletinSignatureStrategy: DocumentSignatureStrategy<'bulletin'> = {
    allowedSignerRoles: ['director', 'admin', 'super_admin'],

    async resolveScope({
                           subSchoolId,
                           classId,
                           academicPeriodId,
                       }: BulletinSignDto) {
        return {
            documentType: 'bulletin',
            documentRef: { academicPeriodId },
            subSchoolId,
            classId,
        }
    },

    async assertReadyToSign({ classId, documentRef }) {
        const incomplete = await db
            .select({ id: grades.id })
            .from(grades)
            .where(
                and(
                    eq(grades.classId, classId!),
                    eq(grades.academicPeriodId, documentRef!.academicPeriodId),
                    // TODO: adapte à ta vraie condition "note manquante"
                )
            )
        if (incomplete.length > 0) {
            throw new AppError('GRADES_INCOMPLETE', 'Certaines notes ne sont pas encore saisies', 422);
        }
    },

    async computeContentHash({ classId, documentRef }) {
        const classGrades = await db
            .select({
                id: grades.id,
                studentId: grades.studentId,
                courseId: grades.courseId,
                score: grades.score,
                gradeType: grades.gradeType,
            })
            .from(grades)
            .where(
                and(
                    eq(grades.classId, classId!),
                    eq(grades.academicPeriodId, documentRef!.academicPeriodId)
                )
            )

        const normalized = classGrades
            .map((g) => `${g.id}:${g.studentId}:${g.courseId}:${g.gradeType}:${g.score ?? 'null'}`)
            .sort()
            .join('|')

        return createHash('sha256').update(normalized).digest('hex')
    },
}