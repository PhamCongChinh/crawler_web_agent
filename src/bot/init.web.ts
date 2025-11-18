// src/bot/init.web.ts
import { envConfig } from "../config/env.config.js";
import { initWeb as crawlerInitWeb } from "../crawler/init.web.js";

/**
 * Wrapper cho initWeb để dùng profile đầu tiên trong PROFILE_IDS.
 * Dùng cho các module cũ import { initWeb } từ "bot/init.web".
 */
export const initWeb = async (agentId: string) => {
    const profileId = envConfig.PROFILE_IDS[0];

    if (!profileId) {
        throw new Error(
            'PROFILE_IDS đang trống. Cần cấu hình PROFILE_IDS=["id1","id2"] trong .env'
        );
    }

    return crawlerInitWeb(agentId, profileId);
};

// Alias để nếu muốn dùng tên khác cho rõ mục đích
export const initBotWeb = initWeb;
