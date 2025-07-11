import { pgTable, timestamp, varchar, uuid, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    email: varchar("email", { length: 256 }).unique().notNull(),
    hashedPassword: varchar("hashed_password", { length: 255 }).notNull().default("unset"),
    isChirpyRed: boolean("is_chirpy_red").notNull().default(false),
});

export type NewUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type UserResponse = Omit<User, "hashedPassword">

