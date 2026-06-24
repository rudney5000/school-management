import {
    pgTable,
    uuid,
    varchar,
    boolean,
    timestamp
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { subSchools } from '@/db/schema/subSchool'
import { exams } from '@/db/schema/exam'
import {grades} from "@/db/schema/grades";

export const academicPeriods = pgTable('academic_periods', {
    id: uuid('id').primaryKey().defaultRandom(),
    subSchoolId: uuid("sub_school_id").notNull().references(() => subSchools.id),
    name: varchar('name', { length: 100 }).notNull(),
    type: varchar('type', { length: 20 }).notNull(),
    startDate: timestamp('start_date').notNull(),
    endDate: timestamp('end_date').notNull(),
    isCurrent: boolean('is_current').notNull().default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const academicPeriodsRelations = relations(academicPeriods, ({ one, many }) => ({
    subSchool: one(subSchools, {
        fields: [academicPeriods.subSchoolId],
        references: [subSchools.id],
    }),
    exams: many(exams),
    grades: many(grades),
}))