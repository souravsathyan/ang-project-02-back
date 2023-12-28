import { User, UserData } from "../model/userModel";
import { asyncErrorHandler } from "../utils/ErrorHandler/asynErrorHandler";
import jwt, { JwtHeader, JwtPayload } from "jsonwebtoken";
import crypto from 'crypto'
import { BaseError } from "../utils/ErrorHandler/base-error";
import util from 'util'
import { NextFunction, Request, Response } from "express";
import { logger } from '../utils/ErrorHandler/logger'
import { HttpStatusCode } from "../utils/types/http.model";
import { APIerror } from "../utils/ErrorHandler/API-error";
import { verifyEmail } from "../utils/email";


const signToken = (newUserId)=>{
    return  jwt.sign(
        {id:newUserId},
        process.env.SECRET_STR,
        {
            expiresIn:process.env.LOGIN_EXPIRES
        }
    )
}

export const signup = asyncErrorHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const newUser = await User.create(req.body)

    const resetToken = newUser.createVerificationToken()
    await newUser.save({validateBeforeSave:false})

    const link = `http://localhost:4200/verifyEmail/${resetToken}`

    await verifyEmail(newUser.name, newUser.email,link)

    res.status(HttpStatusCode.OK).json({
        status:"sucess",
        message:"Email sent successfully. please check the email to activate your account "
    })
})

export const login = asyncErrorHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const {email,password} = req.body

    if(!email || !password){
        const error = new APIerror('Please provide email id and password',HttpStatusCode.BAD_REQUEST)
        return next(error)
    }

    const user = await User.findOne({email}).select('+password')
    if(!user ||!(await user.comparePasswordInDB(""+password,user.password))){
        const error = new APIerror("entered password do not match. Please try again",HttpStatusCode.BAD_REQUEST)
        return next(error)
    }

    if(!user.verified){
        const error = new APIerror("You are not verified please try  again",HttpStatusCode.BAD_REQUEST)
        return next(error) 
    }

    const token = signToken(user._id)

    res.status(HttpStatusCode.OK).json({
        status:"success",
        message:"login succesfull",
        data:{
            id:user._id,
            name:user.name,
            email:user.email,
            role:user.roles,
            status:user.status,
            mobile:user.phone,
            token,
            tokenExpiration:process.env.LOGIN_EXPIRES
        }
    })
})

export const protect = asyncErrorHandler(async (req:Request, res:Response, next:NextFunction)=>{
    const testToken = req.headers.authorization
    let token : string

    if(testToken && testToken.toLowerCase().indexOf('bearer')===0){
        token = testToken.substring(7)
    }

    if(!token){
        const error = new APIerror('you are not logged in',HttpStatusCode.UNAUTH_ACCESS)
        next(error)
    }

    const decodedToken = jwt.verify(token, process.env.SECRET_STR)
    if(typeof decodedToken === 'string'){
        const error = new APIerror('Invalid Token please login again',HttpStatusCode.UNAUTH_ACCESS)
        return next(error)
    }
    const user = await User.findById(decodedToken.id) as UserData

    if(!user){
        const error = new APIerror('User with given token does not exists',HttpStatusCode.BAD_REQUEST)
        return next(error)
    }

    const isPasswordChanged = await user.isPasswordChanged(decodedToken.iat)
    if(isPasswordChanged){
        const error = new APIerror('You have changed password recently. Please Login again',HttpStatusCode.UNAUTH_ACCESS)
        return next(error)
    }
    console.log(user)
    req.user = user 
    next()
})

export const verifyUserByEmail = asyncErrorHandler(async(req:Request, res:Response, next:NextFunction)=>{
    const token = crypto.createHash('sha256').update(req.body.token).digest('hex')
    const user = await User.findOne({verificationToken:token, verificationTokenExpire:{$gte:Date.now()}})
    
    if(!user){
        const error = new APIerror('Token is invalid or expred', HttpStatusCode.BAD_REQUEST,true)
        next(error)
    }
    user.verificationToken=undefined
    user.verificationTokenExpire=undefined
    user.verified=true
    user.save()
    console.log('user verified')
    res.status(HttpStatusCode.OK).json({
        status:"success",
        message:"email verified successfully. Please login to continue",
        data:{
            user
        }
    })
})

