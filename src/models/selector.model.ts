// src/models/selectorModel.ts
import mongoose, { Schema, Document, Model } from "mongoose";
import { BaseModel, BaseSchema, type IBaseDocument } from "./base.model.js";

/** 1️⃣ Interface */
export interface ISelector extends IBaseDocument {
  urlSource: string;
  contentSelector: string;
  timeSelector: string;
  titleSelector: string;
}

/** 2️⃣ Schema */
const selectorSchema = new Schema<ISelector>(
  {
    ...BaseSchema.obj, // kế thừa deleted
    urlSource: { type: String, required: true, unique: true },
    contentSelector: { type: String, required: true },
    timeSelector: { type: String, required: true },
    titleSelector: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

/** 3️⃣ Mongoose Model */
export const Selector: Model<ISelector> = mongoose.model<ISelector>(
  "web_selectors",
  selectorSchema
);

/** 4️⃣ Class SelectorModel */
export class SelectorModel extends BaseModel<ISelector> {
  constructor() {
    super(Selector);
  }

    static async findAll(): Promise<any> {
        try {
            return await Selector.find().lean().exec();
        } catch (error: any) {
            throw new Error(error.message || "Failed to fetch selectors");
        }
    }
  /** 🔹 Chuyển tất cả urlSource thành https nếu chưa có */
  async createHttp(): Promise<void> {
    try {
      const listSelector = await this.findAll({});
      let index = 0;

      for (const selector of listSelector) {
        if (!selector.urlSource.startsWith("http")) {
          index++;
          await this.model
            .updateOne(
              { _id: selector._id },
              { urlSource: "https://" + selector.urlSource }
            )
            .exec();
        }
      }

      console.log("Updated", index);
    } catch (error: any) {
      console.log(error.stack || error.message);
    }
  }

  /** 🔹 Lấy danh sách urlSource */
  async findAllUrlSource(): Promise<string[]> {
    try {
      const list = await this.model.find({}).select("urlSource -_id").lean();
      return list.map((s) => s.urlSource);
    } catch (error: any) {
      console.log(error.stack || error.message);
      return [];
    }
  }
}
