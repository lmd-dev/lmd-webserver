import { Middleware } from "./middleware";
import * as Express from "express";
import Multer from "multer";

/**
 * Middleware processing uploaded files
 */
export class UploadMiddleware extends Middleware
{   
    /**
     * Constructor
     * @param dest Path of the folder to store uploaded files 
     * @param fieldName Name of the field, in the request, that conatins files data to upload 
     */
    constructor(dest: string, fieldName: string)
    {
        super((req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
            Multer({dest: dest}).single(fieldName)(req, res, next);
        });
    }
}