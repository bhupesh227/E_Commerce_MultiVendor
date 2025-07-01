import { NextFunction, Request, Response } from "express";
import { checkOtpRestrictions, sendOtp, trackOtpRequests, validateRegistrationData, verifyOtp } from "../utils/auth.helper";
import prisma from "@packages/libs/prisma";
import { AuthError, ValidationError } from "@packages/error-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { setCookie } from "../utils/cookies/setCookie";

export const userRegistration = async (req:Request, res:Response,next:NextFunction)=>{
try {
    validateRegistrationData(req.body,"user");
    const {name,email} = req.body;
    const exisitingUser = await prisma.users.findUnique({where:{email}});
    if(exisitingUser){
        return next(new ValidationError("user already exists with email"));
    }
    await checkOtpRestrictions(email,next);
    await trackOtpRequests(email,next);
    await sendOtp(name,email,"user-activation-mail");
    res.status(200).json({message:"OTP sent to mail. Please verify your account"});
} catch (error) {
    return next(error);
}
}

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, otp, password } = req.body;

    if (!name || !email || !otp || !password) {
      throw new ValidationError('All fields are required');
    }

    const existing = await prisma.users.findUnique({ where: { email } });

    if (existing) {
      throw new ValidationError(`User with email ${email} already exists`);
    }

    await verifyOtp(email, otp,next);
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.users.create({
      data: { name, email, password: hashedPassword },
    });
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
    });
  } catch (error) {
    return next(error);
  }
};

//login 

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
          return next(new ValidationError("All Fields Required"));
      };

      const user = await prisma.users.findUnique({ where: { email } });

      if (!user) {
          return next(new AuthError("User does not exist"));
      };

      const isMatchCredentials = await bcrypt.compare(password, user.password!);
      if (!isMatchCredentials) return next(new AuthError("Invalid email or password"));

      res.clearCookie("seller-access-token");
      res.clearCookie("seller-refresh-token");

      // Generate access and refresh tokens
      const accessToken = jwt.sign(
        { id: user.id, role: "user" }, 
        process.env.ACCESS_TOKEN_SECRET as string, 
        { expiresIn: "15m" }
      );
      const refreshToken = jwt.sign(
        { id: user.id, role: "user" }, 
        process.env.REFRESH_TOKEN_SECRET as string, 
        { expiresIn: "7d" }
      );

      setCookie(res, "refresh_token", refreshToken);
      setCookie(res, "access_token", accessToken);

      res.status(200).json({
          message: "LogIn Successful",
          user: {
              id: user.id,
              name: user.name,
              email: user.email,
          },
      });
      
    } catch (error) {
      return next(error);
    }
};