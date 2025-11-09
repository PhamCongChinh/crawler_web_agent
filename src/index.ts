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

	// runConsumer();
	runAgent(2)

	const gracefulShutdown = async () => {
		console.log("Gracefully shutting down...");
		await mongo.disconnect();
		server.close(() => {
			console.log("Server stopped, MongoDB connection closed");
			process.exit(0);
		});
	};

	process.on("SIGINT", gracefulShutdown);
	process.on("SIGTERM", gracefulShutdown);

	// cleanupVisited(3);

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


async function launchAgent(index: number) {
    const browser = await puppeteer.launch({
        headless: false,
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        userDataDir: `C:\\Users\\chinhpc\\puppeteer-profile\\agent-${index}`,
        args: ['--start-maximized'],
        defaultViewport: null
    });

    const page = await browser.newPage();
    console.log(`✅ Agent ${index} đã khởi động`);
    return { browser, page };
}

async function runAgent(index: number) {
    const kafka = new Kafka({ clientId: `agent-${index}`, brokers: ['103.97.125.64:9092'], logLevel: logLevel.NOTHING });
    const consumer = kafka.consumer({ groupId: `web-group` });

    await consumer.connect();
    await consumer.subscribe({ topic: 'unclassified_jobs_website', fromBeginning: false });

	// const { browser, page } = await launchAgent(index);
	const agentId = "laksd"
	const { browser, page } = await initWeb(agentId)

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const raw = message.value?.toString()!;
            const data = JSON.parse(raw);
            const keyword = data.keyword;
            console.log(data)
            console.log(`🔍 Agent ${index} xử lý: "${keyword}" | partition: ${partition} | offset: ${message.offset}`);
			console.log(`✅ Agent ${index} đã khởi động và đang lắng nghe Kafka...`);
			await crawlerKafka(data, `agent-${index}`, browser, page)
        }
    });
}