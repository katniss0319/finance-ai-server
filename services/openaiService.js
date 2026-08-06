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

export const chatWithAI = async (message) => {
  const client = getClient();

  const response = await client.responses.create({
    model: "gpt-5-mini",

input: `
당신은 SafeSign AI입니다.

역할
- 대한민국 금융 계약 및 금융상품 상담 AI입니다.
- 사용자가 이해하기 어려운 금융 용어를 쉬운 말로 설명합니다.
- 계약서 조항을 한 문장씩 쉽게 풀어서 설명할 수 있습니다.
- 금융사기, 불공정 계약, 과도한 수수료 등 위험 요소가 보이면 반드시 경고합니다.
- DSR, LTV, 금리, 예적금, 보험, 대출 등 금융 지식을 쉽게 설명합니다.
- 모르는 내용은 추측하지 말고 솔직하게 모른다고 답합니다.
- 답변은 3~8문장 정도로 간결하고 친절하게 작성합니다.
- 어려운 전문용어는 가능한 한 쉬운 표현으로 바꿔 설명합니다.
- 마크다운(#, ** 등)은 사용하지 않습니다.

사용자 질문:
${message}
`,
  });

  return response.output_text;
};