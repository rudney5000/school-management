import { eq } from 'drizzle-orm';
import { GradesService } from '@/modules/grades/grades.service'
import type {
    DocumentSignatureStrategy,
    BulletinSignDto
} from '@/modules/signature/document-signature.schema'
import {enrollments} from "@/db/schema";
import {db} from "@/db";

const gradesService = new GradesService()

export const bulletinSignatureStrategy: DocumentSignatureStrategy<'bulletin'> = {
    allowedSignerRoles: ['director', 'admin', 'super_admin'],

    async resolveScope({ subSchoolId, classId, studentId, academicPeriodId }: BulletinSignDto) {
        return {
            documentType: 'bulletin',
            documentRef: { academicPeriodId },
            subSchoolId,
            classId,
            studentId,
        }
    },

    async assertReadyToSign({ classId, studentId, documentRef }) {
        await gradesService.ensureBulletinCanBeSigned(
            studentId!,
            classId!,
            documentRef!.academicPeriodId,
        )
    },

    async computeContentHash({ classId, studentId, documentRef }) {
        return gradesService.computeBulletinHash(
            studentId!,
            classId!,
            documentRef!.academicPeriodId,
        )
    },

    async resolveBatchTargets(batchParams) {
        const classEnrollments = await db
            .select({ studentId: enrollments.studentId })
            .from(enrollments)
            .where(eq(enrollments.classId, batchParams.classId!))

        return classEnrollments.map((e) => ({
            subSchoolId: batchParams.subSchoolId!,
            classId: batchParams.classId!,
            academicPeriodId: batchParams.academicPeriodId!,
            studentId: e.studentId,
        }))
    },
}