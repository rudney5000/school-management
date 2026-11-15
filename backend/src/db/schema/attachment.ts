import { pgTable, uuid, varchar, integer, timestamp, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import {
  attachableTypeEnum,
  attachmentCategoryEnum,
  attachmentStatusEnum,
} from '@/db/schema/enums';
import { users } from '@/db/schema/users';

export const attachments = pgTable(
  'attachments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    attachableType: attachableTypeEnum('attachable_type').notNull(),
    attachableId: uuid('attachable_id').notNull(),
    category: attachmentCategoryEnum('category').notNull(),
    key: varchar('key', { length: 512 }).notNull(),
    filename: varchar('filename', { length: 255 }).notNull(),
    mimeType: varchar('mime_type', { length: 100 }).notNull(),
    size: integer('size').notNull(),
    width: integer('width'),
    height: integer('height'),
    uploadedBy: uuid('uploaded_by').notNull(),
    status: attachmentStatusEnum('status').notNull().default('pending'),
    rejectionReason: text('rejection_reason'),
    validatedBy: uuid('validated_by').references(() => users.id),
    validatedAt: timestamp('validated_at', { withTimezone: true }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    // A curriculum file is one S3 object: confirming the same key twice would
    // leave a second row pointing at an object the first one's removal deletes.
    // Matched on the key's folder rather than on attachableType: the migration
    // that adds the 'curriculum' enum value cannot use it in the same
    // transaction, and an enum-to-text cast is not allowed in an index predicate.
    idx_attachments_curriculum_key: uniqueIndex('idx_attachments_curriculum_key')
      .on(table.key)
      .where(sql`${table.key} LIKE 'schools/%/curriculums/%'`),
  }),
);

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  uploader: one(users, {
    fields: [attachments.uploadedBy],
    references: [users.id],
  }),
  validator: one(users, {
    fields: [attachments.validatedBy],
    references: [users.id],
  }),
}));
