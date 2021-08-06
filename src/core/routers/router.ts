import * as Express from "express";
import { Middlewares } from "../middlewares/middlewares";
import { Routers } from "./routers";

export class Router
{
    private _origin : Express.Router;
    public get origin() : Express.Router {return this._origin; }
    
    
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

    connect(path: string, parent: Express.Application | Express.Router)
    {
        this.middlewares.connect();
        
        parent.use(path, <any>this.origin);
    }
}