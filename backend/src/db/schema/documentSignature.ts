import {
    pgTable,
    uuid,
    varchar,
    text,
    timestamp,
    jsonb,
    uniqueIndex,
} from 'drizzle-orm/pg-core'
import {
    relations,
    sql
} from 'drizzle-orm'
import { subSchools } from '@/db/schema/subSchool'
import { classes } from '@/db/schema/classes'
import { students } from '@/db/schema/students'
import { users } from '@/db/schema/users'
import { signatureStatusEnum } from '@/db/schema/enums'

export const documentSignatures = pgTable('document_signatures', {
    id: uuid('id').primaryKey().defaultRandom(),

    documentType: varchar('document_type', { length: 50 }).notNull(),

    documentId: uuid('document_id'),

    documentRef: jsonb('document_ref'),

    subSchoolId: uuid('sub_school_id')
        .notNull()
        .references(() => subSchools.id),
    classId: uuid('class_id').references(() => classes.id, { onDelete: 'cascade' }),
    studentId: uuid('student_id').references(() => students.id, { onDelete: 'cascade' }),

    signedByUserId: uuid('signed_by_user_id')
        .notNull()
        .references(() => users.id),
    signedByRole: varchar('signed_by_role', { length: 20 }).notNull(),

    contentHash: varchar('content_hash', { length: 64 }).notNull(),

    status: signatureStatusEnum('status').notNull().default('active'),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    revokedReason: text('revoked_reason'),

    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),

    signedAt: timestamp('signed_at', { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
    uniqueActiveById: uniqueIndex('unique_active_signature_by_id')
        .on(t.documentType, t.documentId)
        .where(sql`status = 'active' AND document_id IS NOT NULL`),

    uniqueActiveBulletin: uniqueIndex('unique_active_bulletin_signature')
        .on(t.documentType, t.classId, sql`(document_ref->>'academicPeriodId')`)
        .where(sql`status = 'active' AND document_type = 'bulletin'`),
}))

export const documentSignaturesRelations = relations(documentSignatures, ({ one }) => ({
    subSchool: one(subSchools, {
        fields: [documentSignatures.subSchoolId],
        references: [subSchools.id],
    }),
    class: one(classes, {
        fields: [documentSignatures.classId],
        references: [classes.id],
    }),
    student: one(students, {
        fields: [documentSignatures.studentId],
        references: [students.id],
    }),
    signedBy: one(users, {
        fields: [documentSignatures.signedByUserId],
        references: [users.id],
    }),
}))