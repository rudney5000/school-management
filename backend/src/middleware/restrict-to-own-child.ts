import type {
    Request,
    Response,
    NextFunction
} from 'express';
import { db } from '@/db';
import { users } from '@/db/schema/users';
import { parentStudents } from '@/db/schema/parents';
import { and, eq } from 'drizzle-orm';
import { AppError } from '@/shared/errors/app-error';
import { asyncHandler } from '@/shared/utils/async-handler';

export const restrictToOwnChild = asyncHandler(
    async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        if (req.user!.role !== 'parent') {
            return next();
        }

        const studentId = (req.query.studentId as string | undefined) ?? req.body?.studentId;

        if (!studentId) {
            throw new AppError('BAD_REQUEST', 'studentId requis', 400);
        }

        const [userRecord] = await db
            .select({ parentId: users.parentId })
            .from(users)
            .where(eq(users.id, req.user!.id))
            .limit(1);

        if (!userRecord?.parentId) {
            throw new AppError('FORBIDDEN', 'Accès refusé', 403);
        }

        const [link] = await db
            .select()
            .from(parentStudents)
            .where(and(
                eq(parentStudents.parentId, userRecord.parentId),
                eq(parentStudents.studentId, studentId),
            ))
            .limit(1);

        if (!link) {
            throw new AppError('FORBIDDEN', 'Accès refusé', 403);
        }

        next();
    }
);