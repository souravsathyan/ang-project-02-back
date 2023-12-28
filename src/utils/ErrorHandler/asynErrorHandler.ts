import { NextFunction, Request, Response } from "express";
import { BaseError } from "./base-error";
import { HttpStatusCode } from "../types/http.model";

export function asyncErrorHandler (func:any) {
  return (req: Request, res: Response, next: NextFunction) => {
    func(req, res, next).catch((err: Error) => {
      const error = new BaseError(
        err.message,
        HttpStatusCode.INTERNAL_SERVER,
        true
      );
      next(error);
    });
  };
};
