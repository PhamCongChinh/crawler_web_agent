class SelectorConfig {
    ggNews: { newsElementSelector: string; newsTitleSelector: string; newsContentSelector: string; newsTimeSelector: string; newsLinkSelector: string; newsNextPageSelector: string; newsAuthorSelector: string; newsSourceSelector: string; newsSourceNameSelector: string; };
    ggAll: { newsElementSelector: string; newsTitleSelector: string; newsContentSelector: string; newsTimeSelector: string; newsLinkSelector: string; newsNextPageSelector: string; newsAuthorSelector: string; newsSourceSelector: string; newsSourceNameSelector: string; };
    ggAllHeadless: { newsElementSelector: string; newsTitleSelector: string; newsContentSelector: string; newsTimeSelector: string; newsLinkSelector: string; newsNextPageSelector: string; newsAuthorSelector: string; newsSourceSelector: string; newsSourceNameSelector: string; };
    ggNewsHeadless: { newsElementSelector: string; newsTitleSelector: string; newsContentSelector: string; newsTimeSelector: string; newsLinkSelector: string; newsNextPageSelector: string; newsAuthorSelector: string; newsSourceSelector: string; newsSourceNameSelector: string; };
    constructor() {
        this.ggNews = {
        newsElementSelector: 'div.SoaBEf',
        newsTitleSelector: 'div.n0jPhd',
        newsContentSelector: 'div.GI74Re.nDgy9d',
        newsTimeSelector: 'div.OSrXXb.rbYSKb.LfVVr',
        newsLinkSelector: 'a.WlydOe',
        newsNextPageSelector: 'span[style="display:block;margin-left:53px"]',
        newsAuthorSelector: 'div.MgUUmf.NUnG9d',
        newsSourceSelector: 'div.MgUUmf span',
        newsSourceNameSelector: 'div.MgUUmf span',
        };

        this.ggAll = {
        newsElementSelector: 'div.MjjYud',
        newsTitleSelector: 'h3',
        newsContentSelector: '#rso div div div div > div > span',
        newsTimeSelector: '.YrbPuc span',
        newsLinkSelector: 'a',
        newsNextPageSelector: 'a[style*="text-align:left"]',
        newsAuthorSelector: '#rso div.kb0PBd.cvP2Ce.A9Y9g.jGGQ5e div div span a div div div > div > span',
        newsSourceSelector: 'cite',
        newsSourceNameSelector: '.CA5RN .VuuXrf',
        };

        this.ggAllHeadless = {
        newsElementSelector: 'div.Gx5Zad.xpd.EtOod.pkphOe',
        newsTitleSelector: 'div.BNeawe.vvjwJb.AP7Wnd',
        newsContentSelector: 'div.BNeawe.s3v9rd.AP7Wnd',
        newsTimeSelector: 'span.r0bn4c.rQMQod',
        newsLinkSelector: 'div.egMi0.kCrYT a',
        newsNextPageSelector: 'a[aria-label="Trang tiếp theo"]',
        newsAuthorSelector: 'div.BNeawe.UPmit.AP7Wnd.lRVwie',
        newsSourceSelector: 'div.BNeawe.UPmit.AP7Wnd.lRVwie',
        newsSourceNameSelector: 'div.BNeawe.UPmit.AP7Wnd.lRVwie',
        };

        this.ggNewsHeadless = {
        newsElementSelector: 'div.Gx5Zad.xpd.EtOod.pkphOe',
        newsTitleSelector: 'div.BNeawe.vvjwJb.AP7Wnd',
        newsContentSelector: 'div.BNeawe.vvjwJb.AP7Wnd',
        newsTimeSelector: 'span.r0bn4c.rQMQod',
        newsLinkSelector: 'a',
        newsNextPageSelector: 'a[aria-label="Trang tiếp theo"]',
        newsAuthorSelector: 'div.BNeawe.UPmit.AP7Wnd.lRVwie',
        newsSourceSelector: 'div.BNeawe.UPmit.AP7Wnd.lRVwie',
        newsSourceNameSelector: 'div.BNeawe.UPmit.AP7Wnd.lRVwie',
        };
    }
}

export const getSelectorsAllType = new SelectorConfig().ggAll;
export const getSelectorsNewsType = new SelectorConfig().ggNews;
export const getSelectorsAllTypeHeadless = new SelectorConfig().ggAllHeadless;
export const getSelectorsNewsTypeHeadless = new SelectorConfig().ggNewsHeadless;
