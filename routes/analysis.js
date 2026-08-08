import express from "express";
import upload from "../middleware/upload.js";
import auth from "../middleware/auth.js";

import {
  uploadAnalysis,
  getMyAnalyses,
  getAnalysisById,
  deleteAnalyses,
} from "../controllers/analysisController.js";

const router = express.Router();

router.get("/", auth, getMyAnalyses);
router.get("/:id", auth, getAnalysisById);
router.delete("/", auth, deleteAnalyses);

router.post(
  "/upload",
  auth,
  upload.single("file"),
  uploadAnalysis
);
export default router;