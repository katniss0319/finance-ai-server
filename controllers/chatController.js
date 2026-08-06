import { chatWithAI } from "../services/openaiService.js";

export const chat = async (req, res) => {
  try {
    const { message } = req.body;

    const answer = await chatWithAI(message);

    res.json({
      answer,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "AI 상담 실패",
    });
  }
};