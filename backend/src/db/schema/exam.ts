import {
    pgTable,
    uuid,
    varchar,
    integer,
    timestamp,
    numeric,
    text,
} from 'drizzle-orm/pg-core';
import {relations} from 'drizzle-orm';
import {
    examStatusEnum,
    examTypeEnum
} from "@/db/schema/enums";
import {users} from "@/db/schema/users";
import {classes} from "@/db/schema/classes";
import {courses} from "@/db/schema/courses";
import {subSchools} from "@/db/schema/subSchool";
import {students} from "@/db/schema/students";
import {academicPeriods} from "@/db/schema/academicPeriod";
import {
    liveSessionColumns
} from "@/db/schema/liveSessionColumns";

export const exams = pgTable("exams", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    type: examTypeEnum("type").notNull().default("quiz"),
    status: examStatusEnum("status").notNull().default("scheduled"),
    courseId: uuid("course_id").notNull().references(() => courses.id),
    classId: uuid("class_id").notNull().references(() => classes.id),
    subSchoolId: uuid("sub_school_id").notNull().references(() => subSchools.id),
    examDate: timestamp("exam_date", { withTimezone: true }).notNull(),
    durationMinutes: integer("duration_minutes").notNull().default(60),
    maxScore: numeric("max_score", { precision: 5, scale: 2 }).notNull().default("20"),
    coefficient: numeric("coefficient", { precision: 4, scale: 2 }).notNull().default("1"),
    academicPeriodId: uuid("academic_period_id")
        .references(() => academicPeriods.id, { onDelete: 'set null' }),
    createdBy: uuid("created_by").references(() => users.id),
    ...liveSessionColumns,
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const examResults = pgTable("exam_results", {
    id: uuid("id").primaryKey().defaultRandom(),
    examId: uuid("exam_id").notNull().references(() => exams.id, { onDelete: "cascade" }),
    studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
    score: numeric("score", { precision: 5, scale: 2 }),
    comment: text("comment"),
    gradedBy: uuid("graded_by").references(() => users.id),
    gradedAt: timestamp("graded_at", { withTimezone: true }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const examsRelations = relations(exams, ({ one, many }) => ({
    course: one(courses, {
        fields: [exams.courseId],
        references: [courses.id],
    }),
    class: one(classes, {
        fields: [exams.classId],
        references: [classes.id],
    }),
    subSchool: one(subSchools, {
        fields: [exams.subSchoolId],
        references: [subSchools.id],
    }),
    academicPeriod: one(academicPeriods, {
        fields: [exams.academicPeriodId],
        references: [academicPeriods.id],
    }),
    createdBy: one(users, {
        fields: [exams.createdBy],
        references: [users.id],
    }),
    results: many(examResults),
}))

export const examResultsRelations = relations(examResults, ({ one }) => ({
    exam: one(exams, {
        fields: [examResults.examId],
        references: [exams.id],
    }),
    student: one(students, {
        fields: [examResults.studentId],
        references: [students.id],
    }),
    gradedBy: one(users, {
        fields: [examResults.gradedBy],
        references: [users.id],
    }),
}))