import axios from "axios";
import z from "zod";
import { startProfileSchema } from "./gpm-login-sdk-request-params.schema.js";
// import queryString from "query-string";

export type TGPMConfig = {
    url: string; // ví dụ: http://127.0.0.1:19995
};

export class GPMLoginSDK {

    private _config: TGPMConfig & { api_url: string };
    private _api_root = "api/v3/";

    constructor(config: TGPMConfig = { url: "http://127.0.0.1:16137" }) {
        const _api_root = config.url.endsWith('/') ? this._api_root : `/${this._api_root}`;
        this._config = { ...config, api_url: `${config.url}/${_api_root}` };
    }

    async checkConnection() {
        try {
            const { data } = await axios.get(this._config.api_url);
            return { success: true, message: 'Connection successful', data };
        } catch (error: any) {
            return { success: false, message: error?.message };
        }
    }

    async startProfile(id: any, params?: any) {
        const queryString = await import('query-string').then(m => m.default);
        const validId = z.string().trim().parse(id);
        const validParams = startProfileSchema.parse(params) ?? {};

        const { data } = await axios.post(
            this._config.api_url + `profiles/start/${validId}?` + queryString.stringify(validParams, { arrayFormat: 'comma' })
        );
        return data;
    }
}
