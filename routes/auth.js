import express from "express";
import {
  signup,
  login,
  deleteAccount,
  updateProfile,
  verifyPassword,
  changePassword,
  exportMyData,
} from "../controllers/authController.js";
import auth from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "사용자를 찾을 수 없습니다.",
      });
    }

    res.json({
      message: "인증 성공",
      user,
    });
  } catch (error) {
    console.error("회원정보 조회 실패:", error);

    res.status(500).json({
      message: "회원정보를 불러오지 못했습니다.",
    });
  }
});

router.put("/me", auth, updateProfile);
router.post(
  "/verify-password",
  auth,
  verifyPassword
);

router.put(
  "/password",
  auth,
  changePassword
);
router.get(
  "/export",
  auth,
  exportMyData
);

router.delete(
  "/delete-account",
  auth,
  deleteAccount
);

export default router;