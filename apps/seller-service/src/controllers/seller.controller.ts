import { NextFunction, Request, Response } from "express";
import imageKit from "@packages/libs/imagekit";
import prisma from "@packages/libs/prisma";
import { AuthError, NotFoundError, ValidationError,ForbiddenError } from "@packages/error-handler";


export const deleteShop =async (req: any, res: Response, next: NextFunction) => {
    try {
        const sellerId = req.seller?.id;
        const seller = await prisma.sellers.findUnique({
            where:{id :sellerId},
            include:{shop:true}
        });
        if(!seller || !seller.shop){
            return next(new NotFoundError("Seller or shop not found"));
        };

        const deletedAt = new Date();
        deletedAt.setDate(deletedAt.getDate() + 28);
        // soft delete both selleer and shop
        await prisma.$transaction([
            prisma.sellers.update({
                where: { id: sellerId },
                data: { deletedAt , isDeleted: true }
            }),
            prisma.shops.update({
                where: { id: seller.shop.id },
                data: { deletedAt , isDeleted: true }
            })
        ]);

        return res.status(200).json({
            message: "Shop and seller marked as deleted successfully and will be permanently deleted after 28 days.",
        });
    } catch (error) {
        return next(new Error("Internal Server Error"));
    }
}

export const restoreShop =async (req: any, res: Response, next: NextFunction) => {
    try {
        const sellerId = req.seller?.id;
        const seller = await prisma.sellers.findUnique({
            where:{id :sellerId},
            include:{shop:true}
        });
        if(!seller || !seller.shop){
            return next(new NotFoundError("Seller or shop not found"));
        };
        if(!seller.deletedAt || !seller.isDeleted || !seller.shop.deletedAt || !seller.shop.isDeleted){
            return next(new ValidationError("Seller or shop is not marked as deleted"));
        }

        const currentDate = new Date();
        const deletedAt = new Date(seller.deletedAt);
        if (currentDate > deletedAt) {
            return next(new ForbiddenError("Cannot restore seller or shop. The 28 days of soft deletion have passed."));
        };

        // restore both seller and shop
        await prisma.$transaction([
            prisma.sellers.update({
                where: { id: sellerId },
                data: { deletedAt: null, isDeleted: false }
            }),
            prisma.shops.update({
                where: { id: seller.shop.id },
                data: { deletedAt: null, isDeleted: false }
            })
        ]);

        return res.status(200).json({
            message: "Shop and seller restored successfully.",
        });
        
    } catch (error) {
        return next(new Error("Internal Server Error"));
    }

}

export const UploadImage =async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {fileName, file , folder} = req.body;
        if (!fileName || !file || !folder) {
            return res.status(400).json({
                message: "fileName, file and folder are required"
            });
        }
        const uploadResponse = await imageKit.upload({
            file: file, // base64 string
            fileName: fileName,
            folder: folder
        });
        return res.status(200).json({
            message: "Image uploaded successfully",
            file_id: uploadResponse.fileId,
            url: uploadResponse.url,
            success: true
        });
    } catch (error) {
        console.error("Error uploading image:", error);
        return next(error);
    }
}

export const updateProfilePictures =async (req: any, res: Response, next: NextFunction) => {
    try {
        const {editType, imageUrl} = req.body;
        if(!editType || !imageUrl) {
            return next(new ValidationError("editType and imageUrl are required"));
        }
        const sellerId = req.seller?.id;
        if(!sellerId) {
            return next(new AuthError("Unauthorized access"));
        }
        const updateField = editType === "cover" ? {coverBanner: imageUrl} : {avatar: imageUrl};
        const updatedSeller = await prisma.shops.update({
            where: { id: sellerId },
            data: updateField,
            select :{
                id: true,
                avatar: true,
                coverBanner: true
            }
        });
        res.status(200).json({
            success: true,
            message : `${editType === "cover" ? "Cover banner" : "Avatar"} updated successfully`,
            updatedSeller
        });
    } catch (error) {
        return next(error);
    }
};

export const editSellerProfile =async (req: any, res: Response, next: NextFunction) => {
    try {
        const { name, bio, address, opening_hours, website, socialLinks} = req.body;
        if (!name || !bio || !address || !opening_hours || !website || !socialLinks) {
            return next(new ValidationError("All fields are required"));
        }
        const sellerId = req.seller?.id;
        if (!sellerId) {
            return next(new AuthError("Unauthorized access"));
        }
        const existingShop = await prisma.shops.findUnique({
            where: { sellerId: sellerId },
        });
        if (!existingShop) {
            return next(new NotFoundError("Shop not found"));
        }

        const updatedShop = await prisma.shops.update({
            where: { sellerId: sellerId },
            data: {
                name,
                bio,
                address,
                opening_hours,
                website,
                socialLinks
            },
            select: {
                id: true,
                name: true,
                bio: true,
                address: true,
                opening_hours: true,
                website: true,
                socialLinks: true,
                updatedAt: true
            }
        });
        return res.status(200).json({
            success: true,
            message: "Shop profile updated successfully",
            updatedShop
        });
    } catch (error) {
        return next(error);
    }
}

export const getSellerInfo =async (req: Request, res: Response, next: NextFunction) => {
    try {
        const shop = await prisma.shops.findUnique({
            where: { id: req.params.id },
        });
        const followersCount = await prisma.followers.count({
            where: { shopsId: shop?.id }
        });
        res.status(200).json({
            success: true,
            shop,
            followersCount
        });
    } catch (error) {
        return next(error);
    }
}

export const getSellerProducts =async (req: any, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;
        const [products,total] = await Promise.all([
            prisma.products.findMany({
                where: { startingDate :null , shopId:req.query.id! },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    images: true,
                    shop: true,
                }
            }),
            prisma.products.count({
                where: { startingDate :null , shopId:req.query.id! }
            })
        ]);
        res.status(200).json({
            success: true,
            products,
            pagination :{
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return next(error);
    }
}

export const getSellerEvents =async (req: any, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;
        const [products, total] = await Promise.all([
            prisma.products.findMany({
                where: { startingDate: { not: null }, shopId: req.query.id! },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    images: true,
                    shop: true,
                }
            }),
            prisma.products.count({
                where: { startingDate: { not: null }, shopId: req.query.id! }
            })
        ]);
        res.status(200).json({
            success: true,
            products,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return next(error);
    }
}

export const followShop =async (req: any, res: Response, next: NextFunction) => {
    try {
        const { shopId } = req.body;
        if (!shopId) {
            return next(new ValidationError("shopId is required"));
        }
        const existingFollow = await prisma.followers.findFirst({
            where: {
                userId: req.user?.id,
                shopsId: shopId
            }    
        });
        if (existingFollow) {
            return res.status(200).json({
                success: true,
                message: "You are already following this shop",
            });
        }
        const follow = await prisma.followers.create({
            data: {
                userId: req.user?.id,
                shopsId: shopId
            }
        });
        res.status(201).json({
            success: true,
            message: "Shop followed successfully",
            follow
        });
    } catch (error) {
        return next(error);
    }
};

export const unfollowShop =async (req: any, res: Response, next: NextFunction) => {
    try {
        const { shopId } = req.body;
        if (!shopId) {
            return next(new ValidationError("shopId is required"));
        }
        const existingFollow = await prisma.followers.findFirst({
            where: {
                userId: req.user?.id,
                shopsId: shopId
            }    
        });
        if (!existingFollow) {
            return res.status(404).json({
                success: false,
                message: "You are not following this shop",
            });
        }
        await prisma.followers.delete({
            where: {
                id: existingFollow.id
            }
        });
        res.status(200).json({
            success: true,
            message: "Shop unfollowed successfully",
        });
    } catch (error) {
        return next(error);
    }
}

export const isFollowing =async (req: any, res: Response, next: NextFunction) => {
    try {
        const shopId = req.params.id;
        if (!shopId) {
            return next(new ValidationError("shopId is required"));
        }
        const isFollowing = await prisma.followers.findFirst({
            where: {
                userId: req.user?.id,
                shopsId: shopId
            }
        });
        res.status(200).json({
            success: true,
            isFollowing
        });
    } catch (error) {
        return next(error);
    }
}
