// src/index.ts
import express, { type Application } from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { Kafka, logLevel, type EachMessagePayload } from "kafkajs";

import { MongoConnection } from "./config/mongo.config.js";
import keywordRoutes from "./routes/keyword.routes.js";
import logger from "./config/logger.config.js";
import { cleanupVisited } from "./crawler/crawl.articles.js";
import crawlerKafka from "./crawler/index.kafka.js";
import { ProfilePool } from "./profile.pool.js";
import { envConfig } from "./config/env.config.js";

dotenv.config();

const PORT = process.env.PORT || 4000;

const app: Application = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/keywords", keywordRoutes);

(async () => {
	try {
		const mongo = MongoConnection.getInstance();
		await mongo.connect();

		app.listen(PORT, () => {
			logger.info(`Server is running at http://localhost:${PORT}`);
		});

		// dọn visited
		cleanupVisited(1);

		const agentIdCli =
			process.argv.find((arg) => arg.startsWith("--id="))?.split("=")[1] ??
			"default";

		const kafka = new Kafka({
			clientId: `agent-${agentIdCli}`,
			brokers: ["103.97.125.64:9092"],
			logLevel: logLevel.INFO,
		});

		const consumer = kafka.consumer({
			groupId: `web-group-${agentIdCli}`,
			sessionTimeout: 600000,
		});

		await consumer.connect();
		await consumer.subscribe({
			topic: "unclassified_jobs_website",
			fromBeginning: false,
		});

		// 🚀 Khởi tạo pool profile
		const pool = new ProfilePool();
		await pool.init();

		await consumer.run({
			autoCommit: false,
			eachMessage: async (payload: EachMessagePayload) => {
				const { topic, partition, message, heartbeat } = payload;
				const raw = message.value?.toString() ?? "";
				const offset = message.offset;

				let data: any;
				try {
					data = JSON.parse(raw);
				} catch (err: any) {
					logger.error(`Lỗi parse JSON tại offset ${offset}: ${err.message}`);
					return;
				}

				const keyword = data.keyword;

				// lấy agent rảnh trong pool
				const agent = await pool.acquire();
				const { agentId, browser, page } = agent;

				try {
					logger.info(
						`Agent ${agentId} xử lý: "${keyword}" | partition: ${partition} | offset: ${offset}`
					);

					await crawlerKafka(data, agentId, browser, page);

					await consumer.commitOffsets([
						{ topic, partition, offset: (Number(offset) + 1).toString() },
					]);
					await heartbeat();

					logger.info(
						`✅ Agent ${agentId} đã commit offset ${
							Number(offset) + 1
						} trên partition ${partition}`
					);
				} catch (err: any) {
					logger.error(
						`❌ Lỗi khi xử lý keyword "${keyword}" tại offset ${offset}: ${err.message}`
					);
				} finally {
					pool.release(agentId);
				}
			},
		});
	} catch (error: any) {
		logger.error("Lỗi khởi động ứng dụng:", error);
		process.exit(1);
	}
})();
