import express from "express";
import Dictionary from "../models/Dictionary.js";

const router = express.Router();

// 전체 용어
router.get("/", async (req, res) => {
  try {
    const terms = await Dictionary.find()
      .sort({ term: 1 });

    res.json(terms);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "금융 용어를 불러오지 못했습니다.",
    });
  }
});

// 용어 검색
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q?.trim()) {
      return res.json([]);
    }

    const terms = await Dictionary.find({
      $or: [
        { term: { $regex: q, $options: "i" } },
        { summary: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
      ],
    }).sort({ term: 1 });

    // 검색량 증가
    await Dictionary.updateMany(
      {
        _id: {
          $in: terms.map((item) => item._id),
        },
      },
      {
        $inc: {
          searchCount: 1,
        },
      }
    );

    res.json(terms);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "검색에 실패했습니다.",
    });
  }
});

// 인기 용어
router.get("/popular", async (req, res) => {
  try {
    const terms = await Dictionary.find()
      .sort({
        searchCount: -1,
        views: -1,
      })
      .limit(5);

    res.json(terms);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "인기 용어를 불러오지 못했습니다.",
    });
  }
});

// 용어 상세
router.get("/:id", async (req, res) => {
  try {
    const term = await Dictionary.findById(req.params.id);

    if (!term) {
      return res.status(404).json({
        message: "용어를 찾을 수 없습니다.",
      });
    }

    await Dictionary.findByIdAndUpdate(
      req.params.id,
      {
        $inc: { views: 1 },
      }
    );

    res.json(term);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "용어를 불러오지 못했습니다.",
    });
  }
});

export default router;