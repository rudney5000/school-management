import {
    boolean,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar
} from "drizzle-orm/pg-core";
import {users} from "@/db/schema/users";
import {subSchools} from "@/db/schema/subSchool";
import {EventTypeEnum} from "@/db/schema/enums";

export const events = pgTable("events", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    type: EventTypeEnum("event_type").notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date"),
    location: varchar("location", { length: 255 }),
    isPublic: boolean("is_public").default(true),
    subSchoolId: uuid('sub_school_id').notNull().references(() => subSchools.id, { onDelete: 'cascade' }),
    createdBy: uuid("created_by")
        .references(() => users.id)
        .notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});