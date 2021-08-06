import * as Express from "express";
import { Middleware } from "./middleware";
import { StaticMiddleware } from "./static.middleware";

export class Middlewares
{
    private _origin : Express.Application | Express.Router;
    public get origin() : Express.Application | Express.Router {return this._origin; }

    private _middlewares : Middleware[];
    public get middlewares() : Middleware[] {return this._middlewares; }   
    
    constructor(origin: Express.Application | Express.Router)
    {
        this._origin = origin;
        this._middlewares = [];
    }

    setMiddlewares(...middlewares: Middleware[])
    {
        this._middlewares = middlewares;
    }

    addMiddlewares(...middlewares: Middleware[])
    {
        Array.prototype.push.apply(this._middlewares, middlewares);
    }

    /**
     * Adds path to static files (css, js, ...)
     * @param path folder path to static files
     */
    addStaticPath(path: string)
    {
        this.addMiddlewares(new StaticMiddleware(path));
    }

    connect()
    {
        for(const middleware of this.middlewares)
        {
            this._origin.use(middleware.callback);
        }
    }
}