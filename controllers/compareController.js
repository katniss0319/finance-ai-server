import Analysis from "../models/Analysis.js";
import OpenAI from "openai";
import { compareContracts } from "../services/openaiService.js";
import CompareHistory from "../models/CompareHistory.js";

export const compareAnalysis = async (req, res) => {
  try {
    const { analysisIds } = req.body;

    if (!analysisIds || analysisIds.length < 2) {
      return res.status(400).json({
        message: "비교할 계약서를 2개 이상 선택하세요.",
      });
    }

    const analyses = await Analysis.find({
  _id: { $in: analysisIds },
  user: req.user.userId,
});

    if (analyses.length !== analysisIds.length) {
      return res.status(404).json({
        message: "계약서를 찾을 수 없습니다.",
      });
    }
const getValue = (item, labels) => {
  const list = Array.isArray(labels) ? labels : [labels];

  const found = item.keyInfo?.find((v) =>
    list.some((label) => v.label.includes(label))
  );

  return found?.value || "";
};
const compareData = analyses.map((item) => ({
  product: getValue(item, "상품명") || item.fileName,

  organization: getValue(item, [
    "기관명",
    "보험사",
    "은행",
    "카드사",
    "증권사",
  ]),

  contractType: getValue(item, "계약종류"),

  keyInfo: item.keyInfo,

  risks: item.risks,

  advantages: item.advantages,

  recommendation: item.recommendation,
}));

const result = await compareContracts(compareData);
await CompareHistory.create({
  user: req.user.userId,

  contractType: compareData[0].contractType,

  products: compareData.map((item, index) => ({
    analysisId: analyses[index]._id,

    product: item.product,

    organization: item.organization,
  })),

  winner: result.winner.product,

  result,
});
return res.json(result);    
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "비교 실패",
    });
  }
};
export const getCompareHistory = async (req, res) => {
  try {
    const history = await CompareHistory.find({
      user: req.user.userId,
    }).sort({ createdAt: -1 });

    res.json(history);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "비교내역 조회 실패",
    });
  }
};