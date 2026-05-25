import { pgTable, uuid, varchar, date, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import {students} from "./students";
import {teachers} from "./teacher";
import {attendanceStatusEnum} from "./enums";

export const studentAttendances = pgTable('student_attendances', {
    id: uuid('id').primaryKey().defaultRandom(),
    studentId: uuid('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    status: attendanceStatusEnum('status').notNull(),
    notedAt: timestamp('noted_at').notNull().defaultNow(),
}, (table) => ({
    idx_student_attendance_unique: uniqueIndex('idx_student_attendance_unique').on(table.studentId, table.date)
}));

export const teacherAttendances = pgTable('teacher_attendances', {
    id: uuid('id').primaryKey().defaultRandom(),
    teacherId: uuid('teacher_id').notNull().references(() => teachers.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    status: varchar('status', { length: 20 }).notNull(),
    notedAt: timestamp('noted_at').notNull().defaultNow(),
}, (table) => ({
    idx_teacher_attendance_unique: uniqueIndex('idx_teacher_attendance_unique').on(table.teacherId, table.date),
}));

export const studentAttendancesRelations = relations(studentAttendances, ({ one }) => ({
    student: one(students, {
        fields: [studentAttendances.studentId],
        references: [students.id],
    }),
}));

export const teacherAttendancesRelations = relations(teacherAttendances, ({ one }) => ({
    teacher: one(teachers, {
        fields: [teacherAttendances.teacherId],
        references: [teachers.id],
    }),
}));