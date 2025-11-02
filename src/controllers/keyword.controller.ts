import KeywordModel from "../models/keyword.model.js";
import type { Request, Response } from "express";
import createKeyword from "../modules/createKeyword/index.js";

const keywordModel = new KeywordModel();

export const getAllKeywords = async (req: Request, res: Response) => {
    try {
        const data = await keywordModel.findAll();
        res.status(200).json(data);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createKeywords = async (req: Request, res: Response) => {
    try {
        await createKeyword()
        res.status(200).json({"Tao": "Thanh cong"});
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}
