
import type { Request, Response, NextFunction } from "express";
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError } from "../errors/customErrors.js";

export function middlewareHandleError(err: Error, req: Request, res: Response, next: NextFunction): void {

    console.log(err)

    if (err instanceof BadRequestError ||
        err instanceof UnauthorizedError ||
        err instanceof ForbiddenError ||
        err instanceof NotFoundError) {

        res.status(err.statusCode).json({
            error: err.message
        })
    }

    res.status(500).json({
        error: "Something went wrong on our end"
    })
}