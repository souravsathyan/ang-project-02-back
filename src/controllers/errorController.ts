import { NextFunction, Request, Response } from "express";
import { BaseError } from "../utils/ErrorHandler/base-error";
import { ErrorHandler } from "../utils/ErrorHandler/error-handler";
import { logger } from "../utils/ErrorHandler/logger";

const errorHandler = new ErrorHandler(logger);

export async function errorMiddleware(
  error: BaseError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!errorHandler.isTrustedError(error)) {
    next(error);
    return;
  }
  await errorHandler.handleError(error);
  res.status(error.httpCode).json({
    status:error.httpCode,
    message:error.message,
    statcTrace:error.stack,
    error:error
  })
}
