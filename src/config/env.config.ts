// src/config/env.config.ts
import dotenv from "dotenv";

dotenv.config();

function parseProfileIds(raw?: string): string[] {
    if (!raw) return [];

    try {
        const arr = JSON.parse(raw);
        if (!Array.isArray(arr)) return [];

        return arr
            .filter((v) => typeof v === "string")
            .map((v: string) => v.trim())
            .filter((v) => v.length > 0);
    } catch (err) {
        console.error(
            "Không parse được PROFILE_IDS: PROFILE_IDS trong .env phải là JSON array, ví dụ:",
            'PROFILE_IDS=["bf152507-e6a0-4d7a-90ce-32a76a393a0a","xxxx-yyyy"]'
        );
        return [];
    }
}

const PROFILE_IDS = parseProfileIds(process.env.PROFILE_IDS);
const MAX_WORKERS = Number(process.env.MAX_WORKERS ?? "1") || 1;

export const envConfig = {
    MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017",
    MONGO_DB_NAME: process.env.MONGO_DB_NAME || "sls_data",
    MONGO_COLLECTION_KEYWORD: process.env.MONGO_COLLECTION_KEYWORD,
    GPM_URL: process.env.GPM_URL || "http://localhost:16137",
    ORG_ID: process.env.ORG_ID,
    PROFILE_IDS,
    MAX_WORKERS,
};
