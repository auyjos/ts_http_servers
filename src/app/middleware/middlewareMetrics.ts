import { Request, Response, NextFunction } from "express";
import { config } from '../../config.js'

export function middlewareMetricsInc(req: Request, res: Response, next: NextFunction): void {

    config.fileserverHits++;
    next()

}