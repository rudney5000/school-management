import { pgTable, uuid, varchar, text, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import {schools} from "./school";
import {classes} from "./classes";

export const subSchools = pgTable('sub_schools', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    code: varchar('code', { length: 50 }).notNull().unique(),
    email: varchar('email', { length: 255 }).unique(),
    phone: varchar('phone', { length: 20 }),
    address: text('address'),
    logo: text('logo'),
    schoolId: uuid('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
    idx_sub_schools_school: index('idx_sub_schools_school').on(table.schoolId),
    idx_sub_schools_code: index('idx_sub_schools_code').on(table.code)
}));

export const subSchoolsRelations = relations(subSchools, ({ one, many }) => ({
    school: one(schools, {
        fields: [subSchools.schoolId],
        references: [schools.id],
    }),
    classes: many(classes),
}));