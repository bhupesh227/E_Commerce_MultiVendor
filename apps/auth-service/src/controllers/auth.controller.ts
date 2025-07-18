import { CookieOptions, NextFunction, Request, Response } from "express";
import { checkOtpRestrictions, handleForgotPassword, sendOtp, trackOtpRequests, validateRegistrationData, verifyOtp, verifyUserForgotPasswordOTP } from "../utils/auth.helper";
import prisma from "@packages/libs/prisma";
import { AuthError, NotFoundError, ValidationError } from "@packages/error-handler";
import bcrypt from "bcryptjs";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { setCookie } from "../utils/cookies/setCookie";
import stripe from "@packages/libs/stripe";

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

      res.clearCookie("seller_access_token");
      res.clearCookie("seller_refresh_token");

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
      req.cookies['refresh_token'] ||
      req.cookies['seller_refresh_token'] ||
      (req.headers.authorization && req.headers.authorization.split(' ')[1]);

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

    let account;

    if (decoded.role === 'user') {
      account = await prisma.users.findUnique({ where: { id: decoded.id } });
    
    } else if (decoded.role === 'seller') {
      account = await prisma.sellers.findUnique({
        where: { id: decoded.id },
        include: { shop: true },
      });
    }

    if (!account) {
      return new AuthError(`Forbidden! User/Seller not found!`);
    }

    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: '15m' }
    );

    if (decoded.role === 'user') {
      setCookie(res, 'access_token', newAccessToken);
    } else if (decoded.role === 'seller') {
      setCookie(res, 'seller_access_token', newAccessToken);
    }

    req.role = decoded.role;

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

export const createStripeLink = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sellerId } = req.body;
    if (!sellerId) {
      return next(new ValidationError(`Seller ID is required`));
    }

    const seller = await prisma.sellers.findUnique({ where: { id: sellerId } });

    if (!seller) {
      return next(new ValidationError(`Seller not found`));
    }

    const account = await stripe.accounts.create({
      type: 'express',
      country: seller.country,
      email: seller?.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    await prisma.sellers.update({
      where: { id: sellerId },
      data: { stripeId: account.id },
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `http://localhost:3000/success`,
      return_url: `http://localhost:3000/success`,
      type: 'account_onboarding',
    });

    return res.status(200).json({ url: accountLink.url });
  } catch (error) {
    return next(error);
  }
};

export const sellerLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AuthError(`All fields are required`));
    }

    const seller = await prisma.sellers.findUnique({ where: { email } });

    if (!seller) {
      return next(new AuthError(`User with email ${email} does not exist`));
    }

    const isPasswordValid = await bcrypt.compare(password, seller.password!);
    if (!isPasswordValid) {
      return next(new ValidationError(`Invalid password or email`));
    }

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    const accessToken = jwt.sign(
      { id: seller.id, role: 'seller' },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: seller.id, role: 'seller' },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: '7d',
      }
    );

    
    setCookie(res, 'seller_access_token', accessToken);
    setCookie(res, 'seller_refresh_token', refreshToken);

    res.status(200).json({
      message: `Logged in successfully!`,
      user: { id: seller.id, email: seller.email, name: seller.name },
    });
  } catch (error) {
    return next(error);
  }
};


export const getSeller = async (req: any, res: Response, next: NextFunction) => {
  try {
    const seller = req.seller;
    
    res.status(200).json({ success: true, seller });
  } catch (error) {
    next(error);
  }
}; 


export const addUserAddress = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { label, name, street, city, zip, country, isDefault } = req.body;

    if (!label || !name || !street || !city || !zip || !country) {
        return next(new ValidationError("All fields are required"));
    }

    if (isDefault) {
        await prisma.address.updateMany({
            where: {
                userId,
                isDefault: true,
            }, data: {
                isDefault: false
            }
        });
    }

    const newAddress = await prisma.address.create({
        data: {
            userId,
            label, name, street, city, zip, country, isDefault
        }
    });

    res.status(201).json({
        success: true,
        address: newAddress
    })
  } catch (error) {
    next(error);
  }
}

export const deleteUserAddress = async (req: any, res: Response, next: NextFunction) => {
  try {
      const userId = req.user?.id;

      const { addressId } = req.params;

      if (!addressId) {
          return next(new ValidationError("Address ID is required"));
      }

      const existingAddress = await prisma.address.findFirst({
          where: {
              id: addressId,
              userId
          }
      });

      if (!existingAddress) {
          return next(new NotFoundError("Address not found or unauthorized"));
      }

      await prisma.address.delete({
          where: {
              id: addressId
          }
      });

      res.status(200).json({
          success: true,
          message: "Address deleted successfully",
      })

  } catch (error) {
    next(error);
  }
}

export const getUserAddresses = async (req: any, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const addresses = await prisma.address.findMany({
            where: {
              userId,
            }, 
            orderBy: {
              createdAt: 'desc'
            },
        });

        res.status(200).json({
            success: true,
            addresses,
        })
    } catch (error) {
      next(error);
    }
}

export const updateUserPassword = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new ValidationError("All fields are required");
    }

    if (newPassword !== confirmPassword) {
      throw new ValidationError("New passwords do not match");
    }

    if (newPassword === currentPassword) {
      throw new ValidationError("New password cannot be the same as the current password");
    }

    const user = await prisma.users.findUnique({ where: { id: userId } });

    if (!user || !user.password) {
      throw new AuthError("User not found or password not set");
    }

    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordCorrect) {
      throw new AuthError("Current password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.users.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: "Password updated successfully" });

  } catch (error) {
    next(error); 
  }
};


export const logOutUser = async (req: any, res: Response) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';

    const cookieOptions :CookieOptions = {
      httpOnly: true,
      sameSite: isProduction ? 'none' : 'lax' ,
      secure: isProduction,
      path: '/',
    };
    
    res.clearCookie("access_token", cookieOptions);
    res.clearCookie("refresh_token", cookieOptions);

    res.status(201).json({
      success: true,
      message: "User Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error during logout",
    });
  }
};


export const logOutSeller = async (req: any, res: Response) => {
  res.clearCookie("seller_access_token");
  res.clearCookie("seller_refresh_token");
  res.status(201).json({
    success: true,
    message: "Seller Logged out successfully",
  });
}


export const loginAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
      const { email, password } = req.body;

      if (!email || !password) {
          throw new ValidationError("Email and password are required");
      }

      const user = await prisma.users.findUnique({ where: { email } });

      if (!user) {
          throw new AuthError("User does not exist!");
      }

      const isPasswordMatch = await bcrypt.compare(password, user.password!);
      if (!isPasswordMatch) {
          throw new AuthError("Invalid email or Password");
      }

      const isAdmin = user.role === 'admin';

      if(!isAdmin){
        // sendLog({
        //   type: 'error',
        //   message: `Admin login failed for ${email} - not an admin`,
        //   source: 'auth-service',
        // });
          throw new AuthError("Invalid access!");
      }

      // sendLog({
      //     type: "success",
      //     message: `Admin login successful for ${email}`,
      //     source: "auth-service",
      // });

      res.clearCookie('seller_access_token');
      res.clearCookie('seller_refresh_token');

      const accessToken = jwt.sign(
          { id: user.id, role: 'admin' },
          process.env.ACCESS_TOKEN_SECRET as string,
          {
              expiresIn: '15m'
          }
      );

      const refreshToken = jwt.sign(
          { id: user.id, role: 'admin' },
          process.env.REFRESH_TOKEN_SECRET as string,
          {
              expiresIn: '7d'
          }
      );

      setCookie(res, "refresh_token", refreshToken);
      setCookie(res, "access_token", accessToken);

      res.status(200).json({
          message: "Login successful",
          user: { id: user.id, email: user.email, name: user.name }
      });

  } catch (error) {
    return next(error);
  }
}

export const logoutAdmin = async (req: any, res: Response) => {
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");

  res.status(200).json({
    success: true,
    message: "Admin logged out successfully",
  });
}

export const getAdmin = async (req: any, res: Response, next: NextFunction) => {
  try {
    const admin = req.admin;
    if (!admin) {
      return next(new NotFoundError("Admin not found"));
    }
    res.status(200).json({ success: true, admin });
  } catch (error) {
    next(error);
  }
};