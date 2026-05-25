import { pgTable, uuid, varchar, text, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import {districts} from "./district";
import {subSchools} from "./subSchool";
import {students} from "./students";
import {teachers} from "./teacher";
import {workers} from "./workers";
import {parents} from "./parents";

export const schools = pgTable('schools', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 255 }).unique(),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  logo: text('logo'),
  districtId: uuid('district_id').notNull().references(() => districts.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  idx_schools_district: index('idx_schools_district').on(table.districtId),
  idx_schools_code: index('idx_schools_code').on(table.code)
}));

export const schoolsRelations = relations(schools, ({ one, many }) => ({
  district: one(districts, {
    fields: [schools.districtId],
    references: [districts.id],
  }),
  subSchools: many(subSchools),
  teachers: many(teachers),
  students: many(students),
  workers: many(workers),
  parents: many(parents),
}));