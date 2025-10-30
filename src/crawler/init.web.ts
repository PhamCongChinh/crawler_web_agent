import { Bot } from "../bot/index.js";
import { GPMLoginSDK } from "../sdk/index.js";

const PROFILE_ID = "7800e5ff-80e8-4375-af70-b567a5204e37"; // lấy trong GPM Login app
const gpm = new GPMLoginSDK({ url: "http://127.0.0.1:16137" });

export const initWeb = async () => {
    let _browser;
    try {
        const check = await gpm.checkConnection();
        console.log(check);

        const startRes = await gpm.startProfile(PROFILE_ID);
        console.log("Profile started:", startRes);

        const bot = await new Bot(gpm).setup(PROFILE_ID);

        _browser = bot?.browser;

        if (!_browser) {
            console.error("❌ Browser chưa được khởi tạo. Có thể GPM chưa start hoặc connect lỗi.");
            return;
        }
        return _browser;
    } catch (error) {
        console.log(error);
    }
};
