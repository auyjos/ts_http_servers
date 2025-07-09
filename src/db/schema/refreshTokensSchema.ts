import { timestamp, text, pgTable, uuid } from "drizzle-orm/pg-core";
import { users } from "./usersSchema.js";

export const refreshTokens = pgTable("refresh_tokens", {
    token: text("token").primaryKey(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }), // Changed from varchar to uuid
    expiresAt: timestamp("expires_at").notNull(),
    revokedAt: timestamp("revoked_at"),
})

export type NewRefreshToken = typeof refreshTokens.$inferInsert;
export type RefreshToken = typeof refreshTokens.$inferSelect;