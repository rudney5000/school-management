import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '@/shared/errors/app-error';
import { env } from '@/config/env';

type ErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
};

export function errorHandler(
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
    } satisfies ErrorResponse);
    return;
  }

  if (error instanceof ZodError) {
    const details = error.errors.reduce<Record<string, string[]>>((acc, issue) => {
      const key = issue.path.join('.') || 'root';
      acc[key] ??= [];
      acc[key].push(issue.message);
      return acc;
    }, {});

    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details,
      },
    } satisfies ErrorResponse);
    return;
  }

  if (env.NODE_ENV !== 'production') {
    console.error(error);
  }

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An internal error occurred',
    },
  } satisfies ErrorResponse);
}