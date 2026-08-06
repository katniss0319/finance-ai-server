import express from "express";
import upload from "../middleware/upload.js";
import auth from "../middleware/auth.js";
import { uploadAnalysis } from "../controllers/analysisController.js";

const router = express.Router();

router.post(
  "/upload",
  auth,
  upload.single("file"),
  uploadAnalysis
);

export default router;