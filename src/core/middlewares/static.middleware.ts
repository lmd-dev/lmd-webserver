import { Middleware } from "./middleware";
import * as Express from "express";

/**
 * Middleware processing static files (css, js, ...)
 */
export class StaticMiddleware extends Middleware
{   
    /**
     * Constructor
     * @param path base path to search requested files 
     */
    constructor(path: string)
    {
        super((req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
            Express.static(path)(req, res, next);
        });
    }
}