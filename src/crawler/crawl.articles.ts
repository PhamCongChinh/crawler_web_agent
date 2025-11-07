import logger from "../config/logger.config.js";
import {
  getSelectorsAllType,
  getSelectorsNewsType,
} from "../config/selector.config.js";
import { delayCustom } from "../utils/delayCustom.js";
import { crawlArticlesPerPage } from "./crawl.articlesperpage.js";
import { crawlContent } from "./crawle.content.js";
import { handleAfterCrawlContent } from "./crawler.api.js";
import { fileURLToPath } from "url";

import fs from "fs";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function randomScroll(page: any, maxScroll = 5000) {
  await page.evaluate(async (maxScroll: number) => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;

      const timer = setInterval(() => {
        // random khoảng cách scroll (100–400px)
        const distance = Math.floor(Math.random() * 300) + 100;

        window.scrollBy(0, distance);
        totalHeight += distance;
        // random dừng (nếu vượt quá maxScroll hoặc hết trang)
        if (
          totalHeight >= maxScroll ||
          totalHeight >= document.body.scrollHeight
        ) {
          clearInterval(timer);
          resolve();
        }
      }, Math.floor(Math.random() * 500) + 200); // random delay mỗi bước (200–700ms)
    });
  }, maxScroll);
}

const VISITED_URL = path.resolve(__dirname, "visited.json");
export function loadVisited(): Set<string> {
  try {
    if (!fs.existsSync(VISITED_URL)) {
      fs.writeFileSync(VISITED_URL, "[]", "utf8");
    }
    const data = fs.readFileSync(VISITED_URL, "utf8");
    const arr: string[] = JSON.parse(data);
    return new Set(arr);
  } catch (err: any) {
    logger.warn("Không đọc được visited.json:", err.message);
    return new Set();
  }
}
export function saveVisited(visited: Set<string>) {
  try {
    fs.writeFileSync(
      VISITED_URL,
      JSON.stringify([...visited], null, 2),
      "utf8"
    );
  } catch (err: any) {
    logger.error("Lỗi khi ghi visited.json:", err.message);
  }
}

export function addVisited(url: string, visited: Set<string>) {
  visited.add(url);
  saveVisited(visited);
}

const visited = loadVisited();

export const cleanupVisited = (days = 1) => {
  if (!fs.existsSync(VISITED_URL)) return;

  const stats = fs.statSync(VISITED_URL);
  const ageMs = Date.now() - stats.mtimeMs;
  const ageDays = ageMs / (1000 * 60 * 60 * 24);

  if (ageDays > days) {
    fs.unlinkSync(VISITED_URL);
    logger.info(`Xoá visited.json (quá ${days} ngày)`);
  }
};

const crawlArticles = async (browser: any, page: any, type: any, key: any, server: string, data: any) => {
  try {
    const selector =
      type === "All" ? getSelectorsAllType : getSelectorsNewsType;
    const newsNextPageSelector = selector.newsNextPageSelector;

    let pageIndex = 1;
    while (true) {
      logger.info(
        `[${key}][${type}] - Trang ${pageIndex}: Crawl bắt đầu với từ khóa: ${key}`
      );
      await delayCustom(1000, 3000);

      const articles = await crawlArticlesPerPage(page, selector, key); // Danh sách url
      const listPost: any[] = [];
      let post: any;
      let i = 0;
      if (articles?.length) {
        for (const article of articles) {
          const url = article.url;
          // in url ra json
          if (visited.has(url)) {
            // const urlVisited = url.length > 30 ? url.slice(0, 30) + "..." : url;
            // logger.info(`Bỏ qua (đã crawl): ${urlVisited}`);
            continue;
          }
          addVisited(url, visited);
          const shortUrl = url.length > 30 ? url.slice(0, 30) + "..." : url;
          logger.info(`[${key}][${type}] - Bài viết [${i + 1}] ${shortUrl}`);
          post = await crawlContent(article, page, browser); // await thật sự
          post.server = server || ""; // hoặc truyền server từ bên ngoài
          listPost.push(post);
          i++;
        }
      }

      // push lên api
      await handleAfterCrawlContent(listPost);
      // pageIndex++
      // break

      await randomScroll(page, 4000);
      await delayCustom(1800, 2300);
      const nextPageElement = await page.$(newsNextPageSelector);
      if (!nextPageElement) {
        logger.info("Hết page, dừng crawl.");
        break;
      }
      const nextText = await page.evaluate(
        (el: { textContent: string }) => el.textContent.trim(),
        nextPageElement
      );
      if (!nextText.includes("Tiếp")) {
        logger.info("Hết page tiếp theo, dừng crawl.");
        break;
      }
      // await nextPageElement.click();
      // await page.waitForNavigation({ waitUntil: 'networkidle2' });
      await Promise.all([
        page.waitForNavigation({
          waitUntil: "domcontentloaded",
          timeout: 20000,
        }),
        nextPageElement.click(),
      ]);

      pageIndex++;
    }
  } catch (error: any) {
    // logger.error(`Lỗi crawlArticles cho ${key}: ${error.message}`);
    logger.error(`Lỗi crawlArticles cho ${key}`);
  }
};

export default crawlArticles;
