import express from "express";
import { MongoConnection } from "./config/mongo.config.js";
import puppeteer, { Browser, Page } from "puppeteer";
import { GPMLoginSDK } from "./sdk/GPMLoginSDK.js";

const app = express();

app.get("/", (_, res) => {
  	res.send("Hello ESM + pnpm + Node!");
});



const PROFILE_ID = "7800e5ff-80e8-4375-af70-b567a5204e37"; // lấy trong GPM Login app
const gpm = new GPMLoginSDK({ url: "http://127.0.0.1:16137" });

const start = async () => {
	// const mongo = MongoConnection.getInstance();
	// await mongo.connect("mongodb://127.0.0.1:27017/testdb");
	try {
		const check = await gpm.checkConnection();
  		console.log(check);

		const startRes = await gpm.startProfile(PROFILE_ID);
  		console.log("Profile started:", startRes);
	} catch (error) {
		console.log(error);
	}
};

start();

app.listen(3000, () => console.log("✅ Server started: http://localhost:3000"));
