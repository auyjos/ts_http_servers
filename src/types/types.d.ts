import { JwtPayload } from "jsonwebtoken";

export type Payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;
export type UserUpdate = {
    email?: string,
    hashedPassword?: string
}