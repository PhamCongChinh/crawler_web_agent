import { fi } from "zod/v4/locales";
import logger from "../config/logger.config.js";
import { SelectorModel } from "../models/selector.model.js";
import { delayCustom } from "../utils/delayCustom.js";

const generateContentBySelector = async (page: any, selector: any) => {
    try {
        const content = await page.evaluate((selectors: any) => {
            const getElementText = (selector: any) => {
                const element = document.querySelector(selector);
                return element ? element.innerText.trim() : '';
            };

            const getTitle = getElementText(selectors.titleSelector);
            const getPublicationTime = getElementText(selectors.timeSelector);
            const getMainContent = getElementText(selectors.contentSelector);

            return {
                title: getTitle,
                time_publication: getPublicationTime,
                content: getMainContent
            };
        }, selector);
        return content;
    } catch (error) {
        return null
    }
}

export const crawlContent = async (article: any, page: any, browser: any) => {
    const pageDetail = await browser.newPage(); // tab mới
    try {
        const listSelector = await SelectorModel.findAll();
        await pageDetail.goto(article.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        const selector = listSelector.find((source: any) => article.url.includes(source.urlSource));
        
        let content = {};
        if (selector) {
            content = await generateContentBySelector(pageDetail, selector);
        }
        logger.info(JSON.stringify(content, null, 2))
        await delayCustom(3000,5000)
        pageDetail.close
    } catch (error:any) {
        logger.error(`Error crawling ${article.url}: ${error.message}`);
    } finally {
        await pageDetail.close(); // ⚡ phải await
    }

}