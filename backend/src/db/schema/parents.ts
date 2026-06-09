import { pgTable, uuid, varchar, timestamp, index, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import {subSchools} from "@/db/schema/subSchool";
import {students} from "@/db/schema/students";

export const parents = pgTable('parents', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id'),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    phone: varchar('phone', { length: 20 }),
    subSchoolId: uuid('sub_school_id').notNull().references(() => subSchools.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
    idx_parents_sub_school: index('idx_parents_sub_school').on(table.subSchoolId)
}));

export const parentStudents = pgTable('parent_students', {
    parentId: uuid('parent_id').notNull().references(() => parents.id, { onDelete: 'cascade' }),
    studentId: uuid('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
    pk: primaryKey({ columns: [table.parentId, table.studentId] }),
}));

export const parentStudentsRelations = relations(parentStudents, ({ one }) => ({
    parent: one(parents, { fields: [parentStudents.parentId], references: [parents.id] }),
    student: one(students, { fields: [parentStudents.studentId], references: [students.id] }),
}));

export const parentsRelations = relations(parents, ({ one, many }) => ({
    subSchool: one(subSchools, {
        fields: [parents.subSchoolId],
        references: [subSchools.id],
    }),
    parentStudents: many(parentStudents),
}));