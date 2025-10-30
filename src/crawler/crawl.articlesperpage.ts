import logger from "../config/logger.config.js";

export const crawlArticlesPerPage = async (page: any, selector: any, key: any) => {
    const urlsToFilter = ['facebook', 'youtube', 'twitter', 'instagram', 'tiktok', 'threads'];
    try {
        const getNewsItems = async (page: any) => {
            const newsElementSelector = selector.newsElementSelector;
            const newsTitleSelector = selector.newsTitleSelector;
            const newsTimeSelector = selector.newsTimeSelector;
            const newsLinkSelector = selector.newsLinkSelector;

            await page.waitForSelector(newsElementSelector);
            const elements = await page.$$(newsElementSelector);

            const newsItems = [];
            for (const el of elements) {
                const url = await el.$eval(newsLinkSelector, (linkEl: { href: any; }) => linkEl.href).catch(() => null);
                const title = await el.$eval(newsTitleSelector, (titleEl: { innerText: any; }) => titleEl.innerText).catch(() => null);
                const time = await el.$eval(newsTimeSelector, (timeEl: { innerText: any; }) => timeEl.innerText).catch(() => null);
                if (!url || !title || !time) {
                    continue;
                }
                if (url !== null && urlsToFilter.some((urlToFilter) => url.includes(urlToFilter))) continue;
                newsItems.push({ keyword: key, title, time, url, author: url });
            }

            return newsItems;
        }
        const res = await getNewsItems(page);
        return res;
    } catch (error) {
        
    }
}