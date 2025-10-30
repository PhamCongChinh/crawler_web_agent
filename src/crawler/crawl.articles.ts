import logger from "../config/logger.config.js";
import { getSelectorsAllType, getSelectorsNewsType } from "../config/selector.config.js";
import { delayCustom } from "../utils/delayCustom.js";
import { crawlArticlesPerPage } from "./crawl.articlesperpage.js";
import { crawlContent } from "./crawle.content.js";

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
        if (totalHeight >= maxScroll || totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, Math.floor(Math.random() * 500) + 200); // random delay mỗi bước (200–700ms)
    });
  }, maxScroll);
}


const crawlArticles = async (browser: any, page: any, type: any, key: any) => {
    try {
        const selector = type === 'All' ? getSelectorsAllType : getSelectorsNewsType;
        const newsNextPageSelector = selector.newsNextPageSelector;

        let pageIndex = 1;
        while (true) {
            console.log(`Trang [${pageIndex}]: Crawl bắt đầu với từ khóa: ${key}`);
            await delayCustom(5000, 7000);

            const articles = await crawlArticlesPerPage(page, selector, key); // Danh sách url
            // logger.info(JSON.stringify(articles, null, 2));
            let listPost = []
            if (articles) {
              for (const article of articles) {
                const url = article.url;
                console.log(`[article] ${url}`);
                await crawlContent(article, page, browser); // await thật sự
              }
            }

            await randomScroll(page, 4000);
            await delayCustom(1800, 2500);
            const nextPageElement = await page.$(newsNextPageSelector);
            if (!nextPageElement) {
                logger.info('Hết page, dừng crawl.');
                break;
            }
            const nextText = await page.evaluate((el: { textContent: string; }) => el.textContent.trim(), nextPageElement);
            if (!nextText.includes('Tiếp')) {
                logger.info('Hết page tiếp theo, dừng crawl.')
                break;
            }
            await nextPageElement.click();
            await page.waitForNavigation({ waitUntil: 'networkidle2' });

            pageIndex++;
        }

    } catch (error) {
        
    }
}

export default crawlArticles