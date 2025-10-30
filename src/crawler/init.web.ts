import puppeteer, { Browser, Page } from "puppeteer";
import { Bot } from "../bot/index.js";
import { GPMLoginSDK } from "../sdk/index.js";

const PROFILE_ID = "7800e5ff-80e8-4375-af70-b567a5204e37"; // lấy trong GPM Login app
const gpm = new GPMLoginSDK({ url: "http://127.0.0.1:16137" });


interface WebAgent {
    agentId: string;
    browser: Browser;
    page: Page;
}

export const initWeb = async (agentId: string): Promise<WebAgent> => {
    try {
        // const check = await gpm.checkConnection();
        // console.log(check);

        // const startRes = await gpm.startProfile(PROFILE_ID);
        // console.log("Profile started:", startRes);

        // const bot = await new Bot(gpm).setup(PROFILE_ID);

        // const browser = bot?.browser;

        // if (!browser) {
        //     console.error("❌ Browser chưa được khởi tạo. Có thể GPM chưa start hoặc connect lỗi.");
        // }
        // const page = (await browser.pages())[0] ?? (await browser.newPage());
        // console.log(`🚀 Agent ${agentId} started with GPM`);
        // return { agentId, browser, page };

        // const check = await gpm.checkConnection();
        // console.log("GPM connected?", check);
        // if (!check) throw new Error("GPM chưa kết nối được.");

        // const startRes = await gpm.startProfile(PROFILE_ID);
        // console.log("Profile started:", startRes);
        // if (!startRes) throw new Error("Không start được profile.");

        // const bot = await new Bot(gpm).setup(PROFILE_ID);
        // const browser = bot.browser!;
        // if (!browser) throw new Error("Browser chưa được khởi tạo. Có thể GPM chưa start hoặc connect lỗi.");

        // // const page = await browser.newPage()
        // const page = (await browser.pages())[0] ?? (await browser.newPage());
        // console.log(`🚀 Agent ${agentId} started with GPM`);
        // return { agentId, browser, page };



        const browser: Browser = await puppeteer.launch({
            headless: false,                      // hiển thị giao diện thật
            defaultViewport: null,                // dùng độ phân giải thật
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-infobars",                     // ẩn infobars
                "--start-maximized",
                "--disable-blink-features=AutomationControlled", // giảm dấu vết automation
                "--disable-dev-shm-usage",
            ],
            executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" // nếu muốn dùng Chrome thật
        });

        const page = (await browser.pages())[0] ?? (await browser.newPage());
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, "webdriver", { get: () => false });
            Object.defineProperty(navigator, "languages", { get: () => ["vi-VN", "vi", "en-US", "en"] });
            Object.defineProperty(navigator, "plugins", {
            get: () => [1, 2, 3, 4, 5],
            });
        });

        console.log(`🚀 Agent ${agentId} started`);
        return { agentId, browser, page };
    } catch (error) {
        console.error(`❌ Lỗi khởi tạo agent ${agentId}:`, error);
        throw error; // bắt buộc throw để TS hiểu luôn trả về WebAgent hoặc lỗi
    }
};
