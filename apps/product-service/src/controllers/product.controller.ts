import { AuthError, NotFoundError, ValidationError } from "@packages/error-handler";
import imageKit from "@packages/libs/imagekit";
import prisma from "@packages/libs/prisma";
import { Prisma } from "@prisma/client";
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


export const uploadProductImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fileName } = req.body;

        if(!fileName) {
            throw new ValidationError("File required.")
        }

        const response = await imageKit.upload({
            file : fileName,
            fileName : `product-${Date.now()}.jpg`,
            folder: "/ecomm/product"
        })

        res.status(201).json({
            fileId: response.fileId,
            fileUrl: response.url,
            message: "Image uploaded successfully",
        })

    } catch (error) {
        next(error);
    }
}

export const deleteProductImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fileId } = req.body;

        if(!fileId) {
            throw new ValidationError("File required.")
        }

        const response = await imageKit.deleteFile(fileId);

        res.status(201).json({
            success : true,
            response
        })

    } catch (error) {
        next(error);
    }
}


export const createProduct = async (req: any, res: Response, next: NextFunction) => {
    try {
        
        const {
            title,
            shortDescription,
            detailedDescription,
            warranty,
            customSpecifications,
            customProperties,
            slug,
            tags,
            cashOnDelivery,
            brand,
            videoUrl,
            category,
            subCategory,
            regularPrice,
            salePrice,
            stock,
            discountCodes,
            images,
            colors,
            sizes,} = req.body; 

        if(!title || !shortDescription || !slug || !salePrice || !cashOnDelivery || !regularPrice || !stock || !category || !subCategory || !images) {
            return next(new  ValidationError("Missing some required fileds!"));
        }

        if(!req.seller.id) {
            return next(new  AuthError("Only seller can create products!"));
        }

        const slugChecking = await prisma.products.findUnique({ where: { slug } });

        if (slugChecking) {
            return next(new ValidationError(`Slug already exists! Please use a different slug`));
        }

        const newProduct = await prisma.products.create({
            data: {
                title,
                shortDescription,
                detailedDescription,
                warranty,
                customSpecifications: customSpecifications || {},
                customProperties : customProperties || {},
                slug,
                tags: Array.isArray(tags) ? tags : tags.split(','),
                cashOnDelivery,
                brand,
                videoUrl,
                category,
                subCategory,
                regularPrice: parseFloat(regularPrice),
                salePrice: parseFloat(salePrice),
                stock: parseInt(stock),
                discountCodes: discountCodes.map((code: string) => code),
                images: {
                    
                    create: images
                        .filter((image: any) => image && image.fileId && image.fileUrl)
                        .map((image: any) => ({
                            file_id: image.fileId,
                            url: image.fileUrl,
                        })),
                },
                colors: colors || [],
                sizes: sizes || [],
                shopId: req.seller.shop.id,
            },
            include: {
                images: true,
                
            },
        });

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product: newProduct,
        });
    } catch (error) {
        next(error);
        
    }
}


export const getShopProduct = async (req: any, res: Response, next: NextFunction) => {
    try {
        const shopId = req.seller?.shop?.id;

        if(!shopId) {
            next(new ValidationError("Shop not found!"));
            return;
        }

        const products = await prisma.products.findMany({
            where : {
                shopId: shopId,
            },
            include : {
                images : true,
            }
        })

        res.status(201).json({
            success : true,
            products
        });

    } catch (error) {
        next(error);
    }
}


export const deleteProduct = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { productId } = req.params;
        const shopId = req?.seller?.shop?.id;

        const product = await prisma.products.findUnique({
            where: { id: productId },
            select: { id: true, shopId: true, isDeleted: true }
        })

        if (!product) {
            return next(new ValidationError("Product not found"));
        }

        if (product.shopId !== shopId) {
            return next(new ValidationError("Unauthorized action"));
        }

        if (product.isDeleted) {
            return next(new ValidationError("Product is already deleted"));
        }

        const deleteProduct = await prisma.products.update({
            where: { id: productId },
            data: {
                isDeleted: true,
                deletedAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            }
        })

        return res.status(200).json({
            message: "Product is scheduled for deletion in 24 hours. Your can restore it within this time",
            deletedAt: deleteProduct.deletedAt

        })

    } catch (error) {
        return next(error);
    }
}

export const restoreProduct = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { productId } = req.params;
        
        const product = await prisma.products.findUnique({
            where : {id : productId},
            select : { id: true, shopId :true, isDeleted: true}
        })

        if(!product) {
            next(new NotFoundError("Product not found!"));
            return;
        }

        if(product.shopId !== req.seller?.shop?.id) {
            next(new ValidationError("Unauthorized Access!"));
            return;
        }

        if(!product.isDeleted) {
            next(new ValidationError("Product is not in deleted state!"));
            return;
        }

        await prisma.products.update({
            where : { id  :productId },
            data : {
                isDeleted : false,
                deletedAt : null
            }
        });

        res.status(200).json({
            message : "Product successfully restored.",
        });
        
    } catch (error) {
        next(error);
    }
}


export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const type = req.query.type ;

    const baseFilter = {
      OR: [{ isDeleted: false }, { isDeleted: null }],
    };

    const orderBy: Prisma.productsOrderByWithRelationInput =
      type === 'latest'
        ? { createdAt: 'desc' as Prisma.SortOrder }
        : { totalSales: 'desc' as Prisma.SortOrder };

    const [products, total, top10Products] = await Promise.all([
        prisma.products.findMany({
            skip,
            take: limit,
            include: {
                images: true,
                shop: true,
            },
            where: baseFilter,
            orderBy,
        }),
        prisma.products.count({ where: baseFilter,}),
        prisma.products.findMany({
            take: 10,
            where: baseFilter,
            orderBy,
        })
    ]);

    res.status(200).json({
        products,
        top10By: type === 'latest' ? 'latest' : 'topSales',
        top10Products,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};


export const getProductDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const product = await prisma.products.findUnique({
            where: {
                slug: req.params.slug!,
            },
            include: {
                images: true,
                shop: true,
            }
        });
        res.status(201).json({
            success: true,
            product,
        })
    } catch (error) {
        return next(error);
    }
}


export const getFilteredProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            priceRange = [0, 10000],
            categories = [],
            colors = [],
            sizes = [],
            page = 1,
            limit = 12
        } = req.query;

        const parsedPriceRange = typeof priceRange === 'string'
            ? priceRange.split(",").map(Number)
            : [0, 10000];

        const parsedPage = Number(page);
        const parsedLimit = Number(limit);

        const skip = (parsedPage - 1) * parsedLimit;

        const filters: Record<string, any> = {
            salePrice: {
                gte: parsedPriceRange[0],
                lte: parsedPriceRange[1],
            },
            isDeleted: false,
        };

        if (categories && (categories as string[]).length > 0) {
            filters.category = {
                in: Array.isArray(categories) ? categories : String(categories).split(",")
            }
        }

        if (colors && (colors as string[]).length > 0) {
            filters.colors = {
                hasSome: Array.isArray(colors) ? colors : [colors],
            }
        }

        if (sizes && (sizes as string[]).length > 0) {
            filters.sizes = {
                hasSome: Array.isArray(sizes) ? sizes : [sizes],
            }
        }

        const [products, total] = await Promise.all([
            prisma.products.findMany({
                where: filters,
                skip,
                take: parsedLimit,
                include: {
                    images: true,
                    shop: true,
                }
            }),
            prisma.products.count({ where: filters })
        ]);

        const totalPages = Math.ceil(total / parsedLimit);

        res.json({
            products,
            pagination: {
                total,
                page: parsedPage,
                totalPages,
            },

        })

    } catch (error) {
        next(error);
    }
}

// for offers
export const getFilteredEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            priceRange = [0, 10000],
            categories = [],
            colors = [],
            sizes = [],
            page = 1,
            limit = 12
        } = req.query;

        const parsedPriceRange = typeof priceRange === 'string'
            ? priceRange.split(",").map(Number)
            : [0, 10000];
        const parsedPage = Number(page);
        const parsedLimit = Number(limit);

        const skip = (parsedPage - 1) * parsedLimit;

        const filters: Record<string, any> = {
            salePrice: {
                gte: parsedPriceRange[0],
                lte: parsedPriceRange[1],
            }, 
            NOT: {
                startingDate: null,
            }
        };

        if (categories && (categories as string[]).length > 0) {
            filters.category = {
                in: Array.isArray(categories) ? categories : String(categories).split(",")
            }
        }

        if (colors && (colors as string[]).length > 0) {
            filters.colors = {
                hasSome: Array.isArray(colors) ? colors : [colors],
            }
        }

        if (sizes && (sizes as string[]).length > 0) {
            filters.sizes = {
                hasSome: Array.isArray(sizes) ? sizes : [sizes],
            }
        }

        const [products, total] = await Promise.all([
            prisma.products.findMany({
                where: filters,
                skip,
                take: parsedLimit,
                include: {
                    images: true,
                    shop: true,
                }
            }),
            prisma.products.count({ where: filters })
        ]);

        const totalPages = Math.ceil(total / parsedLimit);

        res.json({
            products,
            pagination: {
                total,
                page: parsedPage,
                totalPages
            }

        })


    } catch (error) {
        next(error);
    }
}

export const getFilteredShops = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { categories = [], countries = [], page = 1, limit = 12 } = req.query;

        const parsedPage = Number(page);
        const parsedLimit = Number(limit);

        const skip = (parsedPage - 1) * parsedLimit;

        const filters: Record<string, any> = {};

        if (categories && (categories as string[]).length > 0) {
            filters.category = {
                in: Array.isArray(categories) 
                    ? categories 
                    : String(categories).split(",")
            }
        }
        if (countries && String(countries).length > 0) {
            filters.sellers = {
                country: {
                    in: Array.isArray(countries)
                        ? countries 
                        : String(countries).split(",")
                }
            }
        }

        const [shops, total] = await Promise.all([
            prisma.shops.findMany({
                where: filters,
                skip,
                take: parsedLimit,
                include: {
                    sellers: true,
                    products: true,
                    
                }
            }),
            prisma.shops.count({ where: filters }),
        ]);

        const totalPages = Math.ceil(total / parsedLimit);

        res.json({
            shops,
            pagination: {
                total,
                page: parsedPage,
                totalPages
            },
        });

    } catch (error) {
        next(error);
    }
}


export const searchProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = req.query.q as string;

        if (!query || query.trim().length === 0) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const products = await prisma.products.findMany({
            where: {
                OR: [
                    {
                        title: {
                            contains: query,
                            mode: 'insensitive'
                        },
                    }, 
                    {
                        shortDescription: {
                            contains: query,
                            mode: 'insensitive'
                        },
                    },
                ],
            }, 
            select: {
                id: true,
                title: true,
                slug: true
            },
            take: 10,
            orderBy: {
                createdAt: 'desc'
            },
        });

        return res.status(200).json({ products });

    } catch (error) {
        return next(error);
    }
}
