import bcrypt from 'bcrypt'
import jwt, { JwtPayload } from 'jsonwebtoken'
const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {

    return await bcrypt.hash(password, SALT_ROUNDS)

}


export async function checkPasswordHash(password: string, hash: string): Promise<boolean> {

    return await bcrypt.compare(password, hash)

}

