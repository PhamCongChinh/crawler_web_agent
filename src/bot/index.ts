// import puppeteer from 'puppeteer';

// export class Bot {
//     private gpm: any;
//     private _browser: any;

//     constructor(gpm: any) {
//         this.gpm = gpm
//         this._browser = null
//     }

//     get browser() {
//         return this._browser;
//     }

//     async setup(profile_id: string) {
//         try {
//             const { data, message } = await this.gpm.startProfile(profile_id)
//             await new Promise(r => setTimeout(r, 5000)); // chờ GPM mở cổng
//             if (data) {
//                 const { remote_debugging_address } = data
//                 const { webSocketDebuggerUrl } = await this.gpm.getRemoteDebuggingBrowser(remote_debugging_address)
//                 this._browser = await puppeteer.connect({browserWSEndpoint: webSocketDebuggerUrl})
//                 console.log("✅ Browser connected!");
//                 return this
//             } else {
//                 throw new Error(message ?? 'Lỗi setup bot control!');
//             }
//         } catch (error: any) {
//             console.log(error.message);
//         }
//     }
// }

import puppeteer, { Browser } from 'puppeteer-core';

export class Bot {
    private gpm: any;
    private _browser: Browser | null;

    constructor(gpm: any) {
        this.gpm = gpm;
        this._browser = null;
    }

    get browser(): Browser | null {
        return this._browser;
    }

    async setup(profile_id: string): Promise<this> {
        try {
            const { data, message } = await this.gpm.startProfile(profile_id);

            if (!data) {
                throw new Error(message ?? "Lỗi setup bot control!");
            }

            // Chờ GPM mở cổng (tối đa 10s)
            const remote_debugging_address = data.remote_debugging_address;
            let webSocketDebuggerUrl: string | null = null;
            for (let i = 0; i < 10; i++) {
                const res = await this.gpm.getRemoteDebuggingBrowser(remote_debugging_address);
                webSocketDebuggerUrl = res?.webSocketDebuggerUrl;
                if (webSocketDebuggerUrl) break;
                await new Promise(r => setTimeout(r, 1000));
            }

            if (!webSocketDebuggerUrl) {
                throw new Error("GPM chưa mở remote debugger, không thể kết nối browser");
            }

            this._browser = await puppeteer.connect({ browserWSEndpoint: webSocketDebuggerUrl });
            console.log("✅ Browser connected!");
            return this;

        } catch (error: any) {
            console.error("❌ Bot setup failed:", error.message);
            throw error; // ⚡ Throw để caller biết setup thất bại
        }
    }
}
