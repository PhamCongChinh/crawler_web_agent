import puppeteer from 'puppeteer';

export class Bot {
    private gpm: any;
    private _browser: any;

    constructor(gpm: any) {
        this.gpm = gpm
        this._browser = null
    }

    get browser() {
        return this._browser;
    }

    async setup(profile_id: string) {
        try {
            const { data, message } = await this.gpm.startProfile(profile_id)
            await new Promise(r => setTimeout(r, 5000)); // chờ GPM mở cổng
            if (data) {
                const { remote_debugging_address } = data
                const { webSocketDebuggerUrl } = await this.gpm.getRemoteDebuggingBrowser(remote_debugging_address)
                this._browser = await puppeteer.connect({browserWSEndpoint: webSocketDebuggerUrl})
                console.log("✅ Browser connected!");
                return this
            } else {
                throw new Error(message ?? 'Lỗi setup bot control!');
            }
        } catch (error: any) {
            console.log(error.message);
        }
    }
}