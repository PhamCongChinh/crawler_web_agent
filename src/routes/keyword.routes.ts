import { Router } from "express";
import { getAllKeywords } from "../controllers/keyword.controller.js";

const router: Router = Router();

router.get("/", getAllKeywords);

export default router;