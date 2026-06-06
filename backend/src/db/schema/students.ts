import {pgTable, uuid, varchar, date, boolean, timestamp, index, text} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import {parents} from "./parents";
import {enrollments} from "./enrollments";
import {genderEnum} from "./enums";
import {studentAttendances} from "@/db/schema/attendances";
import {subSchools} from "@/db/schema/subSchool";

export const students = pgTable('students', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  gender: genderEnum('gender').notNull(),
  image: text('image'),
  dateOfBirth: date('date_of_birth').notNull(),
  enrollmentDate: date('enrollment_date').notNull(),
  subSchoolId: uuid('sub_school_id').notNull().references(() => subSchools.id, { onDelete: 'cascade' }),
  parentId: uuid('parent_id').references(() => parents.id, { onDelete: 'set null' }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  idx_students_subSchool: index('idx_students_sub-school').on(table.subSchoolId),
  idx_students_parent: index('idx_students_parent').on(table.parentId),
  idx_students_name: index('idx_students_email').on(table.email),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  subSchool: one(subSchools, {
    fields: [students.subSchoolId],
    references: [subSchools.id],
  }),
  parent: one(parents, {
    fields: [students.parentId],
    references: [parents.id],
  }),
  enrollments: many(enrollments),
  attendances: many(studentAttendances),
}));