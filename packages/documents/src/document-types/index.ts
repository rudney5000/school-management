import { DocumentError } from '../errors';
import { bulletin } from './bulletin';
import { freeDocument } from './free';
import type { DocumentTypeDefinition, DocumentTypeKey } from './define';

export * from './define';
export { bulletin, bulletinPayload, type BulletinPayload } from './bulletin';
export { freeDocument, freePayload, type FreePayload } from './free';

/** The types the engine knows today; the others arrive with their collectors. */
export const DOCUMENT_TYPES: Partial<Record<DocumentTypeKey, DocumentTypeDefinition>> = {
  bulletin,
  free: freeDocument,
};

export function getDocumentType(key: string): DocumentTypeDefinition {
  const type = DOCUMENT_TYPES[key as DocumentTypeKey];
  if (!type) throw new DocumentError('UNKNOWN_DOCUMENT_TYPE', `Unknown document type: ${key}`);
  return type;
}
