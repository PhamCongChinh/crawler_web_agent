import { initWeb } from "./init.web.js";

const crawler = async () => {
    const agent = 'agent-01'
    // const { browser, page } = (await initWeb("agent-1"))!;
    const { browser, page } = await initWeb(agent);
    
    await delay(5000); // delay 1 giây
    console.log("Done after 1s")

}

export default crawler
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));