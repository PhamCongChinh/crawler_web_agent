import mongoose, { Schema, Document, Model } from "mongoose";
import { BaseModel, BaseSchema, type IBaseDocument } from "./base.model.js";

export interface IKeyword extends IBaseDocument {
  keyword: string;
  url: string;
  url_news: string;
  org_name: string;
}

// 🧱 Schema cho Mongoose
const keywordSchema = new Schema<IKeyword>(
  {
    ...BaseSchema.obj, // kế thừa field deleted
    keyword: { type: String, required: true, unique: true },
    url: { type: String, default: "" },
    url_news: { type: String, default: "" },
    org_name: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// 📦 Tạo Mongoose model
export const Keyword = mongoose.model<IKeyword>("web_keywords", keywordSchema);

export class KeywordModel extends BaseModel<IKeyword> {
  
  constructor() {
    super(Keyword);
  }

  /**
   * 🔍 Tìm từ khóa theo tên
   */
  async findByKeyword(keyword: string): Promise<IKeyword | null> {
    return await Keyword.findOne({ keyword }).exec();
  }

  static async findByOrgName() {
    try {
      return await Keyword.find({ org_name: "T&T" }).lean();
    } catch (error: any) {
      throw new Error(error);
    }
  }

  /**
   * 🔎 Tìm từ khóa chưa có trong Article
   */
//   async findKeywordWithoutUrl(): Promise<IKeyword[]> {
//     try {
//       const articleKeywords = await ArticleModel.model.distinct("keyword");
//       const keywordsNotInArticles = await Keyword.find({
//         keyword: { $nin: articleKeywords },
//       }).exec();
//       return keywordsNotInArticles;
//     } catch (error: any) {
//       logger.error(`Error fetching keywords not in articles: ${error.message}`);
//       throw error;
//     }
//   }

  /**
   * 🏢 Tìm theo tên tổ chức trong config
   */
//   async findByOrgName(): Promise<IKeyword[]> {
//     try {
//       return await Keyword.find({ org_name: botConfig.ORG_NAME }).lean().exec();
//     } catch (error: any) {
//       throw new Error(error);
//     }
//   }

  /**
   * 🛠️ Cập nhật toàn bộ org_name (thường dùng để đồng bộ)
   */
//   async updateOrg(): Promise<void> {
//     try {
//       const res = await Keyword.updateMany({}, { $set: { org_name: "T&T" } });
//       logger.info(`Updated org_name for ${res.modifiedCount} keywords`);
//     } catch (error: any) {
//       logger.error(`Error updating org_name: ${error.message}`);
//       throw error;
//     }
//   }

  /**
   * 🔗 Cập nhật url và url_news cho từ khóa
   */
//   async updateUrl(
//     keyword: string,
//     url: string,
//     url_news: string
//   ): Promise<void> {
//     try {
//       const res = await Keyword.updateOne(
//         { keyword },
//         { $set: { url, url_news } }
//       );
//       logger.info(`Updated url for keyword ${keyword}`);
//     } catch (error: any) {
//       logger.error(`Error updating URL for ${keyword}: ${error.message}`);
//       throw error;
//     }
//   }
}

export default KeywordModel;
