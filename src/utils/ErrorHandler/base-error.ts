import { HttpStatusCode } from "../types/http.model";

export class BaseError extends Error {
  constructor(
    public readonly message:string,
    public readonly httpCode:HttpStatusCode,
    public readonly isOperational: boolean
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype)

    Error.captureStackTrace(this)
  }
}
