import { envConfig } from "../config/env.config.js";
import logger from "../config/logger.config.js";
import { sendCrawlResult } from "../kafka/producer.js";
import KeywordModel from "../models/keyword.model.js";
import { delayCustom } from "../utils/delayCustom.js";
import crawlArticles from "./crawl.articles.js";
import { initWeb } from "./init.web.js";
import pageByUrl from "./page.url.js";

const crawlerKafka = async (data: any, agentId: string) => {
  const keyword = data.keyword || "";
  const server = data.server || "";
  const kw = await KeywordModel.findByKeyword(keyword);

  const { browser, page } = await initWeb(agentId);
  await delayCustom(3000, 5000);

  logger.info(`[${agentId}] Crawling từ khóa: ${keyword}`);

  const startTime = Date.now();
  let pageAll: any;

  try {
    pageAll = await pageByUrl(page, kw?.url);
    if (pageAll)
      await crawlArticles(browser, pageAll, "All", kw?.keyword, server, data);
  } catch (err: any) {
    logger.error(`Lỗi crawl pageAll cho ${kw?.keyword}`);
  } finally {
    if (pageAll && pageAll !== page) {
      await pageAll.close().catch(() => {});
    }
  }
  await delayCustom(1300, 2600);

  let pageNews: any;
  try {
    pageNews = await browser.newPage();
    const pageNewsReady = await pageByUrl(pageNews, keyword.url_news);
    if (!pageNewsReady) throw new Error("Không mở được pageNews");
    await crawlArticles(
      browser,
      pageNewsReady,
      "News",
      kw?.keyword,
      server,
      data
    );
  } catch (err: any) {
    logger.error(`Lỗi khi xử lý pageNews cho ${kw?.keyword}: ${err.message}`);
  } finally {
    if (pageNews && pageNews !== page) {
      await pageNews.close().catch(() => {});
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  await sendCrawlResult({
    type: "web_keyword",
    task_id: data?.task_id || "",
    keyword: data?.keyword || "",
    platform: data?.platform || "",
    created_at: data?.created_at || "",
    topic: data?.topic || "",
    assigned_bot: data?.assigned_bot || "",
    status: "DONE",
    success: true,
    bot_id: agentId,
  });
  logger.info(`Thời gian crawl "${keyword.keyword}": ${duration} giây`);
  // await browser.close().catch(() => {});
};

export default crawlerKafka;
