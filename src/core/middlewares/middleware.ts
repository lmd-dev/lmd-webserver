import * as Express from "express";

/**
 * Base class for a middleware
 */
export class Middleware
{
    //Function which will process the request
    private _callback : (req: Express.Request, res: Express.Response, next: Express.NextFunction) => void;
    public get callback() : (req: Express.Request, res: Express.Response, next: Express.NextFunction) => void {return this._callback; }
    
    /**
     * Constructor
     * @param callback Function which will process the request
     */
    constructor(callback: (req: Express.Request, res: Express.Response, next: Express.NextFunction) => void)
    {
        this._callback = callback;
    }
}