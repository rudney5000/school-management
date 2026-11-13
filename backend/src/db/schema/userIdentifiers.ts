import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { identifierTypeEnum } from './enums';

export const userIdentifiers = pgTable('user_identifiers', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: identifierTypeEnum('type').notNull(),
  value: varchar('value', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const userIdentifiersRelations = relations(userIdentifiers, ({ one }) => ({
  user: one(users, { fields: [userIdentifiers.userId], references: [users.id] }),
}));
