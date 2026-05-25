import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import {departments} from "./department";
import {districts} from "./district";

export const cities = pgTable('cities', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    departmentId: uuid('department_id').notNull().references(() => departments.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const citiesRelations = relations(cities, ({ one, many }) => ({
    department: one(departments, {
        fields: [cities.departmentId],
        references: [departments.id],
    }),
    districts: many(districts),
}));