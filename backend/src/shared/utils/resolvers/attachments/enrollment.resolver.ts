import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { enrollments } from '@/db/schema/enrollments'
import { students } from '@/db/schema/students'
import { AppError } from '@/shared/errors/app-error'
import {
    AttachmentContextResolver
} from "@/shared/utils/resolvers/attachments/attachment-context-resolver";
import {
    assertStudentScopeAccess
} from "@/shared/utils/resolvers/assert-student-scope-access";

export class EnrollmentAttachmentResolver implements AttachmentContextResolver {
    async resolve(userId: string, userRole: string, enrollmentId: string) {
        const [row] = await db
            .select({ subSchoolId: students.subSchoolId, studentId: enrollments.studentId })
            .from(enrollments)
            .innerJoin(students, eq(students.id, enrollments.studentId))
            .where(eq(enrollments.id, enrollmentId))
            .limit(1)

        if (!row) throw new AppError('NOT_FOUND', 'Inscription introuvable', 404)

        await assertStudentScopeAccess({
            userId,
            userRole,
            studentId: row.studentId,
            subSchoolId: row.subSchoolId,
        })

        return { subSchoolId: row.subSchoolId }
    }
}