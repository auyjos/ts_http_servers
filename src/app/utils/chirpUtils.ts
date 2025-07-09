// src/app/utils/chirpUtils.ts
import { BadRequestError } from "../errors/customErrors.js";

export function validateChirpBody(body: any): string {
    if (body === undefined || body === null) {
        throw new BadRequestError("Body is required");
    }

    if (typeof body !== 'string') {
        throw new BadRequestError("Body must be a string");
    }

    const maxChirpLength = 140;
    if (body.length > maxChirpLength) {
        throw new BadRequestError("Chirp is too long");
    }

    return body;
}

export function cleanProfanity(text: string): string {
    const badWords = ["kerfuffle", "sharbert", "fornax"];
    let cleanedText = text;

    for (const word of badWords) {
        const regex = new RegExp(word, "gi");
        cleanedText = cleanedText.replace(regex, "****");
    }

    return cleanedText;
}