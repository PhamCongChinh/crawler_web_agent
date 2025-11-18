// src/crawler/init.web.ts
import type { Browser, Page } from "puppeteer";
import logger from "../config/logger.config.js";
import { GPMLoginSDK } from "../sdk/index.js";
import { Bot } from "../bot/index.js";
import { envConfig } from "../config/env.config.js";

export interface WebAgent {
    agentId: string;
    browser: Browser;
    page: Page;
}

const gpm = new GPMLoginSDK({ url: envConfig.GPM_URL });

export const initWeb = async (
    agentId: string,
    profileId: string
): Promise<WebAgent> => {
    try {
        const check = await gpm.checkConnection();
        if (!check?.success) {
            throw new Error(`GPM chưa kết nối được: ${check?.message ?? "unknown"}`);
        }

        const startRes = await gpm.startProfile(profileId);
        if (!startRes) {
            throw new Error(`Không start được profile ${profileId}`);
        }

        const bot = await new Bot(gpm).setup(profileId);
        const browser = bot.browser;
        if (!browser) {
            throw new Error("Browser chưa được khởi tạo sau khi setup Bot");
        }

        const page = (await browser.pages())[0] ?? (await browser.newPage());
        logger.info(
            `Agent ${agentId} started with GPM profile=${profileId.substring(0, 8)}...`
        );

        return { agentId, browser, page };
    } catch (err: any) {
        logger.error(
            `initWeb(${agentId}, ${profileId.substring(0, 8)}...) lỗi: ${err.message}`
        );
        throw err;
    }
};
