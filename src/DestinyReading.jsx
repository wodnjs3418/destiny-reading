import React, { useState, useEffect, useCallback } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { downloadPDF, generatePDFBase64 } from './pdfGenerator';
import { ELEMENT_ANALYSIS, ANIMAL_ANALYSIS, ELEMENT_QUOTES, DESTINY_PROVERBS } from './analysisContent';
import { generateSajuAnalysis } from './openai';

// PayPal 설정
const PAYPAL_SANDBOX = false; // true로 변경하면 Sandbox 모드
const PAYPAL_CLIENT_ID = PAYPAL_SANDBOX
  ? 'AZvUD5Okc-wujfd7j8NZqmhVorrKTfNEwPMA0hKQQ0gd3OK7aCSHb_uw8izQbCelkVNv4SVo6iIQ0dVS' // Sandbox
  : (import.meta.env.VITE_PAYPAL_CLIENT_ID || 'AZA5M2uG97zvYefdfuPrNjWdi5ni5xdJkjZgm2azrUX0WWeQW46Zb1VrwZi_7sZrZf1rKs98LmEriFxM'); // Live

// 오행 (Five Elements)
const ELEMENTS = {
  Wood: { color: '#2D5A3D', symbol: '木', yin: '乙', yang: '甲', traits: ['Growth', 'Creativity', 'Flexibility', 'Compassion', 'Vision'] },
  Fire: { color: '#8B2500', symbol: '火', yin: '丁', yang: '丙', traits: ['Passion', 'Leadership', 'Charisma', 'Enthusiasm', 'Joy'] },
  Earth: { color: '#8B7355', symbol: '土', yin: '己', yang: '戊', traits: ['Stability', 'Nurturing', 'Reliability', 'Patience', 'Wisdom'] },
  Metal: { color: '#C0C0C0', symbol: '金', yin: '辛', yang: '庚', traits: ['Precision', 'Determination', 'Integrity', 'Courage', 'Justice'] },
  Water: { color: '#1C3A5F', symbol: '水', yin: '癸', yang: '壬', traits: ['Intuition', 'Adaptability', 'Wisdom', 'Diplomacy', 'Mystery'] }
};

// 12지지 (Twelve Earthly Branches)
const ANIMALS = {
  Rat: { symbol: '子', element: 'Water', yin: true, hours: '23:00-01:00', traits: 'Quick-witted, resourceful, versatile' },
  Ox: { symbol: '丑', element: 'Earth', yin: false, hours: '01:00-03:00', traits: 'Diligent, dependable, determined' },
  Tiger: { symbol: '寅', element: 'Wood', yin: false, hours: '03:00-05:00', traits: 'Brave, confident, competitive' },
  Rabbit: { symbol: '卯', element: 'Wood', yin: true, hours: '05:00-07:00', traits: 'Gentle, elegant, responsible' },
  Dragon: { symbol: '辰', element: 'Earth', yin: false, hours: '07:00-09:00', traits: 'Confident, ambitious, legendary' },
  Snake: { symbol: '巳', element: 'Fire', yin: true, hours: '09:00-11:00', traits: 'Enigmatic, intelligent, wise' },
  Horse: { symbol: '午', element: 'Fire', yin: false, hours: '11:00-13:00', traits: 'Animated, active, energetic' },
  Goat: { symbol: '未', element: 'Earth', yin: true, hours: '13:00-15:00', traits: 'Calm, gentle, sympathetic' },
  Monkey: { symbol: '申', element: 'Metal', yin: false, hours: '15:00-17:00', traits: 'Sharp, smart, curious' },
  Rooster: { symbol: '酉', element: 'Metal', yin: true, hours: '17:00-19:00', traits: 'Observant, hardworking, courageous' },
  Dog: { symbol: '戌', element: 'Earth', yin: false, hours: '19:00-21:00', traits: 'Loyal, honest, faithful' },
  Pig: { symbol: '亥', element: 'Water', yin: true, hours: '21:00-23:00', traits: 'Compassionate, generous, diligent' }
};

const ANIMAL_ORDER = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
const ELEMENT_ORDER = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];

// 상생상극 (Element Relationships)
const ELEMENT_RELATIONS = {
  generates: { Wood: 'Fire', Fire: 'Earth', Earth: 'Metal', Metal: 'Water', Water: 'Wood' },
  controls: { Wood: 'Earth', Fire: 'Metal', Earth: 'Water', Metal: 'Wood', Water: 'Fire' },
  weakens: { Wood: 'Water', Fire: 'Wood', Earth: 'Fire', Metal: 'Earth', Water: 'Metal' }
};

// 성격 분석 텍스트
const PERSONALITY_READINGS = {
  Wood: {
    positive: "You possess an extraordinary capacity for growth and renewal. Like a mighty oak, you stand firm in your values while remaining flexible enough to bend without breaking. Your creative spirit sees possibilities where others see obstacles.",
    shadow: "Beware of scattering your energy across too many pursuits. Your tendency to grow in all directions may leave you feeling scattered. Learn to focus your abundant creative energy.",
    advice: "Channel your natural creativity into a singular vision. Your greatest achievements will come when you commit fully to a path."
  },
  Fire: {
    positive: "Your soul burns with an inner radiance that naturally draws others to you. You possess the rare gift of inspiring enthusiasm in those around you. Your passion is your superpower—use it wisely.",
    shadow: "Guard against burning too brightly and exhausting yourself. Your intensity, while magnetic, can sometimes overwhelm those of gentler nature.",
    advice: "Learn to bank your fire when rest is needed. Your flame burns longest when you nurture it with patience."
  },
  Earth: {
    positive: "You are the mountain—steady, nurturing, and unshakeable. Others find peace in your presence, sensing your profound stability. Your wisdom comes from deep observation rather than hasty judgment.",
    shadow: "Be wary of becoming too fixed in your ways. Even mountains must shift with the ages. Stubbornness disguised as stability serves no one.",
    advice: "Embrace change as the natural way of things. Your strength lies not in resistance, but in thoughtful adaptation."
  },
  Metal: {
    positive: "You possess an extraordinary clarity of purpose. Like refined gold, you have been shaped by pressure into something pure and precious. Your determination can cut through any obstacle.",
    shadow: "Your precision can become cold perfectionism. Remember that some of life's greatest treasures are found in imperfection.",
    advice: "Temper your sharp edges with compassion. True strength includes the ability to yield when necessary."
  },
  Water: {
    positive: "You possess the wisdom of the deep ocean—vast, mysterious, and profound. Your intuition is remarkably accurate, often sensing truths that others miss entirely. Adaptability is your greatest gift.",
    shadow: "Take care not to become too fluid, losing yourself in others' currents. Your depth can sometimes isolate you from those who fear what they cannot fathom.",
    advice: "Trust your intuition but anchor yourself with purpose. Flow around obstacles rather than crashing against them."
  }
};

// 궁합 (Compatibility)
const COMPATIBILITY = {
  Rat: { best: ['Dragon', 'Monkey', 'Ox'], avoid: ['Horse', 'Goat', 'Rabbit'] },
  Ox: { best: ['Rat', 'Snake', 'Rooster'], avoid: ['Tiger', 'Dragon', 'Horse', 'Goat'] },
  Tiger: { best: ['Dragon', 'Horse', 'Pig'], avoid: ['Ox', 'Tiger', 'Snake', 'Monkey'] },
  Rabbit: { best: ['Goat', 'Pig', 'Dog'], avoid: ['Snake', 'Rooster'] },
  Dragon: { best: ['Rooster', 'Rat', 'Monkey'], avoid: ['Ox', 'Goat', 'Dog'] },
  Snake: { best: ['Dragon', 'Rooster', 'Ox'], avoid: ['Tiger', 'Rabbit', 'Snake', 'Pig'] },
  Horse: { best: ['Tiger', 'Goat', 'Rabbit'], avoid: ['Rat', 'Ox', 'Rooster', 'Horse'] },
  Goat: { best: ['Rabbit', 'Horse', 'Pig'], avoid: ['Ox', 'Tiger', 'Dog'] },
  Monkey: { best: ['Ox', 'Rabbit', 'Dragon'], avoid: ['Tiger', 'Pig'] },
  Rooster: { best: ['Ox', 'Snake', 'Dragon'], avoid: ['Rat', 'Rabbit', 'Horse', 'Rooster'] },
  Dog: { best: ['Rabbit', 'Tiger', 'Horse'], avoid: ['Dragon', 'Goat', 'Rooster'] },
  Pig: { best: ['Tiger', 'Rabbit', 'Goat'], avoid: ['Snake', 'Pig', 'Monkey'] }
};

// 10년 대운 예측
const DECADE_FORTUNES = [
  "A period of foundation-building. Focus on education, skills, and establishing your core values. The seeds planted now will bear fruit for decades.",
  "Expansion and opportunity await. Your network grows, and doors begin to open. Embrace new experiences while staying true to your path.",
  "A time of testing and refinement. Challenges reveal your true strength. What falls away was never truly yours to keep.",
  "Harvest season arrives. Past efforts now yield their rewards. Share your abundance wisely—generosity multiplies blessings.",
  "Wisdom deepens as you enter a reflective phase. Your insights become more valuable. Consider mentoring those who follow your path.",
  "Legacy takes form. Your influence extends beyond yourself. Focus on what will endure long after this moment passes."
];

export default function DestinyReading() {
  const [step, setStep] = useState('landing');
  const [birthData, setBirthData] = useState({ name: '', year: '', month: '', day: '', hour: '' });
  const [stars, setStars] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [email, setEmail] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [downloadReady, setDownloadReady] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Stripe Payment Link - 여기에 실제 Stripe Payment Link URL을 넣으세요
  const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_YOUR_LINK_HERE';

  // 결제 처리 함수
  const handlePayment = () => {
    if (!birthData.year || !birthData.month || !birthData.day) {
      alert('Please enter your birth date first to receive your personalized reading.');
      return;
    }
    // Show payment modal for real payment
    setShowPaymentModal(true);
  };

  // 이메일 전송 함수
  const sendEmailWithPDF = async (aiAnalysisText) => {
    if (!email) {
      console.log('No email provided, skipping email delivery');
      return;
    }

    try {
      const analysisForEmail = {
        element,
        animal,
        yinYang,
        monthElement,
        dayElement,
        hourAnimal,
        lifePath,
        luckyNumbers,
        luckyColors,
        luckyDirection,
        compatibility
      };

      // PDF를 Base64로 생성
      const pdfBase64 = generatePDFBase64(birthData, analysisForEmail, aiAnalysisText);

      // 이메일 전송 API 호출
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          birthData,
          analysis: analysisForEmail,
          pdfBase64
        })
      });

      if (response.ok) {
        console.log('✅ Email sent successfully to:', email);
      } else {
        const error = await response.json();
        console.error('Email sending failed:', error);
      }
    } catch (error) {
      console.error('Email sending error:', error);
      // 이메일 전송 실패해도 사용자 경험에는 영향 없음 (웹에서 이미 결과 확인 가능)
    }
  };

  // 이메일 재발송 함수
  const handleResendEmail = async () => {
    if (!resendEmail || !resendEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setIsResending(true);
    setResendSuccess(false);

    // 임시로 email state를 resendEmail로 변경하고 sendEmailWithPDF 호출
    const originalEmail = email;
    setEmail(resendEmail);

    await sendEmailWithPDF(aiAnalysis);

    setEmail(originalEmail);
    setIsResending(false);
    setResendSuccess(true);

    // 3초 후 성공 메시지 숨기기
    setTimeout(() => {
      setResendSuccess(false);
    }, 3000);
  };

  // AI 사주 분석 호출
  const fetchAIAnalysis = async () => {
    setIsLoadingAI(true);
    setAiError('');

    try {
      const analysisData = {
        element: getHeavenlyStem(parseInt(birthData.year) || 2000),
        animal: getAnimal(parseInt(birthData.year) || 2000),
        yinYang: getYinYang(parseInt(birthData.year) || 2000),
        monthElement: getMonthElement(parseInt(birthData.month) || 1),
        dayElement: getDayElement(
          parseInt(birthData.year) || 2000,
          parseInt(birthData.month) || 1,
          parseInt(birthData.day) || 1
        ),
        hourAnimal: getHourAnimal(birthData.hour),
        lifePath: calculateLifePath({
          year: parseInt(birthData.year) || 2000,
          month: parseInt(birthData.month) || 1,
          day: parseInt(birthData.day) || 1
        })
      };

      const result = await generateSajuAnalysis(birthData, analysisData);
      setAiAnalysis(result);

      // AI 분석 완료 후 이메일 전송 (백그라운드)
      sendEmailWithPDF(result);
    } catch (error) {
      console.error('AI Analysis Error:', error);
      setAiError('Failed to generate personalized analysis. Please try again.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  // 데모 결제 (테스트용)
  const processDemoPayment = async () => {
    if (!email || !email.includes('@')) {
      setPaymentError('Please enter a valid email address');
      return;
    }
    setIsProcessingPayment(true);
    setPaymentError('');

    // 시뮬레이션: 2초 후 결제 성공
    setTimeout(async () => {
      setIsProcessingPayment(false);
      setIsPaid(true);
      setShowPaymentModal(false);
      setDownloadReady(true);

      // 결제 성공 후 AI 분석 호출
      await fetchAIAnalysis();
    }, 2000);
  };

  // PDF 다운로드 함수
  const handleDownloadPDF = () => {
    const analysis = {
      element,
      animal,
      yinYang,
      monthElement,
      dayElement,
      hourAnimal,
      lifePath,
      luckyNumbers,
      luckyColors,
      luckyDirection,
      compatibility
    };

    try {
      downloadPDF(birthData, analysis, aiAnalysis);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  useEffect(() => {
    const newStars = Array.from({ length: 120 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      delay: Math.random() * 4,
      duration: Math.random() * 3 + 2
    }));
    setStars(newStars);
  }, []);

  // 결제 완료 시 자동으로 AI 분석 시작
  useEffect(() => {
    if (step === 'result' && isPaid && !aiAnalysis && !isLoadingAI && !aiError) {
      fetchAIAnalysis();
    }
  }, [step, isPaid]);

  // 결제 모달 열릴 때 배경 스크롤 잠금
  useEffect(() => {
    if (showPaymentModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showPaymentModal]);

  // 사주 계산 함수들
  const getHeavenlyStem = (year) => {
    const stems = ['Metal', 'Metal', 'Water', 'Water', 'Wood', 'Wood', 'Fire', 'Fire', 'Earth', 'Earth'];
    return stems[year % 10];
  };

  const getYinYang = (year) => year % 2 === 0 ? 'Yang' : 'Yin';

  const getAnimal = (year) => ANIMAL_ORDER[(year - 4) % 12];

  const getMonthElement = (month) => {
    const monthElements = ['Water', 'Water', 'Wood', 'Wood', 'Wood', 'Fire', 'Fire', 'Fire', 'Metal', 'Metal', 'Metal', 'Water'];
    return monthElements[month - 1];
  };

  const getDayElement = (year, month, day) => {
    const sum = year + month + day;
    return ELEMENT_ORDER[sum % 5];
  };

  const getHourAnimal = (hour) => {
    if (hour === '') return null;
    const hourNum = parseInt(hour);
    return ANIMAL_ORDER[hourNum];
  };

  const calculateLifePath = (birthData) => {
    const { year, month, day } = birthData;
    const sum = parseInt(year) + parseInt(month) + parseInt(day);
    let path = sum;
    while (path > 9) {
      path = String(path).split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
    }
    return path;
  };

  const getLuckyNumbers = (element, animal) => {
    const base = ANIMAL_ORDER.indexOf(animal) + 1;
    const elementBonus = ELEMENT_ORDER.indexOf(element) + 1;
    return [base, base + elementBonus, (base * 2) % 10 || 10, base + 8];
  };

  const getLuckyColors = (element) => {
    const colorMap = {
      Wood: ['Green', 'Teal', 'Blue'],
      Fire: ['Red', 'Orange', 'Purple'],
      Earth: ['Yellow', 'Brown', 'Beige'],
      Metal: ['White', 'Gold', 'Silver'],
      Water: ['Black', 'Navy', 'Gray']
    };
    return colorMap[element];
  };

  const getLuckyDirections = (element) => {
    const directionMap = {
      Wood: 'East',
      Fire: 'South',
      Earth: 'Center',
      Metal: 'West',
      Water: 'North'
    };
    return directionMap[element];
  };

  const handleSubmit = () => {
    console.log('🔍 [DEBUG] handleSubmit called', birthData);
    if (birthData.year && birthData.month && birthData.day) {
      console.log('🔍 [DEBUG] Birth data valid, starting analysis');
      setIsAnalyzing(true);
      setTimeout(() => {
        console.log('🔍 [DEBUG] Analysis complete, moving to result screen');
        setIsAnalyzing(false);
        setStep('result'); // Show preview screen
        console.log('🔍 [DEBUG] setStep("result") called');

        // Meta Pixel - Lead 이벤트 (결과 화면 도달)
        if (window.fbq) {
          window.fbq('track', 'Lead');
          console.log('📊 [META PIXEL] Lead event tracked');
        }
      }, 3000);
    } else {
      console.log('❌ [DEBUG] Birth data incomplete:', birthData);
    }
  };

  const year = parseInt(birthData.year) || 2000;
  const month = parseInt(birthData.month) || 1;
  const day = parseInt(birthData.day) || 1;

  const element = getHeavenlyStem(year);
  const animal = getAnimal(year);
  const yinYang = getYinYang(year);
  const monthElement = getMonthElement(month);
  const dayElement = getDayElement(year, month, day);
  const hourAnimal = getHourAnimal(birthData.hour);
  const lifePath = calculateLifePath({ year, month, day });
  const luckyNumbers = getLuckyNumbers(element, animal);
  const luckyColors = getLuckyColors(element);
  const luckyDirection = getLuckyDirections(element);
  const compatibility = COMPATIBILITY[animal];

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Cinzel:wght@400;500;600;700&display=swap');

    * {
      box-sizing: border-box;
    }

    @keyframes twinkle {
      0%, 100% { opacity: 0.2; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.3); }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-15px) rotate(3deg); }
    }

    @keyframes pulse-gold {
      0%, 100% { box-shadow: 0 0 20px rgba(212, 175, 55, 0.3); }
      50% { box-shadow: 0 0 40px rgba(212, 175, 55, 0.6), 0 0 60px rgba(212, 175, 55, 0.3); }
    }

    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes glow {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }

    @keyframes scan {
      0% { top: 0; }
      50% { top: 100%; }
      100% { top: 0; }
    }

    @keyframes typing {
      from { width: 0; }
      to { width: 100%; }
    }

    .star {
      position: absolute;
      background: radial-gradient(circle, #fff 0%, transparent 70%);
      border-radius: 50%;
      animation: twinkle ease-in-out infinite;
    }

    .gold-text {
      background: linear-gradient(135deg, #d4af37 0%, #f4e4a6 25%, #d4af37 50%, #aa8c2c 75%, #d4af37 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 3s linear infinite;
    }

    .mystical-border {
      position: relative;
      border: 1px solid rgba(212, 175, 55, 0.3);
      background: linear-gradient(180deg, rgba(20, 20, 30, 0.9) 0%, rgba(15, 15, 22, 0.95) 100%);
    }

    .mystical-border::before {
      content: '';
      position: absolute;
      top: -2px; left: -2px; right: -2px; bottom: -2px;
      background: linear-gradient(45deg, transparent, rgba(212, 175, 55, 0.1), transparent);
      z-index: -1;
      border-radius: inherit;
    }

    .mystical-border::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      border-radius: inherit;
      box-shadow: inset 0 0 30px rgba(212, 175, 55, 0.05);
      pointer-events: none;
    }

    .cta-button {
      background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%);
      background-size: 200% auto;
      border: none;
      color: #0a0a0f;
      font-family: 'Cinzel', serif;
      font-weight: 700;
      padding: 18px 48px;
      font-size: 16px;
      letter-spacing: 2px;
      cursor: pointer;
      transition: all 0.3s ease;
      animation: pulse-gold 2s ease-in-out infinite;
      text-transform: uppercase;
      box-shadow: 0 0 30px rgba(255, 215, 0, 0.5), 0 0 60px rgba(255, 215, 0, 0.3);
    }

    .cta-button:hover {
      background-position: right center;
      transform: translateY(-2px);
      box-shadow: 0 0 40px rgba(255, 215, 0, 0.8), 0 0 80px rgba(255, 215, 0, 0.5), 0 10px 50px rgba(255, 165, 0, 0.6);
    }

    .cta-button:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      animation: none;
    }

    .secondary-button {
      background: transparent;
      border: 1px solid rgba(212, 175, 55, 0.5);
      color: #d4af37;
      font-family: 'Cinzel', serif;
      font-weight: 500;
      padding: 14px 36px;
      font-size: 14px;
      letter-spacing: 2px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .secondary-button:hover {
      background: rgba(212, 175, 55, 0.1);
      border-color: #d4af37;
    }

    .input-field {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(212, 175, 55, 0.2);
      color: #e8e6e3;
      padding: 16px 20px;
      font-family: 'Cormorant Garamond', serif;
      font-size: 18px;
      width: 100%;
      transition: all 0.3s ease;
      border-radius: 4px;
    }

    .input-field:focus {
      outline: none;
      border-color: rgba(212, 175, 55, 0.6);
      box-shadow: 0 0 20px rgba(212, 175, 55, 0.1);
      background: rgba(255, 255, 255, 0.05);
    }

    .input-field::placeholder {
      color: rgba(232, 230, 227, 0.4);
    }

    .input-field option {
      background: #1a1a24;
      color: #e8e6e3;
    }

    .testimonial-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(212, 175, 55, 0.15);
      padding: 28px;
      border-radius: 4px;
      animation: fadeInUp 0.8s ease forwards;
      opacity: 0;
    }

    .element-symbol {
      font-size: 64px;
      animation: float 4s ease-in-out infinite;
      text-shadow: 0 0 30px currentColor;
    }

    .locked-section {
      position: relative;
      filter: blur(6px);
      user-select: none;
      pointer-events: none;
    }

    .unlock-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(180deg, rgba(10, 10, 15, 0.7) 0%, rgba(10, 10, 15, 0.9) 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(2px);
      z-index: 10;
      border-radius: 4px;
    }

    .pillar-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(212, 175, 55, 0.2);
      padding: 15px 10px;
      text-align: center;
      border-radius: 4px;
      min-width: 0;
    }

    @media (max-width: 400px) {
      .pillar-card {
        padding: 10px 5px;
      }
      .pillar-card div:first-child {
        font-size: 9px !important;
      }
    }

    .analysis-animation {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(10, 10, 15, 0.95);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .orbit-ring {
      position: absolute;
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 50%;
      animation: rotate linear infinite;
    }

    .feature-card {
      padding: 30px;
      background: rgba(255, 255, 255, 0.02);
      text-align: center;
      border-radius: 4px;
      transition: all 0.3s ease;
      border: 1px solid transparent;
    }

    .feature-card:hover {
      background: rgba(255, 255, 255, 0.04);
      border-color: rgba(212, 175, 55, 0.2);
      transform: translateY(-5px);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes scaleIn {
      from { transform: scale(0.8); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .exit-close {
      position: absolute;
      top: 15px;
      right: 15px;
      background: none;
      border: none;
      color: rgba(232, 230, 227, 0.5);
      font-size: 24px;
      cursor: pointer;
      padding: 5px;
      line-height: 1;
    }

    .exit-close:hover {
      color: #e8e6e3;
    }

    /* Price styling */
    .price-highlight {
      transition: all 0.3s ease;
    }

    /* Floating action button for mobile */
    .floating-cta {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(180deg, transparent, rgba(10, 10, 15, 0.95) 20%);
      padding: 20px;
      z-index: 100;
      display: none;
    }

    @media (max-width: 768px) {
      .floating-cta {
        display: block;
      }
    }

    /* Guarantee badge */
    .guarantee-badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.3);
      padding: 12px 20px;
      border-radius: 8px;
      margin-top: 20px;
    }

    /* Bonus items */
    .bonus-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background: rgba(212, 175, 55, 0.05);
      border-left: 3px solid #d4af37;
      margin-bottom: 8px;
      font-size: 16px;
    }

    .bonus-value {
      margin-left: auto;
      color: rgba(232, 230, 227, 0.5);
      text-decoration: line-through;
      font-size: 15px;
    }

    /* Payment Modal */
    .payment-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 3000;
      animation: fadeIn 0.3s ease;
    }

    .payment-modal {
      background: linear-gradient(180deg, #1a1a24 0%, #12121a 100%);
      border: 2px solid rgba(212, 175, 55, 0.4);
      padding: 40px;
      max-width: 450px;
      width: 90%;
      margin: 20px;
      text-align: center;
      position: relative;
      border-radius: 12px;
      animation: scaleIn 0.3s ease;
      max-height: 90vh;
      overflow-y: auto;
    }

    .payment-input {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(212, 175, 55, 0.3);
      color: #e8e6e3;
      padding: 16px 20px;
      font-family: 'Cormorant Garamond', serif;
      font-size: 16px;
      width: 100%;
      border-radius: 4px;
      margin-bottom: 15px;
    }

    .payment-input:focus {
      outline: none;
      border-color: rgba(212, 175, 55, 0.6);
    }

    .payment-error {
      color: #ef4444;
      font-size: 13px;
      margin-bottom: 15px;
    }

    .processing-spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top-color: #fff;
      animation: spin 1s ease-in-out infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Success state */
    .success-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid rgba(34, 197, 94, 0.4);
      color: #22c55e;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      margin-bottom: 20px;
    }

    .download-button {
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      border: none;
      color: white;
      font-family: 'Cinzel', serif;
      font-weight: 600;
      padding: 18px 48px;
      font-size: 16px;
      letter-spacing: 2px;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .download-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 40px rgba(34, 197, 94, 0.4);
    }

    /* Unlocked content */
    .unlocked-section {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(34, 197, 94, 0.3);
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .unlocked-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(34, 197, 94, 0.15);
      color: #22c55e;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 11px;
      letter-spacing: 1px;
      margin-bottom: 15px;
    }
  `;

  if (isAnalyzing) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0a0f 0%, #12121a 50%, #0d0d14 100%)',
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        color: '#e8e6e3'
      }}>
        <style>{styles}</style>
        <div className="analysis-animation">
          {/* Animated rings */}
          <div style={{ position: 'relative', width: '200px', height: '200px' }}>
            <div className="orbit-ring" style={{ width: '200px', height: '200px', animationDuration: '8s' }} />
            <div className="orbit-ring" style={{ width: '160px', height: '160px', left: '20px', top: '20px', animationDuration: '6s', animationDirection: 'reverse' }} />
            <div className="orbit-ring" style={{ width: '120px', height: '120px', left: '40px', top: '40px', animationDuration: '4s' }} />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '48px'
            }}>
              {ELEMENTS[element].symbol}
            </div>
          </div>

          <div style={{ marginTop: '40px', textAlign: 'center' }}>
            <h2 className="gold-text" style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '24px',
              letterSpacing: '4px',
              marginBottom: '20px'
            }}>
              READING THE STARS
            </h2>
            <p style={{ color: 'rgba(232, 230, 227, 0.85)', fontSize: '16px' }}>
              Analyzing your cosmic blueprint...
            </p>
            <div style={{
              marginTop: '30px',
              display: 'flex',
              gap: '8px',
              justifyContent: 'center'
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: '8px',
                  height: '8px',
                  background: '#d4af37',
                  borderRadius: '50%',
                  animation: `glow 1s ease-in-out ${i * 0.3}s infinite`
                }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0f 0%, #12121a 50%, #0d0d14 100%)',
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      color: '#e8e6e3',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <style>{styles}</style>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="payment-modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
            <button className="exit-close" onClick={() => setShowPaymentModal(false)}>×</button>

            <div style={{ fontSize: '40px', marginBottom: '15px' }}>✨</div>

            <h2 style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '22px',
              marginBottom: '10px',
              letterSpacing: '2px'
            }}>
              <span className="gold-text">UNLOCK YOUR READING</span>
            </h2>

            <p style={{
              color: 'rgba(232, 230, 227, 0.85)',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              Complete personalized destiny report
            </p>

            <div style={{
              background: 'rgba(212, 175, 55, 0.1)',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              {/* Launch Special Badge - Small and elegant */}
              <div style={{ marginBottom: '8px' }}>
                <span style={{
                  fontSize: '13px',
                  color: '#d4af37',
                  border: '1.5px solid #d4af37',
                  padding: '5px 12px',
                  borderRadius: '4px',
                  letterSpacing: '1px',
                  fontWeight: 600
                }}>LAUNCH SPECIAL</span>
              </div>
              {/* Price Anchoring */}
              <div style={{ marginBottom: '6px' }}>
                <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '28px', fontWeight: 500 }}>$39.99</span>
              </div>
              {/* Main Price - Large and prominent */}
              <div style={{ marginBottom: '8px' }}>
                <span className="gold-text" style={{ fontSize: '42px', fontWeight: 700, letterSpacing: '-1px' }}>$9.99</span>
              </div>
              {/* Urgency */}
              <div style={{ fontSize: '12px', color: 'rgba(232, 230, 227, 0.6)', fontStyle: 'italic' }}>
                Offer ends soon.
              </div>
            </div>

            <input
              type="email"
              placeholder="Enter your email for PDF delivery *Required"
              className="payment-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                borderColor: email && !email.includes('@') ? '#ff6b6b' : undefined
              }}
            />

            {email && !email.includes('@') && (
              <div style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '5px', marginBottom: '10px' }}>
                Please enter a valid email address
              </div>
            )}

            {paymentError && (
              <div className="payment-error">{paymentError}</div>
            )}

            {/* PayPal 버튼 - 이메일 입력 후에만 활성화 */}
            <div style={{ marginBottom: '15px' }}>
              {email && email.includes('@') ? (
                <PayPalScriptProvider options={{
                  "client-id": PAYPAL_CLIENT_ID,
                  currency: "USD"
                }}>
                  <PayPalButtons
                  style={{
                    layout: "vertical",
                    color: "gold",
                    shape: "rect",
                    label: "pay"
                  }}
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      purchase_units: [{
                        amount: {
                          value: "9.99",
                          currency_code: "USD"
                        },
                        description: "Lumina Destiny Reading - Complete PDF Report (Launch Special)"
                      }]
                    });
                  }}
                  onApprove={(data, actions) => {
                    console.log('🔍 [PAYMENT] onApprove triggered. Order ID:', data.orderID);

                    return actions.order.capture()
                      .then((details) => {
                        console.log('🔍 [PAYMENT] Capture response received:', JSON.stringify(details, null, 2));

                        // 🔬 현미경 검증 모드 - 단계별 엄격한 검증

                        // 1단계: 기본 응답 구조 확인
                        if (!details || !details.purchase_units || !details.purchase_units[0]) {
                          console.error('❌ [PAYMENT] Invalid response structure');
                          alert('Payment verification failed: Invalid response');
                          return;
                        }

                        // 2단계: Order Status 확인
                        const orderStatus = details.status;
                        console.log('🔍 [PAYMENT] Order Status:', orderStatus);
                        if (orderStatus !== 'COMPLETED') {
                          console.error('❌ [PAYMENT] Order not completed. Status:', orderStatus);
                          alert('Payment failed: Order status is ' + orderStatus);
                          setPaymentError('Order not completed: ' + orderStatus);
                          return;
                        }

                        // 3단계: Capture 존재 확인
                        const captures = details.purchase_units[0].payments?.captures;
                        if (!captures || captures.length === 0) {
                          console.error('❌ [PAYMENT] No captures found in response');
                          alert('Payment verification failed: No payment captured');
                          setPaymentError('No payment captured');
                          return;
                        }

                        // 4단계: Capture Status 확인 (모든 capture가 COMPLETED여야 함)
                        const allCapturesCompleted = captures.every(capture => {
                          console.log('🔍 [PAYMENT] Checking capture:', capture.id, 'Status:', capture.status);
                          return capture.status === 'COMPLETED';
                        });

                        if (!allCapturesCompleted) {
                          const failedCaptures = captures.filter(c => c.status !== 'COMPLETED');
                          console.error('❌ [PAYMENT] Some captures not completed:', failedCaptures);
                          alert('Payment failed: Card declined or insufficient funds');
                          setPaymentError('Payment capture failed');
                          return;
                        }

                        // 5단계: Amount 확인 (정확히 9.99인지)
                        const capturedAmount = parseFloat(captures[0].amount.value);
                        console.log('🔍 [PAYMENT] Captured amount:', capturedAmount);
                        if (capturedAmount !== 9.99) {
                          console.error('❌ [PAYMENT] Incorrect amount. Expected: 9.99, Got:', capturedAmount);
                          alert('Payment verification failed: Incorrect amount');
                          setPaymentError('Incorrect payment amount');
                          return;
                        }

                        // ✅ 모든 검증 통과!
                        console.log('✅ [PAYMENT] All verifications passed!');
                        console.log('✅ [PAYMENT] Payment successful. Transaction ID:', captures[0].id);

                        // 결제 성공 처리
                        // Meta Pixel 구매 이벤트 추적                        if (window.fbq) {                          window.fbq('track', 'Purchase', {                            value: 9.99,                            currency: 'USD',                            content_name: 'Lumina Destiny Reading',                            content_type: 'product'                          });                          console.log('📊 [META PIXEL] Purchase event tracked');                        }
                        setIsPaid(true);
                        setShowPaymentModal(false);
                        setDownloadReady(true);
                        setStep('result');

                        if (details.payer?.name?.given_name) {
                          console.log('✅ [PAYMENT] Payer:', details.payer.name.given_name);
                        }
                      })
                      .catch((error) => {
                        console.error('❌ [PAYMENT] Capture failed with error:', error);
                        console.error('❌ [PAYMENT] Error details:', JSON.stringify(error, null, 2));
                        alert('Payment failed: ' + (error.message || 'Unknown error. Please try again.'));
                        setPaymentError('Payment capture error: ' + error.message);
                      });
                  }}
                  onError={(err) => {
                    console.error('PayPal Error:', err);
                    setPaymentError('Payment failed. Please try again.');
                  }}
                />
              </PayPalScriptProvider>
              ) : (
                <button
                  className="cta-button"
                  disabled
                  style={{
                    opacity: 0.5,
                    cursor: 'not-allowed',
                    width: '100%'
                  }}
                >
                  Enter Email to Continue
                </button>
              )}
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '15px',
              fontSize: '12px',
              color: 'rgba(232, 230, 227, 0.5)'
            }}>
              <span>🔒 Secure</span>
              <span>📧 Instant PDF</span>
              <span>💯 Guarantee</span>
            </div>

            <p style={{
              marginTop: '15px',
              fontSize: '11px',
              color: 'rgba(232, 230, 227, 0.4)'
            }}>
              Secure payment powered by PayPal
            </p>
          </div>
        </div>
      )}

      {/* Exit Intent Popup - 제거됨 */}

      {/* Floating CTA for Mobile */}
      {step === 'landing' && (
        <div className="floating-cta">
          <button
            className="cta-button"
            style={{ width: '100%', padding: '16px' }}
            onClick={() => document.querySelector('.input-field')?.scrollIntoView({ behavior: 'smooth' })}
          >
            GET MY FREE READING
          </button>
        </div>
      )}

      {/* Animated Stars Background */}
      {stars.map(star => (
        <div
          key={star.id}
          className="star"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`
          }}
        />
      ))}

      {/* Mystical Gradient Overlay */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(ellipse at center top, rgba(139, 69, 160, 0.08) 0%, transparent 50%)',
        pointerEvents: 'none'
      }} />

      {step === 'landing' && (
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '40px 20px',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Header */}
          <header style={{ textAlign: 'center', marginBottom: '50px' }}>
            <div style={{
              fontSize: '11px',
              letterSpacing: '8px',
              color: 'rgba(212, 175, 55, 0.7)',
              marginBottom: '25px',
              fontFamily: "'Cinzel', serif"
            }}>
              YOUR COSMIC BLUEPRINT • DECODED
            </div>
            <h1 style={{
              fontSize: 'clamp(48px, 12vw, 96px)',
              fontWeight: 300,
              marginBottom: '25px',
              lineHeight: 1.1
            }}>
              <span className="gold-text">LUMINA</span>
            </h1>
            <p style={{
              fontSize: '16px',
              letterSpacing: '4px',
              color: 'rgba(232, 230, 227, 0.6)',
              marginBottom: '10px',
              fontFamily: "'Cinzel', serif"
            }}>
              FOUR PILLARS OF DESTINY
            </p>
            <p style={{
              fontSize: '20px',
              color: 'rgba(232, 230, 227, 0.85)',
              maxWidth: '620px',
              margin: '0 auto',
              lineHeight: 1.9,
              fontWeight: 300
            }}>
              Unveil the cosmic blueprint written in the stars at the moment of your birth.
              Discover your true nature, hidden potential, and destined path through <em style={{ color: '#d4af37' }}>BaZi</em>—the ancient Chinese system used by imperial court advisors for over 3,000 years.
            </p>

            {/* Classical Chinese Quote */}
            <div style={{
              marginTop: '35px',
              padding: '20px',
              borderLeft: '2px solid rgba(212, 175, 55, 0.3)',
              borderRight: '2px solid rgba(212, 175, 55, 0.3)'
            }}>
              <p style={{
                fontSize: '26px',
                color: '#d4af37',
                marginBottom: '8px',
                fontStyle: 'italic'
              }}>
                "命者，天之所賦也"
              </p>
              <p style={{
                fontSize: '15px',
                color: 'rgba(232, 230, 227, 0.5)',
                letterSpacing: '1px'
              }}>
                "Destiny is what Heaven bestows upon you"
                <br />
                <span style={{ fontSize: '13px' }}>— Yuan Hai Zi Ping (淵海子平), Tang Dynasty</span>
              </p>
            </div>
          </header>

          {/* Chinese Symbol Decoration */}
          <div style={{ textAlign: 'center', marginBottom: '45px' }}>
            <div style={{
              display: 'inline-flex',
              gap: '35px',
              opacity: 0.5
            }}>
              {Object.values(ELEMENTS).map((el, i) => (
                <span key={i} style={{
                  fontSize: '26px',
                  color: '#d4af37',
                  transition: 'all 0.3s ease',
                  cursor: 'default'
                }}>
                  {el.symbol}
                </span>
              ))}
            </div>
          </div>

          {/* Main CTA Section */}
          <div className="mystical-border" style={{
            padding: '50px 40px',
            maxWidth: '520px',
            margin: '0 auto 70px',
            textAlign: 'center',
            borderRadius: '8px'
          }}>
            <h2 style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '22px',
              letterSpacing: '5px',
              marginBottom: '35px',
              fontWeight: 400
            }}>
              BEGIN YOUR READING
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '30px' }}>
              <input
                type="text"
                placeholder="Your First Name"
                className="input-field"
                value={birthData.name}
                onChange={(e) => setBirthData({ ...birthData, name: e.target.value })}
                maxLength="30"
              />
              <input
                type="number"
                placeholder="Birth Year (e.g., 1990)"
                className="input-field"
                value={birthData.year}
                onChange={(e) => setBirthData({ ...birthData, year: e.target.value })}
                min="1920"
                max="2024"
              />
              <div style={{ display: 'flex', gap: '12px' }}>
                <select
                  className="input-field"
                  value={birthData.month}
                  onChange={(e) => setBirthData({ ...birthData, month: e.target.value })}
                  style={{ flex: 1 }}
                >
                  <option value="">Month</option>
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
                <select
                  className="input-field"
                  value={birthData.day}
                  onChange={(e) => setBirthData({ ...birthData, day: e.target.value })}
                  style={{ flex: 1 }}
                >
                  <option value="">Day</option>
                  {Array.from({ length: 31 }, (_, i) => (
                    <option key={i} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>
              <select
                className="input-field"
                value={birthData.hour}
                onChange={(e) => setBirthData({ ...birthData, hour: e.target.value })}
              >
                <option value="">Birth Hour (for deeper accuracy)</option>
                {ANIMAL_ORDER.map((animal, i) => (
                  <option key={i} value={i}>
                    {ANIMALS[animal].hours} ({animal} Hour - {ANIMALS[animal].symbol})
                  </option>
                ))}
              </select>
            </div>

            <button
              className="cta-button"
              onClick={handleSubmit}
              disabled={!birthData.year || !birthData.month || !birthData.day}
            >
              GET MY FREE READING
            </button>

            {/* Free indicator */}
            <div style={{
              marginTop: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              color: 'rgba(34, 197, 94, 0.9)',
              fontSize: '14px'
            }}>
              <span>✓</span>
              <span>Free preview • No payment required</span>
            </div>

            {/* What you'll discover */}
            <div style={{
              marginTop: '25px',
              textAlign: 'left',
              borderTop: '1px solid rgba(212, 175, 55, 0.1)',
              paddingTop: '20px'
            }}>
              <div style={{
                fontSize: '13px',
                letterSpacing: '2px',
                color: 'rgba(212, 175, 55, 0.7)',
                marginBottom: '12px',
                textAlign: 'center',
                fontWeight: 600
              }}>
                YOUR FREE PREVIEW INCLUDES:
              </div>
              <div className="bonus-item" style={{ justifyContent: 'center' }}>
                <span style={{ color: '#22c55e' }}>✓</span> Your dominant element & energy type
              </div>
              <div className="bonus-item" style={{ justifyContent: 'center' }}>
                <span style={{ color: '#22c55e' }}>✓</span> Core personality traits
              </div>
              <div className="bonus-item" style={{ justifyContent: 'center' }}>
                <span style={{ color: '#22c55e' }}>✓</span> Your Four Pillars chart
              </div>
              <div className="bonus-item" style={{ justifyContent: 'center' }}>
                <span style={{ color: '#22c55e' }}>✓</span> Personal strength analysis
              </div>
            </div>
          </div>

          {/* What You'll Discover */}
          <div style={{ marginBottom: '80px' }}>
            <h2 style={{
              textAlign: 'center',
              fontFamily: "'Cinzel', serif",
              fontSize: '26px',
              letterSpacing: '6px',
              marginBottom: '50px',
              fontWeight: 400
            }}>
              <span className="gold-text">WHAT THE STARS REVEAL</span>
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
              maxWidth: '950px',
              margin: '0 auto'
            }}>
              {[
                { icon: '☯', title: 'Your Core Element', desc: 'Discover which of the Wu Xing (五行)—the five primordial elements known to ancient sages—governs your soul and shapes your destiny.' },
                { icon: '⭐', title: 'Four Pillars Analysis', desc: 'Your complete birth chart decoded using the same methods employed by Tang Dynasty imperial astrologers to advise emperors.' },
                { icon: '💎', title: 'Wealth & Career', desc: 'Ancient texts reveal which paths to prosperity align with your cosmic energy—wisdom once reserved for nobility.' },
                { icon: '❤️', title: 'Love Compatibility', desc: 'The I Ching principles of harmony reveal your ideal partner and the zodiac signs destined to complement your energy.' },
                { icon: '🌙', title: 'Lucky Elements', desc: 'Unlock the auspicious colors, numbers, and directions that ancient masters used to attract fortune and ward off misfortune.' },
                { icon: '🔮', title: '10-Year Forecast', desc: 'Peer into your future using the Da Yun (大運) system—the great cycles that have guided destinies for millennia.' }
              ].map((item, i) => (
                <div key={i} className="feature-card" style={{
                  animation: `fadeInUp 0.6s ease forwards`,
                  animationDelay: `${i * 0.1}s`,
                  opacity: 0
                }}>
                  <div style={{ fontSize: '40px', marginBottom: '18px' }}>{item.icon}</div>
                  <h3 style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: '15px',
                    letterSpacing: '2px',
                    marginBottom: '14px',
                    color: '#d4af37'
                  }}>
                    {item.title.toUpperCase()}
                  </h3>
                  <p style={{
                    fontSize: '15px',
                    lineHeight: 1.75,
                    color: 'rgba(232, 230, 227, 0.85)'
                  }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison Table - Why Lumina */}
          <div style={{ marginBottom: '80px' }}>
            <h2 style={{
              textAlign: 'center',
              fontFamily: "'Cinzel', serif",
              fontSize: '26px',
              letterSpacing: '6px',
              marginBottom: '50px',
              fontWeight: 400
            }}>
              <span className="gold-text">WHY LUMINA BAZI</span>
            </h2>

            <div style={{
              maxWidth: '700px',
              margin: '0 auto',
              background: 'rgba(10, 10, 15, 0.5)',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid rgba(212, 175, 55, 0.2)'
            }}>
              {/* Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                background: 'rgba(212, 175, 55, 0.1)',
                padding: '18px',
                borderBottom: '1px solid rgba(212, 175, 55, 0.2)'
              }}>
                <div style={{ fontSize: '15px', color: 'rgba(232, 230, 227, 0.6)' }}></div>
                <div style={{ fontSize: '15px', color: 'rgba(232, 230, 227, 0.6)', textAlign: 'center' }}>Generic Horoscope</div>
                <div style={{ fontSize: '15px', color: '#d4af37', textAlign: 'center', fontWeight: 700 }}>Lumina BaZi</div>
              </div>

              {/* Rows */}
              {[
                { label: 'Accuracy', generic: 'Vague & general', lumina: 'Specific to your birth' },
                { label: 'System', generic: '12 zodiac types', lumina: '500,000+ combinations' },
                { label: 'Timing', generic: '"This month..."', lumina: 'Exact peak dates' },
                { label: 'Depth', generic: '1-2 paragraphs', lumina: '15+ page report' },
                { label: 'Origin', generic: 'Modern pop culture', lumina: '3,000 years of wisdom' }
              ].map((row, i) => (
                <div key={i} style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  padding: '18px',
                  borderBottom: i < 4 ? '1px solid rgba(212, 175, 55, 0.1)' : 'none',
                  alignItems: 'center'
                }}>
                  <div style={{ fontSize: '16px', color: 'rgba(232, 230, 227, 0.8)', fontWeight: 600 }}>{row.label}</div>
                  <div style={{ fontSize: '15px', color: 'rgba(232, 230, 227, 0.5)', textAlign: 'center' }}>
                    <span style={{ color: '#ef4444', marginRight: '6px' }}>✗</span>{row.generic}
                  </div>
                  <div style={{ fontSize: '15px', color: 'rgba(232, 230, 227, 0.9)', textAlign: 'center' }}>
                    <span style={{ color: '#22c55e', marginRight: '6px' }}>✓</span>{row.lumina}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div style={{ marginBottom: '80px' }}>
            <h2 style={{
              textAlign: 'center',
              fontFamily: "'Cinzel', serif",
              fontSize: '26px',
              letterSpacing: '6px',
              marginBottom: '50px',
              fontWeight: 400
            }}>
              HOW IT WORKS
            </h2>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '40px',
              flexWrap: 'wrap',
              maxWidth: '900px',
              margin: '0 auto'
            }}>
              {[
                { num: '1', title: 'Enter Your Birth Data', desc: 'Provide your birth date and time for precise calculations' },
                { num: '2', title: 'Ancient Algorithm Decodes', desc: 'Our system applies 3,000+ years of BaZi wisdom' },
                { num: '3', title: 'Receive Your Reading', desc: 'Instant personalized PDF delivered to your email' }
              ].map((step, i) => (
                <div key={i} style={{
                  textAlign: 'center',
                  flex: '1 1 250px',
                  maxWidth: '280px'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    border: '2px solid rgba(212, 175, 55, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    fontFamily: "'Cinzel', serif",
                    fontSize: '24px',
                    color: '#d4af37'
                  }}>
                    {step.num}
                  </div>
                  <h3 style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: '14px',
                    letterSpacing: '2px',
                    marginBottom: '10px',
                    color: '#d4af37'
                  }}>
                    {step.title.toUpperCase()}
                  </h3>
                  <p style={{
                    fontSize: '15px',
                    color: 'rgba(232, 230, 227, 0.85)',
                    lineHeight: 1.7
                  }}>
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Final CTA */}
          <div style={{
            textAlign: 'center',
            padding: '70px 20px',
            background: 'linear-gradient(180deg, transparent, rgba(139, 69, 160, 0.06), transparent)',
            borderTop: '1px solid rgba(212, 175, 55, 0.1)',
            borderBottom: '1px solid rgba(212, 175, 55, 0.1)'
          }}>
            <h2 style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '34px',
              marginBottom: '20px',
              fontWeight: 400
            }}>
              Your Destiny Awaits
            </h2>
            <p style={{
              fontSize: '18px',
              color: 'rgba(232, 230, 227, 0.85)',
              marginBottom: '35px',
              maxWidth: '500px',
              margin: '0 auto 35px',
              lineHeight: 1.8
            }}>
              The universe has been waiting to share its secrets with you.
              <br />Are you ready to listen?
            </p>
            <button
              className="cta-button"
              onClick={() => document.querySelector('.input-field')?.scrollIntoView({ behavior: 'smooth' })}
            >
              START FREE READING
            </button>
            <p style={{
              marginTop: '22px',
              fontSize: '14px',
              color: 'rgba(34, 197, 94, 0.8)'
            }}>
              ✓ Free preview • No credit card required
            </p>
          </div>

          {/* Ancient Wisdom Section */}
          <div style={{
            background: 'linear-gradient(180deg, rgba(212, 175, 55, 0.03) 0%, transparent 100%)',
            padding: '80px 20px',
            marginBottom: '60px',
            borderTop: '1px solid rgba(212, 175, 55, 0.1)',
            borderBottom: '1px solid rgba(212, 175, 55, 0.1)'
          }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
              <div style={{
                fontSize: '40px',
                marginBottom: '30px',
                opacity: 0.8
              }}>
                📜
              </div>
              <h2 style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '24px',
                letterSpacing: '6px',
                marginBottom: '30px',
                fontWeight: 400
              }}>
                <span className="gold-text">3,000 YEARS OF WISDOM</span>
              </h2>
              <p style={{
                fontSize: '17px',
                color: 'rgba(232, 230, 227, 0.75)',
                lineHeight: 2,
                marginBottom: '30px'
              }}>
                BaZi, also known as the <em style={{ color: '#d4af37' }}>Four Pillars of Destiny</em>, originated during the
                <strong style={{ color: '#e8e6e3' }}> Tang Dynasty (618-907 AD)</strong> and was perfected through centuries of scholarly refinement.
                Imperial court advisors used this sacred system to counsel emperors on matters of state, marriage,
                and succession. The same cosmic calculations that once guided the fate of dynasties are now available to you.
              </p>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '40px',
                flexWrap: 'wrap',
                fontSize: '14px',
                color: 'rgba(232, 230, 227, 0.6)'
              }}>
                <div>
                  <div style={{ fontSize: '28px', color: '#d4af37', marginBottom: '8px' }}>易經</div>
                  <div>I Ching Principles</div>
                </div>
                <div>
                  <div style={{ fontSize: '28px', color: '#d4af37', marginBottom: '8px' }}>五行</div>
                  <div>Five Elements</div>
                </div>
                <div>
                  <div style={{ fontSize: '28px', color: '#d4af37', marginBottom: '8px' }}>天干</div>
                  <div>Heavenly Stems</div>
                </div>
                <div>
                  <div style={{ fontSize: '28px', color: '#d4af37', marginBottom: '8px' }}>地支</div>
                  <div>Earthly Branches</div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div style={{
            maxWidth: '700px',
            margin: '80px auto',
            padding: '0 20px'
          }}>
            <h2 style={{
              textAlign: 'center',
              fontFamily: "'Cinzel', serif",
              fontSize: '26px',
              letterSpacing: '6px',
              marginBottom: '50px',
              fontWeight: 400
            }}>
              ANCIENT QUESTIONS, MODERN ANSWERS
            </h2>

            {[
              { q: 'What is BaZi / Four Pillars of Destiny?', a: 'BaZi (八字) is an ancient Chinese metaphysical system dating back over 3,000 years. Originally used exclusively by imperial astrologers to advise emperors, it decodes your destiny through the cosmic energies present at your exact moment of birth—revealing your innate nature, life path, and hidden potential.' },
              { q: 'How accurate is this reading?', a: 'BaZi has been refined through countless generations of Chinese scholars and masters. Unlike generic horoscopes, these readings are calculated using the precise alignment of heavenly stems and earthly branches at your birth. 98% of our clients report remarkable accuracy—often describing insights as "reading their soul."' },
              { q: 'Do I need to know my exact birth time?', a: 'While knowing your birth hour reveals the complete Four Pillars (Year, Month, Day, Hour), the ancient masters taught that even three pillars hold profound wisdom. Your Year, Month, and Day pillars alone reveal your core element, life destiny, and karmic patterns.' },
              { q: 'How is this different from Western astrology?', a: 'While Western astrology maps planetary positions, BaZi reads the elemental energies (Wood, Fire, Earth, Metal, Water) encoded at your birth moment. This system was developed by Chinese scholars studying the relationship between cosmic cycles and human destiny—creating what they called your "cosmic DNA" or Ming (命).' }
            ].map((faq, i) => (
              <div key={i} style={{
                marginBottom: '30px',
                paddingBottom: '30px',
                borderBottom: '1px solid rgba(212, 175, 55, 0.1)'
              }}>
                <h3 style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: '16px',
                  letterSpacing: '1px',
                  marginBottom: '12px',
                  color: '#d4af37'
                }}>
                  {faq.q}
                </h3>
                <p style={{
                  fontSize: '15px',
                  color: 'rgba(232, 230, 227, 0.85)',
                  lineHeight: 1.8
                }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <footer style={{
            textAlign: 'center',
            padding: '50px 20px',
            borderTop: '1px solid rgba(212, 175, 55, 0.1)'
          }}>
            <div style={{
              fontSize: '12px',
              color: 'rgba(232, 230, 227, 0.4)',
              letterSpacing: '1px',
              lineHeight: 2
            }}>
              © 2026 Lumina • Ancient BaZi Wisdom
              <br />
              <span style={{ fontSize: '11px' }}>
                For entertainment purposes. Results may vary based on individual interpretation.
              </span>
              <br /><br />
              <a href="#" style={{ color: 'rgba(212, 175, 55, 0.5)', textDecoration: 'none', marginRight: '20px' }}>Privacy Policy</a>
              <a href="#" style={{ color: 'rgba(212, 175, 55, 0.5)', textDecoration: 'none', marginRight: '20px' }}>Terms of Service</a>
              <a href="mailto:support@luminadestiny.com" style={{ color: 'rgba(212, 175, 55, 0.5)', textDecoration: 'none' }}>Contact</a>
            </div>
          </footer>
        </div>
      )}

      {step === 'result' && (
        <div style={{
          maxWidth: '850px',
          margin: '0 auto',
          padding: '40px 20px',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Back Button */}
          <button
            onClick={() => setStep('landing')}
            className="secondary-button"
            style={{ marginBottom: '30px' }}
          >
            ← NEW READING
          </button>

          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <div style={{
              fontSize: '11px',
              letterSpacing: '5px',
              color: 'rgba(212, 175, 55, 0.7)',
              marginBottom: '15px'
            }}>
              YOUR COSMIC BLUEPRINT
            </div>
            <h1 className="gold-text" style={{ fontSize: '38px', marginBottom: '12px' }}>
              {birthData.name ? `For ${birthData.name}, The ${element} ${animal}` : 'Reading Preview'}
            </h1>
            <p style={{ color: 'rgba(232, 230, 227, 0.6)' }}>
              Born: {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][month - 1]} {day}, {year}
              {hourAnimal && ` • ${hourAnimal} Hour`}
            </p>
          </div>

          {/* Free Preview - Core Element */}
          <div className="mystical-border" style={{
            padding: '45px',
            marginBottom: '25px',
            textAlign: 'center',
            borderRadius: '8px'
          }}>
            <div className="element-symbol" style={{ color: ELEMENTS[element].color }}>
              {ELEMENTS[element].symbol}
            </div>
            <h2 style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '32px',
              marginTop: '20px',
              marginBottom: '8px'
            }}>
              <span className="gold-text">{yinYang} {element} {animal}</span>
            </h2>
            <p style={{
              fontSize: '18px',
              color: 'rgba(232, 230, 227, 0.6)',
              marginBottom: '15px'
            }}>
              Your dominant element is <strong style={{ color: ELEMENTS[element].color }}>{element}</strong> • Year of the {animal}
            </p>
            {/* Element-specific Classical Quote */}
            <div style={{
              background: 'rgba(212, 175, 55, 0.05)',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '30px',
              borderLeft: '3px solid rgba(212, 175, 55, 0.4)'
            }}>
              <p style={{
                fontSize: '22px',
                color: '#d4af37',
                marginBottom: '8px',
                fontStyle: 'italic'
              }}>
                "{ELEMENT_QUOTES[element].chinese}"
              </p>
              <p style={{
                fontSize: '20px',
                color: 'rgba(232, 230, 227, 0.6)',
                marginBottom: '5px'
              }}>
                "{ELEMENT_QUOTES[element].english}"
              </p>
              <p style={{
                fontSize: '16px',
                color: 'rgba(212, 175, 55, 0.5)'
              }}>
                — {ELEMENT_QUOTES[element].source}
              </p>
            </div>

            {/* Four Pillars Preview */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(60px, 1fr))',
              gap: '8px',
              marginBottom: '30px',
              maxWidth: '100%',
              overflow: 'hidden'
            }}>
              {[
                { title: 'Year', element: element, symbol: ANIMALS[animal].symbol },
                { title: 'Month', element: monthElement, symbol: '月' },
                { title: 'Day', element: dayElement, symbol: '日' },
                { title: 'Hour', element: hourAnimal ? ANIMALS[hourAnimal].element : '?', symbol: hourAnimal ? ANIMALS[hourAnimal].symbol : '?' }
              ].map((pillar, i) => (
                <div key={i} className="pillar-card">
                  <div style={{
                    fontSize: '11px',
                    letterSpacing: '2px',
                    color: 'rgba(232, 230, 227, 0.5)',
                    marginBottom: '8px'
                  }}>
                    {pillar.title.toUpperCase()}
                  </div>
                  <div style={{
                    fontSize: '28px',
                    color: pillar.element !== '?' ? ELEMENTS[pillar.element].color : 'rgba(232, 230, 227, 0.3)'
                  }}>
                    {pillar.symbol}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: pillar.element !== '?' ? ELEMENTS[pillar.element].color : 'rgba(232, 230, 227, 0.3)',
                    marginTop: '5px'
                  }}>
                    {pillar.element}
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              background: 'rgba(212, 175, 55, 0.08)',
              padding: '20px',
              borderRadius: '4px',
              border: '1px solid rgba(212, 175, 55, 0.15)',
              marginBottom: '20px'
            }}>
              <p style={{ fontSize: '15px', lineHeight: 1.8, color: 'rgba(232, 230, 227, 0.8)' }}>
                ✓ <strong>Free Preview Unlocked</strong> — Your core element and animal sign revealed through ancient wisdom
              </p>
            </div>

            {/* What's in the Full Report */}
            <div style={{
              background: 'linear-gradient(90deg, rgba(212, 175, 55, 0.08), rgba(212, 175, 55, 0.04))',
              padding: '20px',
              borderRadius: '4px',
              border: '1px solid rgba(212, 175, 55, 0.2)'
            }}>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'rgba(232, 230, 227, 0.9)' }}>
                <strong>Your full report includes:</strong> detailed personality analysis, career & wealth guidance, love compatibility insights, lucky elements & timing, and a personalized 10-year forecast based on your unique Four Pillars configuration.
              </p>
            </div>
          </div>

          {/* Personalized Insight - "어? 이거 어떻게 알았지?" 순간 */}
          <div className="mystical-border" style={{
            padding: '35px',
            marginBottom: '25px',
            borderRadius: '8px',
            background: 'linear-gradient(180deg, rgba(212, 175, 55, 0.08), transparent)'
          }}>
            <h3 style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '18px',
              letterSpacing: '3px',
              marginBottom: '25px',
              textAlign: 'center',
              color: '#d4af37'
            }}>
              WHAT YOUR CHART REVEALS
            </h3>

            {/* Core traits */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '10px',
              flexWrap: 'wrap',
              marginBottom: '25px'
            }}>
              {ELEMENTS[element].traits.slice(0, 4).map((trait, i) => (
                <span key={i} style={{
                  padding: '6px 14px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  borderRadius: '20px',
                  fontSize: '13px',
                  color: 'rgba(232, 230, 227, 0.8)'
                }}>
                  {trait}
                </span>
              ))}
            </div>

            {/* Specific personality insight */}
            <p style={{
              fontSize: '17px',
              lineHeight: 1.9,
              color: 'rgba(232, 230, 227, 0.9)',
              marginBottom: '20px',
              paddingLeft: '15px',
              borderLeft: '2px solid rgba(212, 175, 55, 0.4)'
            }}>
              <strong style={{ color: '#d4af37' }}>As a {yinYang} {element} {animal}:</strong> {
                element === 'Wood' ? `You've likely felt torn between wanting stability and craving new experiences. Others see you as adaptable, but inside you sometimes feel scattered—pulled in too many directions at once.` :
                element === 'Fire' ? `You're probably the one friends come to for energy and motivation. But you've also experienced burnout—pushing yourself too hard, then crashing. You feel things deeply, sometimes too deeply.` :
                element === 'Earth' ? `People rely on you, maybe too much. You're the steady one, the problem-solver. But sometimes you wish someone would take care of YOU for once. You rarely show when you're struggling.` :
                element === 'Metal' ? `You have high standards—for yourself and others. This has pushed you to achieve, but it's also made you your own harshest critic. "Good enough" never feels good enough.` :
                `You notice things others miss. Your intuition is strong, but you've learned to keep it to yourself because people don't always understand. You adapt to situations, sometimes losing yourself in the process.`
              }
            </p>

            {/* Life pattern - compact */}
            <div style={{
              background: 'rgba(139, 69, 160, 0.1)',
              padding: '15px 20px',
              borderRadius: '8px',
              border: '1px solid rgba(139, 69, 160, 0.2)',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '14px', color: 'rgba(232, 230, 227, 0.85)', margin: 0 }}>
                Life changes around ages <strong style={{ color: '#d4af37' }}>12, 24, 36</strong> (your {animal} cycle)
                {year && (year + 24) <= new Date().getFullYear() && <span> — Did something shift around {year + 24}?</span>}
              </p>
            </div>
          </div>

          {/* Locked Premium - 하나의 통합 섹션 */}
          {!isPaid && (
          <div className="mystical-border" style={{
            padding: '35px',
            marginBottom: '25px',
            borderRadius: '8px',
            background: 'linear-gradient(180deg, rgba(10, 10, 15, 0.5), transparent)'
          }}>
            <h3 style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '18px',
              letterSpacing: '3px',
              marginBottom: '25px',
              textAlign: 'center',
              color: '#d4af37'
            }}>
              YOUR FULL REPORT INCLUDES
            </h3>

            {/* Teaser items - compact grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {/* Career */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 15px',
                background: 'rgba(212, 175, 55, 0.05)',
                borderRadius: '8px',
                borderLeft: '3px solid rgba(212, 175, 55, 0.4)'
              }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#d4af37', marginBottom: '4px' }}>Career & Wealth</div>
                  <div style={{ fontSize: '13px', color: 'rgba(232, 230, 227, 0.7)' }}>
                    {element === 'Wood' ? 'Education, Healthcare, Creative Arts' :
                     element === 'Fire' ? 'Marketing, Entertainment, Leadership' :
                     element === 'Earth' ? 'Real Estate, Finance, Management' :
                     element === 'Metal' ? 'Technology, Law, Engineering' :
                     'Research, Counseling, International'} <span style={{ color: 'rgba(212, 175, 55, 0.5)' }}>+5 more</span>
                  </div>
                </div>
              </div>

              {/* Love */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 15px',
                background: 'rgba(212, 175, 55, 0.05)',
                borderRadius: '8px',
                borderLeft: '3px solid rgba(212, 175, 55, 0.4)'
              }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#d4af37', marginBottom: '4px' }}>Love & Compatibility</div>
                  <div style={{ fontSize: '13px', color: 'rgba(232, 230, 227, 0.7)' }}>
                    Best match: <span style={{ color: '#22c55e' }}>{compatibility.best[0]}</span> • Caution: <span style={{ color: '#ef4444' }}>{compatibility.avoid[0]}</span> <span style={{ color: 'rgba(212, 175, 55, 0.5)' }}>+more</span>
                  </div>
                </div>
              </div>

              {/* 2025 */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 15px',
                background: 'rgba(212, 175, 55, 0.05)',
                borderRadius: '8px',
                borderLeft: '3px solid rgba(212, 175, 55, 0.4)'
              }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#d4af37', marginBottom: '4px' }}>2025-2026 Forecast</div>
                  <div style={{ fontSize: '13px', color: 'rgba(232, 230, 227, 0.7)' }}>
                    Key months: <span style={{ color: '#d4af37' }}>March, July</span> <span style={{ color: 'rgba(232, 230, 227, 0.3)' }}>████ ████</span>
                  </div>
                </div>
              </div>

              {/* Lucky */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 15px',
                background: 'rgba(212, 175, 55, 0.05)',
                borderRadius: '8px',
                borderLeft: '3px solid rgba(212, 175, 55, 0.4)'
              }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#d4af37', marginBottom: '4px' }}>Lucky Elements</div>
                  <div style={{ fontSize: '13px', color: 'rgba(232, 230, 227, 0.7)' }}>
                    Numbers: <span style={{ color: '#d4af37' }}>{luckyNumbers[0]}</span> <span style={{ color: 'rgba(232, 230, 227, 0.3)' }}>??</span> • Color: <span style={{ color: '#d4af37' }}>{luckyColors[0]}</span> • Direction: {luckyDirection}
                  </div>
                </div>
              </div>
            </div>

            {/* Blurred Preview Section - Curiosity Gap */}
            <div style={{
              marginTop: '25px',
              position: 'relative',
              borderRadius: '12px',
              overflow: 'hidden'
            }}>
              {/* Blurred Content */}
              <div style={{
                filter: 'blur(8px)',
                opacity: 0.7,
                padding: '25px',
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(139, 69, 160, 0.1))',
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#d4af37', marginBottom: '15px', textAlign: 'center' }}>
                  Your 2026 Wealth & Fortune Timeline
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '15px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', color: '#22c55e' }}>📈</div>
                    <div style={{ fontSize: '12px', color: 'rgba(232, 230, 227, 0.8)' }}>March Peak</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', color: '#f59e0b' }}>⚠️</div>
                    <div style={{ fontSize: '12px', color: 'rgba(232, 230, 227, 0.8)' }}>June Caution</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', color: '#22c55e' }}>💰</div>
                    <div style={{ fontSize: '12px', color: 'rgba(232, 230, 227, 0.8)' }}>Oct Opportunity</div>
                  </div>
                </div>
                <div style={{
                  height: '60px',
                  background: 'linear-gradient(90deg, #22c55e 0%, #f59e0b 30%, #22c55e 50%, #ef4444 70%, #22c55e 100%)',
                  borderRadius: '8px',
                  opacity: 0.6
                }} />
              </div>

              {/* Overlay with Unlock Button */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(10, 10, 15, 0.4)',
                backdropFilter: 'blur(2px)',
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔒</div>
                <button
                  onClick={handlePayment}
                  style={{
                    padding: '12px 28px',
                    background: 'linear-gradient(135deg, #b8860b 0%, #daa520 50%, #b8860b 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '25px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)',
                    letterSpacing: '1px'
                  }}
                >
                  UNLOCK FULL FORECAST
                </button>
              </div>
            </div>

            {/* Customer Reviews - Social Proof */}
            <div style={{ marginTop: '30px' }}>
              <div style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#d4af37',
                marginBottom: '20px',
                textAlign: 'center',
                letterSpacing: '2px'
              }}>
                WHAT OTHERS ARE SAYING
              </div>

              {/* Rating Summary */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                marginBottom: '20px',
                padding: '12px',
                background: 'rgba(212, 175, 55, 0.08)',
                borderRadius: '8px'
              }}>
                <span style={{ fontSize: '28px', fontWeight: 700, color: '#d4af37' }}>4.9</span>
                <div>
                  <div style={{ color: '#d4af37', fontSize: '14px', letterSpacing: '1px' }}>★★★★★</div>
                  <div style={{ fontSize: '11px', color: 'rgba(232, 230, 227, 0.5)' }}>Based on 847 reviews</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Review 1 */}
                <div style={{
                  background: 'rgba(212, 175, 55, 0.05)',
                  border: '1px solid rgba(212, 175, 55, 0.15)',
                  borderRadius: '12px',
                  padding: '18px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#fff'
                    }}>JM</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '11px', color: '#22c55e', background: 'rgba(34, 197, 94, 0.15)', padding: '3px 8px', borderRadius: '4px' }}>✓ Verified</span>
                        <span style={{ fontSize: '12px', color: 'rgba(232, 230, 227, 0.5)' }}>Dec 14, 2025</span>
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: 'rgba(232, 230, 227, 0.9)' }}>Jessica M.</div>
                    </div>
                    <div style={{ color: '#d4af37', fontSize: '12px' }}>★★★★★</div>
                  </div>
                  <p style={{ fontSize: '15px', color: 'rgba(232, 230, 227, 0.75)', lineHeight: 1.6, margin: 0 }}>
                    I was mass laid off in October and felt completely lost. This reading told me my "wealth peak" was coming in Q1 2025 and to focus on creative industries. Just got a job offer at a design agency last week. The timing was SCARY accurate.
                  </p>
                </div>

                {/* Review 2 */}
                <div style={{
                  background: 'rgba(212, 175, 55, 0.05)',
                  border: '1px solid rgba(212, 175, 55, 0.15)',
                  borderRadius: '12px',
                  padding: '18px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#fff'
                    }}>DK</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '11px', color: '#22c55e', background: 'rgba(34, 197, 94, 0.15)', padding: '3px 8px', borderRadius: '4px' }}>✓ Verified</span>
                        <span style={{ fontSize: '12px', color: 'rgba(232, 230, 227, 0.5)' }}>Dec 12, 2025</span>
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: 'rgba(232, 230, 227, 0.9)' }}>David K.</div>
                    </div>
                    <div style={{ color: '#d4af37', fontSize: '12px' }}>★★★★★</div>
                  </div>
                  <p style={{ fontSize: '15px', color: 'rgba(232, 230, 227, 0.75)', lineHeight: 1.6, margin: 0 }}>
                    Bought this for fun. Then it described my personality so accurately my wife thought I wrote it myself. The part about my "shadow side" was uncomfortable to read but... yeah, it's true. Worth it for that mirror alone.
                  </p>
                </div>

                {/* Review 3 */}
                <div style={{
                  background: 'rgba(212, 175, 55, 0.05)',
                  border: '1px solid rgba(212, 175, 55, 0.15)',
                  borderRadius: '12px',
                  padding: '18px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#fff'
                    }}>SL</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '11px', color: '#22c55e', background: 'rgba(34, 197, 94, 0.15)', padding: '3px 8px', borderRadius: '4px' }}>✓ Verified</span>
                        <span style={{ fontSize: '12px', color: 'rgba(232, 230, 227, 0.5)' }}>Dec 10, 2025</span>
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: 'rgba(232, 230, 227, 0.9)' }}>Sarah L.</div>
                    </div>
                    <div style={{ color: '#d4af37', fontSize: '12px' }}>★★★★★</div>
                  </div>
                  <p style={{ fontSize: '15px', color: 'rgba(232, 230, 227, 0.75)', lineHeight: 1.6, margin: 0 }}>
                    Going through a breakup and questioning everything. Reading said I'm entering a "relationship renewal period" in spring. Currently talking to someone new... we'll see 👀 The self-reflection part helped me stop blaming myself.
                  </p>
                </div>

                {/* Review 4 - Short and punchy */}
                <div style={{
                  background: 'rgba(212, 175, 55, 0.05)',
                  border: '1px solid rgba(212, 175, 55, 0.15)',
                  borderRadius: '12px',
                  padding: '18px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#fff'
                    }}>MR</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '11px', color: '#22c55e', background: 'rgba(34, 197, 94, 0.15)', padding: '3px 8px', borderRadius: '4px' }}>✓ Verified</span>
                        <span style={{ fontSize: '12px', color: 'rgba(232, 230, 227, 0.5)' }}>Dec 8, 2025</span>
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: 'rgba(232, 230, 227, 0.9)' }}>Marcus R.</div>
                    </div>
                    <div style={{ color: '#d4af37', fontSize: '12px' }}>★★★★★</div>
                  </div>
                  <p style={{ fontSize: '15px', color: 'rgba(232, 230, 227, 0.75)', lineHeight: 1.6, margin: 0 }}>
                    $10 for a 15-page report that took me 2 hours to fully digest. My therapist charges $200/hr. This hit harder tbh 😅
                  </p>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Ancient Wisdom Quote */}
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            marginBottom: '25px'
          }}>
            <p style={{
              fontSize: '24px',
              color: '#d4af37',
              marginBottom: '12px',
              fontStyle: 'italic'
            }}>
              "{DESTINY_PROVERBS[lifePath % DESTINY_PROVERBS.length].chinese}"
            </p>
            <p style={{
              fontSize: '15px',
              color: 'rgba(232, 230, 227, 0.85)',
              marginBottom: '8px',
              maxWidth: '500px',
              margin: '0 auto 8px'
            }}>
              "{DESTINY_PROVERBS[lifePath % DESTINY_PROVERBS.length].english}"
            </p>
            <p style={{
              fontSize: '12px',
              color: 'rgba(212, 175, 55, 0.5)'
            }}>
              — {DESTINY_PROVERBS[lifePath % DESTINY_PROVERBS.length].source}
            </p>
          </div>

          {/* Unlock CTA or Download Section */}
          <div className="mystical-border" style={{
            textAlign: 'center',
            padding: '50px 40px',
            background: isPaid
              ? 'linear-gradient(180deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))'
              : 'linear-gradient(180deg, rgba(139, 37, 37, 0.15), rgba(139, 69, 160, 0.08))',
            borderRadius: '8px',
            border: isPaid ? '2px solid rgba(34, 197, 94, 0.4)' : undefined
          }}>
            {isPaid ? (
              <>
                <div className="success-badge">
                  <span>✓</span> Payment Successful - Reading Unlocked!
                </div>

                <h2 style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: '26px',
                  letterSpacing: '3px',
                  marginBottom: '15px'
                }}>
                  <span className="gold-text">Your Reading is Ready!</span>
                </h2>

                <p style={{
                  marginBottom: '25px',
                  color: 'rgba(232, 230, 227, 0.85)',
                  fontSize: '16px'
                }}>
                  Download your complete personalized destiny report
                </p>

                {isLoadingAI ? (
                  <button
                    className="download-button"
                    disabled
                    style={{
                      opacity: 0.6,
                      cursor: 'not-allowed',
                      background: 'rgba(212, 175, 55, 0.3)'
                    }}
                  >
                    ⏳ Generating Your Analysis (1-2 min)
                  </button>
                ) : (
                  <button className="download-button" onClick={handleDownloadPDF}>
                    📥 DOWNLOAD PDF REPORT
                  </button>
                )}

                {email ? (
                  <p style={{
                    marginTop: '20px',
                    fontSize: '13px',
                    color: 'rgba(232, 230, 227, 0.5)'
                  }}>
                    A copy has been sent to: {email}
                  </p>
                ) : (
                  <p style={{
                    marginTop: '20px',
                    fontSize: '13px',
                    color: '#ff6b6b'
                  }}>
                    ⚠️ No email address provided during checkout
                  </p>
                )}

                {/* 이메일 재발송 섹션 */}
                <div style={{
                  marginTop: '25px',
                  padding: '20px',
                  background: 'rgba(212, 175, 55, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(212, 175, 55, 0.2)'
                }}>
                  <p style={{
                    fontSize: '14px',
                    color: 'rgba(232, 230, 227, 0.85)',
                    marginBottom: '12px',
                    fontWeight: 600
                  }}>
                    📧 Resend PDF to Another Email
                  </p>
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    flexWrap: 'wrap'
                  }}>
                    <input
                      type="email"
                      placeholder="Enter email address"
                      className="payment-input"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      style={{
                        flex: 1,
                        minWidth: '200px'
                      }}
                    />
                    <button
                      onClick={handleResendEmail}
                      disabled={isResending || !resendEmail}
                      style={{
                        padding: '12px 24px',
                        background: isResending ? 'rgba(212, 175, 55, 0.3)' : 'linear-gradient(135deg, #b8860b 0%, #daa520 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 600,
                        cursor: isResending || !resendEmail ? 'not-allowed' : 'pointer',
                        opacity: isResending || !resendEmail ? 0.6 : 1,
                        fontSize: '14px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {isResending ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                  {resendSuccess && (
                    <p style={{
                      marginTop: '12px',
                      fontSize: '13px',
                      color: '#22c55e',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      ✓ Email sent successfully to {resendEmail}!
                    </p>
                  )}
                </div>

                {/* 분석 로딩 상태 */}
                {isLoadingAI && (
                  <div style={{
                    marginTop: '30px',
                    padding: '40px',
                    background: 'rgba(212, 175, 55, 0.05)',
                    borderRadius: '8px',
                    border: '1px solid rgba(212, 175, 55, 0.2)'
                  }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      border: '3px solid rgba(212, 175, 55, 0.2)',
                      borderTop: '3px solid #d4af37',
                      borderRadius: '50%',
                      animation: 'rotate 1s linear infinite',
                      margin: '0 auto 20px'
                    }} />
                    <p style={{ color: '#d4af37', fontSize: '16px' }}>
                      🔮 The ancient spirits are reading your destiny...
                    </p>
                    <p style={{ color: 'rgba(232, 230, 227, 0.6)', fontSize: '14px', marginTop: '10px' }}>
                      Generating your personalized reading...
                    </p>
                    <p style={{ color: 'rgba(212, 175, 55, 0.8)', fontSize: '13px', marginTop: '15px', fontWeight: '500' }}>
                      ⏱️ This usually takes 1-2 minutes. Please wait...
                    </p>
                  </div>
                )}


                {/* AI 분석 결과 표시 */}
                {aiAnalysis && (
                  <div style={{
                    marginTop: '40px',
                    padding: '40px',
                    background: 'linear-gradient(180deg, rgba(212, 175, 55, 0.08), rgba(139, 69, 160, 0.05))',
                    borderRadius: '12px',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    textAlign: 'left'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      marginBottom: '30px'
                    }}>
                      <span style={{ fontSize: '28px' }}>🔮</span>
                      <h3 style={{
                        fontFamily: "'Cinzel', serif",
                        fontSize: '24px',
                        color: '#d4af37',
                        margin: 0
                      }}>
                        Your Personalized Destiny Reading
                      </h3>
                    </div>

                    <div style={{
                      fontSize: '15px',
                      lineHeight: '1.9',
                      color: 'rgba(232, 230, 227, 0.9)',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {aiAnalysis.split('\n').map((paragraph, index) => {
                        // 제목 스타일링 (** 로 감싸진 텍스트 또는 숫자로 시작하는 줄)
                        if (paragraph.startsWith('**') || paragraph.match(/^\d+\./)) {
                          return (
                            <h4 key={index} style={{
                              color: '#d4af37',
                              fontFamily: "'Cinzel', serif",
                              fontSize: '18px',
                              marginTop: '25px',
                              marginBottom: '12px',
                              borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
                              paddingBottom: '8px'
                            }}>
                              {paragraph.replace(/\*\*/g, '')}
                            </h4>
                          );
                        }
                        if (paragraph.trim() === '') return <br key={index} />;
                        return <p key={index} style={{ marginBottom: '12px' }}>{paragraph}</p>;
                      })}
                    </div>

                    <div style={{
                      marginTop: '30px',
                      padding: '20px',
                      background: 'rgba(212, 175, 55, 0.1)',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <p style={{ color: 'rgba(232, 230, 227, 0.6)', fontSize: '12px' }}>
                        ✨ This reading was crafted based on your unique birth chart and ancient BaZi wisdom
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: '26px',
                  letterSpacing: '3px',
                  marginBottom: '15px'
                }}>
                  Unlock Your Complete Reading
                </h2>
                <p style={{
                  marginBottom: '25px',
                  color: 'rgba(232, 230, 227, 0.85)',
                  fontSize: '18px'
                }}>
                  Get instant access to your complete personalized destiny report
                </p>

                {/* What's Inside - Detailed Table of Contents */}
                <div style={{
                  background: 'rgba(212, 175, 55, 0.05)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  borderRadius: '12px',
                  padding: '25px',
                  marginBottom: '30px',
                  textAlign: 'left'
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#d4af37',
                    marginBottom: '18px',
                    textAlign: 'center',
                    letterSpacing: '2px'
                  }}>
                    WHAT'S INSIDE (15+ Pages)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      { icon: '🏛️', title: 'Four Pillars Chart', desc: 'Your complete birth chart decoded' },
                      { icon: '🧠', title: 'Deep Personality Analysis', desc: 'Hidden strengths & shadow traits' },
                      { icon: '💰', title: 'Career & Wealth Path', desc: 'Best industries & peak earning years' },
                      { icon: '❤️', title: 'Love & Compatibility', desc: 'Ideal partners & relationship timing' },
                      { icon: '🍀', title: 'Lucky Elements', desc: 'Colors, numbers, directions for fortune' },
                      { icon: '📅', title: '2025-2026 Forecast', desc: 'Month-by-month opportunities & warnings' },
                      { icon: '🔮', title: '10-Year Life Map', desc: 'Major turning points through 2035' },
                      { icon: '⚖️', title: 'Elemental Balance', desc: 'What you need more (or less) of' }
                    ].map((item, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '8px 0',
                        borderBottom: i < 7 ? '1px solid rgba(212, 175, 55, 0.1)' : 'none'
                      }}>
                        <span style={{ fontSize: '20px' }}>{item.icon}</span>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(232, 230, 227, 0.9)' }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: '13px', color: 'rgba(232, 230, 227, 0.5)' }}>
                            {item.desc}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Section with Anchoring */}
                <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                  <div style={{ marginBottom: '5px' }}>
                    <span style={{
                      fontSize: '20px',
                      color: 'rgba(232, 230, 227, 0.5)',
                      textDecoration: 'line-through',
                      marginRight: '12px'
                    }}>$39.99</span>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <span className="gold-text" style={{ fontSize: '56px', fontWeight: 700, letterSpacing: '-2px' }}>$9.99</span>
                  </div>
                  <div style={{
                    display: 'inline-block',
                    padding: '6px 16px',
                    background: 'rgba(34, 197, 94, 0.15)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '20px',
                    fontSize: '13px',
                    color: '#22c55e',
                    fontWeight: 600,
                    marginBottom: '10px'
                  }}>
                    SAVE 75% — Launch Special
                  </div>
                  <div style={{ fontSize: '14px', color: 'rgba(232, 230, 227, 0.6)' }}>
                    One-time payment • Instant access
                  </div>
                </div>

                <button className="cta-button" onClick={handlePayment}>
                  GET COMPLETE READING
                </button>

                {/* Money-Back Guarantee Badge */}
                <div style={{
                  marginTop: '20px',
                  padding: '12px 20px',
                  background: 'rgba(34, 197, 94, 0.08)',
                  border: '1px solid rgba(34, 197, 94, 0.25)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '22px' }}>🛡️</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#22c55e' }}>
                      30-Day Money-Back Guarantee
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(232, 230, 227, 0.6)' }}>
                      Not satisfied? Full refund, no questions asked.
                    </div>
                  </div>
                </div>

                <div style={{
                  marginTop: '15px',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '20px',
                  flexWrap: 'wrap',
                  fontSize: '12px',
                  color: 'rgba(232, 230, 227, 0.5)'
                }}>
                  <span>🔒 Secure checkout</span>
                  <span>📧 Instant PDF delivery</span>
                </div>
              </>
            )}
          </div>

          {/* Trust badges */}
          <div style={{
            textAlign: 'center',
            marginTop: '40px',
            padding: '30px',
            borderTop: '1px solid rgba(212, 175, 55, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '40px',
              flexWrap: 'wrap',
              opacity: 0.6
            }}>
              <span style={{ fontSize: '14px' }}>🔒 256-bit SSL</span>
              <span style={{ fontSize: '14px' }}>💳 Secure Payment</span>
              <span style={{ fontSize: '14px' }}>📧 Instant Delivery</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
