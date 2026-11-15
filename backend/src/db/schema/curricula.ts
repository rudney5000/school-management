import { pgTable, uuid, varchar, text, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { subSchools } from './subSchool';
import { courses } from './courses';
import { classes } from './classes';
import { users } from './users';
import { curriculumStatusEnum, curriculumTypeEnum } from './enums';

/**
 * A teaching programme a school makes available to its teachers, parents and
 * students: the national programme it follows, or one of its own. The files
 * themselves live in `attachments` (attachableType `curriculum`).
 */
export const curricula = pgTable(
  'curricula',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    subSchoolId: uuid('sub_school_id')
      .notNull()
      .references(() => subSchools.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 150 }).notNull(),
    description: text('description'),
    type: curriculumTypeEnum('type').notNull(),
    courseId: uuid('course_id').references(() => courses.id, { onDelete: 'set null' }),
    schoolYear: varchar('school_year', { length: 9 }).notNull(), // ex: "2026-2027"
    status: curriculumStatusEnum('status').notNull().default('draft'),
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    publishedAt: timestamp('published_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    idx_curricula_sub_school_year: index('idx_curricula_sub_school_year').on(
      table.subSchoolId,
      table.schoolYear,
    ),
  }),
);

/** The classes a programme applies to: one programme can serve 7e A, 7e B and 7e C. */
export const curriculumClasses = pgTable(
  'curriculum_classes',
  {
    curriculumId: uuid('curriculum_id')
      .notNull()
      .references(() => curricula.id, { onDelete: 'cascade' }),
    classId: uuid('class_id')
      .notNull()
      .references(() => classes.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    idx_curriculum_classes_unique: uniqueIndex('idx_curriculum_classes_unique').on(
      table.curriculumId,
      table.classId,
    ),
    idx_curriculum_classes_class: index('idx_curriculum_classes_class').on(table.classId),
  }),
);

export const curriculaRelations = relations(curricula, ({ one, many }) => ({
  subSchool: one(subSchools, { fields: [curricula.subSchoolId], references: [subSchools.id] }),
  course: one(courses, { fields: [curricula.courseId], references: [courses.id] }),
  author: one(users, { fields: [curricula.createdBy], references: [users.id] }),
  classes: many(curriculumClasses),
}));

export const curriculumClassesRelations = relations(curriculumClasses, ({ one }) => ({
  curriculum: one(curricula, {
    fields: [curriculumClasses.curriculumId],
    references: [curricula.id],
  }),
  class: one(classes, { fields: [curriculumClasses.classId], references: [classes.id] }),
}));
