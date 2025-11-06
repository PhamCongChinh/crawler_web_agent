import logger from "../config/logger.config.js";
import crawlerKafka from "../crawler/index.kafka.js";
import kafka from "./client.js";
import type { EachMessagePayload } from "kafkajs";

const consumer = kafka.consumer({ groupId: "web-group" });

const runConsumer = async() => {
    await consumer.connect();
    await consumer.subscribe({ topic: "unclassified_jobs_website", fromBeginning: true });
    await consumer.run({
        eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
            const value = message.value?.toString();
            if (!value) {
                logger.warn("Message value is null");
                return;
            }

            // console.log(`Topic: ${topic} | Partition: ${partition} | Message: ${value}`);
            await crawlerKafka(value)
        },
  });
}

export default runConsumer