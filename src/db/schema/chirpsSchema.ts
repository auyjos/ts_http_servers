import { PgTable, timestamp, varchar, uuid, text, pgTable, boolean } from "drizzle-orm/pg-core";
import { users } from "./usersSchema.js";

export const chirps = pgTable('chirps', {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    body: text("body").notNull(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
   
})

export type NewChirp = typeof chirps.$inferInsert;
export type Chirp = typeof chirps.$inferSelect;