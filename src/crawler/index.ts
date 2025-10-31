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
        logger.info(`[${i + 1}/${listKeyword.length}] Crawling từ khóa: ${keyword.keyword} - URL: ${keyword.url}`);
        const startTime = Date.now();
        let pageAll = await pageByUrl(page, keyword.url)
        if (pageAll) {
            try {
                await crawlArticles(browser, pageAll, 'All', keyword.keyword);
            } catch (err: any) {
                logger.error(`Lỗi crawl pageAll cho ${keyword.keyword}: ${err.message}`);
            }
        }
        await delayCustom(1300, 2600)
        const pageNews = await browser.newPage(); // mở tab mới cùng browser
        try {
            const pageNewsReady = await pageByUrl(pageNews, keyword.url_news);
            await pageAll.close()
            if (!pageNewsReady) throw new Error("Không mở được pageNews");
            await crawlArticles(browser, pageNewsReady, 'News', keyword.keyword);
        } catch (err: any) {
            logger.error(`Lỗi khi xử lý pageNews cho ${keyword.keyword}: ${err.message}`);
        }
        
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2); // tính giây
        logger.info(`Thời gian crawl keyword "${keyword.keyword}": ${duration} giây`);

        i++
        await delayCustom(2000, 3200);
        
        try {
            await browser.close();
        } catch (err: any) {
            console.warn("Đóng browser lỗi (có thể đã disconnect):", err.message);
        }
    }
}

export default crawler
