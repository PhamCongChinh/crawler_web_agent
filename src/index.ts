import express from "express";
import puppeteer, { Browser, Page } from "puppeteer";
import { GPMLoginSDK } from "./sdk/gpm-login-sdk.js";
import { Bot } from "./bot/index.js";
import { initWeb } from "./crawler/init.web.js";
import crawler from "./crawler/index.js";
import { MongoConnection } from "./config/mongo.config.js";
import KeywordModel from "./models/keyword.model.js";

const app = express();

app.get("/", (_, res) => {
  	res.send("Hello ESM + pnpm + Node!");
});


const PROFILE_ID = "7800e5ff-80e8-4375-af70-b567a5204e37"; // lấy trong GPM Login app
const gpm = new GPMLoginSDK({ url: "http://127.0.0.1:16137" });


const start = async () => {
	const mongo = MongoConnection.getInstance();
  	await mongo.connect();
	const keywordModel = new KeywordModel();
	// 🔍 Lấy tất cả keyword (hoặc thêm filter nếu cần)
	const keywords = await keywordModel.findAll();

	console.log(`📦 Tổng số keyword: ${keywords.length}`);
	// console.log(keywords.slice(0, 5)); // xem thử 5 cái đầu
	await mongo.disconnect();
	
	await crawler()
};

start();

app.listen(3000, () => console.log("✅ Server started: http://localhost:3000"));
