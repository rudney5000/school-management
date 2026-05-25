import { pgTable, uuid, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import {subSchools} from "@/db/schema/subSchool";

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

export const parentsRelations = relations(parents, ({ one }) => ({
    subSchool: one(subSchools, {
        fields: [parents.subSchoolId],
        references: [subSchools.id],
    }),
}));