// src/app/api/refresh.ts
import type { Request, Response, NextFunction } from "express";
import { respondWithJson, respondWithError } from "./json.js";
import { getBearerToken, makeJWT } from "../utils/auth.js";
import { getUserFromRefreshToken, revokeRefreshToken } from "../../db/queries/refreshTokens.js";
import { config } from "../../config.js";

export async function handlerRefresh(req: Request, res: Response, next: NextFunction) {
    try {
        const refreshToken = getBearerToken(req);
        const tokenData = await getUserFromRefreshToken(refreshToken);
        if (!tokenData) {
            respondWithError(res, 401, "Invalid refresh token")
            return;
        }

        if (new Date() > tokenData.expiresAt) {
            respondWithError(res, 401, "Refresh token expired");
            return;
        }

        if (tokenData.revokedAt) {
            respondWithError(res, 401, "Refresh token revoked");
            return;
        }

        const oneHour = 60 * 60
        const newAccessToken = makeJWT(tokenData.userId, oneHour, config.jwtSecret)

        respondWithJson(res, 200, {
            token: newAccessToken
        })

    } catch (error) {
        console.error("Refresh error:", error);
        next(error)
    }

}

export async function handlerRevoke(req: Request, res: Response, next: NextFunction) {
    try {
        const refreshToken = getBearerToken(req);

        await revokeRefreshToken(refreshToken);

        // 204 status code with no response body
        res.status(204).send();

    } catch (error) {
        console.error("Revoke error:", error);
        next(error);
    }
}