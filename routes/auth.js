import express from "express";
import {
  signup,
  login,
} from "../controllers/authController.js";
import auth from "../middleware/auth.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", auth, async (req, res) => {
  res.json({
    message: "인증 성공",
    user: req.user,
  });
});
export default router;