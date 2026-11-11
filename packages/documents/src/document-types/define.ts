import type { z } from 'zod';
import type { BlockType } from '../engine/layout';

export type DocumentTypeKey =
  | 'bulletin'
  | 'receipt'
  | 'certificate'
  | 'diploma'
  | 'enrollment'
  | 'reenrollment'
  | 'supplies'
  | 'free';

export type SubjectType = 'student' | 'payment' | 'class' | 'level' | 'teacher';

/** How issued documents are numbered: SJG-BUL-2025-2026-000045. */
export interface NumberingRule {
  /** Type part of the number (BUL, REC, CER…). */
  prefix: string;
  /** Counters restart every school year or every calendar year. */
  period: 'schoolYear' | 'calendarYear';
}

/**
 * A document type is the contract between the backend collector, which
 * produces the payload, and the templates, which may only use the variables
 * and blocks it declares.
 */
export interface DocumentTypeDefinition<
  P extends z.ZodTypeAny = z.ZodTypeAny,
  D extends z.ZodTypeAny = z.ZodTypeAny,
> {
  key: DocumentTypeKey;
  /** What the document is about; null for a free document, written by hand. */
  subject: SubjectType | null;
  /**
   * True when a scope has at most one live template of this type and issuing
   * picks it alone (the bulletin). False when the school keeps several and
   * the person issuing chooses one (certificates, attestations…).
   */
  oneTemplatePerScope: boolean;
  /** True when the person issuing types values into the template's fields (free documents). */
  manualFields?: boolean;
  /** What the caller passes to issue a document (ids). */
  params: P;
  /** What the collector returns and the template reads. */
  payload: D;
  /** Bumped when the payload shape changes, and stored with every issued document. */
  payloadVersion: number;
  blocks: readonly BlockType[];
  /** Blocks a template of this type cannot be published without. */
  requiredBlocks: readonly BlockType[];
  numbering: NumberingRule | null;
  /** The school year a payload belongs to ("2025-2026"), for `schoolYear` numbering. */
  schoolYearOf?(payload: z.output<D>): string;
  /**
   * What the public verification page may show. Only identity, never grades
   * or amounts: the page is open to anyone holding the QR code.
   */
  publicView(payload: z.output<D>): { schoolName: string; holderName: string | null };
  /** Data used for previews and tests. */
  sample: z.input<D>;
}

export function defineDocumentType<P extends z.ZodTypeAny, D extends z.ZodTypeAny>(
  definition: DocumentTypeDefinition<P, D>,
): DocumentTypeDefinition<P, D> {
  for (const required of definition.requiredBlocks) {
    if (!definition.blocks.includes(required)) {
      throw new Error(`${definition.key}: required block ${required} is not an allowed block`);
    }
  }
  if (definition.numbering?.period === 'schoolYear' && !definition.schoolYearOf) {
    throw new Error(`${definition.key}: schoolYear numbering needs schoolYearOf`);
  }
  return definition;
}

/** Variables the engine adds to every payload. */
export interface DocumentMeta {
  number: string;
  /** YYYY-MM-DD. */
  issuedAt: string;
  verifyUrl: string;
}
