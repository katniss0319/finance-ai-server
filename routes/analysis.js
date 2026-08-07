import express from "express";
import upload from "../middleware/upload.js";
import auth from "../middleware/auth.js";

import {
  uploadAnalysis,
  getMyAnalyses,
  getAnalysisById,
} from "../controllers/analysisController.js";

const router = express.Router();

router.get("/", auth, getMyAnalyses);
router.get("/:id", auth, getAnalysisById);

router.post(
  "/upload",
  auth,
  upload.single("file"),
  uploadAnalysis
);
export default router;