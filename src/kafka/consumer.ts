import logger from "../config/logger.config.js";
import crawlerKafka from "../crawler/index.kafka.js";
import { delayCustom } from "../utils/delayCustom.js";
import type { EachMessagePayload } from "kafkajs";
import { Kafka } from "kafkajs";

const agentId = process.env.AGENT_ID || "agent-01";

const kafka = new Kafka({
    clientId: agentId,
    brokers: ["103.97.125.64:9092"]
})

const consumer = kafka.consumer({ groupId: "web-group" });

const runConsumer = async() => {

    try {
        logger.info("Kết nối Kafka consumer...");
        await consumer.connect();
        await consumer.subscribe({ topic: "unclassified_jobs_website", fromBeginning: true });
        logger.info(`[${agentId}] Đã kết nối Kafka và sẵn sàng nhận task`);
        await consumer.run({
            eachMessage: async ({ message }: EachMessagePayload) => {
                try {
                    const value = message.value?.toString();
                    if (!value) {
                        logger.warn("Message value is null");
                        return;
                    }
                    const data = JSON.parse(value);
                    // logger.info(`Nhận message từ Kafka: ${JSON.stringify(data)}`);
                    logger.info(`[${agentId}] Nhận keyword: ${data.keyword}`);

                    await crawlerKafka(data, agentId);
                } catch (error: any) {
                    logger.error(`Lỗi khi xử lý message: ${error.message}`);
                }
            },
        });
    } catch (error: any) {
        logger.error(`Kafka consumer bị lỗi: ${error.message}`);
        logger.info("Tự động restart sau 5 giây...");
        await new Promise((resolve) => setTimeout(resolve, 5000));
        await runConsumer(); // restart lại consumer
    }
}

export default runConsumer