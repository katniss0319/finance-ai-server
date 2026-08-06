import fs from "fs";
import path from "path";
import pdf from "pdf-parse/lib/pdf-parse.js";

import Analysis from "../models/Analysis.js";
import { analyzeContract, analyzeContractImage, } from "../services/openaiService.js";

export const uploadAnalysis = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "파일이 없습니다.",
      });
    }

    const ext = path
      .extname(req.file.originalname)
      .toLowerCase();

    let contractText = "";

    // =====================
    // PDF
    // =====================

    if (ext === ".pdf") {
      const buffer = fs.readFileSync(req.file.path);

      const data = await pdf(buffer);

      contractText = data.text;
    }

    // =====================
    // JPG / PNG
    // =====================

    else if (
      ext === ".jpg" ||
      ext === ".jpeg" ||
      ext === ".png"
    ) {
      // 이미지 경로를 그대로 GPT Vision에 전달
      contractText = req.file.path;
    }

    else {
      return res.status(400).json({
        message: "지원하지 않는 파일 형식입니다.",
      });
    }

    // =====================
    // GPT 분석
    // =====================

    let result;

if (ext === ".pdf") {
  result = await analyzeContract(contractText);
} else {
  result = await analyzeContractImage(req.file.path);
}
    // =====================
    // DB 저장
    // =====================

    const analysis = await Analysis.create({
      user: req.user.userId,

      fileName: req.file.originalname,

      summary: result.summary,

      risks: result.risks,

      advantages: result.advantages,

      recommendation: result.recommendation,

      riskScore: result.riskScore,
    });

    res.status(200).json(analysis);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "계약서 분석 실패",
    });
  }
};