import { initWeb } from "./init.web.js";

const crawler = async () => {
    const agent = 'agent-01'
    // const { browser, page } = (await initWeb("agent-1"))!;
    const { browser, page } = await initWeb(agent);
    let pageAll = page.goto("https://www.google.com/search?q=T%E1%BA%ADp+%C4%91o%C3%A0n+T%26T&hl=vi&source=lnt&tbs=qdr:d&sa=X&biw=1280&bih=665&dpr=1.25")
    await delay(5000); // delay 1 giây
    console.log("Done after 1s")

}

export default crawler
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));