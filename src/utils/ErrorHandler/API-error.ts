import { HttpStatusCode } from "../types/http.model";
import { BaseError } from "./base-error";

export class APIerror extends BaseError {
  constructor(
    message: string,
    httpCode : HttpStatusCode,
    isOperational = true
  ) {
    super( message, httpCode, isOperational);
  }
}
