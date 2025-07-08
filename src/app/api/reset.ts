import type { Request, Response } from "express";
import { config } from "../../config.js"
import { respondWithError, respondWithJson } from "./json.js";
import { deleteAllUsers } from "../../db/queries/users.js"

export async function handlerReset(_: Request, res: Response) {

    try {
        if (config.platform !== "dev") {
            respondWithError(res, 403, "Forbidden");
            return;
        }
        config.fileserverHits = 0;

        await deleteAllUsers();

        respondWithJson(res, 200, {
            message: "Hits reset to 0 and all users deleted"
        });
    } catch (error) {
        respondWithError(res, 500, "Failed to reset")
    }

}
