import type { NextFunction, Request, Response } from "express";
import { respondWithJson, respondWithError } from "./json.js";
import { BadRequestError } from "../errors/customErrors.js";
export async function handlerChirpsValidate(req: Request, res: Response, next: NextFunction) {
    try {
        const { body } = req.body

        if (body === undefined || body === null) {
            respondWithError(res, 400, "Body is required")
        }

        if (typeof body !== 'string') {
            respondWithError(res, 400, "Body must be a string");
            return;
        }

        const maxChirpLength = 140;
        if (body.length > maxChirpLength) {
            throw new BadRequestError("Chirp is too long. Max length is 140");
        }
        const profaneWords = ["kerfuffle", "sharbert", "fornax"]
        const words = body.split(" ")
        const cleanedWords = words.map(word => {
            if (profaneWords.includes(word.toLowerCase())) {
                return "****"
            }
            return word
        })
        const cleanedBody = cleanedWords.join(" ");
        respondWithJson(res, 200, {
            cleanedBody: cleanedBody
        })

    } catch (error) {
        next(error)
    }
}
