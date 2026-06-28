import {
    pgTable,
    uuid,
    timestamp,
    text,
    boolean,
    primaryKey,
    uniqueIndex
} from 'drizzle-orm/pg-core';
import {relations} from 'drizzle-orm';
import {
    conversationTypeEnum,
    memberRoleEnum,
    messageTypeEnum
} from "@/db/schema/enums";
import {users} from "@/db/schema/users";

export const conversations = pgTable('conversations', {
    id:          uuid('id').primaryKey().defaultRandom(),
    type:        conversationTypeEnum('type').notNull().default('dm'),
    name:        text('name'),
    description: text('description'),
    avatar:      text('avatar'),
    classId:     uuid('class_id'),
    courseId:    uuid('course_id'),
    subSchoolId: uuid('sub_school_id').notNull(),
    createdBy:   uuid('created_by').notNull().references(() => users.id),
    createdAt:   timestamp('created_at').defaultNow().notNull(),
    updatedAt:   timestamp('updated_at').defaultNow().notNull(),
})

export const conversationMembers = pgTable('conversation_members', {
    id:             uuid('id').primaryKey().defaultRandom(),
    conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
    userId:         uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    role:           memberRoleEnum('role').notNull().default('member'),
    lastReadAt:     timestamp('last_read_at').defaultNow(),
    isMuted:        boolean('is_muted').default(false).notNull(),
    joinedAt:       timestamp('joined_at').defaultNow().notNull(),
}, (table) => ({
    uniq: uniqueIndex('uniq_conversation_member').on(
        table.conversationId,
        table.userId
    ),
}))

export const messages = pgTable('messages', {
    id:             uuid('id').primaryKey().defaultRandom(),
    conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
    senderId:       uuid('sender_id').notNull().references(() => users.id),
    type:           messageTypeEnum('type').notNull().default('text'),
    content:        text('content'),
    replyToId:      uuid('reply_to_id'),
    isDeleted:      boolean('is_deleted').default(false).notNull(),
    deletedAt:      timestamp('deleted_at'),
    isEdited:       boolean('is_edited').default(false).notNull(),
    editedAt:       timestamp('edited_at'),
    createdAt:      timestamp('created_at').defaultNow().notNull(),
})

export const messageReactions = pgTable('message_reactions', {
    id:        uuid('id').primaryKey().defaultRandom(),
    messageId: uuid('message_id').notNull().references(() => messages.id, { onDelete: 'cascade' }),
    userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    emoji:     text('emoji').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    uniq: uniqueIndex('uniq_message_reaction').on(
        table.messageId,
        table.userId,
        table.emoji
    ),
}))

export const messageReadReceipts = pgTable('message_read_receipts', {
    messageId: uuid('message_id').notNull().references(() => messages.id, { onDelete: 'cascade' }),
    userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    readAt:    timestamp('read_at').defaultNow().notNull(),
}, (table) => ({
    uniq: uniqueIndex('uniq_message_read_receipt').on(
        table.messageId,
        table.userId
    ),
}))

export const conversationsRelations = relations(conversations, ({ many, one }) => ({
    members:  many(conversationMembers),
    messages: many(messages),
    creator:  one(users, { fields: [conversations.createdBy], references: [users.id] }),
}))

export const conversationMembersRelations = relations(conversationMembers, ({ one }) => ({
    conversation: one(conversations, { fields: [conversationMembers.conversationId], references: [conversations.id] }),
    user:         one(users, { fields: [conversationMembers.userId], references: [users.id] }),
}))

export const messagesRelations = relations(messages, ({ one, many }) => ({
    conversation: one(conversations, { fields: [messages.conversationId], references: [conversations.id] }),
    sender:       one(users, { fields: [messages.senderId], references: [users.id] }),
    replyTo:      one(messages, { fields: [messages.replyToId], references: [messages.id] }),
    reactions:    many(messageReactions),
    readReceipts: many(messageReadReceipts),
}))

export const messageReactionsRelations = relations(messageReactions, ({ one }) => ({
    message: one(messages, { fields: [messageReactions.messageId], references: [messages.id] }),
    user:    one(users, { fields: [messageReactions.userId], references: [users.id] }),
}))