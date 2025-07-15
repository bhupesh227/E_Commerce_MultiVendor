
import { kafka } from '@packages/utils/kafka';
import { updateUserAnalytics } from './services/analytics.service';

const consumer = kafka.consumer({ 
    groupId: 'user-events-debug-group',
    allowAutoTopicCreation: true,
    sessionTimeout: 30000,
    retry : {
        initialRetryTime: 300,
        retries: 5,
    },
  });

const eventQueue: any[] = [];

const processQueue = async () => {

  if (eventQueue.length === 0) return;

  const events = [...eventQueue];

  eventQueue.length = 0;

  for (const event of events) {
    
    if (event.action === 'shop_visit') {
      continue; 
    }

    const validActions = [
      'add_to_wishlist',
      'add_to_cart',
      'product_view',
      'remove_from_cart',
      'remove_from_wishlist',
    ];

    if (!event.action || !validActions.includes(event.action)) {
      console.warn("Skipping invalid action:", event.action);
      continue;
    }
    try {
      await updateUserAnalytics(event);
    } catch (error) {
      console.log("Error processing Event :", error);
    }
  }
}

setInterval(processQueue, 3000);


export const consumeKafkaMessages = async () => {
  try {
    await consumer.connect();
  } catch (err) {
    console.error("❌ Kafka connection failed:", err);
    return;
  }
  await consumer.subscribe({ topic: "users-events", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (!message.value) return;
      const raw = message.value.toString();
      try {
        const event = JSON.parse(raw);
        eventQueue.push(event);
      } catch (err) {
        console.error("❌ Error parsing Kafka message:", err);
      }
    }
  })
}

consumeKafkaMessages().catch(console.error);
