import express from "express";
import puppeteer, { Browser, Page } from "puppeteer";
import { GPMLoginSDK } from "./sdk/gpm-login-sdk.js";
import { Bot } from "./bot/index.js";
import { initWeb } from "./crawler/init.web.js";
import crawler from "./crawler/index.js";
import { MongoConnection } from "./config/mongo.config.js";
import KeywordModel from "./models/keyword.model.js";
import cors from "cors";
import morgan from "morgan";
import type { Application } from "express";
import dotenv from "dotenv";
import keywordRoutes from "./routes/keyword.routes.js";
import logger from "./config/logger.config.js";
import { cleanupVisited } from "./crawler/crawl.articles.js";
import runConsumer from "./kafka/consumer.js";
import { Kafka, logLevel } from "kafkajs";
import crawlerKafka from "./crawler/index.kafka.js";
import { envConfig } from "./config/env.config.js";

dotenv.config();

const PORT = process.env.PORT || 4000;

const app: Application = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));


(async () => {
	const mongo = MongoConnection.getInstance()
  	await mongo.connect()

	const server = app.listen(PORT, () => {
		logger.info(`Server is running at http://localhost:${PORT}`);
	});

	// pnpm run start:1
	cleanupVisited(1);

	const agentId = process.argv.find(arg => arg.startsWith('--id='))?.split('=')[1] || 'default';

	const kafka = new Kafka({
		clientId: `agent-${agentId}`,
		brokers: ['103.97.125.64:9092'],
		logLevel: logLevel.INFO
	});
	const consumer = kafka.consumer({ groupId: `web-group-${agentId}`, sessionTimeout: 600000 });

	await consumer.connect();
	await consumer.subscribe({ topic: 'unclassified_jobs_website', fromBeginning: false });

	const { browser, page } = await initWeb(`agent-${process.pid}`);

	await consumer.run({
		autoCommit: false,
		eachMessage: async ({ topic, partition, message, heartbeat }) => {
			const raw = message.value?.toString()!;
			const offset = message.offset;

			const data = JSON.parse(raw);
			const keyword = data.keyword;

			try {
				logger.info(`Agent ${process.pid} xử lý: "${keyword}" | partition: ${partition} | offset: ${message.offset}`);
				await crawlerKafka(data, `agent-${process.pid}`, browser, page);
				
				await consumer.commitOffsets([{ topic, partition, offset: (Number(offset) + 1).toString() }]);
				await heartbeat(); // giữ kết nối với Kafka
				logger.info(`Đã commit xong tại offset ${Number(offset) + 1} trên phân vùng ${partition}`);
				logger.info(`Agent ${agentId} đã khởi động và đang lắng nghe Kafka...`);
			} catch (error: any) {
				// logger.error(`Lỗi xử lý keyword "${keyword}": ${error.message}`);
				logger.error(`Lỗi xử lý keyword "${keyword}"`);
			}
		}
	});


	const gracefulShutdown = async () => {
		logger.info("Gracefully shutting down...");
		await consumer.disconnect();
		await mongo.disconnect();
		server.close(() => {
			logger.info("Server stopped, MongoDB connection closed");
			process.exit(0);
		});
	};

	process.on("SIGINT", gracefulShutdown);
	process.on("SIGTERM", gracefulShutdown);

	

	// const intervalMs = 15 * 1000;
	// while (true) {
	// 	try {
	// 		logger.info("Bắt đầu crawl...");
	// 		await crawler(); // chặn tới khi crawler xong
	// 		logger.info("Crawl xong!");
	// 	} catch (err: any) {
	// 		logger.error("Lỗi khi crawl:", err.message);
	// 		logger.info("Khởi động lại crawler sau 5 giây...");
	// 		await new Promise(resolve => setTimeout(resolve, 5000)); // delay trước khi restart
	// 		continue; // quay lại vòng lặp
	// 	}
	// 	// delay cố định sau khi crawl xong
	// 	logger.info(`Chờ ${intervalMs / 1000} giây trước lần crawl tiếp theo...`);
	// 	await new Promise(resolve => setTimeout(resolve, intervalMs));
	// }
})();

app.get("/", (_, res) => {
  	res.send("Hello ESM + pnpm + Node!");
});

app.use("/api/keywords", keywordRoutes);