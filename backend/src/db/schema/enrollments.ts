import { pgTable, uuid, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import {students} from "@/db/schema/students";
import {classes} from "@/db/schema/classes";

export const enrollments = pgTable('enrollments', {
    id: uuid('id').primaryKey().defaultRandom(),
    studentId: uuid('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
    classId: uuid('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
    enrollmentDate: timestamp('enrollment_date').notNull().defaultNow(),
}, (table) => ({
    idx_enrollment_unique: uniqueIndex('idx_enrollment_unique').on(table.studentId, table.classId),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
    student: one(students, {
        fields: [enrollments.studentId],
        references: [students.id],
    }),
    class: one(classes, {
        fields: [enrollments.classId],
        references: [classes.id],
    }),
}));