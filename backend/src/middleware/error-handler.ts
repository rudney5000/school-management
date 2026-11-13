import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { DocumentError, type DocumentErrorCode } from '@school-hub/documents';
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

const DOCUMENT_ERROR_STATUS: Record<DocumentErrorCode, number> = {
  INVALID_LAYOUT: 400,
  UNKNOWN_BLOCK: 400,
  BLOCK_NOT_ALLOWED: 400,
  UNKNOWN_VARIABLE: 400,
  UNKNOWN_FORMATTER: 400,
  INVALID_FORMATTER_VALUE: 400,
  UNKNOWN_ASSET: 400,
  REQUIRED_BLOCK_MISSING: 400,
  UNKNOWN_FIELD: 400,
  DUPLICATE_FIELD: 400,
  FIELDS_NOT_ALLOWED: 400,
  INVALID_FIELDS: 400,
  UNKNOWN_DOCUMENT_TYPE: 400,
  INVALID_PARAMS: 400,
  NO_COLLECTOR: 400,
  // The data read from the school does not fit the document: not the caller's fault.
  INVALID_PAYLOAD: 422,
  NO_TEMPLATE: 422,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INVALID_POLICY: 400,
  UNKNOWN_FUNCTION: 400,
  EVENT_NOT_ALLOWED: 400,
  FUNCTION_NOT_ALLOWED: 400,
  INVALID_ARGS: 400,
  TOO_MANY_STEPS: 400,
  // The school's policy refuses: the request is well formed, the situation does not allow it.
  FEES_UNPAID: 422,
  MISSING_GRADES: 422,
  ATTENDANCE_TOO_LOW: 422,
  ALREADY_ISSUED: 422,
  ROLE_NOT_ALLOWED: 422,
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

  if (error instanceof DocumentError) {
    const details = error.issues.reduce<Record<string, string[]>>((acc, issue) => {
      const key = issue.path || 'root';
      acc[key] ??= [];
      acc[key].push(`${issue.code}: ${issue.message}`);
      return acc;
    }, {});

    res.status(DOCUMENT_ERROR_STATUS[error.code]).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.issues.length ? { details } : {}),
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
