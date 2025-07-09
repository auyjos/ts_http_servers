import { db } from "../index.js";
import { NewRefreshToken, refreshTokens } from "../schema/refreshTokensSchema.js";
import { eq, and, isNull } from 'drizzle-orm'

export async function createRefreshToken(token: NewRefreshToken) {
    const [result] = await db.insert(refreshTokens).values(token).returning();
    return result
}

export async function getUserFromRefreshToken(token: string) {
    const [result] = await db.select({
        userId: refreshTokens.userId,
        expiresAt: refreshTokens.expiresAt,
        revokedAt: refreshTokens.revokedAt
    })
        .from(refreshTokens)
        .where(eq(refreshTokens.token, token));
    return result
}

export async function revokeRefreshToken(token: string) {

    const [result] = await db.update(refreshTokens)
        .set({
            revokedAt: new Date(),
            updatedAt: new Date()
        })
        .where(eq(refreshTokens.token, token))
        .returning()
    return result;
}