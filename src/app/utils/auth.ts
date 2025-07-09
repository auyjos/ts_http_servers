import bcrypt from 'bcrypt'
import crypto from 'crypto'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { Payload } from '../../types/types';
import { UnauthorizedError } from '../errors/customErrors.js';
import type { Request } from 'express';
const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {

    return await bcrypt.hash(password, SALT_ROUNDS)

}


export async function checkPasswordHash(password: string, hash: string): Promise<boolean> {

    return await bcrypt.compare(password, hash)

}

export function makeRefreshToken(): string {
    return crypto.randomBytes(32).toString('hex')
}

export function makeJWT(userID: string, expiresIn: number, secret: string): string {
    const iat = Math.floor(Date.now() / 1000)
    const exp = iat + expiresIn

    const payload: Payload = {
        iss: "chirpy",
        sub: userID,
        iat: iat,
        exp: exp
    }

    return jwt.sign(payload, secret);
}

export function validateJWT(tokenString: string, secret: string): string {
    try {
        const decoded = jwt.verify(tokenString, secret) as JwtPayload
        if (!decoded.sub) {
            throw new UnauthorizedError("Invalid token: missing subject");
        }
        return decoded.sub
    } catch (error) {
        throw new UnauthorizedError("Invalid or expired token");
    }

}


export function getBearerToken(req: Request): string {
    const authHeader = req.get('Authorization')

    if (!authHeader) {
        throw new UnauthorizedError("Authorization header missing");
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] != 'Bearer') {
        throw new UnauthorizedError("Invalid authorization header format");
    }
    const token = parts[1].trim();
    if (!token) {
        throw new UnauthorizedError("Token missing from authorization header");
    }
    return token;
}