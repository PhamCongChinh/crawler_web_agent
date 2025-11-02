import logger from "../../config/logger.config.js";
import { delayCustom } from "../../utils/delayCustom.js";

export const getUrlPage = async (page: any) => {
    try {
        // Click into tool
        await page.waitForSelector("#hdtb-tls", { visible: true });
        await page.click("#hdtb-tls");
        await delayCustom(1500, 2500);

        // Chọn thời gian
        await page.waitForSelector('div[jsname="oYxtQd"] div[jsname="qRxief"]');
        await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('div[jsname="oYxtQd"] div[jsname="qRxief"]'));
            const recentElement = elements.find(el => el.textContent?.trim() === 'Mọi lúc');
            if (recentElement) (recentElement as HTMLElement).click();
        });
        await delayCustom(1500, 2500);
        await page.waitForSelector('a[href*="tbs=qdr:d"]', { visible: true });
        await page.evaluate(() => {
            const link = Array.from(document.querySelectorAll('a[href*="tbs=qdr:d"]'))
                .find(el => el.textContent?.trim() === '24 giờ qua');
            if (link) (link as HTMLElement).click();
        });

        await delayCustom(1500, 2500);

        await page.waitForSelector("#hdtb-tls", { visible: true });
        await page.click("#hdtb-tls");
        await delayCustom(1500, 2500);

        // Tìm trang tiếng việt
        await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('div[role="button"]'));
            const target = buttons.find(el => el.textContent?.trim() === 'Mọi ngôn ngữ');
            if (target) (target as HTMLElement).click();
        });

        await delayCustom(1500, 2500);
        await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a'));
            const vnLink = links.find(el => el.textContent?.trim() === 'Tìm những trang Tiếng Việt');
            if (vnLink) (vnLink as HTMLElement).click();
        });

        await delayCustom(1000, 2000);
        const url = page.url();
        logger.info(`Đã lọc kết quả 24h: ${url}`);
        return { pageAll: page, url };
    } catch (error: any) {
        console.error("Lỗi getUrlPage:", error.message);
        return null;
    }
};
