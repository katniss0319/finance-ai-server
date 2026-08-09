import express from "express";
import auth from "../middleware/auth.js";

import {
  compareAnalysis,
  getCompareHistory,
} from "../controllers/compareController.js";

const router = express.Router();

// 비교 실행
router.post("/", auth, compareAnalysis);

// 비교 내역 조회
router.get("/history", auth, getCompareHistory);

export default router;