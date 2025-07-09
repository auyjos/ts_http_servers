// src/app/utils/auth.test.ts
import { describe, it, expect, beforeAll } from "vitest";
import { hashPassword, checkPasswordHash, makeJWT, validateJWT } from "../app/utils/auth.js";
import { UnauthorizedError } from "../app/errors/customErrors.js";

describe("JWT Creation and Validation", () => {
    const userID = "123e4567-e89b-12d3-a456-426614174000";
    const secret = "test-secret-key";
    const expiresIn = 3600;
    let validToken: string;

    beforeAll(() => {
        validToken = makeJWT(userID, expiresIn, secret);
    });

    it("should validate a correct JWT and return user ID", () => {
        const result = validateJWT(validToken, secret);
        expect(result).toBe(userID);
    });

    it("should reject JWT with wrong secret", () => {
        expect(() => {
            validateJWT(validToken, "wrong-secret");
        }).toThrow(UnauthorizedError);
    });

    it("should reject expired JWT", () => {
        const expiredToken = makeJWT(userID, -1, secret);
        expect(() => {
            validateJWT(expiredToken, secret);
        }).toThrow(UnauthorizedError);
    });

    it("should reject malformed JWT", () => {
        expect(() => {
            validateJWT("invalid.token.here", secret);
        }).toThrow(UnauthorizedError);
    });
});