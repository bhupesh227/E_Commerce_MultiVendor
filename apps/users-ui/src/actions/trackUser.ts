export async function sendKafkaEvent(eventData: {
  userId?: string;
  productId?: string;
  shopId?: string;
  action: string;
  device?: string | object;
  country?: string;
  city?: string;
}) {
  try {
    await fetch("/api/kafka-event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
    });
  } catch (error) {
    console.error("❌ Failed to send event to Kafka API route:", error);
  }
}
