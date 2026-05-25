import { pgTable, uuid, varchar, text, date, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import {genderEnum} from "@/db/schema/enums";
import {schools} from "@/db/schema/school";
import {courses} from "@/db/schema/courses";

export const teachers = pgTable('teachers', {
    id: uuid('id').primaryKey().defaultRandom(),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    phone: varchar('phone', { length: 20 }),
    address: text('address'),
    gender: genderEnum('gender').notNull(),
    dateOfBirth: date('date_of_birth').notNull(),
    hireDate: date('hire_date').notNull(),
    qualification: text('qualification'),
    specialization: text('specialization'),
    schoolId: uuid('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
    idx_teachers_school: index('idx_teachers_school').on(table.schoolId),
    idx_teachers_email: index('idx_teachers_email').on(table.email)
}));

export const teachersRelations = relations(teachers, ({ one, many }) => ({
    school: one(schools, {
        fields: [teachers.schoolId],
        references: [schools.id],
    }),
    courses: many(courses),
}));