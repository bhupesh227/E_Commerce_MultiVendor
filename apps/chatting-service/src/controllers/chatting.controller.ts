import { ValidationError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import redis from "@packages/libs/redis";
import { getUnseenCount } from "@packages/libs/redis/message.redis";
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
        
    } catch (error) {
        
    }
}