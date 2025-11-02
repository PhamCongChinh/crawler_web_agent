import mongoose, { Schema } from "mongoose";
import { BaseModel, type IBaseDocument } from "./base.model.js";

export interface IKeywordCore extends IBaseDocument {
  keyword: string;
  org_id: number;
}

const keywordCoreSchema = new Schema<IKeywordCore>({
  keyword: { type: String, required: true, unique: true },
  org_id: { type: Number, required: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export const KeywordCore = mongoose.model("KeywordCore", keywordCoreSchema, "keyword");

class KeywordCoreModel extends BaseModel<IKeywordCore> {

    static model = KeywordCoreModel;

    constructor() {
        super(KeywordCore);
    }

    static async getKeywordsByOrgId (orgs_id: number[]) {
        try {
            return await KeywordCore.find({ org_id: { $in: orgs_id} }).select("keyword org_id").lean();
        } catch (error: any) {
            throw new Error(error);
        }
    }

}

export default KeywordCoreModel