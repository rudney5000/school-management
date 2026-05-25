import { pgTable, uuid, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import {subSchools} from "./subSchool";

export const courses = pgTable('courses', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    code: varchar('code', { length: 20 }).notNull(),
    description: text('description'),
    credits: integer('credits').default(0),
    subSchoolId: uuid('sub_school_id').notNull().references(() => subSchools.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const coursesRelations = relations(courses, ({ one }) => ({
    subSchool: one(subSchools, {
        fields: [courses.subSchoolId],
        references: [subSchools.id],
    }),
}));