import type { Request, Response, NextFunction } from "express";
import { respondWithJson, respondWithError } from "./json.js";
import { createUser, getUserByEmail, updateUser } from "../../db/queries/users.js"
import { checkPasswordHash, getBearerToken, hashPassword, makeJWT, makeRefreshToken, validateJWT } from "../utils/auth.js";
import type { User, UserResponse } from "../../db/schema/usersSchema.js";
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
            email: newUser.email,
            isChirpyRed: newUser.isChirpyRed
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
            refreshToken: refreshTokenString,
            isChirpyRed: user.isChirpyRed
        };

        respondWithJson(res, 200, loginResponse);

    } catch (error) {
        console.error("Login error:", error); // Add logging to see the actual error
        next(error);
    }
}

export async function handlerUpdateUser(req: Request, res: Response, next: NextFunction) {
    try {
        // Authenticate user
        let userId: string;
        try {
            const token = getBearerToken(req);
            userId = validateJWT(token, config.jwtSecret);
        } catch {
            respondWithError(res, 401, "Invalid or expired token");
            return;
        }

        const { email, password } = req.body;

        if (!email || !password) {
            respondWithError(res, 400, "Email and password are required");
            return;
        }
        if (typeof email !== "string" || typeof password !== "string") {
            respondWithError(res, 400, "Email and password must be strings");
            return;
        }

        // Hash the new password
        const hashedPassword = await hashPassword(password);

        // Update user in DB
        const updatedUser = await updateUser(userId, {
            email,
            hashedPassword
        });

        if (!updatedUser) {
            respondWithError(res, 404, "User not found");
            return;
        }

        const userResponse: UserResponse = {
            id: updatedUser.id,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt,
            email: updatedUser.email,
            isChirpyRed: updatedUser.isChirpyRed
        }
        // Respond with updated user (omit password)
        respondWithJson(res, 200, userResponse);
    } catch (error) {
        next(error);
    }
}