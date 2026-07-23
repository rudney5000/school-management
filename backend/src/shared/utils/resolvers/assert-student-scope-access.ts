import {
    and,
    eq
} from 'drizzle-orm'
import { db } from '@/db'
import { users } from '@/db/schema/users'
import { workers } from '@/db/schema/workers'
import { teacherSchools } from '@/db/schema/teacher'
import { parentStudents } from '@/db/schema/parents'
import { AppError } from '@/shared/errors/app-error'

interface AssertParams {
    userId: string
    userRole: string
    studentId: string
    subSchoolId: string
}

export async function assertStudentScopeAccess(params: AssertParams): Promise<void> {
    const { userId, userRole, studentId, subSchoolId } = params

    if (userRole === 'super_admin') return

    if (userRole === 'teacher') {
        const [row] = await db
            .select({ teacherId: users.teacherId })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1)

        if (row?.teacherId) {
            const [link] = await db
                .select()
                .from(teacherSchools)
                .where(and(
                    eq(teacherSchools.teacherId, row.teacherId),
                    eq(teacherSchools.subSchoolId, subSchoolId),
                    eq(teacherSchools.isActive, true),
                ))
                .limit(1)
            if (link) return
        }
    }

    if (['admin', 'director', 'worker'].includes(userRole)) {
        const [row] = await db
            .select({ subSchoolId: workers.subSchoolId })
            .from(users)
            .innerJoin(workers, eq(workers.id, users.workerId))
            .where(eq(users.id, userId))
            .limit(1)
        if (row?.subSchoolId === subSchoolId) return
    }

    if (userRole === 'student') {
        const [row] = await db
            .select({ studentId: users.studentId })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1)
        if (row?.studentId === studentId) return
    }

    if (userRole === 'parent') {
        const [link] = await db
            .select()
            .from(parentStudents)
            .where(and(
                eq(parentStudents.parentId, userId),
                eq(parentStudents.studentId, studentId),
            ))
            .limit(1)
        if (link) return
    }

    throw new AppError('FORBIDDEN', 'Accès non autorisé', 403)
}