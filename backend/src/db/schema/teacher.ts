import { pgTable, uuid, varchar, text, date, boolean, uniqueIndex, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import {genderEnum} from "@/db/schema/enums";
import {courses} from "@/db/schema/courses";
import {subSchools} from "@/db/schema/subSchool";

export const teachers = pgTable('teachers', {
    id: uuid('id').primaryKey().defaultRandom(),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    phone: varchar('phone', { length: 20 }),
    address: text('address'),
    gender: genderEnum('gender').notNull(),
    dateOfBirth: date('date_of_birth').notNull(),
    enrollmentDate: date('enrollment_date').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
    idx_teachers_email: index('idx_teachers_email').on(table.email)
}));

export const teacherSchools = pgTable('teacher_schools', {
    id: uuid('id').primaryKey().defaultRandom(),
    teacherId: uuid('teacher_id')
        .notNull()
        .references(() => teachers.id, { onDelete: 'cascade' }),
    subSchoolId: uuid('sub_school_id').notNull(),
    hireDate: date('hire_date').notNull(),
    qualification: text('qualification'),
    specialization: text('specialization'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
    uniq: uniqueIndex('uniq_teacher_school').on(table.teacherId, table.subSchoolId),
    idx_teachers_sub_school: index('idx_teachers_schools_sub_school').on(table.subSchoolId),

}));

export const teachersRelations = relations(teachers, ({ many }) => ({
   schools: many(teacherSchools),
    courses: many(courses),
}));

export const teacherSchoolsRelations = relations(teacherSchools, ({ one }) => ({
    teacher: one(teachers, {
        fields: [teacherSchools.teacherId],
        references: [teachers.id],
    }),
    subSchool: one(subSchools, {
        fields: [teacherSchools.subSchoolId],
        references: [subSchools.id],
    }),
}));