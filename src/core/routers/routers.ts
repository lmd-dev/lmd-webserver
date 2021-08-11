import * as Express from "express";
import { Middleware } from "./../middlewares/middleware";
import { Router} from "./router";

/**
 * Collection of routers
 */
export class Routers
{
    //Origin of each router of the collection
    private _origin : Express.Application | Express.Router;
    public get origin() : Express.Application | Express.Router {return this._origin; }
        
    /**
     * Constructor
     * @param origin Parent of each router of the collection 
     */
    constructor(origin: Express.Application | Express.Router)
    {
        this._origin = origin;
    }

    /**
     * Adds route to the server
     * @param method HTTP Method to access to this route
     * @param path relative path from server root
     * @param middleware Middleware(s) to call
     */
    addRoute(method: "get" | "post" | "all", path: string, ...middlewares: Middleware[])
    {
        this.origin[method](path, <any>middlewares.map((middleware) => { return middleware.callback; }));
    }

    /**
     * Adds router as child to the server
     * @param path relative path from server root
     * @param router Child router
     */
    addRouter(path: string, router: Router)
    {
        router.connect(path, this.origin);
    }
}