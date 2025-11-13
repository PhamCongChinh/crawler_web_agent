import { Kafka } from "kafkajs";
import { formatISO } from "date-fns";
import logger from "../config/logger.config.js";


const kafka = new Kafka({
  brokers: ["103.97.125.64:9092"],
  clientId: "crawler-result-producer",
});

const producer = kafka.producer();
export const sendCrawlResult = async ({
  type,
  task_id,
  keyword,
  platform,
  created_at,
  topic,
  assigned_bot,
  status,
  success,
  bot_id,
}: {
  type: string;
  task_id: string;
  keyword: string;
  platform: string;
  created_at: string;
  topic: string;
  assigned_bot: string;
  status: string;
  success: boolean;
  bot_id: string;
}) => {
  try {
    const payload = {
      type,
      data: {
        task_id,
        keyword,
        platform,
        created_at,
        topic,
        assigned_bot,
        status,
      },
      success,
      timestamp: formatISO(new Date()), // giống datetime.now().isoformat()
      bot_id,
    };

    const jsonData = JSON.stringify(payload);

    await producer.connect();
    await producer.send({
      topic: "crawl-results",
      messages: [{ value: jsonData }],
    });

    logger.info(`Gửi kết quả đến Kafka: ${jsonData}`);
  } catch (error: any) {
    logger.error(`Failed to send crawl result: ${error.message}`);
  } finally {
    await producer.disconnect(); // hoặc để open connection lâu dài
  }
};
