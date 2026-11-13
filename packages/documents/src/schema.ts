import { sql } from 'drizzle-orm';
import {
  foreignKey,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';

/**
 * The tables of the document engine. The package cannot import the
 * backend's `schools`, `sub_schools` and `users`, so the backend passes them
 * in and gets the new tables back (see backend/src/db/schema/documents.ts).
 */

export const documentTypeEnum = pgEnum('document_type', [
  'bulletin',
  'receipt',
  'certificate',
  'diploma',
  'enrollment',
  'reenrollment',
  'supplies',
  'free',
]);
export const subjectTypeEnum = pgEnum('document_subject_type', [
  'student',
  'payment',
  'class',
  'level',
  'teacher',
]);
export const issuedStatusEnum = pgEnum('issued_document_status', ['issued', 'revoked']);
export const assetKindEnum = pgEnum('template_asset_kind', [
  'logo',
  'stamp',
  'signature',
  'background',
  'image',
]);

export const policyEventEnum = pgEnum('document_policy_event', [
  'beforeIssue',
  'afterIssue',
  'beforeRevoke',
  'afterRevoke',
]);
export const outboxStatusEnum = pgEnum('document_outbox_status', ['pending', 'done', 'failed']);

type WithId = { id: AnyPgColumn };

export interface HostTables {
  schools: WithId;
  subSchools: WithId;
  users: WithId;
}

export const documentTables = ({ schools, subSchools, users }: HostTables) => {
  /** The school's tree of folders, only to file templates. */
  const documentFolders = pgTable(
    'document_folders',
    {
      id: uuid('id').primaryKey().defaultRandom(),
      schoolId: uuid('school_id')
        .notNull()
        .references(() => schools.id, { onDelete: 'restrict' }),
      parentId: uuid('parent_id'),
      name: varchar('name', { length: 120 }).notNull(),
      position: integer('position').notNull().default(0),
      createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
      updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    },
    (t) => ({
      // A folder is deleted only once empty, so restrict is the safety net.
      parent: foreignKey({
        name: 'fk_document_folders_parent',
        columns: [t.parentId],
        foreignColumns: [t.id],
      }).onDelete('restrict'),
      bySchool: index('idx_document_folders_school').on(t.schoolId),
    }),
  );

  const documentTemplates = pgTable(
    'document_templates',
    {
      id: uuid('id').primaryKey().defaultRandom(),
      schoolId: uuid('school_id')
        .notNull()
        .references(() => schools.id, { onDelete: 'restrict' }),
      subSchoolId: uuid('sub_school_id').references(() => subSchools.id, {
        onDelete: 'restrict',
      }),
      documentType: documentTypeEnum('document_type').notNull(),
      name: varchar('name', { length: 255 }).notNull(),
      folderId: uuid('folder_id').references(() => documentFolders.id, { onDelete: 'restrict' }),
      position: integer('position').notNull().default(0),
      draftLayout: jsonb('draft_layout'),
      activeVersion: integer('active_version'),
      archivedAt: timestamp('archived_at', { withTimezone: true }),
      createdBy: uuid('created_by')
        .notNull()
        .references(() => users.id),
      createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
      updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    },
    (t) => ({
      // Several live templates may share a type (certificates, attestations…).
      // For the types that allow only one per scope, the service checks it.
      bySchool: index('idx_document_templates_school').on(t.schoolId),
    }),
  );

  const documentTemplateVersions = pgTable(
    'document_template_versions',
    {
      templateId: uuid('template_id')
        .notNull()
        .references(() => documentTemplates.id, { onDelete: 'restrict' }),
      version: integer('version').notNull(),
      layout: jsonb('layout').notNull(),
      layoutFormat: integer('layout_format').notNull().default(1),
      note: text('note'),
      publishedBy: uuid('published_by')
        .notNull()
        .references(() => users.id),
      publishedAt: timestamp('published_at', { withTimezone: true }).notNull().defaultNow(),
    },
    (t) => ({ pk: primaryKey({ columns: [t.templateId, t.version] }) }),
  );

  const templateAssets = pgTable(
    'template_assets',
    {
      id: uuid('id').primaryKey().defaultRandom(),
      schoolId: uuid('school_id')
        .notNull()
        .references(() => schools.id, { onDelete: 'restrict' }),
      subSchoolId: uuid('sub_school_id').references(() => subSchools.id, {
        onDelete: 'restrict',
      }),
      kind: assetKindEnum('kind').notNull(),
      s3Key: text('s3_key').notNull(),
      mime: varchar('mime', { length: 50 }).notNull(),
      width: integer('width'),
      height: integer('height'),
      sizeBytes: integer('size_bytes').notNull(),
      createdBy: uuid('created_by')
        .notNull()
        .references(() => users.id),
      createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    },
    (t) => ({ bySchool: index('idx_template_assets_school').on(t.schoolId) }),
  );

  /** The rules of a group or a sub-school for one type, apart from the design. */
  const documentPolicies = pgTable(
    'document_policies',
    {
      id: uuid('id').primaryKey().defaultRandom(),
      schoolId: uuid('school_id')
        .notNull()
        .references(() => schools.id, { onDelete: 'restrict' }),
      subSchoolId: uuid('sub_school_id').references(() => subSchools.id, {
        onDelete: 'restrict',
      }),
      documentType: documentTypeEnum('document_type').notNull(),
      draftSteps: jsonb('draft_steps'),
      activeVersion: integer('active_version'),
      archivedAt: timestamp('archived_at', { withTimezone: true }),
      createdBy: uuid('created_by')
        .notNull()
        .references(() => users.id),
      createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
      updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    },
    (t) => ({
      // One live policy per scope and type; the group's applies where a sub-school has none.
      uniqGroup: uniqueIndex('uniq_document_policy_group')
        .on(t.schoolId, t.documentType)
        .where(sql`sub_school_id IS NULL AND archived_at IS NULL`),
      uniqSubSchool: uniqueIndex('uniq_document_policy_sub_school')
        .on(t.subSchoolId, t.documentType)
        .where(sql`sub_school_id IS NOT NULL AND archived_at IS NULL`),
      bySchool: index('idx_document_policies_school').on(t.schoolId),
    }),
  );

  const documentPolicyVersions = pgTable(
    'document_policy_versions',
    {
      policyId: uuid('policy_id')
        .notNull()
        .references(() => documentPolicies.id, { onDelete: 'restrict' }),
      version: integer('version').notNull(),
      // [{ on, fn, args }], args parsed with their defaults.
      steps: jsonb('steps').notNull(),
      note: text('note'),
      publishedBy: uuid('published_by')
        .notNull()
        .references(() => users.id),
      publishedAt: timestamp('published_at', { withTimezone: true }).notNull().defaultNow(),
    },
    (t) => ({ pk: primaryKey({ columns: [t.policyId, t.version] }) }),
  );

  const issuedDocuments = pgTable(
    'issued_documents',
    {
      // Generated before rendering: it is printed in the QR code.
      id: uuid('id').primaryKey(),
      schoolId: uuid('school_id')
        .notNull()
        .references(() => schools.id, { onDelete: 'restrict' }),
      subSchoolId: uuid('sub_school_id')
        .notNull()
        .references(() => subSchools.id, { onDelete: 'restrict' }),
      documentType: documentTypeEnum('document_type').notNull(),
      number: varchar('number', { length: 64 }).notNull(),
      // Null for a free document, which is about no record of the app.
      subjectType: subjectTypeEnum('subject_type'),
      subjectId: uuid('subject_id'),
      templateId: uuid('template_id').notNull(),
      templateVersion: integer('template_version').notNull(),
      payload: jsonb('payload').notNull(),
      payloadVersion: integer('payload_version').notNull(),
      contentHash: varchar('content_hash', { length: 64 }).notNull(),
      pdfKey: text('pdf_key').notNull(),
      status: issuedStatusEnum('status').notNull().default('issued'),
      revokedAt: timestamp('revoked_at', { withTimezone: true }),
      revokedReason: text('revoked_reason'),
      replacesId: uuid('replaces_id'),
      // The policy applied at issue, null when the school had none.
      policyId: uuid('policy_id'),
      policyVersion: integer('policy_version'),
      signedByUserId: uuid('signed_by_user_id').references(() => users.id),
      signedAt: timestamp('signed_at', { withTimezone: true }),
      issuedBy: uuid('issued_by')
        .notNull()
        .references(() => users.id),
      issuedAt: timestamp('issued_at', { withTimezone: true }).notNull().defaultNow(),
    },
    (t) => ({
      version: foreignKey({
        name: 'fk_issued_documents_template_version',
        columns: [t.templateId, t.templateVersion],
        foreignColumns: [documentTemplateVersions.templateId, documentTemplateVersions.version],
      }),
      replaces: foreignKey({
        name: 'fk_issued_documents_replaces',
        columns: [t.replacesId],
        foreignColumns: [t.id],
      }),
      policy: foreignKey({
        name: 'fk_issued_documents_policy_version',
        columns: [t.policyId, t.policyVersion],
        foreignColumns: [documentPolicyVersions.policyId, documentPolicyVersions.version],
      }),
      uniqNumber: uniqueIndex('uniq_issued_document_number').on(
        t.subSchoolId,
        t.documentType,
        t.number,
      ),
      bySubject: index('idx_issued_documents_subject').on(t.subjectType, t.subjectId),
      bySubSchool: index('idx_issued_documents_sub_school').on(
        t.subSchoolId,
        t.documentType,
        t.issuedAt,
      ),
      // The verification page looks up the document that replaces a revoked one.
      byReplaces: index('idx_issued_documents_replaces').on(t.replacesId),
    }),
  );

  const documentNumberSequences = pgTable(
    'document_number_sequences',
    {
      subSchoolId: uuid('sub_school_id')
        .notNull()
        .references(() => subSchools.id, { onDelete: 'restrict' }),
      documentType: documentTypeEnum('document_type').notNull(),
      // '2026' or '2025-2026'
      period: varchar('period', { length: 16 }).notNull(),
      lastNumber: integer('last_number').notNull().default(0),
      updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    },
    (t) => ({ pk: primaryKey({ columns: [t.subSchoolId, t.documentType, t.period] }) }),
  );

  /** The after… actions, written in the transaction of the document and run by the worker. */
  const documentOutbox = pgTable(
    'document_outbox',
    {
      // Also the idempotency key given to the function.
      id: uuid('id').primaryKey(),
      // Copied from the document, so the back-office lists a school's actions without a join.
      schoolId: uuid('school_id')
        .notNull()
        .references(() => schools.id, { onDelete: 'restrict' }),
      issuedDocumentId: uuid('issued_document_id')
        .notNull()
        .references(() => issuedDocuments.id, { onDelete: 'restrict' }),
      event: policyEventEnum('event').notNull(),
      fn: varchar('fn', { length: 64 }).notNull(),
      args: jsonb('args').notNull().default({}),
      status: outboxStatusEnum('status').notNull().default('pending'),
      attempts: integer('attempts').notNull().default(0),
      nextAttemptAt: timestamp('next_attempt_at', { withTimezone: true }).notNull().defaultNow(),
      lastError: text('last_error'),
      doneAt: timestamp('done_at', { withTimezone: true }),
      createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    },
    (t) => ({
      due: index('idx_document_outbox_due')
        .on(t.nextAttemptAt)
        .where(sql`status = 'pending'`),
      byDocument: index('idx_document_outbox_document').on(t.issuedDocumentId),
      bySchool: index('idx_document_outbox_school').on(t.schoolId, t.status, t.createdAt),
    }),
  );

  return {
    documentFolders,
    documentPolicies,
    documentPolicyVersions,
    documentOutbox,
    documentTemplates,
    documentTemplateVersions,
    templateAssets,
    issuedDocuments,
    documentNumberSequences,
  };
};

export type DocumentTables = ReturnType<typeof documentTables>;
