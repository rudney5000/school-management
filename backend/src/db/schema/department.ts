import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import {countries} from "./country";
import {cities} from "./city";

export const departments = pgTable('departments', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    code: varchar('code', { length: 10 }).notNull(),
    countryId: uuid('country_id').notNull().references(() => countries.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const departmentsRelations = relations(departments, ({ one, many }) => ({
    country: one(countries, {
        fields: [departments.countryId],
        references: [countries.id],
    }),
    cities: many(cities),
}));