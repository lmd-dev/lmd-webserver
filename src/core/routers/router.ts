import * as Express from "express";
import { Middlewares } from "../middlewares/middlewares";
import { Routers } from "./routers";

/**
 * Base class for a router
 */
export class Router
{
    //Origin of the router
    private _origin : Express.Router;
    public get origin() : Express.Router {return this._origin; }
    
    //Routers collection for sub routes
    private _routers : Routers;
    public get routers() : Routers {return this._routers; }

    //Middlewares
    private _middlewares : Middlewares;
    public get middlewares() : Middlewares {return this._middlewares; }
    
    /**
     * Constructor
     */
    constructor()
    {
        this._origin = Express.Router();

        this._routers = new Routers(this.origin);
        this._middlewares = new Middlewares(this.origin);
    }

    /**
     * Connects the router to its parent
     * @param path URL managed by the router
     * @param parent Parent of the router (the express application or another router)
     */
    connect(path: string, parent: Express.Application | Express.Router)
    {
        this.middlewares.connect();
        
        parent.use(path, <any>this.origin);
    }
}