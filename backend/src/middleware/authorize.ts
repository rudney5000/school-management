import type { NextFunction, Request, Response } from 'express';
import { AppError } from '@/shared/errors/app-error';
import type { UserRole } from '@/shared/types/express';

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    if (!roles.includes(<"super_admin" | "admin" | "director" | "teacher" | "parent" | "student">req.user.role)) {
      next(new AppError('FORBIDDEN', 'Access denied', 403));
      return;
    }

    next();
  };
}