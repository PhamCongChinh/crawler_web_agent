import axios from "axios";

export type TGPMConfig = {
    url: string; // ví dụ: http://127.0.0.1:19995
};

export class GPMLoginSDK {
    private _config: TGPMConfig & { api_url: string };
    private _api_root = "api/v3/";

    constructor(config: TGPMConfig = { url: "http://127.0.0.1:19995" }) {
        this._config = { ...config, api_url: `${config.url}/${this._api_root}` };
    }

    /** Lấy danh sách profile */
    async getProfiles() {
        const res = await axios.get(`${this._config.api_url}profiles`);
        return res.data;
    }

    /** Mở profile theo ID */
    async startProfile(profile_id: string) {
        const res = await axios.get(
        `${this._config.api_url}browser/start-profile`,
        {
            params: { id: profile_id },
        }
        );

        if (!res.data?.ws) {
        throw new Error("Không nhận được websocket URL từ GPM");
        }

        // Tự kết nối qua Puppeteer Core
        const puppeteer = await import("puppeteer-core");
        const browser = await puppeteer.connect({
        browserWSEndpoint: res.data.ws,
        defaultViewport: null,
        });

        return browser;
    }

    /** Dừng profile */
    async stopProfile(profile_id: string) {
        const res = await axios.get(`${this._config.api_url}browser/stop-profile`, {
        params: { id: profile_id },
        });
        return res.data;
    }

    /** Lấy thông tin một profile */
    async getProfile(profile_id: string) {
        const res = await axios.get(
        `${this._config.api_url}profiles/${profile_id}`
        );
        return res.data;
    }
}
