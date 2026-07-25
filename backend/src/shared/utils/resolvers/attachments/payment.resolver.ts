import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { students } from '@/db/schema/students'
import { AppError } from '@/shared/errors/app-error'
import {payments} from "@/db/schema";
import {
    AttachmentContextResolver
} from "@/shared/utils/resolvers/attachments/attachment-context-resolver";
import {
    assertStudentScopeAccess
} from "@/shared/utils/resolvers/assert-student-scope-access";

export class PaymentAttachmentResolver implements AttachmentContextResolver {
    async resolve(userId: string, userRole: string, paymentId: string) {
        const [row] = await db
            .select({ subSchoolId: students.subSchoolId, studentId: payments.studentId })
            .from(payments)
            .innerJoin(students, eq(students.id, payments.studentId))
            .where(eq(payments.id, paymentId))
            .limit(1)

        if (!row) throw new AppError('NOT_FOUND', 'Paiement introuvable', 404)

        await assertStudentScopeAccess({
            userId,
            userRole,
            studentId: row.studentId,
            subSchoolId: row.subSchoolId,
        })
        return { subSchoolId: row.subSchoolId }
    }
}