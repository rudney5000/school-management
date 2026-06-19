import { pgTable, uuid, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import {subSchools} from "./subSchool";
import {teachers} from "@/db/schema/teacher";

export const COURSE_ICONS = ['book-open', 'ruler', 'palette', 'lightbulb', 'smartphone', 'pencil', 'zap', 'graduation-cap'] as const;
export const COURSE_COLORS = ['orange', 'violet', 'blue', 'green', 'purple', 'pink', 'teal', 'amber'] as const;
export const COURSE_STATUSES = ['active', 'completed', 'archived'] as const;
export const COURSE_RESOURCE_TYPES = ['video', 'pdf', 'other'] as const;

export const courses = pgTable('courses', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    code: varchar('code', { length: 20 }).notNull(),
    description: text('description'),
    credits: integer('credits').default(0),
    icon: varchar('icon', { length: 30 }).notNull().default('book-open'),
    color: varchar('color', {length: 20 }).notNull().default('blue'),
    thumbnailUrl: text('thumbnail_url'),
    teacherId: uuid('teacher_id').references(() => teachers.id, {onDelete: 'set null'}),
    totalLessons: integer('total_lessons').notNull().default(0),
    totalHours: integer('total_hours').notNull().default(0),
    status: varchar('status', { length: 20 }).notNull().default('active'),
    subSchoolId: uuid('sub_school_id').notNull().references(() => subSchools.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const courseResources = pgTable('course_resources', {
    id: uuid('id').primaryKey().defaultRandom(),
    courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 20 }).notNull(),
    title: varchar('title', { length: 150 }).notNull(),
    url: text('url').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const courseResourcesRelations = relations(courseResources, ({ one }) => ({
    course: one(courses, {
        fields: [courseResources.courseId],
        references: [courses.id],
    }),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
    subSchool: one(subSchools, { fields: [courses.subSchoolId], references: [subSchools.id] }),
    teacher: one(teachers, { fields: [courses.teacherId], references: [teachers.id] }),
    resources: many(courseResources),
}));