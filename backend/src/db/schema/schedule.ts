import {
    pgTable,
    uuid,
    varchar,
    time,
    timestamp,
    uniqueIndex
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import {classes} from "@/db/schema/classes";
import {courses} from "@/db/schema/courses";
import {dayOfWeekEnum} from "@/db/schema/enums";
import {teachers} from "@/db/schema/teacher";
import {subSchools} from "@/db/schema/subSchool";
import {
    liveSessionColumns
} from "@/db/schema/liveSessionColumns";

export const schedules = pgTable('schedules', {
    id: uuid('id').primaryKey().defaultRandom(),
    classId: uuid('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
    teacherId: uuid('teacher_id').notNull().references(() => teachers.id, { onDelete: 'cascade' }),
    dayOfWeek: dayOfWeekEnum('day_of_week').notNull(),
    startTime: time('start_time').notNull(),
    endTime: time('end_time').notNull(),
    room: varchar('room', { length: 50 }),
    academicYear: varchar('academic_year', { length: 20 }).notNull(),
    subSchoolId: uuid('sub_school_id').notNull().references(() => subSchools.id, { onDelete: 'cascade' }),
    ...liveSessionColumns,
    createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
    idx_schedule_no_overlap: uniqueIndex('idx_schedule_no_overlap').on(table.teacherId, table.classId, table.dayOfWeek, table.startTime),
}));

export const schedulesRelations = relations(schedules, ({ one }) => ({
    class: one(classes, {
        fields: [schedules.classId],
        references: [classes.id],
    }),
    course: one(courses, {
        fields: [schedules.courseId],
        references: [courses.id],
    }),
    teacher: one(teachers, {
        fields: [schedules.teacherId],
        references: [teachers.id],
    }),
}));