import { ValidationError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import { NextFunction, Request, Response } from "express";




export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const [products, totalProducts] = await Promise.all([
            prisma.products.findMany({
                where: {
                    isDeleted: false,
                },
                skip,
                take: limit,
                orderBy: {
                    createdAt: "desc"
                },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    salePrice: true,
                    stock: true,
                    createdAt: true,
                    ratings: true,
                    category: true,
                    images: {
                        select: {
                            url: true,
                        },
                        take: 1,
                    },
                    shop: {
                        select: { name: true }
                    }
                }
            }),
            prisma.products.count({
                where: {
                    isDeleted: false,
                },
            }),
        ]);

        const totalPages = Math.ceil((totalProducts / limit));

        res.status(200).json({
            success: true,
            data: products,
            meta: {
                totalProducts,
                currentPage: page,
                totalPages,
            }
        });

    } catch (error) {
        next(error);
    }
}

export const getAllEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const [products, totalProducts] = await Promise.all([
            prisma.products.findMany({
                where: {
                    startingDate: {
                        not: null
                    }
                },
                skip,
                take: limit,
                orderBy: {
                    createdAt: "desc"
                },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    salePrice: true,
                    stock: true,
                    createdAt: true,
                    ratings: true,
                    category: true,
                    images: {
                        select: {
                            url: true,
                        },
                        take: 1,
                    },
                    shop: {
                        select: { name: true }
                    }
                }
            }),
            prisma.products.count({
                where: {
                    startingDate: {
                        not: null
                    }
                },
            }),
        ]);

        const totalPages = Math.ceil((totalProducts / limit));

        res.status(200).json({
            success: true,
            data: products,
            meta: {
                totalProducts,
                currentPage: page,
                totalPages,
            }
        });

    } catch (error) {
        next(error);
    }
}

export const getAllAdmins = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const admins = await prisma.users.findMany({
            where: {
                role: "admin"
            }
        });

        res.status(201).json({
            success: true,
            admins,
        });
    } catch (error) {
        next(error);
    }
}

export const addNewAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, role } = req.body;

        const isUser = await prisma.users.findUnique({ where: { email } });

        if (!isUser) {
            return next(new ValidationError("Something went wrong"));
        }

        const updateRole = await prisma.users.update({
            where: { email },
            data: { role }
        });

        res.status(201).json({
            success: true,
            updateRole,
        });

    } catch (error) {
        next(error);
    }
}


export const getAllCustomizations = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const configs = await prisma.siteConfig.findFirst();

        return res.status(200).json({
            categories: configs?.categories || [],
            subCategories: configs?.subCategories || [],
            logo: configs?.logo || null,
            banner: configs?.banner || null,
        });
    } catch (error) {
        return next(error);
    }
}


export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const [users, totalUsers] = await Promise.all([
            prisma.users.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                }
            }),
            prisma.users.count({}),
        ]);

        const totalPages = Math.ceil((totalUsers / limit));

        res.status(200).json({
            success: true,
            data: users,
            meta: {
                totalUsers,
                currentPage: page,
                totalPages,
            }
        });
    } catch (error) {
        next(error);
    }
}

export const getAllSellers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const [sellers, totalSellers] = await Promise.all([
            prisma.sellers.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true,
                    shop: {
                        select: {
                            name: true,
                            avatar: true,
                            address: true,
                        }
                    }
                }
            }),
            prisma.sellers.count({})
        ]);
        const totalPages = Math.ceil((totalSellers / limit));

        res.status(200).json({
            success: true,
            data: sellers,
            meta: {
                totalSellers,
                currentPage: page,
                totalPages,
            }
        });
    } catch (error) {
        next(error);
    }
}

export const getAllNotifications = async (req: any, res: Response, next: NextFunction) => {
    try {
        const adminId = req.admin.id;
        const notifications = await prisma.notifications.findMany({
            where: { receiverId : adminId },
            orderBy: { createdAt: 'desc' }
        });

        return res.status(200).json({
            success: true,
            data: notifications
        });
    } catch (error) {
        return next(error);
    }
}

export const getAllUsersNotifications = async (req: any, res: Response, next: NextFunction) => {
    try {
        const notifications = await prisma.notifications.findMany({
            where: { receiverId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });

        return res.status(200).json({
            success: true,
            data: notifications
        });
    } catch (error) {
        return next(error);
    }
}
