import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { users } from '@/db/schema/users'
import { workers } from '@/db/schema/workers'
import { AppError } from '@/shared/errors/app-error'

interface AssertParams {
    userId: string
    userRole: string
    teacherId: string
    subSchoolId: string
}

export async function assertTeacherScopeAccess(params: AssertParams): Promise<void> {
    const { userId, userRole, teacherId, subSchoolId } = params

    if (userRole === 'super_admin') return

    if (['admin', 'director', 'worker'].includes(userRole)) {
        const [row] = await db
            .select({ subSchoolId: workers.subSchoolId })
            .from(users)
            .innerJoin(workers, eq(workers.id, users.workerId))
            .where(eq(users.id, userId))
            .limit(1)
        if (row?.subSchoolId === subSchoolId) return
    }

    if (userRole === 'teacher') {
        const [row] = await db
            .select({ teacherId: users.teacherId })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1)
        if (row?.teacherId === teacherId) return
    }

    throw new AppError(
        'FORBIDDEN',
        'Accès non autorisé',
        403
    )
}