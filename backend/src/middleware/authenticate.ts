import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { AppError } from '@/shared/errors/app-error';
import type { TokenPayload } from '@/modules/auth/auth.service';

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    throw new AppError('UNAUTHORIZED', 'Missing authorization header', 401);
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
    req.user = {
      id:          payload.id,
      email:       payload.email,
      role:        payload.role,
      schoolId:    payload.schoolId,
      subSchoolId: payload.subSchoolId,
    };
    next();
  } catch {
    throw new AppError('UNAUTHORIZED', 'Invalid or expired token', 401);
  }
};