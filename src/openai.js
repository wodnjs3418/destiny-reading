// OpenAI GPT-4o API Service
// 사주 분석 AI 서비스
// API 키는 서버사이드 (Vercel Serverless Function)에서 안전하게 처리됩니다

/**
 * GPT-4o를 사용해서 맞춤형 사주 분석을 생성합니다
 * Vercel Serverless Function을 통해 안전하게 API 호출
 * @param {Object} birthData - 생년월일시 정보
 * @param {Object} analysis - 기본 사주 계산 결과
 * @returns {Promise<string>} AI 분석 결과
 */
export async function generateSajuAnalysis(birthData, analysis) {
  try {
    // 로컬 개발 vs 프로덕션 환경 구분
    const apiUrl = import.meta.env.DEV
      ? '/api/analyze'  // 로컬에서는 Vite proxy 사용
      : '/api/analyze'; // 프로덕션에서는 Vercel serverless

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ birthData, analysis })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    const data = await response.json();
    return data.analysis;
  } catch (error) {
    console.error('AI Analysis Error:', error);
    throw error;
  }
}

/**
 * 한국어로 사주 분석을 생성합니다 (추후 구현)
 */
export async function generateSajuAnalysisKorean(birthData, analysis) {
  // 한국어 버전은 추후 서버리스 함수에 추가 예정
  return generateSajuAnalysis(birthData, analysis);
}
