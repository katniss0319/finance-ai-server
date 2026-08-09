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
모든 응답은 반드시 한국어로 작성하세요.

영어를 절대 사용하지 마세요.

{
  "summary":[
  ""
],
  "risks":[
  {
"title":"",
"description":""
}],
  "advantages":[],
  "recommendation":"",
  "riskScore":0,

  "keyInfo":[
    {
      "label":"",
      "value":""
    }
  ],

  "checklist":[
    ""
  ],

  "easyExplanation":{
    "title":"",
    "original":"",
    "translated":""
  }
}
  계약서 종류를 먼저 판단하세요.

keyInfo에는 기관명, 상품명, 계약종류를 반드시 포함하세요.

그 외 계약 종류에 따라 핵심 정보를 추가하여
최종 keyInfo는 6~9개 항목으로 작성하세요.
기관명은 계약을 제공하는 회사명 또는 금융기관명을 의미합니다.

예시

보험 → 메리츠화재, 삼성화재
은행 → KB국민은행, 신한은행
카드 → 현대카드, 신한카드
증권 → 미래에셋증권

기관명이 계약서에 명시되어 있다면 반드시 keyInfo에 포함하세요.
상품명은 계약서 상단에 기재된 정식 상품명을 그대로 사용하세요.
계약종류는 다음과 같이 일반적인 종류만 작성하세요.

보험
대출
신용카드
체크카드
예금
적금
증권
펀드
리스
렌탈
{
  "label":"항목명",
  "value":"내용"
}

예시)
대출 계약서
- 대출금액
- 금리
- 계약기간
- 상환방식

보험 계약서
- 보험료
- 보장기간
- 면책기간
- 보험금

예금/적금
- 가입금액
- 금리
- 만기일
- 이자지급방식

계약 종류에 따라 적절한 항목을 선택하세요.
항목명은 절대로 고정하지 마세요.

summary는 반드시 3~5개의 핵심 내용을 배열로 작성하세요.

예시

[
 "...",
 "...",
 "..."
]

keyInfo.value는 최대 25자 이내로 작성하세요.

쉼표(,)로 여러 내용을 나열하지 마세요.

핵심 키워드만 작성하세요.

좋은 예시

보험료
월 32,000원

보장기간
1년(자동갱신)

금리
연 3.4%

보장한도
연 750만원

나쁜 예시

고급형, 기본형, 실속형에 따라 통원의료비...
(긴 설명 절대 금지)
keyInfo는 비교 페이지에 표시되는 정보입니다.

긴 설명이 아니라 한눈에 비교 가능한 정보만 작성하세요.

각 value는 짧고 명확해야 합니다.

original은
계약서 원문 전체가 아니라

AI 설명에 필요한 핵심 조항만
1~3문장 발췌하세요.
easyExplanation의 translated는 초등학생도 이해할 수 있는 쉬운 한국어로 작성하세요.
easyExplanation.title은
설명할 조항의 제목을 작성하세요.

절대로
'쉬운 설명',
'초등학생도 알기 쉬운 요약',
'쉽게 설명',
'AI 쉬운 설명'
같은 일반적인 제목을 작성하지 마세요.

좋은 예시

- 중도상환수수료는 언제 내나요?
- 면책기간이란 무엇인가요?
- 보험금을 받을 수 없는 경우
- 자기부담금 계산 방법
- 자동갱신 시 주의사항

recommendation은 반드시 1~2문장으로 작성하세요.
최대 70자 이내로 작성하세요.
가입 전에 가장 중요한 조언 하나만 알려주세요.
장황한 설명은 절대 하지 마세요.

계약 체결 전에 반드시 확인해야 하는 사항을
3~6개 checklist 배열에 작성하세요.

사용자가 직접 확인해야 하는 질문 형태로 작성하세요.

예시

- 중도상환수수료를 확인했나요?
- 자동갱신 여부를 확인했나요?
- 해지 시 불이익을 확인했나요?

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
// ============================
// 챗봇
// ============================
export const chatWithAI = async (message) => {
  const client = getClient();

  const response = await client.responses.create({
    model: "gpt-5-mini",

input: `
당신은 SafeSign AI입니다.

반드시 한국 금융위원회·금융감독원 기준을 우선한다.

전문용어가 나오면
① 한 줄 요약
② 쉬운 설명
③ 예시
④ 주의사항

순서대로 답변한다.

계약서를 질문하면
위험요소도 같이 설명한다.

금융과 무관한 질문은
"금융 관련 질문만 답변할 수 있습니다."
라고 답한다.

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
// ============================
// 비교
// ============================
export const compareContracts = async (compareData) => {
  const client = getClient();

  const response = await client.responses.create({
    model: "gpt-5-mini",

    input: `
당신은 대한민국 금융상품 비교 전문가입니다.

반드시 JSON 객체만 반환하세요.
설명, 코드블록, 마크다운은 절대 포함하지 마세요.
모든 응답은 반드시 한국어로 작성하세요.

입력으로 여러 개의 같은 종류 금융계약 분석 결과가 제공됩니다.

계약 종류가 서로 다르면

{
  "error":"같은 종류의 계약서만 비교할 수 있습니다."
}

만 반환하세요.

각 상품을 비교하여 가장 추천하는 상품을 선택하세요.
winner.score는 반드시 1~5 사이의 정수입니다.
절대로 6 이상을 반환하지 마세요.
잘못된 예시

22
9
100

올바른 예시

1
2
3
4
5

평가 기준은

- 보장범위
- 보험료
- 자기부담금
- 보장기간
- 면책기간
- 금리
- 상환방식
- 수수료
- 연회비

등 실제 존재하는 항목만 사용하세요.

점수는 1~5점 정수입니다.

이유는 최대 50자입니다.

반드시 아래 JSON만 반환하세요.

{
  "winner":{
    "product":"",
    "score":0,
    "reason":""
  },

  "comparisons":[
    {
      "title":"",
      "products":[
        {
          "product":"",
          "score":0
        }
      ],
      "reason":""
    }
  ],

  "overall":""
}
비교 데이터

${JSON.stringify(compareData)}
`,
  });

  return JSON.parse(response.output_text);
};