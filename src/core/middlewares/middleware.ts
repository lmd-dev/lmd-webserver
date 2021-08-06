import * as Express from "express";

export class Middleware
{
    private _callback : (req: Express.Request, res: Express.Response, next: Express.NextFunction) => void;
    public get callback() : (req: Express.Request, res: Express.Response, next: Express.NextFunction) => void {return this._callback; }
    
    constructor(callback: (req: Express.Request, res: Express.Response, next: Express.NextFunction) => void)
    {
        this._callback = callback;
    }
}