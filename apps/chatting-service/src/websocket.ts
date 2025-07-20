import { kafka } from "@packages/utils/kafka";
import { WebSocketServer , WebSocket } from 'ws';
import redis from "@packages/libs/redis";
import {Server as HttpServer} from 'http';


const producer = kafka.producer();
const connnectedUsers:  Map<string, WebSocket> = new Map();
const unseenCounts: Map<string, number> = new Map();


type IncomingMessage = {
    type?: string;
    fromUserId: string;
    toUserId: string;
    messageBody: string;
    conversationId: string;
    senderType: string;
};


export async function createWebSocketServer(server: HttpServer) {
    const wss = new WebSocketServer({ server });
    await producer.connect();
    console.log('kafka producer connected');

    wss.on('connection', (ws: WebSocket) => {
        let registeredUserId: string | null = null;
        ws.on('message',async(rawMessage)=>{
            try {
                const messageStr = rawMessage.toString();
                if (!registeredUserId && !messageStr.startsWith("{")) {
                    registeredUserId = messageStr;
                    connnectedUsers.set(registeredUserId, ws);
                    console.log(`User ${registeredUserId} connected`);

                    const isSeller = registeredUserId.startsWith("seller_");
                    const redisKey = isSeller 
                            ? `online:seller:${registeredUserId.replace("seller_","")}` 
                            : `online:user:${registeredUserId}`;
                    await redis.set(redisKey, "1");
                    await redis.expire(redisKey, 300); 
                    return;
                }
                //process json msg
                const data: IncomingMessage = JSON.parse(messageStr);
                if(data.type === "MARK_AS_SEEN" &&registeredUserId){
                    const seenKey = `${registeredUserId}_${data.conversationId}`;
                    unseenCounts.set(seenKey, 0);
                    return;
                }
                const { fromUserId, toUserId, messageBody, conversationId, senderType } = data;
                if (!fromUserId || !toUserId || !messageBody || !conversationId ) {
                    console.error('Invalid message format:', data);
                    return;
                }
                const now = new Date().toISOString();
                const messagePayload = {
                    senderId: fromUserId,
                    conversationId,
                    senderType,
                    content : messageBody,
                    createdAt: now,
                };

                const messageEvent = JSON.stringify({
                    type: 'NEW_MESSAGE',
                    payload : messagePayload,
                });

                const receiverKey = senderType === 'user' ? `seller_${toUserId}` : `user_${toUserId}`;
                const senderKey = senderType === 'user' ? `user_${fromUserId}` : `seller_${fromUserId}`;

                const unseenKey = `${receiverKey}_${conversationId}`;
                const prevCount = unseenCounts.get(unseenKey) || 0;
                unseenCounts.set(unseenKey, prevCount + 1);

                const receiverSocket = connnectedUsers.get(receiverKey);
                if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
                    receiverSocket.send(messageEvent);
                    receiverSocket.send(JSON.stringify({
                        type: 'UNSEEN_COUNT_UPDATE',
                        payload: {
                            conversationId,
                            count :prevCount + 1,
                        }
                    }));
                    console.log(`Message Deveiverd+unseen to ${receiverKey}:`);
                }else {
                    console.log(`User ${receiverKey} is not connected, message will be sent later`);
                }
                // echo the message back to the sender
                const senderSocket = connnectedUsers.get(senderKey);
                if (senderSocket && senderSocket.readyState === WebSocket.OPEN) {
                    senderSocket.send(messageEvent);
                    console.log(`Message echoed to sender ${senderKey}`);
                }

                await producer.send({
                    topic: 'chat.new_message',
                    messages: [
                        {
                            key: conversationId,
                            value: JSON.stringify(messagePayload),
                        },
                    ],
                });
                console.log(`Message sent to Kafka topic 'chat.new_message' for conversation ${conversationId}`);

            } catch (error) {
                console.error('Error processing  WebSocket message:', error);     
            }
        });

        ws.on('close', async () => {
            if (registeredUserId) {
                connnectedUsers.delete(registeredUserId);
                console.log(`User ${registeredUserId} disconnected`);

                const isSeller = registeredUserId.startsWith("seller_");
                const redisKey = isSeller 
                        ? `online:seller:${registeredUserId.replace("seller_","")}` 
                        : `online:user:${registeredUserId}`;
                await redis.del(redisKey);
            }
        });

        ws.on('error', (error) => {
            console.error(`WebSocket error for user ${registeredUserId}:`, error);
        });
    });

    
    console.log('WebSocket server is running');
}