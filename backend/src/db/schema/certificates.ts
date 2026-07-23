import {
    pgTable,
    uuid,
    timestamp,
    text,
    index
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { students } from '@/db/schema/students';
import { subSchools } from '@/db/schema/subSchool';
import { users } from '@/db/schema/users';
import { certificateTypeEnum } from '@/db/schema/enums';

export const certificates = pgTable('certificates', {
    id: uuid('id').primaryKey().defaultRandom(),

    studentId: uuid('student_id')
        .notNull()
        .references(() => students.id, { onDelete: 'cascade' }),
    subSchoolId: uuid('sub_school_id')
        .notNull()
        .references(() => subSchools.id, { onDelete: 'cascade' }),

    type: certificateTypeEnum('type').notNull(),

    content: text('content').notNull(),

    issuedBy: uuid('issued_by').references(() => users.id),
    issuedAt: timestamp('issued_at', { withTimezone: true }).defaultNow().notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    idx_certificates_student: index('idx_certificates_student').on(table.studentId),
    idx_certificates_subSchool: index('idx_certificates_sub_school').on(table.subSchoolId),
}));

export const certificatesRelations = relations(certificates, ({ one }) => ({
    student: one(students, {
        fields: [certificates.studentId],
        references: [students.id],
    }),
    subSchool: one(subSchools, {
        fields: [certificates.subSchoolId],
        references: [subSchools.id],
    }),
    issuedBy: one(users, {
        fields: [certificates.issuedBy],
        references: [users.id],
    }),
}));