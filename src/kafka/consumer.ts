import kafka from "./client.js";
import type { EachMessagePayload } from "kafkajs";

const consumer = kafka.consumer({ groupId: "web-group" });

const runConsumer = async() => {
    await consumer.connect();
    await consumer.subscribe({ topic: "unclassified_web_jobs", fromBeginning: true });
    await consumer.run({
        eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
            const value = message.value?.toString();
            if (!value) {
                console.warn("⚠️ Message value is null");
                return;
            }

            console.log(`📩 Topic: ${topic} | Partition: ${partition} | Message: ${value}`);
        },
  });
}

export default runConsumer