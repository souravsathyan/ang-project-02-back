// global dependencies
import express, { Application, NextFunction, Request, Response } from 'express'
import cors from "cors";

// project dependencies
import { APIerror } from './utils/ErrorHandler/API-error'
import { HttpStatusCode } from './utils/types/http.model'
import { errorMiddleware } from './controllers/errorController'
import { router as authRouter } from './routes/authRouter'
import {router as userRouter } from './routes/userRoutes'
import {router as adminRouter } from './routes/adminRouter'
import cookieParser from 'cookie-parser';

// Express initialization
export let app:Application = express()

// middlewares
const allowedOrigins = ['http://localhost:4200'];
const options: cors.CorsOptions = {
  origin: allowedOrigins,
  credentials:true,
};
app.use(cors(options));
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(express.json())

// Using route
app.use('/auth',authRouter)
app.use('/user',userRouter)
app.use('/admin',adminRouter)

// global error handling
app.use(errorMiddleware)

app.all('*',(req:Request,res:Response,next:NextFunction)=>{
    const errMsg = `Can't find ${req.originalUrl} on the server!`
    const err = new APIerror(errMsg, HttpStatusCode.NOT_FOUND, true)
    next(err)
})


