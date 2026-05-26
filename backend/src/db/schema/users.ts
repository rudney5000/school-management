import { pgTable, uuid, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { roleEnum } from './enums';
import { workers } from './workers';
import { teachers } from './teacher';
import { students } from './students';
import { parents } from './parents';

export const users = pgTable('users', {
    id:           uuid('id').primaryKey().defaultRandom(),
    email:        varchar('email', { length: 255 }).notNull().unique(),
    password:     varchar('password', { length: 255 }).notNull(), // bcrypt hash
    role:         roleEnum('role').notNull(),
    workerId:     uuid('worker_id').references(() => workers.id,  { onDelete: 'cascade' }),
    teacherId:    uuid('teacher_id').references(() => teachers.id, { onDelete: 'cascade' }),
    studentId:    uuid('student_id').references(() => students.id, { onDelete: 'cascade' }),
    parentId:     uuid('parent_id').references(() => parents.id,  { onDelete: 'cascade' }),
    isActive:     varchar('is_active', { length: 10 }).notNull().default('true'),
    lastLoginAt:  timestamp('last_login_at'),
    createdAt:    timestamp('created_at').notNull().defaultNow(),
    updatedAt:    timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
    idx_users_email:     index('idx_users_email').on(table.email),
    idx_users_worker:    index('idx_users_worker').on(table.workerId),
    idx_users_teacher:   index('idx_users_teacher').on(table.teacherId),
    idx_users_student:   index('idx_users_student').on(table.studentId),
}));

export const usersRelations = relations(users, ({ one }) => ({
    worker:  one(workers,  { fields: [users.workerId],  references: [workers.id]  }),
    teacher: one(teachers, { fields: [users.teacherId], references: [teachers.id] }),
    student: one(students, { fields: [users.studentId], references: [students.id] }),
    parent:  one(parents,  { fields: [users.parentId],  references: [parents.id]  }),
}));