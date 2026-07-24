import {
    pgTable,
    uuid,
    varchar,
    timestamp,
    index,
    integer,
    uniqueIndex
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import {subSchools} from "./subSchool";
import {courses} from "@/db/schema/courses";

export const classes = pgTable('classes', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),        // ex: "6ème A", "Terminale S2"
    gradeLevel: varchar('grade_level', { length: 50 }),      // ex: "6ème", "1ère", "CP"
    capacity: integer('capacity').default(30),               // Nombre max d'élèves (optionnel)
    subSchoolId: uuid('sub_school_id').notNull().references(() => subSchools.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
    idx_classes_sub_school: index('idx_classes_sub_school').on(table.subSchoolId),
    idx_classes_grade: index('idx_classes_grade').on(table.gradeLevel)
}));

export const classCourses = pgTable('class_courses', {
    id: uuid('id').primaryKey().defaultRandom(),
    classId: uuid('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
    idx_class_courses_unique: uniqueIndex('idx_class_courses_unique').on(table.classId, table.courseId),
}));

export const classesRelations = relations(classes, ({ one }) => ({
    subSchool: one(subSchools, {
        fields: [classes.subSchoolId],
        references: [subSchools.id],
    }),
}));

export const classCoursesRelations = relations(classCourses, ({ one }) => ({
    class: one(classes, {
        fields: [classCourses.classId],
        references: [classes.id],
    }),
    course: one(courses, {
        fields: [classCourses.courseId],
        references: [courses.id],
    }),
}));