import { NextFunction, Request, Response } from "express";
import { asyncErrorHandler } from "../utils/ErrorHandler/asynErrorHandler";
import { HttpStatusCode } from "../utils/types/http.model";

export const userHome = asyncErrorHandler(async(req:Request,res:Response,next:NextFunction)=>{
    res.status(HttpStatusCode.OK).json({
        status:"success",
        message:"home works"
    })
})