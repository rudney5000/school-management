import { z } from 'zod';
import { DOCUMENT_TYPES, STARTERS, type DocumentTypeKey } from '@school-hub/documents';

const documentType = z
  .string()
  .refine((key) => key in DOCUMENT_TYPES, 'Unknown document type')
  .transform((key) => key as DocumentTypeKey);

// The layout itself is checked by the engine, which reports every problem at once.
const layout = z.record(z.unknown());

export const idParamsSchema = z.object({ id: z.string().uuid() });

export const createTemplateSchema = z
  .object({
    documentType,
    name: z.string().trim().min(1).max(255),
    /** Absent or null: the template of the whole group. */
    subSchoolId: z.string().uuid().nullable().optional(),
    /** The folder to file it in; absent or null at the root. */
    folderId: z.string().uuid().nullable().optional(),
    layout: layout.optional(),
    /** Start from a ready-made design instead of a layout. */
    starter: z
      .string()
      .refine((key) => STARTERS.some((s) => s.key === key), 'Unknown starter')
      .optional(),
  })
  .refine((body) => (body.layout === undefined) !== (body.starter === undefined), {
    message: 'Give either a layout or a starter',
    path: ['layout'],
  });

export const saveDraftSchema = z.object({ layout });

export const previewSchema = z.object({
  version: z.number().int().positive().optional(),
  /** A layout being edited, not saved yet. */
  layout: layout.optional(),
});

export const typeParamsSchema = z.object({ type: documentType });

export const publishSchema = z.object({ note: z.string().trim().max(500).nullable().optional() });

export const activateSchema = z.object({ version: z.number().int().positive() });

export const issueSchema = z.object({
  type: documentType,
  /** Absent: the sub-school of the token. */
  subSchoolId: z.string().uuid().optional(),
  params: z.record(z.unknown()).default({}),
  /** The template chosen, for types with several templates (free documents). */
  templateId: z.string().uuid().optional(),
  /** Values of the template's fields, by key. */
  fields: z.record(z.union([z.string(), z.number()])).optional(),
  locale: z.enum(['fr', 'en']).optional(),
  replaces: z
    .object({ id: z.string().uuid(), reason: z.string().trim().min(1).max(500) })
    .optional(),
});

export const listIssuedQuerySchema = z.object({
  subSchoolId: z.string().uuid().optional(),
  documentType: documentType.optional(),
  subjectId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export const revokeSchema = z.object({ reason: z.string().trim().min(1).max(500) });

const name = z.string().trim().min(1).max(120);
const index = z.number().int().min(0).max(10_000);

export const createFolderSchema = z.object({
  name,
  parentId: z.string().uuid().nullable().default(null),
});
export const renameSchema = z.object({ name });
export const moveFolderSchema = z.object({ parentId: z.string().uuid().nullable(), index });
export const moveTemplateSchema = z.object({ folderId: z.string().uuid().nullable(), index });
