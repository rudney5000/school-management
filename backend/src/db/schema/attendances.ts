import {
    pgTable,
    uuid,
    varchar,
    date,
    timestamp,
    uniqueIndex,
    text
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import {students} from "./students";
import {teachers} from "./teacher";
import {
    attendanceStatusEnum,
    attendanceTargetEnum
} from "./enums";
import {classes} from "@/db/schema/classes";
import {courses} from "@/db/schema/courses";
import {subSchools} from "@/db/schema/subSchool";

export const attendances = pgTable('attendances', {
    id: uuid('id').primaryKey().defaultRandom(),

    targetType: attendanceTargetEnum('target_type').notNull(),

    studentId: uuid('student_id')
        .references(() => students.id),

    teacherId: uuid('teacher_id')
        .references(() => teachers.id),

    date: date('date').notNull(),

    status: attendanceStatusEnum('status').notNull(),

    notedAt: timestamp('noted_at')
        .defaultNow()
        .notNull(),
});

export const studentAttendances = pgTable('student_attendances', {
    id: uuid('id').primaryKey().defaultRandom(),

    subSchoolId: uuid('sub_school_id')
        .notNull()
        .references(() => subSchools.id, { onDelete: 'cascade' }),

    studentId: uuid('student_id')
        .notNull()
        .references(() => students.id, { onDelete: 'cascade' }),

    classId: uuid('class_id')
        .references(() => classes.id),

    courseId: uuid('course_id')
        .references(() => courses.id),

    teacherId: uuid('teacher_id')
        .references(() => teachers.id),

    date: date('date').notNull(),

    status: attendanceStatusEnum('status').notNull(),

    reason: text('reason'),

    note: varchar('note', { length: 255 }),

    notedAt: timestamp('noted_at')
        .defaultNow()
        .notNull(),
});

export const teacherAttendances = pgTable('teacher_attendances', {
    id: uuid('id')
        .primaryKey()
        .defaultRandom(),
    subSchoolId: uuid('sub_school_id')
        .notNull()
        .references(() => subSchools.id, { onDelete: 'cascade' }),
    teacherId: uuid('teacher_id')
        .notNull()
        .references(() => teachers.id, { onDelete: 'cascade' }),
    date: date('date')
        .notNull(),
    status: attendanceStatusEnum('status')
        .notNull(),
    reason: text('reason'),
    notedAt: timestamp('noted_at')
        .notNull()
        .defaultNow(),
}, (table) => ({
    idx_teacher_attendance_unique: uniqueIndex('idx_teacher_attendance_unique')
        .on(table.teacherId, table.date),
}));

export const studentAttendancesRelations = relations(studentAttendances, ({ one }) => ({
    student: one(students, { fields: [studentAttendances.studentId], references: [students.id] }),
    subSchool: one(subSchools, { fields: [studentAttendances.subSchoolId], references: [subSchools.id] }),
}));

export const teacherAttendancesRelations = relations(teacherAttendances, ({ one }) => ({
    teacher: one(teachers, { fields: [teacherAttendances.teacherId], references: [teachers.id] }),
    subSchool: one(subSchools, { fields: [teacherAttendances.subSchoolId], references: [subSchools.id] }),
}));