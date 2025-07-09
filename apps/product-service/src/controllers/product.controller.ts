import { NotFoundError, ValidationError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import { NextFunction, Request, Response } from "express";



export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const config = await prisma.siteConfig.findFirst();

        if (!config) {
            return res.status(404).json({ message: 'Site config not found' });
        }

        
        return res.status(200).json({
            categories: config.categories,
            subCategories: config.subCategories,
        });
    } catch (error) {
        return next(error);
    }
};

export const createDiscountCode = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { publicName, discountType, discountValue, discountCode } = req.body;

        const isDiscountCodeExist = await prisma.discountCodes.findUnique({ where : {discountCode : discountCode}})

        if(isDiscountCodeExist) {
            return next(new ValidationError("Discount Code Already Exists, Please Use a different Code"));
        }

        const discount_code = await prisma.discountCodes.create({
            data : {
                publicName,
                discountCode,
                discountType,
                discountValue : parseFloat(discountValue),
                sellerId: req.seller.id
            }
        })

        return res.status(200).json({
            success : true,
            discountCode: discount_code
        })
        
    } catch (error) {
        next(error);
    }
}

export const getDiscountCodes = async (req: any, res: Response, next: NextFunction) => {
    try {
        const discountCodes = await prisma.discountCodes.findMany({ where : {  sellerId : req.seller.id }});

        res.status(201).json({
            success : true,
            discountCodes
        })
        
    } catch (error) {
        next(error);
    }
}

export const deleteDiscountCodes = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const sellerId = req.seller?.id;


        const discountCode = await prisma.discountCodes.findUnique({ 
            where : {  id : id },
            select : { id : true, sellerId : true }
        });

        if(!discountCode){
            return next(new  NotFoundError("Discount code Not Found!"));
            
        }
        
        if(discountCode.sellerId !== sellerId) {
            return next(new  ValidationError("Unauthorized Access!"));
            
        }

        await prisma.discountCodes.delete({ where : { id : id }})

        return res.status(200).json({
            message : "Dicount code deleted succesfully!",
        })
        
    } catch (error) {
        next(error);
    }
}