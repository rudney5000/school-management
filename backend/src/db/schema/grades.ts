import {
    pgTable,
    uuid,
    numeric,
    text,
    timestamp,
    uniqueIndex
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { students } from '@/db/schema/students'
import { courses } from '@/db/schema/courses'
import { classes } from '@/db/schema/classes'
import { users } from '@/db/schema/users'
import {academicPeriods} from "@/db/schema/academicPeriod";
import {gradeTypeEnum} from "@/db/schema/enums";
import {subSchools} from "@/db/schema/subSchool";
import {exams} from "@/db/schema/exam";

export const grades = pgTable('grades', {
    id: uuid('id').primaryKey().defaultRandom(),
    studentId: uuid('student_id')
        .notNull()
        .references(() => students.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id')
        .notNull()
        .references(() => courses.id, { onDelete: 'cascade' }),
    classId: uuid('class_id')
        .notNull()
        .references(() => classes.id),
    academicPeriodId: uuid('academic_period_id')
        .notNull()
        .references(() => academicPeriods.id, { onDelete: 'cascade' }),
    subSchoolId: uuid("sub_school_id").notNull().references(() => subSchools.id),
    examId: uuid('exam_id').references(() => exams.id),
    gradeType: gradeTypeEnum('grade_type').notNull(),
    score: numeric('score', { precision: 5, scale: 2 }),
    maxScore: numeric('max_score', { precision: 5, scale: 2 }).notNull().default('20'),
    coefficient: numeric('coefficient', { precision: 4, scale: 2 }).notNull().default('1'),
    comment: text('comment'),
    gradedBy: uuid('graded_by').references(() => users.id, { onDelete: 'set null' }),
    gradedAt: timestamp('graded_at', { withTimezone: true }).defaultNow(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
    uniqueGrade: uniqueIndex('unique_grade_idx')
        .on(t.studentId, t.courseId, t.academicPeriodId, t.gradeType),
}))

export const gradesRelations = relations(grades, ({ one }) => ({
    student: one(students, {
        fields: [grades.studentId],
        references: [students.id]
    }),
    course: one(courses, {
        fields: [grades.courseId],
        references: [courses.id]
    }),
    class: one(classes, {
        fields: [grades.classId],
        references: [classes.id]
    }),
    academicPeriod: one(academicPeriods, {
        fields: [grades.academicPeriodId],
        references: [academicPeriods.id]
    }),
    gradedBy: one(users, {
        fields: [grades.gradedBy],
        references: [users.id]
    }),
}))