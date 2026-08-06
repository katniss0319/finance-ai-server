import express from "express";
import { chat } from "../controllers/chatController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, chat);

export default router;