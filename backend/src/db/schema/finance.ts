import { pgTable, uuid, decimal, timestamp, text, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import {students} from "./students";
import {paymentStatusEnum, paymentTypeEnum, payrollStatusEnum} from "./enums";
import {workers} from "./workers";
import {teachers} from "./teacher";

export const payments = pgTable('payments', {
    id: uuid('id').primaryKey().defaultRandom(),
    studentId: uuid('student_id').notNull().references(() => students.id, { onDelete: 'restrict' }),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    type: paymentTypeEnum('payment_type').notNull(),
    status: paymentStatusEnum('status').notNull().default('PENDING'),
    paymentDate: timestamp('payment_date').notNull().defaultNow(),
    description: text('description'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
    idx_payments_student: index('idx_payments_student').on(table.studentId),
    idx_payments_status: index('idx_payments_status').on(table.status)
}));

export const payrolls = pgTable('payrolls', {
    id: uuid('id').primaryKey().defaultRandom(),
    workerId: uuid('worker_id').references(() => workers.id, { onDelete: 'restrict' }),
    teacherId: uuid('teacher_id').references(() => teachers.id, { onDelete: 'restrict' }),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    periodStart: timestamp('period_start').notNull(),
    periodEnd: timestamp('period_end').notNull(),
    status: payrollStatusEnum('status').notNull().default('PENDING'),
    paidAt: timestamp('paid_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
    idx_payrolls_worker: index('idx_payrolls_worker').on(table.workerId),
    idx_payrolls_teacher: index('idx_payrolls_teacher').on(table.teacherId),
    idx_payrolls_status: index('idx_payrolls_status').on(table.status),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
    student: one(students, {
        fields: [payments.studentId],
        references: [students.id],
    }),
}));

export const payrollsRelations = relations(payrolls, ({ one }) => ({
    worker: one(workers, {
        fields: [payrolls.workerId],
        references: [workers.id],
    }),
    teacher: one(teachers, {
        fields: [payrolls.teacherId],
        references: [teachers.id],
    }),
}));