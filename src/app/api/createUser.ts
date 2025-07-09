import type { Request, Response, NextFunction } from "express";
import { respondWithJson, respondWithError } from "./json.js";
import { createUser, getUserByEmail } from "../../db/queries/users.js"
import { checkPasswordHash, hashPassword, makeJWT, makeRefreshToken } from "../utils/auth.js";
import type { UserResponse } from "../../db/schema/usersSchema.js";
import { config } from "../../config.js";
import { createRefreshToken } from "../../db/queries/refreshTokens.js";

export async function handlerCreateUser(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, password } = req.body
        if (!email) {
            respondWithError(res, 400, "Email is required");
            return;
        }
        if (!password) {
            respondWithError(res, 400, "Password is required");
        }
        if (typeof email !== 'string') {
            respondWithError(res, 400, "Email must be a string");
            return;
        }
        if (typeof password !== 'string') {
            respondWithError(res, 400, "Password must be a string");
            return;
        }

        const hashedPassword = await hashPassword(password)
        const newUser = await createUser({ email, hashedPassword });
        if (!newUser) {
            respondWithError(res, 409, "User already exists");
            return;
        }

        const userResponse: UserResponse = {
            id: newUser.id,
            createdAt: newUser.createdAt,
            updatedAt: newUser.updatedAt,
            email: newUser.email
        };

        respondWithJson(res, 201, userResponse);

    } catch (error) {
        next(error)
    }
}


export async function handlerLogin(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            respondWithError(res, 401, "Incorrect email or password");
            return;
        }

        if (typeof email !== 'string' || typeof password !== 'string') {
            respondWithError(res, 401, "Incorrect email or password");
            return;
        }

        const user = await getUserByEmail(email)
        if (!user) {
            respondWithError(res, 401, "Incorrect email or password")
            return;
        }

        const isPasswordValid = await checkPasswordHash(password, user.hashedPassword)
        if (!isPasswordValid) {
            respondWithError(res, 401, "Incorrect email or password")
            return;
        }

        // Create access token (1 hour expiration)
        const oneHour = 60 * 60;
        const accessToken = makeJWT(user.id, oneHour, config.jwtSecret);

        // Create refresh token (60 days expiration)
        const refreshTokenString = makeRefreshToken();
        const sixtyDays = 60 * 24 * 60 * 60 * 1000; // 60 days in milliseconds
        const expiresAt = new Date(Date.now() + sixtyDays);

        // Create refresh token in database
        await createRefreshToken({
            token: refreshTokenString,
            userId: user.id,
            expiresAt: expiresAt,
            revokedAt: null
        });

        const loginResponse = {
            id: user.id,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            email: user.email,
            token: accessToken,
            refreshToken: refreshTokenString
        };

        respondWithJson(res, 200, loginResponse);

    } catch (error) {
        console.error("Login error:", error); // Add logging to see the actual error
        next(error);
    }
}