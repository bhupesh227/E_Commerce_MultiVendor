import { NextFunction, Request, Response } from "express";
import { checkOtpRestrictions, handleForgotPassword, sendOtp, trackOtpRequests, validateRegistrationData, verifyOtp, verifyUserForgotPasswordOTP } from "../utils/auth.helper";
import prisma from "@packages/libs/prisma";
import { AuthError, ValidationError } from "@packages/error-handler";
import bcrypt from "bcryptjs";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
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


export const userForgotPassword = async (req: Request,res: Response,next: NextFunction ) => {
  await handleForgotPassword(req, res, next, 'user');
};

export const verifyUserForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await verifyUserForgotPasswordOTP(req, res, next);
};


export const userResetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return next(new ValidationError('Email and password are required'));
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return next(
        new ValidationError(`User with email ${email} does not exist`)
      );
    }

    // Compare existing with new password
    const isSamePassword = await bcrypt.compare(newPassword, user.password!);
    if (isSamePassword) {
      return next(
        new ValidationError(
          'New password cannot be the same as the old password'
        )
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.users.update({
      where: { email },
      data: { password: hashedPassword },
    });

    res.status(200).json({
      message: 'Password Reset Successfully',
    });
  } catch (error) {
    return next(error);
  }
};


export const handleRefreshToken = async (req: any, res: Response, next: NextFunction) => {
  try {
    const refreshToken =
      req.cookies['refresh_token'] 

    if (!refreshToken) {
      return next(new ValidationError(`Unauthorized, no refresh token!`));
    }
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as { id: string; role: string };

    if (!decoded || !decoded.id || !decoded.role) {
      return next(new JsonWebTokenError(`Forbidden! Invalid refresh token`));
    }

    const user = await prisma.users.findUnique({ where: { id: decoded.id } });

    if (!user) {
      return next(new AuthError(`Forbidden! User/Seller not found!`));
    }

    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: '15m' }
    );

    setCookie(res, 'access_token', newAccessToken);

    return res.status(200).json({ success: true });
  } catch (error) {
    return next(error);
  }
};


export const getUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};


export const registerSeller = async (req: Request, res: Response, next: NextFunction ) => {
  try {
    validateRegistrationData(req.body, 'seller');
    const { name, email } = req.body;

    const existingSeller = await prisma.sellers.findUnique({ where: { email } });

    if (existingSeller) {
      throw new ValidationError(`Seller with this email already exists`);
    }
    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(name, email, 'seller-activation-mail-temp');
    res
      .status(200)
      .json({ message: `OTP sent to email. Please verify your account.` });
  } catch (error) {
    next(error);
  }
};


export const verifySeller = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp, password, name, phone_number, country } = req.body;

    if (!email || !otp || !password || !name || !phone_number || !country) {
      throw new ValidationError(`All fields are required`);
    }

    const existing = await prisma.sellers.findUnique({ where: { email } });

    if (existing) {
      throw new ValidationError(`Seller with this email already exists`);
    }

    await verifyOtp(email, otp, next);

    const hashedPassword = await bcrypt.hash(password, 10);

    const seller = await prisma.sellers.create({
      data: { name, email, password: hashedPassword, phone_number, country },
    });

    res
      .status(201)
      .json({ message: `Seller registered successfully!`, seller });
  } catch (error) {
    next(error);
  }
};

export const createShop = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, bio, address, opening_hours, website, category, sellerId } = req.body;

    if (
      !name ||
      !bio ||
      !address ||
      !opening_hours ||
      !website ||
      !category ||
      !sellerId
    ) {
      throw new ValidationError(`All fields are required!`);
    }

    const shopData = {
      name,
      bio,
      address,
      opening_hours,
      website,
      category,
      sellerId,
    };

    if (website && website.trim() !== '') {
      shopData.website = website;
    }

    const shop = await prisma.shops.create({ data: shopData });

    res.status(201).json({ success: true, shop });
  } catch (error) {
    next(error);
  }
};
