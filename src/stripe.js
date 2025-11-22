// Stripe Configuration
// 스트라이프 설정

import { loadStripe } from '@stripe/stripe-js';

// ⚠️ 실제 배포 시 환경변수로 관리하세요!
// 테스트 모드 키 (pk_test_...)를 여기에 넣으세요
// 실제 모드 키 (pk_live_...)는 프로덕션에서만 사용
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_KEY || 'pk_test_YOUR_KEY_HERE';

// Stripe 인스턴스 로드
let stripePromise = null;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

// 상품 정보
export const PRODUCT = {
  name: 'Lumina Destiny Reading',
  description: 'Complete Four Pillars of Destiny Analysis - 15 Page PDF Report',
  price: 599, // cents ($5.99)
  currency: 'usd',
  image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400'
};

// Stripe Checkout 세션 생성 (백엔드 없이 Payment Links 사용)
// 실제 프로덕션에서는 백엔드 서버가 필요합니다
export const createCheckoutSession = async (customerEmail, metadata) => {
  // 백엔드 API 호출 예시:
  // const response = await fetch('/api/create-checkout-session', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ customerEmail, metadata })
  // });
  // return response.json();

  // 현재는 데모 모드
  console.log('Checkout session would be created with:', { customerEmail, metadata });
  return { sessionId: 'demo_session' };
};

// 결제 성공 처리
export const handlePaymentSuccess = (sessionId) => {
  console.log('Payment successful:', sessionId);
  return true;
};

// 결제 상태 확인
export const verifyPayment = async (sessionId) => {
  // 실제로는 백엔드에서 Stripe API로 확인
  // const response = await fetch(`/api/verify-payment/${sessionId}`);
  // return response.json();

  return { paid: true };
};

/*
=== STRIPE 설정 방법 ===

1. Stripe 계정 생성: https://stripe.com

2. Dashboard에서 API 키 확인:
   - Publishable key (pk_test_... 또는 pk_live_...)
   - Secret key (sk_test_... 또는 sk_live_...)

3. 환경변수 설정:
   프로젝트 루트에 .env 파일 생성:
   ```
   VITE_STRIPE_KEY=pk_test_your_key_here
   ```

4. Stripe Payment Link 생성 (백엔드 없이 가장 쉬운 방법):
   - Stripe Dashboard > Products > Add Product
   - Price: $5.99
   - Payment Link 생성
   - 해당 링크를 버튼에 연결

5. 또는 Stripe Checkout (백엔드 필요):
   - Node.js/Express 서버 설정
   - stripe.checkout.sessions.create() 사용
   - 성공/취소 URL 설정

=== 테스트 카드 ===
카드번호: 4242 4242 4242 4242
만료일: 아무 미래 날짜
CVC: 아무 3자리
*/
