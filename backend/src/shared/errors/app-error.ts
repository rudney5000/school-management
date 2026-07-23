export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'BAD_REQUEST'
  | 'INTERNAL_ERROR'
  | 'CALL_ENDED'
  | 'INVALID_STATE'
  | 'NOT_LIVE'
  | 'NOT_SIGNED'
  | 'SIGNATURE_STALE'
  | 'GRADES_INCOMPLETE';

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;
  readonly details?: Record<string, string[]>;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number,
    details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}
