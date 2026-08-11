import express from "express";
import Favorite from "../models/Favorite.js";
import Dictionary from "../models/Dictionary.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();


// ========================================
// 즐겨찾기 추가
// ========================================

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { dictionaryId } = req.body;

    const userId = req.user.id;

    if (!dictionaryId) {
      return res.status(400).json({
        message: "dictionaryId가 필요합니다.",
      });
    }

    const existing = await Favorite.findOne({
      userId,
      dictionaryId,
    });

    if (existing) {
      return res.status(409).json({
        message: "이미 즐겨찾기한 용어입니다.",
      });
    }

    const favorite = await Favorite.create({
      userId,
      dictionaryId,
    });

    await Dictionary.findByIdAndUpdate(
      dictionaryId,
      {
        $inc: {
          favoriteCount: 1,
        },
      }
    );

    res.status(201).json({
      message: "즐겨찾기에 추가되었습니다.",
      favorite,
    });

  } catch (error) {
    console.error("즐겨찾기 추가 실패:", error);

    res.status(500).json({
      message: "즐겨찾기 추가에 실패했습니다.",
    });
  }
});


// ========================================
// 즐겨찾기 삭제
// ========================================

router.delete("/:dictionaryId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { dictionaryId } = req.params;

    const favorite = await Favorite.findOneAndDelete({
      userId,
      dictionaryId,
    });

    if (!favorite) {
      return res.status(404).json({
        message: "즐겨찾기를 찾을 수 없습니다.",
      });
    }

    await Dictionary.findByIdAndUpdate(
      dictionaryId,
      {
        $inc: {
          favoriteCount: -1,
        },
      }
    );

    res.json({
      message: "즐겨찾기가 삭제되었습니다.",
    });

  } catch (error) {
    console.error("즐겨찾기 삭제 실패:", error);

    res.status(500).json({
      message: "즐겨찾기 삭제에 실패했습니다.",
    });
  }
});


// ========================================
// 내 즐겨찾기 목록
// ========================================

router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const favorites = await Favorite.find({
      userId,
    })
      .populate("dictionaryId")
      .sort({
        createdAt: -1,
      });

    res.json(favorites);

  } catch (error) {
    console.error("즐겨찾기 조회 실패:", error);

    res.status(500).json({
      message: "즐겨찾기를 불러오지 못했습니다.",
    });
  }
});


// ========================================
// 특정 용어의 즐겨찾기 여부
// ========================================

router.get(
  "/check/:dictionaryId",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { dictionaryId } = req.params;

      const favorite = await Favorite.findOne({
        userId,
        dictionaryId,
      });

      res.json({
        favorite: !!favorite,
      });

    } catch (error) {
      console.error(
        "즐겨찾기 상태 확인 실패:",
        error
      );

      res.status(500).json({
        message: "즐겨찾기 상태를 확인하지 못했습니다.",
      });
    }
  }
);

export default router;