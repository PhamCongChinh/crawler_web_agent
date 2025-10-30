import { initWeb } from "./init.web.js";

const crawler = async () => {

    const browser = await initWeb()

    let [page] = await browser.newPage();
    await delay(5000); // delay 1 giây
    console.log("Done after 1s")

}

export default crawler
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));