import {boolean, date, pgEnum, pgTable, timestamp, uuid, varchar} from "drizzle-orm/pg-core";

export const genderEnum = pgEnum('gender', ['male', 'female']);

export const students = pgTable("students", {
    id: uuid('id').primaryKey().defaultRandom(),
    firstName: varchar('first_name',{ length: 100 }).notNull(),
    lastName: varchar('last_name',{ length: 100 }).notNull(),
    gender: genderEnum('gender').notNull(),
    birthday: date('birthday').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    email: varchar('email',{ length: 255 }).notNull().unique(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'),
});
