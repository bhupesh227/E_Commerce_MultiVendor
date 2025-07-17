import crypto from 'crypto';
import { ValidationError } from '@packages/error-handler';
import { NextFunction, Request, Response } from 'express';
import redis from '@packages/libs/redis';
import { sendEmail } from './sendMail';
import prisma from '@packages/libs/prisma';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegistrationData = (data: any, userType: "user" | "seller") => {
  const { name, email, password, phone_number, country } = data;
  if (
    !name ||
    !email ||
    !password ||
    (userType == "seller" && (!phone_number || !country))
  ) {
    throw new ValidationError("Missing required fields");
  }
  if (!emailRegex.test(email)) {
    throw new ValidationError("Invalid email format");
  }
};

export const checkOtpRestrictions = async (
  email: string,
  next: NextFunction
) => {
  if (await redis.get(`otp_lock: ${email}`)) {
    throw new ValidationError("Account locked due to multiple failed attempts! Try again after 30 minutes" ); 
  }
  if (await redis.get(`otp_spam_lock:${email}`)) {
    throw new ValidationError("Too Many OTP requests! Please wait an hour before requesting again");
  }
  if(await redis.get(`otp_cooldown:${email}`)){
    throw new ValidationError("Please wait 1 minute before requesting a new OTP!");
  }
};


export const trackOtpRequests = async(email:string,next:NextFunction)=>{ 
  const otpRequestKey = `otp_request_count:${email}`;
  let otpRequests = parseInt((await redis.get(otpRequestKey)) || "0");
  if(otpRequests>=2){
    await redis.set(`otp_spam_lock:${email}`,"locked","EX",3600);         //lock for 1 hour
    throw new ValidationError("Too many OTP requests. Please nwait 1 hour before requestiing");
  }
  await redis.set(otpRequestKey,otpRequests+1,"EX",3600); //tracking requests for 1 hour

}


export const sendOtp = async (
  name: string,
  email: string,
  template: string
) => {
  const otp = crypto.randomInt(1000, 9999).toString();
  await sendEmail(email, "Verify your Email", template, { name, otp });
  await redis.set(`otp:${email}`, otp, "EX", 300);
  await redis.set(`otp_cooldown:${email}`, "true", "EX", 60);
};


export const verifyOtp = async (email: string, otp: string, next: NextFunction) => {
    const storedOtp = await redis.get(`otp:${email}`);
    if (!storedOtp) {
        throw new ValidationError("Invalid or expired OTP!");
    };

    const failedAttemptsKey = `otp_attempts:${email}`;
    const failedAttempts = parseInt((await redis.get(failedAttemptsKey)) || "0");

    if (storedOtp !== otp) {
        if (failedAttempts >= 2) {
            await redis.set(`otp_lock:${email}`, "locked", "EX", 1800); // Lock for 30 min.
            await redis.del(`otp:${email}`, failedAttemptsKey);
            throw new ValidationError("Too many failed Attempts. Your account is locked for 30 minutes!");
        };
        await redis.set(failedAttemptsKey, failedAttempts + 1, "EX", 300);
        throw new ValidationError(`Incorrect OTP. ${2 - failedAttempts} attempts left.`);
    };

    await redis.del(`otp:${email}`, failedAttemptsKey);

};



export const handleForgotPassword = async (req: Request, res: Response, next: NextFunction, userType: "user" | "seller") => {
  try {
      const { email } = req.body;

      if (!email) throw new ValidationError("Email is Required!");

      const user =
        userType === 'user'
          ? await prisma.users.findUnique({ where: { email } })
          : await prisma.sellers.findUnique({ where: { email } });
        
      if (!user) throw new ValidationError(`${userType} is not found!`);

      await checkOtpRestrictions(email, next);
      await trackOtpRequests(email, next);

      await sendOtp(user.name, email,  userType === 'user' ? "forgot-password-user-mail" : "forgot-password-seller-mail");

      res.json(200).json({
          message: "OTP sent to email. Please verify your account."
      });
  } catch (error) {
      next(error);
  }
};


export const verifyUserForgotPasswordOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) throw new ValidationError("Email and OTP are Required!");
        await verifyOtp(email, otp, next);

        res.status(200).json({ message: "OTP Verified. You can now reset your password." });
    } catch (error) {
      next(error);
    }
};
