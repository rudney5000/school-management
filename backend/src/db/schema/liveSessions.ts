import {
    pgTable,
    uuid,
    varchar,
    uniqueIndex,
    timestamp,
    index,
    check,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { subSchools } from '@/db/schema/subSchool';
import { users } from '@/db/schema/users';
import { courses } from '@/db/schema/courses';
import { classes } from '@/db/schema/classes';
import {liveSessionStatusEnum} from "@/db/schema/enums";
import {schedules} from "@/db/schema/schedule";
import {events} from "@/db/schema/events";
import {exams} from "@/db/schema/exam";
import {conversations} from "@/db/schema/chat";


export const liveSessions = pgTable('live_sessions', {
    id: uuid('id').primaryKey().defaultRandom(),
    subSchoolId: uuid('sub_school_id')
        .notNull()
        .references(() => subSchools.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id')
        .references(() => courses.id, { onDelete: 'cascade' }),
    classId: uuid('class_id')
        .references(() => classes.id, { onDelete: 'cascade' }),
    scheduleId: uuid('schedule_id')
        .references(() => schedules.id, { onDelete: 'cascade' }),
    eventId: uuid('event_id')
        .references(() => events.id, { onDelete: 'cascade' }),
    examId: uuid('exam_id')
        .references(() => exams.id, { onDelete: 'cascade' }),
    conversationId: uuid('conversation_id')
        .references(() => conversations.id, { onDelete: 'cascade' }),
    teacherId: uuid('teacher_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    roomName: varchar('room_name', { length: 255 }).notNull(),
    status: liveSessionStatusEnum('status').notNull().default('scheduled'),
    scheduledAt: timestamp('scheduled_at'),
    startedAt: timestamp('started_at'),
    endedAt: timestamp('ended_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
    uniq_room_name: uniqueIndex('uniq_live_session_room_name').on(table.roomName),
    idx_live_sessions_sub_school: index('idx_live_sessions_sub_school').on(table.subSchoolId),
    idx_live_sessions_course: index('idx_live_sessions_course').on(table.courseId),
    idx_live_sessions_class: index('idx_live_sessions_class').on(table.classId),
    idx_live_sessions_schedule: index('idx_live_sessions_schedule').on(table.scheduleId),
    idx_live_sessions_event: index('idx_live_sessions_event').on(table.eventId),
    idx_live_sessions_exam: index('idx_live_sessions_exam').on(table.examId),
    idx_live_sessions_conversation: index('idx_live_sessions_conversation').on(table.conversationId),
    idx_live_sessions_teacher: index('idx_live_sessions_teacher').on(table.teacherId),
    check_at_most_one_target: check(
        'check_live_session_at_most_one_target',
        sql`(
        (${table.courseId} IS NOT NULL)::int +
        (${table.classId} IS NOT NULL)::int +
        (${table.scheduleId} IS NOT NULL)::int +
        (${table.eventId} IS NOT NULL)::int +
        (${table.examId} IS NOT NULL)::int +
        (${table.conversationId} IS NOT NULL)::int
    ) <= 1`
    ),
}));

export const liveSessionViewers = pgTable('live_session_viewers', {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id')
        .notNull()
        .references(() => liveSessions.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    joinedAt: timestamp('joined_at').notNull().defaultNow(),
    leftAt: timestamp('left_at'),
}, (table) => ({
    idx_viewers_session: index('idx_live_session_viewers_session').on(table.sessionId),
    idx_viewers_user: index('idx_live_session_viewers_user').on(table.userId),
}));

export const liveSessionsRelations = relations(liveSessions, ({ one, many }) => ({
    subSchool: one(subSchools, {
        fields: [liveSessions.subSchoolId],
        references: [subSchools.id],
    }),
    course: one(courses, {
        fields: [liveSessions.courseId],
        references: [courses.id],
    }),
    class: one(classes, {
        fields: [liveSessions.classId],
        references: [classes.id],
    }),
    schedule: one(schedules, {
        fields: [liveSessions.scheduleId],
        references: [schedules.id]
    }),
    event: one(events, {
        fields: [liveSessions.eventId],
        references: [events.id]
    }),
    exam: one(exams, {
        fields: [liveSessions.examId],
        references: [exams.id]
    }),
    conversation: one(conversations, {
        fields: [liveSessions.conversationId],
        references: [conversations.id]
    }),
    teacher: one(users, {
        fields: [liveSessions.teacherId],
        references: [users.id],
    }),
    viewers: many(liveSessionViewers),
}));

export const liveSessionViewersRelations = relations(liveSessionViewers, ({ one }) => ({
    session: one(liveSessions, {
        fields: [liveSessionViewers.sessionId],
        references: [liveSessions.id],
    }),
    user: one(users, {
        fields: [liveSessionViewers.userId],
        references: [users.id],
    }),
}));