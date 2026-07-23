import {
    pgTable,
    uuid,
    varchar,
    integer,
    timestamp
} from 'drizzle-orm/pg-core'
import {relations} from "drizzle-orm";
import {
    attachableTypeEnum,
    attachmentCategoryEnum
} from "@/db/schema/enums";
import {users} from "@/db/schema/users";

export const attachments = pgTable('attachments', {
    id:             uuid('id').defaultRandom().primaryKey(),
    attachableType: attachableTypeEnum('attachable_type').notNull(),
    attachableId:   uuid('attachable_id').notNull(),
    category:       attachmentCategoryEnum("category").notNull(),
    key:            varchar('key', { length: 512 }).notNull(),
    filename:       varchar('filename', { length: 255 }).notNull(),
    mimeType:       varchar('mime_type', { length: 100 }).notNull(),
    size:           integer('size').notNull(),
    uploadedBy:     uuid('uploaded_by').notNull(),
    createdAt:      timestamp('created_at').defaultNow().notNull(),
})

export const attachmentsRelations = relations(attachments, ({ one }) => ({
    uploader: one(users, {
        fields: [attachments.uploadedBy],
        references: [users.id],
    }),
}))