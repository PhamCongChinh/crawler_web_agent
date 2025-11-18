// src/profile.pool.ts
import logger from "./config/logger.config.js";
import { envConfig } from "./config/env.config.js";
import { initWeb } from "./crawler/init.web.js";
import type { WebAgent } from "./crawler/init.web.js";

export interface PoolAgent extends WebAgent {
    busy: boolean;
    profileId: string;
}

export class ProfilePool {
    private agents: PoolAgent[] = [];
    private waitQueue: ((agent: PoolAgent) => void)[] = [];
    private readonly profileIds: string[];
    private readonly maxWorkers: number;

    constructor() {
        // Lấy danh sách profile từ env, lọc rỗng cho chắc
        this.profileIds = (envConfig.PROFILE_IDS || []).filter(
            (id) => typeof id === "string" && id.trim().length > 0
        );

        if (!this.profileIds.length) {
            throw new Error(
                'PROFILE_IDS rỗng. Cần cấu hình PROFILE_IDS=["id1","id2"] trong .env'
            );
        }

        const fromEnv = envConfig.MAX_WORKERS || 1;
        this.maxWorkers = Math.max(
            1,
            Math.min(fromEnv, this.profileIds.length)
        );

        logger.info(
            `🚀 ProfilePool MAX_WORKERS=${this.maxWorkers}, tổng PROFILE_IDS=${this.profileIds.length}`
        );
    }

    /** Khởi tạo N agent đầu tiên (N = maxWorkers) */
    public async init(): Promise<void> {
        const activeProfiles: string[] = this.profileIds.slice(0, this.maxWorkers);

        let idx = 1;
        for (const profileId of activeProfiles) {
            const agentId = `agent-${idx++}`;

            logger.info(
                `🔌 Khởi tạo ${agentId} với profile ${profileId.substring(0, 8)}...`
            );

            try {
                const webAgent: WebAgent = await initWeb(agentId, profileId);
                const poolAgent: PoolAgent = {
                    ...webAgent,
                    busy: false,
                    profileId,
                };
                this.agents.push(poolAgent);
            } catch (err: any) {
                logger.error(
                    `❌ Lỗi khởi tạo ${agentId} (${profileId}): ${err.message}`
                );
            }
        }

        if (!this.agents.length) {
            throw new Error("Không khởi tạo được agent nào trong ProfilePool");
        }
    }

    /** Lấy 1 agent rảnh; nếu bận hết thì chờ */
    public async acquire(): Promise<PoolAgent> {
        const free = this.agents.find((a) => !a.busy);
        if (free) {
            free.busy = true;
            return free;
        }

        return new Promise<PoolAgent>((resolve) => {
            this.waitQueue.push((agent) => {
                agent.busy = true;
                resolve(agent);
            });
        });
    }

    /** Trả agent về pool và gọi tiếp job hàng đợi (nếu có) */
    public release(agentId: string): void {
        const agent = this.agents.find((a) => a.agentId === agentId);
        if (!agent) return;

        agent.busy = false;

        const next = this.waitQueue.shift();
        if (next) {
            const free = this.agents.find((a) => !a.busy);
            if (free) {
                next(free);
            }
        }
    }

    /** Đóng toàn bộ browser khi shutdown */
    public async shutdown(): Promise<void> {
        for (const agent of this.agents) {
            try {
                await agent.browser.close();
            } catch {
                // ignore
            }
        }
    }
}
