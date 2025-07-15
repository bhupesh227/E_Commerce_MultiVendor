
import { kafka } from "packages/utils/kafka";
import { NextRequest, NextResponse } from "next/server";
import { Partitioners } from "kafkajs";

// Persistent Kafka producer (singleton)
const producer = kafka.producer({
  createPartitioner: Partitioners.DefaultPartitioner,
});

let connected = false;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!connected) {
      await producer.connect();
      connected = true;
    }

    await producer.send({
      topic: "users-events",
      messages: [{ value: JSON.stringify(body) }],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Kafka error:", error);
    return NextResponse.json({ error: "Kafka send failed" }, { status: 500 });
  }
}
