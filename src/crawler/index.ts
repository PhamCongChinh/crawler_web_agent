// src/crawler/index.ts
import logger from "../config/logger.config.js";
import { envConfig } from "../config/env.config.js";
import KeywordModel from "../models/keyword.model.js";
import { delayCustom } from "../utils/delayCustom.js";
import crawlArticles from "./crawl.articles.js";
import pageByUrl from "./page.url.js";
import { initWeb } from "./init.web.js";

/**
 * Crawler thủ công (không qua Kafka), dùng 1 profile đầu tiên trong PROFILE_IDS.
 */
const crawler = async () => {
    const orgs_id = JSON.parse(envConfig.ORG_ID || "[]");
    const keywords = await KeywordModel.findByOrgId(orgs_id);

    const agent = "agent-manual";
    const profileId = envConfig.PROFILE_IDS[0];

    if (!profileId) {
        throw new Error(
            'PROFILE_IDS đang trống. Cần cấu hình PROFILE_IDS=["id1","id2"] trong .env'
        );
    }

    const { browser, page } = await initWeb(agent, profileId);

    let i = 0;
    for (const keyword of keywords) {
        logger.info(
            `[${i + 1}/${keywords.length}] Crawling từ khóa: ${keyword.keyword}`
        );

        const startTime = Date.now();
        const server = "";          // manual mode không có server
        const data: any = {};       // manual mode không có metadata

        let pageAll: any;
        try {
            pageAll = await pageByUrl(page, keyword.url);
            if (pageAll) {
                await crawlArticles(browser, pageAll, "All", keyword.keyword, server, data);
            }
        } catch (err: any) {
            logger.error(`Lỗi crawl All cho "${keyword.keyword}": ${err.message}`);
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
                keyword.keyword,
                server,
                data
            );
        } catch (err: any) {
            logger.error(`Lỗi crawl News cho "${keyword.keyword}": ${err.message}`);
        } finally {
            if (pageNews && pageNews !== page) {
                await pageNews.close().catch(() => {});
            }
        }

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        logger.info(`Thời gian crawl "${keyword.keyword}": ${duration} giây`);

        i++;
        await delayCustom(2000, 3200);
    }

    await browser.close().catch(() => {});
};

export default crawler;
