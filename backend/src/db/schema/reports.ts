import { pgTable, uuid, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import {
  involvedPersonRoleEnum,
  reportCategoryEnum,
  reporterRoleEnum,
  reportStatusEnum,
} from '@/db/schema/enums';
import { schools } from '@/db/schema/school';
import { subSchools } from '@/db/schema/subSchool';
import { users } from '@/db/schema/users';
import { students } from '@/db/schema/students';

export const reports = pgTable(
  'reports',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    schoolId: uuid('school_id')
      .notNull()
      .references(() => schools.id),
    subSchoolId: uuid('sub_school_id')
      .notNull()
      .references(() => subSchools.id),
    reporterId: uuid('reporter_id').references(() => users.id),
    reporterRole: reporterRoleEnum('reporter_role').notNull(),
    isAnonymous: boolean('is_anonymous').notNull().default(false),
    trackingToken: uuid('tracking_token').notNull().defaultRandom(),
    category: reportCategoryEnum('category').notNull(),
    otherCategoryLabel: text('other_category_label'),
    description: text('description').notNull(),
    involvedPersonName: text('involved_person_name'),
    involvedPersonRole: involvedPersonRoleEnum('involved_person_role'),
    relatedStudentId: uuid('related_student_id').references(() => students.id),
    status: reportStatusEnum('status').notNull().default('new'),
    assignedToId: uuid('assigned_to_id').references(() => users.id),
    resolutionNote: text('resolution_note'),
    resolvedAt: timestamp('resolved_at'),
    resolvedById: uuid('resolved_by_id').references(() => users.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    subSchoolStatusIdx: index('reports_sub_school_status_idx').on(table.subSchoolId, table.status),
    trackingTokenIdx: index('reports_tracking_token_idx').on(table.trackingToken),
  }),
);

export const reportStatusHistory = pgTable('report_status_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  reportId: uuid('report_id')
    .notNull()
    .references(() => reports.id, { onDelete: 'cascade' }),
  fromStatus: reportStatusEnum('from_status'),
  toStatus: reportStatusEnum('to_status').notNull(),
  changedById: uuid('changed_by_id')
    .notNull()
    .references(() => users.id),
  note: text('note'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const reportsRelations = relations(reports, ({ one, many }) => ({
  reporter: one(users, {
    fields: [reports.reporterId],
    references: [users.id],
  }),
  relatedStudent: one(students, {
    fields: [reports.relatedStudentId],
    references: [students.id],
  }),
  assignedTo: one(users, {
    fields: [reports.assignedToId],
    references: [users.id],
  }),
  statusHistory: many(reportStatusHistory),
}));

export const reportStatusHistoryRelations = relations(reportStatusHistory, ({ one }) => ({
  report: one(reports, {
    fields: [reportStatusHistory.reportId],
    references: [reports.id],
  }),
  changedBy: one(users, {
    fields: [reportStatusHistory.changedById],
    references: [users.id],
  }),
}));
