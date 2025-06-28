import { NextFunction, Request, Response } from "express";
import { validateRegistrationData } from "../utils/auth.helper";
import prisma from "../../../../packages/libs/prisma";
import { ValidationError } from "../../../../packages/error-handler";

export const userRegistration = async (req:Request, res:Response,next:NextFunction)=>{
try {
    validateRegistrationData(req.body,"user");
    const {name,email} = req.body;
    const exisitingUser = await prisma.users.findUnique({where:email});
    if(exisitingUser){
        return next(new ValidationError("user already exists with email"));
    }
    
    res.status(200).json({message:"OTP sent to mail. Please verify your account"});
} catch (error) {
    return next(error);
}
}