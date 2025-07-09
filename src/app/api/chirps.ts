import type { NextFunction, Request, Response } from "express";
import { respondWithJson, respondWithError } from "./json.js";
import { BadRequestError } from "../errors/customErrors.js";
import { validateChirpBody, cleanProfanity } from "../utils/chirpUtils.js";
import { createChirp, getAllChirps, getChirp } from "../../db/queries/chirps.js";
import { getBearerToken, validateJWT } from "../utils/auth.js";
import { config } from "../../config.js";
export async function handlerChirpsValidate(req: Request, res: Response, next: NextFunction) {
    try {
        const { body } = req.body;

        // Use the same validation logic
        const validatedBody = validateChirpBody(body);
        const cleanedBody = cleanProfanity(validatedBody);

        respondWithJson(res, 200, {
            cleanedBody: cleanedBody
        });
        return;
    } catch (error) {
        next(error);
    }
}


export async function handlerCreateChirp(req: Request, res: Response, next: NextFunction) {
    try {
        console.log("=== CREATE CHIRP START ===");
        console.log("Request body:", req.body);
        // Authenticate the user first
        const token = getBearerToken(req);
        console.log("Token extracted successfully");
        const userId = validateJWT(token, config.jwtSecret);
        console.log("User ID:", userId);

        const { body } = req.body;

        // Validate body exists
        if (!body) {
            respondWithError(res, 400, "Body is required");
            return;
        }

        if (typeof body !== 'string') {
            respondWithError(res, 400, "Body must be a string");
            return;
        }

        // Validate and clean the chirp body
        const validatedBody = validateChirpBody(body);
        const cleanedBody = cleanProfanity(validatedBody);

        // Create the chirp
        const newChirp = await createChirp({
            body: cleanedBody,
            userId: userId
        });
        console.log("Chirp created successfully:", newChirp);

        // Return the full chirp object, not just cleanedBody
        respondWithJson(res, 201, {
            id: newChirp.id,
            createdAt: newChirp.createdAt,
            updatedAt: newChirp.updatedAt,
            body: newChirp.body,
            userId: newChirp.userId
        });

        return;
    } catch (error) {
        console.error("=== CREATE CHIRP ERROR ===");
        console.error("Error:", error);
        next(error);
    }
}

export async function handlerGetChirps(req: Request, res: Response, next: NextFunction) {
    try {
        const allChirps = await getAllChirps();

        // Format the response to match the expected structure
        const formattedChirps = allChirps.map(chirp => ({
            id: chirp.id,
            createdAt: chirp.createdAt,
            updatedAt: chirp.updatedAt,
            body: chirp.body,
            userId: chirp.userId
        }));

        respondWithJson(res, 200, formattedChirps);
        return;

    } catch (error) {
        next(error);
    }
}


export async function handlerGetChirp(req: Request, res: Response, next: NextFunction) {

    try {
        const { chirpID } = req.params
        if (!chirpID) {
            respondWithError(res, 400, "Chirp ID is required");
            return;
        }

        const chirp = await getChirp(chirpID)

        if (!chirp) {
            respondWithError(res, 404, "Chirp not found");
            return;
        }

        respondWithJson(res, 200, {
            id: chirp.id,
            createdAt: chirp.createdAt,
            updatedAt: chirp.updatedAt,
            body: chirp.body,
            userId: chirp.userId
        })
        return;
    } catch (error) {
        next(error)
    }
}