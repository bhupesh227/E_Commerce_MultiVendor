import { AuthError, NotFoundError, ValidationError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import redis from "@packages/libs/redis";
import { clearUnseenCount, getUnseenCount } from "@packages/libs/redis/message.redis";
import { NextFunction, Response } from "express"



export const newConversation = async (req:any, res:Response,next:NextFunction) => {
    try {
        const {sellerId} = req.body;
        const userId = req.user.id;
        if (!sellerId) {
            return next(new ValidationError("Seller Id is required"));
        }

        const existingGroup = await prisma.conversationGroup.findFirst({
            where: {
                isGroup: false,
                participantIds: {
                    hasEvery: [userId, sellerId]
                }
            },
        });
        if (existingGroup) {
            return res
                .status(200)
                .json({ conversation: existingGroup, isNew: false });
        }

        const newGroup = await prisma.conversationGroup.create({
            data: {
                isGroup: false,
                participantIds: [userId, sellerId],
                creatorId: userId,
            },
        });

        await prisma.participant.createMany({
            data: [
                {
                    conversationId: newGroup.id,
                    userId: userId,
                },
                {
                    conversationId: newGroup.id,
                    sellerId,
                }
            ],
        });

        return res.status(201).json({ conversation: newGroup, isNew: true });            
    } catch (error) {
        next(error);
    }
}

export const getUserConversations = async (req:any, res:Response,next:NextFunction) => {
    try {
        const userId = req.user.id;
        const conversations = await prisma.conversationGroup.findMany({
            where: {
                participantIds: {
                    has: userId
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        const responseData = await Promise.all(
            conversations.map(async (conversation) => {
                const sellerParticipant = await prisma.participant.findFirst({
                    where: {
                        conversationId: conversation.id,
                        sellerId: {
                            not: null
                        }
                    }
                });

                let seller = null;
                if (sellerParticipant?.sellerId) {
                    seller = await prisma.sellers.findUnique({
                        where: {
                            id: sellerParticipant.sellerId
                        },
                        include:{
                            shop: true
                        }
                    });
                }

                const lastMessage = await prisma.message.findFirst({
                    where: {
                        conversationId: conversation.id
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                });

                let isOnline = false;
                if (sellerParticipant?.sellerId) {
                    const redisKey = `online:seller:${sellerParticipant.sellerId}`;
                    const redisResult = await redis.get(redisKey);
                    isOnline = !!redisResult;
                }

                const unreadCount = await getUnseenCount("user", conversation.id);

                return {
                    conversationId: conversation.id,
                    seller :{
                        id: seller?.id || null,
                        name: seller?.shop?.name || "Unknown",
                        isOnline,
                        avatar: seller?.shop?.avatar || null,
                    },
                    lastMessage : lastMessage?.content || "Say hi to start conversation",
                    lastMessageAt: lastMessage?.createdAt || conversation.updatedAt,
                    unreadCount,
                };
            })
        );

        res.status(200).json({ conversations: responseData });
    } catch (error) {
        next(error);
    }
}


export const getSellerConversation = async (req:any, res:Response,next:NextFunction) => {
    try {
        const sellerId = req.seller.id;

        const conversations = await prisma.conversationGroup.findMany({
            where: {
                participantIds: {
                    has: sellerId
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        const responseData = await Promise.all(
            conversations.map(async (conversation) => {
                const userParticipant = await prisma.participant.findFirst({
                    where: {
                        conversationId: conversation.id,
                        userId: {
                            not: null
                        }
                    }
                });

                let user = null;
                if (userParticipant?.userId) {
                    user = await prisma.users.findUnique({
                        where: {
                            id: userParticipant.userId
                        },
                    });
                }

                const lastMessage = await prisma.message.findFirst({
                    where: {
                        conversationId: conversation.id
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                });

                let isOnline = false;
                if (userParticipant?.userId) {
                    const redisKey = `online:user:user_${userParticipant.userId}`;
                    const redisResult = await redis.get(redisKey);
                    isOnline = !!redisResult;
                }

                const unreadCount = await getUnseenCount("seller", conversation.id);

                return {
                    conversationId: conversation.id,
                    user:{
                        id: user?.id || null,
                        name: user?.name || "Unknown",
                        avatar: user?.avatar || null,
                        isOnline,
                    },
                    lastMessage : lastMessage?.content || "Say hi to start conversation",
                    lastMessageAt: lastMessage?.createdAt || conversation.updatedAt,
                    unreadCount,
                };
            })
        );
        res.status(200).json({ conversations: responseData });
        
    } catch (error) {
        next(error);
    
    }
}


export const fetchMessages = async (req:any, res:Response,next:NextFunction) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = 10;

        if (!conversationId) {
            return next(new ValidationError("Conversation ID is required"));
        }

        const conversation = await prisma.conversationGroup.findUnique({
            where: {
                id: conversationId
            }
        });

        if (!conversation) {
            return next(new NotFoundError("Conversation not found"));
        }

        const hasAccess = conversation.participantIds.includes(userId);
        if (!hasAccess) {
            return next(new AuthError("You do not have access to this conversation"));
        }

        await clearUnseenCount("user", conversationId);

        const sellerParticipant = await prisma.participant.findFirst({
            where: {
                conversationId: conversation.id,
                sellerId: {
                    not: null
                }
            }
        });
        let seller = null;
        let isOnline = false;
        if (sellerParticipant?.sellerId) {
            seller = await prisma.sellers.findUnique({
                where: {
                    id: sellerParticipant.sellerId
                },
                include: {
                    shop: true
                }
            });

            const redisKey = `online:seller:${sellerParticipant.sellerId}`;
            const redisResult = await redis.get(redisKey);
            isOnline = !!redisResult;
        }

        const messages = await prisma.message.findMany({
            where: {
                conversationId: conversationId
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip: (page - 1) * pageSize,
            take: pageSize
        });

        res.status(200).json({ 
            messages,
            seller: {
                id: seller?.id || null,
                name: seller?.shop?.name || "Unknown",
                avatar: seller?.shop?.avatar || null,
                isOnline,
            },
            currentPage: page,
            hasMore: messages.length === pageSize,
        });
    } catch (error) {
        next(error);
    }
}


export const fetchSellerMessages = async (req:any, res:Response,next:NextFunction) => {
    try {
        const { conversationId } = req.params;
        const sellerId = req.seller.id;
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = 10;

        if (!conversationId) {
            return next(new ValidationError("Conversation ID is required"));
        }

        const conversation = await prisma.conversationGroup.findUnique({
            where: {
                id: conversationId
            }
        });

        if (!conversation) {
            return next(new NotFoundError("Conversation not found"));
        }

        const hasAccess = conversation.participantIds.includes(sellerId);
        if (!hasAccess) {
            return next(new AuthError("You do not have access to this conversation"));
        }

        await clearUnseenCount("seller", conversationId);

        const userParticipant = await prisma.participant.findFirst({
            where: {
                conversationId: conversation.id,
                userId: {
                    not: null
                }
            }
        });
        let user = null;
        let isOnline = false;
        if (userParticipant?.userId) {
            user = await prisma.users.findUnique({
                where: {
                    id: userParticipant.userId
                },
            });

            const redisKey = `online:user:user_${userParticipant.userId}`;
            const redisResult = await redis.get(redisKey);
            isOnline = !!redisResult;
        }

        const messages = await prisma.message.findMany({
            where: {
                conversationId: conversationId
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip: (page - 1) * pageSize,
            take: pageSize
        });

        res.status(200).json({ 
            messages,
            user: {
                id: user?.id || null,
                name: user?.name || "Unknown",
                avatar: user?.avatar || null,
                isOnline,
            },
            currentPage: page,
            hasMore: messages.length === pageSize,
        });
    } catch (error) {
        next(error);
    }
}