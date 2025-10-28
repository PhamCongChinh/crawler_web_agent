import express from 'express';
import { MongoConnection } from './config/mongo.config.js';
import puppeteer, { Browser, Page } from 'puppeteer';
import { GPMLoginSDK } from './sdk/GPMLoginSDK.js';

const app = express();

app.get('/', (_, res) => {
  res.send('Hello ESM + pnpm + Node!');
});

const start = async () => {
    const mongo = MongoConnection.getInstance();
    await mongo.connect('mongodb://127.0.0.1:27017/testdb');
};

start();


(async () => {
  // Khởi tạo SDK
  const gpm = new GPMLoginSDK({
    url: 'http://127.0.0.1:19995', // URL GPM service
  });

  // Lấy danh sách profile
  const profiles = await gpm.getProfiles();
  console.log('Tổng số profile:', profiles.length);

  if (profiles.length === 0) return;

  const profileId = profiles[0].id;
  console.log('Mở profile:', profileId);

  // Start profile → nhận Browser object của Puppeteer
  const browser: Browser = await gpm.startProfile(profileId);

  // Tạo page mới
  const page: Page = await browser.newPage();

  // Truy cập Google
  await page.goto('https://google.com');
  console.log('✅ Đã mở Google');

  // Dừng profile
  await gpm.stopProfile(profileId);
  console.log('🧹 Đã dừng profile');

  // Đóng browser nếu cần
  await browser.close();
})();


app.listen(3000, () => console.log('✅ Server started: http://localhost:3000'));