import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import {cities} from "./city";
import {schools} from "./school";

export const districts = pgTable('districts', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    cityId: uuid('city_id').notNull().references(() => cities.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const districtsRelations = relations(districts, ({ one, many }) => ({
    city: one(cities, {
        fields: [districts.cityId],
        references: [cities.id],
    }),
    schools: many(schools),
}));