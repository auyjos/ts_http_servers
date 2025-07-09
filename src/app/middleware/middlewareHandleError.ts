
import type { Request, Response, NextFunction } from "express";
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError } from "../errors/customErrors.js";
import { respondWithError } from "../api/json.js";
export function middlewareHandleError(err: any, req: Request, res: Response, next: NextFunction) {
    // Check if response has already been sent
    if (res.headersSent) {
        return next(err);
    }

    console.error("Error middleware caught:", err);

    if (err instanceof BadRequestError) {
        respondWithError(res, 400, err.message);
        return;
    }

    if (err instanceof UnauthorizedError) {
        respondWithError(res, 401, err.message);
        return;
    }

    // For any other error, return 500
    respondWithError(res, 500, "Something went wrong on our end");
}