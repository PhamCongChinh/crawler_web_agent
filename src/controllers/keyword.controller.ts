import KeywordModel from "../models/keyword.model.js";
import type { Request, Response } from "express";

const keywordModel = new KeywordModel();

export const getAllKeywords = async (req: Request, res: Response) => {
    try {
        const data = await keywordModel.findAll();
        res.status(200).json(data);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
