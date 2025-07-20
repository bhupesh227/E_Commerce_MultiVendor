import { kafka } from "@packages/utils/kafka";
import prisma from "@packages/libs/prisma";
import { Consumer , EachMessagePayload } from "kafkajs";
import { incrementUnseenCount } from "@packages/libs/redis/message.redis";



interface BufferedMessage{
    conversationId: string;
    senderId: string;
    senderType: string;
    content : string;
    createdAt: string;
}


const TOPIC = "chat.new_message";
const GROUP_ID = "chat-message-db-writer";
const BATCH_INTERVAL_MS = 3000;

let buffer : BufferedMessage[] = [];
let flushTimer: NodeJS.Timeout | null = null;


export async function startConsumer() {
    const consumer: Consumer = kafka.consumer({ groupId: GROUP_ID });
    await consumer.connect();
    console.log(`Kafka consumer connected to topic ${TOPIC}`);

    await consumer.subscribe({ topic: TOPIC, fromBeginning: false });

    await consumer.run({
        eachMessage: async ({message}: EachMessagePayload) => {
            if (!message.value) return;
            try {
                const parsed: BufferedMessage = JSON.parse(message.value.toString());
                buffer.push(parsed);
                if(buffer.length === 1 && !flushTimer) {
                    flushTimer = setTimeout(flushBufferToDb, BATCH_INTERVAL_MS);
                }
            } catch (error) {
                console.error('Error processing message:', error);               
            }
        },
    });
}


async function flushBufferToDb() {
    const toInsert = buffer.splice(0, buffer.length);
    if (flushTimer) {
        clearTimeout(flushTimer);
        flushTimer = null;
    }
    if (toInsert.length === 0) return;
    try {
        const prismaPayload = toInsert.map(msg => ({
            conversationId: msg.conversationId,
            senderId: msg.senderId,
            senderType: msg.senderType,
            content: msg.content,
            createdAt: new Date(msg.createdAt),
        }));

        await prisma.message.createMany({
            data: prismaPayload,
        });

        for (const msg of prismaPayload) {
            const receiverType = msg.senderType === "user" ? "seller" : "user";
            await incrementUnseenCount(receiverType,msg.conversationId);
        }
        console.log(`flushed ${prismaPayload.length} messages to the database`);
    } catch (error) {
        console.error('Error inserting messages into the database:', error);
        buffer.unshift(...toInsert); 
        if (!flushTimer) {
            flushTimer = setTimeout(flushBufferToDb, BATCH_INTERVAL_MS);
        }
    }
}