const pageByUrl = async (page: any, url: any) => {
    try {
        await page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });
        //domcontentloaded
        const elements = await page.$$('.Hg3NO.VDgVie.swJ5ic.f2HKGc.ttBXeb');
        for (const element of elements) {
            const textContent = await page.evaluate((el: any) => el.textContent || '', element);
            if (textContent.includes('Để sau')) {
                await element.click();
                break;
            }
        }
        return page
    } catch (error) {
        return null;
    }
}

export default pageByUrl