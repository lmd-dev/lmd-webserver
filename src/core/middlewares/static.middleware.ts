import { Middleware } from "./middleware";
import * as Express from "express";

export class StaticMiddleware extends Middleware
{   
    constructor(path: string)
    {
        super((req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
            Express.static(path)(req, res, next);
        });
    }
}