import type { Request } from 'express';
import { AppError } from '@/shared/errors/app-error';

export function resolveSchoolId(req: Request): string {
    const id = req.user?.schoolId ?? (req.query.schoolId as string);
    if (!id) throw new AppError('BAD_REQUEST', 'schoolId is required', 400);
    return id;
}

export function resolveSubSchoolId(req: Request): string {
    const id = req.user?.subSchoolId ?? (req.query.subSchoolId as string);
    if (!id) throw new AppError('BAD_REQUEST', 'subSchoolId is required', 400);
    return id;
}