import {
    pgTable,
    uuid,
    varchar,
    integer,
    timestamp
} from 'drizzle-orm/pg-core'
import {relations} from "drizzle-orm";
import {messages} from "@/db/schema/chat";

export const messageAttachments = pgTable('message_attachments', {
    id:          uuid('id').primaryKey().defaultRandom(),
    messageId:   uuid('message_id').notNull().references(() => messages.id, { onDelete: 'cascade' }),
    key:         varchar('key', { length: 512 }).notNull(),
    filename:    varchar('filename', { length: 255 }).notNull(),
    mimeType:    varchar('mime_type', { length: 100 }).notNull(),
    size:        integer('size').notNull(),
    width:       integer('width'),
    height:      integer('height'),
    createdAt:   timestamp('created_at').defaultNow().notNull(),
})

export const messageAttachmentsRelations = relations(messageAttachments, ({ one }) => ({
    message: one(messages, {
        fields: [messageAttachments.messageId],
        references: [messages.id]
    }),
}))