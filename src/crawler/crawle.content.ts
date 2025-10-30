import moment from "moment";
import logger from "../config/logger.config.js";
import { SelectorModel } from "../models/selector.model.js";
import { delayCustom } from "../utils/delayCustom.js";
import { convertContentToPost } from "./crawler.post.js";

const validateContentBeforeInsert = async (article: any, contentJson: any) => {
    try {
        const pubTime = contentJson.time_publication;
        if (!contentJson.title || contentJson.title === 'null' || contentJson.title === '' || contentJson.content === '') {
            return null;
        }

        const res = parsePubtime(pubTime, contentJson.createdAt, article.time);
        if (!res) {
            return null;
        }

        contentJson.time_publication = res;
        return contentJson;
    } catch (error: any) {
        logger.error(`Dữ liệu không hợp lệ: ${error.stack}`);
        return null;
    }
}

/**
 * @description Hàm phân tích thời gian tương đối (vd: "2 giờ trước", "3 phút trước")
 * @param {*} crawlTime - Thời gian crawl link
 * @param {*} timeString - Chuỗi thời gian cần phân tích (vd: "2 giờ trước", "3 phút trước", "thg 10/2023")
 * @returns {string|null} - Trả về thời gian đã được định dạng lại (hh:mm dd/mm/yyyy) hoặc null nếu không thể phân tích
 */
const parseRelativeTime = (crawlTime: any, timeString: any): string | null => {
    const crawlDate = new Date(crawlTime);
    const normalizedString = timeString.replace(/[—,]/g, '').trim();

    const timeParts = normalizedString.split(' ');
    const value = parseInt(timeParts[0]);
    const unit = timeParts[1];

    if (unit.includes('giờ')) {
        crawlDate.setHours(crawlDate.getHours() - value);
    } else if (unit.includes('phút')) {
        crawlDate.setMinutes(crawlDate.getMinutes() - value);
    } else if (unit.includes('thg')) {
        return `00:00 ${timeParts[0]}/${String(timeParts[2]).padStart(2, '0')}/${timeParts[3]}`;
    } else {
        return null;
    }

    // Định dạng lại thời gian thành hh:mm dd/mm/yyyy
    const newHours = String(crawlDate.getHours()).padStart(2, '0');
    const newMinutes = String(crawlDate.getMinutes()).padStart(2, '0');
    const newDay = String(crawlDate.getDate()).padStart(2, '0');
    const newMonth = String(crawlDate.getMonth() + 1).padStart(2, '0');
    const newYear = crawlDate.getFullYear();

    return `${newHours}:${newMinutes} ${newDay}/${newMonth}/${newYear}`;
};


/**
 * @description Hàm phân tích chuỗi thời gian khi crawl content và định dạng lại thành hh:mm dd/mm/yyyy
 * @param {string} dateString - Chuỗi thời gian cần phân tích (vd: "2023/10/01 12:30", "2023/10/01 12:30")
 * @returns {string|null} - Trả về thời gian đã được định dạng lại (hh:mm dd/mm/yyyy) hoặc null nếu không thể phân tích
 */
export const parseDate = (dateString: any): string | null => {
    const timeRegex = /\b\d{2}:\d{2}\b/;
    const dateRegex1 = /\b\d{2}\/\d{2}\/\d{4}\b/;
    const dateRegex2 = /\b\d{4}\/\d{2}\/\d{2}\b/;

    const time = dateString.match(timeRegex)?.[0] || null;
    const date1 = dateString.match(dateRegex1)?.[0] || null;
    const date2 = dateString.match(dateRegex2)?.[0] || null;

    if (time && date1) {
        return `${time} ${date1}`;
    } else if (time && date2) {
        const chunkDate = date2.split('/');
        return `${time} ${chunkDate[0]}/${chunkDate[1]}/${chunkDate[2]}`;
    } else {
        return null;
    }
};

/**
 *
 * @description Hàm chính để trả về pubTime cho bài viết, nếu không thể lấy được chính xác thời gian của bài báo thì trả về thời gian tương đối nằm trong khoảng 1 ngày
 * @param {string} dateString - Chuỗi thời gian sau khi crawl content (vd: "2023/10/01 12:30", "2023/10/01 12:30")
 * @param {*} createdAt - Thời gian crawl link
 * @param {*} time - Thời gian tương đối (vd: "2 giờ trước", "3 phút trước", "thg 10/2023")
 * @returns {string|null} - Trả về thời gian đã được định dạng lại (hh:mm dd/mm/yyyy) hoặc null nếu không thể phân tích
 */
export const parsePubtime = (dateString: any, createdAt: any, time: any): string | null => {
    const timeParse = parseDate(dateString);
    const relativeTime = parseRelativeTime(createdAt, time);
    if (!relativeTime && !timeParse) {
        return null;
    }
    if (!timeParse) {
        return relativeTime;
    }

    const minTime = moment(relativeTime, 'HH:mm DD/MM/YYYY').subtract(24, 'hours');
    const maxTime = moment(relativeTime, 'HH:mm DD/MM/YYYY').add(24, 'hours');
    if (!moment(timeParse, 'HH:mm DD/MM/YYYY').isBetween(minTime, maxTime)) {
        return relativeTime;
    }
    return timeParse;
};




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

            // const contentElement = document.querySelector(selectors.contentSelector);
            // let firstImage = null;
            // if (contentElement) {
            //     const images = contentElement.querySelectorAll('img');
            //     firstImage = images[0]?.src ?? null;
            // }

            return {
                title: getTitle,
                time_publication: getPublicationTime,
                content: getMainContent,
                createdAt: new Date().toISOString().replace("Z", "+00:00")
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

        let post = {}
        const contentAfterValidate = await validateContentBeforeInsert(article, content);
        
        if (contentAfterValidate) {
            post = convertContentToPost(article, contentAfterValidate)
        }
        await delayCustom(3000,5000)
        return post
    } catch (error:any) {
        logger.error(`Error crawling ${article.url}: ${error.message}`);
    } finally {
        await pageDetail.close(); // ⚡ phải await
    }

}