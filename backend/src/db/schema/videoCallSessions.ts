import {
    pgTable,
    uuid,
    varchar,
    uniqueIndex,
    timestamp,
    index
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { subSchools } from '@/db/schema/subSchool';
import { users } from '@/db/schema/users';
import {conversations} from "@/db/schema/chat";
import {videoCallStatusEnum} from "@/db/schema/enums";

export const videoCallSessions = pgTable('video_call_sessions', {
    id: uuid('id').primaryKey().defaultRandom(),
    subSchoolId: uuid('sub_school_id')
        .notNull()
        .references(() => subSchools.id, { onDelete: 'cascade' }),
    conversationId: uuid('conversation_id')
        .references(() => conversations.id, { onDelete: 'set null' }),
    roomName: varchar('room_name', { length: 255 }).notNull(),
    initiatedBy: uuid('initiated_by')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    status: videoCallStatusEnum('status').notNull().default('active'),
    startedAt: timestamp('started_at').notNull().defaultNow(),
    endedAt: timestamp('ended_at'),
}, (table) => ({
    uniq_room_name: uniqueIndex('uniq_video_call_room_name').on(table.roomName),
    idx_video_calls_sub_school: index('idx_video_calls_sub_school').on(table.subSchoolId),
    idx_video_calls_conversation: index('idx_video_calls_conversation').on(table.conversationId),
}));

export const videoCallParticipants = pgTable('video_call_participants', {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id')
        .notNull()
        .references(() => videoCallSessions.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    joinedAt: timestamp('joined_at').notNull().defaultNow(),
    leftAt: timestamp('left_at'),
}, (table) => ({
    idx_participants_session: index('idx_video_call_participants_session').on(table.sessionId),
    idx_participants_user: index('idx_video_call_participants_user').on(table.userId),
}));

export const videoCallSessionsRelations = relations(videoCallSessions, ({ one, many }) => ({
    subSchool: one(subSchools, {
        fields: [videoCallSessions.subSchoolId],
        references: [subSchools.id],
    }),
    conversation: one(conversations, {
        fields: [videoCallSessions.conversationId],
        references: [conversations.id],
    }),
    initiator: one(users, {
        fields: [videoCallSessions.initiatedBy],
        references: [users.id],
    }),
    participants: many(videoCallParticipants),
}));

export const videoCallParticipantsRelations = relations(videoCallParticipants, ({ one }) => ({
    session: one(videoCallSessions, {
        fields: [videoCallParticipants.sessionId],
        references: [videoCallSessions.id],
    }),
    user: one(users, {
        fields: [videoCallParticipants.userId],
        references: [users.id],
    }),
}));