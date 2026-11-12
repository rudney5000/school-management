/**
 * Stable error codes. The backend maps them to HTTP responses and the
 * back-office shows them next to the faulty block, so they never change
 * meaning once published.
 */
export type DocumentErrorCode =
  | 'INVALID_LAYOUT'
  | 'UNKNOWN_BLOCK'
  | 'BLOCK_NOT_ALLOWED'
  | 'UNKNOWN_VARIABLE'
  | 'UNKNOWN_FORMATTER'
  | 'INVALID_FORMATTER_VALUE'
  | 'UNKNOWN_ASSET'
  | 'REQUIRED_BLOCK_MISSING'
  | 'UNKNOWN_FIELD'
  | 'DUPLICATE_FIELD'
  | 'FIELDS_NOT_ALLOWED'
  | 'INVALID_FIELDS'
  | 'UNKNOWN_DOCUMENT_TYPE'
  | 'NO_COLLECTOR'
  | 'INVALID_PARAMS'
  | 'INVALID_PAYLOAD'
  | 'NO_TEMPLATE'
  | 'NOT_FOUND'
  | 'CONFLICT'
  // Publication of a policy: INVALID_POLICY carries one issue per faulty step.
  | 'INVALID_POLICY'
  | 'UNKNOWN_FUNCTION'
  | 'EVENT_NOT_ALLOWED'
  | 'FUNCTION_NOT_ALLOWED'
  | 'INVALID_ARGS'
  | 'TOO_MANY_STEPS'
  // Refusals of a before… step: the issue or the revocation does not happen.
  | 'FEES_UNPAID'
  | 'MISSING_GRADES'
  | 'ATTENDANCE_TOO_LOW'
  | 'ALREADY_ISSUED'
  | 'ROLE_NOT_ALLOWED';

/** One problem found in a template, located by a JSON path such as `blocks.3.text`. */
export interface LayoutIssue {
  code: DocumentErrorCode;
  path: string;
  message: string;
}

export class DocumentError extends Error {
  readonly code: DocumentErrorCode;
  readonly issues: LayoutIssue[];

  constructor(code: DocumentErrorCode, message: string, issues: LayoutIssue[] = []) {
    super(message);
    this.name = 'DocumentError';
    this.code = code;
    this.issues = issues;
  }
}
