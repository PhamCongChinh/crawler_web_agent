import axios from "axios";
import logger from "../config/logger.config.js";
import { ROOT_URL } from "../constants/index.js";

import dotenv from "dotenv";
dotenv.config();

export const handleAfterCrawlContent = async (listArticleContent: any) => {
    try {
        const resApi = await postArticle(listArticleContent);
    } catch (error: any) {
        logger.error(`Lỗi trong quá trình insert hoặc post API ${JSON.stringify(error.stack, null, 2)}`);
    }
};

export const postArticle = async (listArticle: any) => {
    try {
        const listArticleWithoutId = listArticle.map((article: any) => {
            const doc = typeof article.toJSON === 'function' ? article.toJSON() : article;
            const { _id, ...rest } = doc;
            if (!doc || Object.keys(doc).length === 0) return null;
            // return {
            //     ...rest,
            //     '@timestamp': new Date().toISOString()
            // };
            return {
                ...rest
            };
        }).filter(Boolean);
        if (!listArticleWithoutId || listArticleWithoutId.length === 0) {
            logger.warn("Không có bài viết hợp lệ, bỏ qua gửi request.");
            return null;
        }
        const data = {
            upsert: true,
            index: 'not_classify_org_posts',
            data: listArticleWithoutId
        };
        try {
            const res = await axios.post(ROOT_URL, data);
            logger.info(`[SUCCESS] Gửi dữ liệu thành công: ${data.data.length} bài viết - ${process.env.URL_API_MASTER}`);
            return res.data;
        } catch (error: any) {
            logger.error(`[ERROR] Lỗi khi gửi dữ liệu: [postArticle]}`);
            return null;
        }
    } catch (error: any) {
        throw new Error(error);
    }
};