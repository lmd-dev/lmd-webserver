import * as Express from "express";
import { Middleware } from "./middleware";
import { StaticMiddleware } from "./static.middleware";
import { UploadMiddleware } from "./upload.middleware";

/**
 * Middlewares manager
 * Managed middlewares will be connected in the order of their adding to the collection
 */
export class Middlewares
{
    //Object to append middlewares
    private _origin : Express.Application | Express.Router;
    public get origin() : Express.Application | Express.Router {return this._origin; }

    //Middlewares collection
    private _middlewares : Middleware[];
    public get middlewares() : Middleware[] {return this._middlewares; }   
    
    /**
     * Constructor
     * @param origin Object to append middlewares 
     */
    constructor(origin: Express.Application | Express.Router)
    {
        this._origin = origin;
        this._middlewares = [];
    }

    /**
     * Sets the collection of middlewares
     * @param middlewares Middlewares to add
     */
    setMiddlewares(...middlewares: Middleware[])
    {
        this._middlewares = middlewares;
    }

    /**
     * Adds some middlewares to the collection
     * @param middlewares Middlewares to add
     */
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

    /**
     * Adds uploading files manager
     * @param dest folder path to store uploaded files
     * @param fieldName name of the field containing uploaded files data in the request
     */
    addUploadManager(dest: string, fieldName: string)
    {
        this.addMiddlewares(new UploadMiddleware(dest, fieldName));
    }

    /**
     * Connects middlewares of the collection to the origin object
     */
    connect()
    {
        for(const middleware of this.middlewares)
        {
            this._origin.use(middleware.callback);
        }
    }
}