
import { GoogleGenAI } from "@google/genai";
import { SalesReportData, CalculationResult } from "../types";

export const generateCoachingReport = async (data: SalesReportData, results: CalculationResult): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  // Extract top selling items for context
  const allItems = data.categories.flatMap(c => c.items).filter(i => i.qty > 0);
  const topItems = [...allItems].sort((a, b) => b.qty - a.qty).slice(0, 5);
  const topItemsText = topItems.map(i => `${i.name}(${i.qty}개)`).join(", ");

  const prompt = `
너는 홍콩반점(캄보디아 매장, 통화 USD)의 “매출 코치 AI”다.
아래 데이터를 바탕으로 점주가 바로 행동할 수 있는 “짧고 명확한 데일리 코칭 리포트”를 작성하라.

[데이터 요약]
- 매출: POS $${data.posSales} (계산액 $${results.calcSales})
- 오차: $${results.gapUsd} (${results.status})
- 지표: 주문 ${data.orders}건, 방문 ${data.visitCount}명, 객단가 $${results.aov}, 전환율 ${results.conversionRate}%
- 토핑: 주문당 ${results.addonPerOrder}개
- 현황: ${topItemsText}
- 월 목표: $${data.monthlyTarget}, 누적: $${data.mtdSales}, 잔여: $${data.monthlyTarget - data.mtdSales - results.calcSales}
- 메모: ${data.note || '없음'}

[중요 규칙]
- 통화 단위는 반드시 USD로 표기.
- 숫자는 반올림하여 간결하게.
- 인사말, 감탄, 서술형 설명 절대 금지.
- 각 섹션 최대 2~3줄.
- “숫자 + 행동 지시” 위주로 작성.

[출력 형식 - 반드시 이 구조만 사용]
1) 오늘 요약 (매출, 객단가, 전환율 위주 성과 요약)
2) 핵심 포인트 (잘한 점/아쉬운 점 중 2개, 각 1줄, 숫자 포함)
3) 월 목표 관점 (남은 목표액 대비 현재 페이스 진단 및 한 줄 조언)
4) 내일 액션 플랜 (객단가/전환율 개선을 위한 메뉴명 + 추가 목표 수량 4~6개)
5) 실행 체크리스트 (3줄, 매우 구체적인 현장 행동 지침)
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "리포트를 생성할 수 없습니다.";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return "통신 오류 발생. 데이터를 다시 확인해주세요.";
  }
};
