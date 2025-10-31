import logger from "../config/logger.config.js";
import KeywordModel from "../models/keyword.model.js";
import { delayCustom } from "../utils/delayCustom.js";
import crawlArticles from "./crawl.articles.js";
import { initWeb } from "./init.web.js";
import pageByUrl from "./page.url.js";

const crawler = async () => {

    const listKeyword = await KeywordModel.findByOrgName();

    const agent = 'agent-01'
    const { browser, page } = await initWeb(agent);
    await delayCustom(4000,5000);

    let i = 0
    for(let keyword of listKeyword) {
        // if (i===2) break
        logger.info(`[${i + 1}/${listKeyword.length}] Crawling từ khóa: ${keyword.keyword}`);

        const startTime = Date.now();
        let pageAll: any;

        try {
            pageAll = await pageByUrl(page, keyword.url);
            if (pageAll) await crawlArticles(browser, pageAll, 'All', keyword.keyword);
        } catch (err: any) {
            logger.error(`Lỗi crawl pageAll cho ${keyword.keyword}: ${err.message}`);
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
            await crawlArticles(browser, pageNewsReady, 'News', keyword.keyword);
        } catch (err: any) {
            logger.error(`Lỗi khi xử lý pageNews cho ${keyword.keyword}: ${err.message}`);
        } finally {
            if (pageNews && pageNews !== page) {
                await pageNews.close().catch(() => {});
            }
        }

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        logger.info(`Thời gian crawl "${keyword.keyword}": ${duration} giây`);

        i++
        await delayCustom(2000, 3200);
    }

    await browser.close().catch(() => {});
}

export default crawler
