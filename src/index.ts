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

	// await crawler()

	const intervalMs = 60 * 1000; // 1 phút

    while (true) {
        const startTime = Date.now();
        try {
            logger.info("Bắt đầu crawl...");
            await crawler(); // đợi crawler xong
            logger.info("Crawl xong!");
        } catch (err: any) {
            logger.error("Lỗi khi crawl:", err.message);
        }

        const elapsed = Date.now() - startTime;
        const delayTime = Math.max(intervalMs - elapsed, 0); // đảm bảo cách nhau ít nhất 1 phút
        logger.info(`Chờ ${delayTime / 1000} giây trước lần crawl tiếp theo...`);
        await new Promise((resolve) => setTimeout(resolve, delayTime));
    }

})();

app.get("/", (_, res) => {
  	res.send("Hello ESM + pnpm + Node!");
});

app.use("/api/keywords", keywordRoutes);


// const PROFILE_ID = "7800e5ff-80e8-4375-af70-b567a5204e37"; // lấy trong GPM Login app
// const gpm = new GPMLoginSDK({ url: "http://127.0.0.1:16137" });


// const start = async () => {
// 	const mongo = MongoConnection.getInstance();
//   	await mongo.connect();
// 	const keywordModel = new KeywordModel();
// 	// 🔍 Lấy tất cả keyword (hoặc thêm filter nếu cần)
// 	const keywords = await keywordModel.findAll();

// 	console.log(`📦 Tổng số keyword: ${keywords.length}`);
// 	// console.log(keywords.slice(0, 5)); // xem thử 5 cái đầu
// 	await mongo.disconnect();
	
// 	// await crawler()
// };

// start();

// app.listen(3000, () => console.log("✅ Server started: http://localhost:3000"));
