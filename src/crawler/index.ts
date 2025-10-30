import KeywordModel from "../models/keyword.model.js";
import crawlArticles from "./crawl.articles.js";
import { initWeb } from "./init.web.js";
import pageByUrl from "./page.url.js";

const crawler = async () => {

    const listKeyword = await KeywordModel.findByOrgName();

    const agent = 'agent-01'
    const { browser, page } = await initWeb(agent);
    await delay(5000); // delay 1 giây

    let count = 1
    for(let keyword of listKeyword) {
        console.log(`[${count}/${listKeyword.length}] Từ khóa`);
        let pageAll = await pageByUrl(page, keyword.url)
        if (pageAll) {
            await crawlArticles(browser, pageAll, 'All', keyword.keyword);
        }

        await delay(5000)
        count++
    }
    console.log("Done after 1s")

}

export default crawler
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
