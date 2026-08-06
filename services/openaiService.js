import fs from "fs";
import OpenAI from "openai";

const getClient = () => {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
};

const SYSTEM_PROMPT = `
당신은 대한민국 금융 계약서를 분석하는 전문가입니다.

반드시 JSON 객체만 반환하세요.
설명, 코드블록, 마크다운은 절대 포함하지 마세요.

{
  "summary":"",
  "risks":[],
  "advantages":[],
  "recommendation":"",
  "riskScore":0
}
`;

// ============================
// PDF(텍스트) 분석
// ============================

export const analyzeContract = async (contractText) => {
  const client = getClient();
  const response = await client.responses.create({
    model: "gpt-5-mini",

    input: `
${SYSTEM_PROMPT}

계약서 내용:

${contractText}
    `,
  });

  return JSON.parse(response.output_text);
};

// ============================
// 이미지(JPG/PNG) 분석
// ============================

export const analyzeContractImage = async (imagePath) => {
  const client = getClient();
  
  const base64 = fs.readFileSync(imagePath, {
    encoding: "base64",
  });

  const response = await client.responses.create({
    model: "gpt-5-mini",

    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: SYSTEM_PROMPT,
          },
          {
            type: "input_image",
            image_url: `data:image/png;base64,${base64}`,
          },
        ],
      },
    ],
  });

  return JSON.parse(response.output_text);
};