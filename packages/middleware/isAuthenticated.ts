import prisma from "../libs/prisma";
import { NextFunction, Response } from "express";
import jwt from 'jsonwebtoken';

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies['access_token'] ||
      req.cookies['seller_access_token'] ||
      req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: `Unauthorized! Token missing` });
    }
    // Verify the token
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as { id: string; role: 'user' | 'seller' | 'admin' };


    if (!decoded) {
      return res.status(401).json({ message: `Unauthorized! Invalid token` });
    }

    let account;

    if (decoded.role === 'user') {
      account = await prisma.users.findUnique({
        where: { id: decoded.id },
      });
      req.user = account;

    } else if (decoded.role === 'seller') {
      account = await prisma.sellers.findUnique({
        where: { id: decoded.id },
        include:{
          shop:{
            include:{
              _count: {
                select: { followers: true },
              },
            }
          }
        }
      });
      req.seller = account;
    }else if (decoded.role === 'admin') {
      account = await prisma.users.findUnique({
        where: { id: decoded.id , role: 'admin' },
        select: {
          id: true,
          email: true,
          role: true,
          name: true,
        }
      });
      req.admin = account;
    }
    
    if (!account) {
      return res.status(401).json({ message: `Unauthorized! Account not found` });
    }

    req.role = decoded.role;
    
    return next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: `Unauthorized! Token expired or invalid` });
  }
};

export default isAuthenticated;