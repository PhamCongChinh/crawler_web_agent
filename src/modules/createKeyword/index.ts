import { initWeb } from "../../bot/init.web.js";
import { envConfig } from "../../config/env.config.js";
import logger from "../../config/logger.config.js";
import KeywordModel from "../../models/keyword.model.js";
import KeywordCoreModel, {
  KeywordCore,
} from "../../models/keywordCore.model.js";
import { GPMLoginSDK } from "../../sdk/gpm-login-sdk.js";
import { delayCustom } from "../../utils/delayCustom.js";
import { getUrlPage } from "./page.url.js";

const createKeyword = async () => {
  try {
    const agent = "agent-01-create-keyword";
    const { browser, page } = await initWeb(agent);
    await page.goto("https://www.google.com/", {
      waitUntil: "domcontentloaded",
      timeout: 10000,
    });

    const orgs_id = JSON.parse(envConfig.ORG_ID || "[]");
    const keywords = await KeywordCoreModel.getKeywordsByOrgId(orgs_id);
    console.log("Số lượng từ khóa", keywords.length);

    const keywordTemplate = "vng";
    await page.waitForSelector("#APjFqb", { visible: true });
    await page.click("#APjFqb", { clickCount: 3 });
    await page.keyboard.press("Backspace");
    await delayCustom(1000, 3000);
    await page.type("#APjFqb", keywordTemplate);
    await delayCustom(1000, 3000);
    await page.keyboard.press("Enter");
    await page
      .waitForSelector(".Hg3NO.VDgVie.swJ5ic.f2HKGc.ttBXeb", { timeout: 10000 })
      .catch(() => {});

    const elements = await page.$$(".Hg3NO.VDgVie.swJ5ic.f2HKGc.ttBXeb");
    for (const element of elements) {
      const textContent = await page.evaluate(
        (el) => el.textContent || "",
        element
      );
      if (textContent.includes("Để sau")) {
        await element.click();
        console.log('Đã click "Để sau"');
        break;
      }
    }

    const result = await getUrlPage(page);
    if (!result) {
        console.error("getUrlPage() trả về null");
        return;
    }
    await delayCustom(1000,2000);
    for( const { keyword, org_id } of keywords) {
        logger.info(`Đang tìm: ${keyword} (org_id: ${org_id})`)
        // Đảm bảo input có sẵn
        await page.waitForSelector('#APjFqb', { visible: true});

        // Xóa text cũ
        await page.click('#APjFqb', { clickCount: 3 });
        await page.keyboard.press('Backspace');
        await delayCustom(1000, 3000)

        // Gõ từ khóa mới
        await page.type('#APjFqb', keyword);
        await delayCustom(1000, 3000)

        // Nhấn Enter
        await page.keyboard.press('Enter');
        await page.waitForSelector('.Hg3NO.VDgVie.swJ5ic.f2HKGc.ttBXeb', { timeout: 10000 }).catch(() => {});
        await delayCustom(2000, 3000)

        // --- Lấy URL hiện tại ---
        const url = page.url();
        logger.info(`📄 URL tab All: ${url}`);

        // --- Nếu đang ở tab khác, quay về All ---
        if (url.includes('tbm=')) {
            const allTabUrl = url.replace(/(&)?tbm=[^&]*/g, '');
            await page.goto(allTabUrl, { waitUntil: 'networkidle2' });
            await delayCustom(1000, 2000);
            logger.info('↩️ Quay lại tab Tất cả');
        }

        const newsTab = await page.$('a[href*="tbm=nws"]');
        if (newsTab) {
            await newsTab.click();
            await page.waitForNavigation({ waitUntil: 'networkidle2' });
        }
        const newsUrl = page.url();

        // const { pageAll, url } = result;
        // await pageAll.waitForSelector('a[href*="tbm=nws"]', { visible: true });
        // await pageAll.click('a[href*="tbm=nws"]');
        // await pageAll.waitForNavigation({ waitUntil: 'networkidle2' });
        // const newsUrl = pageAll.url();

        const data = {
            keyword: keyword,
            url: url,
            url_news: newsUrl,
            org_id: org_id
        }
        await KeywordModel.updateByKeyword(data.keyword, data)
        logger.info(`✅ Đã lưu ${keyword}`);
        await delayCustom(2500, 4000);
    }


    // for( const { keyword, org_id } of keywords) {
    //     logger.info(`Đang tìm: ${keyword} (org_id: ${org_id})`)
    //     await page.waitForSelector('#APjFqb', { visible: true});

    //     await page.click('#APjFqb', { clickCount: 3 });
    //     await page.keyboard.press('Backspace');
    //     await delayCustom(1000, 3000)
    //     await page.type('#APjFqb', keyword);
    //     await delayCustom(1000, 3000)
    //     await page.keyboard.press('Enter');
    //     await page.waitForSelector('.Hg3NO.VDgVie.swJ5ic.f2HKGc.ttBXeb', { timeout: 10000 }).catch(() => {});

    //     // Tìm và click "Để sau"
    //     const elements = await page.$$('.Hg3NO.VDgVie.swJ5ic.f2HKGc.ttBXeb');
    //     for (const element of elements) {
    //     const textContent = await page.evaluate(el => el.textContent || '', element);
    //         if (textContent.includes('Để sau')) {
    //             await element.click();
    //             console.log('Đã click "Để sau"');
    //             break;
    //         }
    //     }

    //     const result = await getUrlPage(page);
    //     if (!result) {
    //         console.error("getUrlPage() trả về null");
    //         return;
    //     }

    //     const { pageAll, url } = result;
    //     await pageAll.waitForSelector('a[href*="tbm=nws"]', { visible: true });
    //     await pageAll.click('a[href*="tbm=nws"]');
    //     await pageAll.waitForNavigation({ waitUntil: 'networkidle2' });

    //     const newsUrl = pageAll.url();

    //     // Insert
    //     const data = {
    //         keyword: keyword,
    //         url: url,
    //         url_news: newsUrl,
    //         org_id: org_id
    //     }
    //     await KeywordModel.updateByKeyword(data.keyword, data)
    //     await delayCustom(3000,5000);
    // }

    await delayCustom(3000,5000);
    await browser.close();
  } catch (error: any) {
    throw new Error(error);
  }
};

export default createKeyword;
