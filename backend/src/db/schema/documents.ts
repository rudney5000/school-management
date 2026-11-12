import { index, pgTable, primaryKey, timestamp, uuid } from 'drizzle-orm/pg-core';
import {
  assetKindEnum,
  documentTables,
  documentTypeEnum,
  issuedStatusEnum,
  outboxStatusEnum,
  policyEventEnum,
  subjectTypeEnum,
} from '@school-hub/documents';
import { parents } from './parents';
import { schools } from './school';
import { subSchools } from './subSchool';
import { users } from './users';

// Re-exported so drizzle-kit sees the enums and puts them in the migration.
export {
  assetKindEnum,
  documentTypeEnum,
  issuedStatusEnum,
  outboxStatusEnum,
  policyEventEnum,
  subjectTypeEnum,
};

export const {
  documentFolders,
  documentTemplates,
  documentTemplateVersions,
  templateAssets,
  issuedDocuments,
  documentNumberSequences,
  documentPolicies,
  documentPolicyVersions,
  documentOutbox,
} = documentTables({ schools, subSchools, users });

/**
 * Documents shared with a parent by the publishToParentPortal policy
 * function. One row per document and parent, so running the action twice
 * shares once. The parent portal reads it; the document's status says
 * whether it is still valid.
 */
export const documentParentShares = pgTable(
  'document_parent_shares',
  {
    issuedDocumentId: uuid('issued_document_id')
      .notNull()
      .references(() => issuedDocuments.id, { onDelete: 'restrict' }),
    parentId: uuid('parent_id')
      .notNull()
      .references(() => parents.id, { onDelete: 'cascade' }),
    sharedAt: timestamp('shared_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.issuedDocumentId, t.parentId] }),
    byParent: index('idx_document_parent_shares_parent').on(t.parentId, t.sharedAt),
  }),
);
