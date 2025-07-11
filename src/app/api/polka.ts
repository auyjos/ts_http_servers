import type { Request, Response, NextFunction } from "express";
import { respondWithError } from "./json.js";
import { upgradeUserToChirpyRed } from "../../db/queries/users.js";

export async function handlerPolkaWebhook(req: Request, res: Response, next: NextFunction) {
    try {
        const { event, data } = req.body;

        if (event !== 'user.upgraded') {
            res.status(204).send();
            return;
        }

        const { userId } = data
        if (!userId) {
            respondWithError(res, 400, "User ID is required");
            return;
        }

        const updatedUser = await upgradeUserToChirpyRed(userId);

        if (!updatedUser) {
            respondWithError(res, 404, "User not found");
            return;
        }

        res.status(204).send();
        return;
    } catch (error) {
        console.log("Polka webhook error: ", error)
        next(error)
    }
}