import { Router } from "express";
import { createKeywords, getAllKeywords } from "../controllers/keyword.controller.js";

const router: Router = Router();

router.get("/", getAllKeywords);
router.get("/create-keyword", createKeywords);

export default router;