import React, { useState, useEffect, useCallback } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { downloadPDF } from './pdfGenerator';
import { ELEMENT_ANALYSIS, ANIMAL_ANALYSIS, ELEMENT_QUOTES, DESTINY_PROVERBS } from './analysisContent';
import { generateSajuAnalysis } from './openai';

// PayPal 설정
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'test';

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
  const [birthData, setBirthData] = useState({ year: '', month: '', day: '', hour: '' });
  const [stars, setStars] = useState([]);
  const [countdown, setCountdown] = useState({ hours: 2, minutes: 47, seconds: 33 });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeViewers, setActiveViewers] = useState(Math.floor(Math.random() * 30) + 45);
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [showPurchaseNotif, setShowPurchaseNotif] = useState(false);
  const [currentNotif, setCurrentNotif] = useState(null);
  const [spotsLeft, setSpotsLeft] = useState(Math.floor(Math.random() * 8) + 7);
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [hasShownExit, setHasShownExit] = useState(false);
  const [pulsePrice, setPulsePrice] = useState(false);
  const [isPaid, setIsPaid] = useState(true); // TODO: 테스트 후 false로 되돌리기!
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [email, setEmail] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [downloadReady, setDownloadReady] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState('');

  // Stripe Payment Link - 여기에 실제 Stripe Payment Link URL을 넣으세요
  const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_YOUR_LINK_HERE';

  // 결제 처리 함수
  const handlePayment = () => {
    if (!birthData.year || !birthData.month || !birthData.day) {
      alert('Please enter your birth date first to receive your personalized reading.');
      return;
    }
    // TODO: 테스트 모드 - 결제 없이 바로 결과 페이지로
    setStep('result');
    setIsPaid(true);
    // setShowPaymentModal(true); // 실제 결제 시 이 줄 활성화
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

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);

    const viewerTimer = setInterval(() => {
      setActiveViewers(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(viewerTimer);
    };
  }, []);

  // Fake recent purchase notifications - 60+ names to prevent repetition
  const fakeNames = [
    // North America
    { name: 'Emma', location: 'New York', time: 2 },
    { name: 'Michael', location: 'Toronto', time: 1 },
    { name: 'Olivia', location: 'Los Angeles', time: 1 },
    { name: 'Sophia', location: 'Chicago', time: 3 },
    { name: 'Liam', location: 'Miami', time: 2 },
    { name: 'Ava', location: 'San Francisco', time: 1 },
    { name: 'Noah', location: 'Vancouver', time: 4 },
    { name: 'Emily', location: 'Seattle', time: 2 },
    { name: 'Ethan', location: 'Boston', time: 3 },
    { name: 'Madison', location: 'Austin', time: 1 },
    { name: 'Jacob', location: 'Denver', time: 2 },
    { name: 'Abigail', location: 'Montreal', time: 3 },
    { name: 'Mason', location: 'Phoenix', time: 1 },
    { name: 'Harper', location: 'Dallas', time: 2 },
    // Europe
    { name: 'James', location: 'London', time: 1 },
    { name: 'Alexander', location: 'Berlin', time: 3 },
    { name: 'Mia', location: 'Paris', time: 2 },
    { name: 'Lucas', location: 'Amsterdam', time: 3 },
    { name: 'Sophie', location: 'Dublin', time: 2 },
    { name: 'Oliver', location: 'Manchester', time: 1 },
    { name: 'Amelia', location: 'Edinburgh', time: 4 },
    { name: 'Felix', location: 'Munich', time: 2 },
    { name: 'Elena', location: 'Madrid', time: 3 },
    { name: 'Marco', location: 'Milan', time: 1 },
    { name: 'Anna', location: 'Stockholm', time: 2 },
    { name: 'Erik', location: 'Copenhagen', time: 3 },
    { name: 'Nina', location: 'Vienna', time: 1 },
    { name: 'Thomas', location: 'Brussels', time: 2 },
    { name: 'Clara', location: 'Zurich', time: 4 },
    { name: 'Hugo', location: 'Barcelona', time: 1 },
    { name: 'Freya', location: 'Oslo', time: 3 },
    { name: 'Matteo', location: 'Rome', time: 2 },
    // Asia Pacific
    { name: 'Charlotte', location: 'Melbourne', time: 2 },
    { name: 'Sophie', location: 'Sydney', time: 3 },
    { name: 'William', location: 'Singapore', time: 4 },
    { name: 'Daniel', location: 'Tokyo', time: 1 },
    { name: 'Grace', location: 'Hong Kong', time: 2 },
    { name: 'Benjamin', location: 'Auckland', time: 3 },
    { name: 'Chloe', location: 'Brisbane', time: 1 },
    { name: 'Ryan', location: 'Perth', time: 2 },
    { name: 'Lily', location: 'Taipei', time: 4 },
    { name: 'Nathan', location: 'Bangkok', time: 1 },
    { name: 'Zoe', location: 'Kuala Lumpur', time: 3 },
    { name: 'Adrian', location: 'Manila', time: 2 },
    { name: 'Sarah', location: 'Jakarta', time: 1 },
    { name: 'David', location: 'Mumbai', time: 3 },
    // Middle East & Africa
    { name: 'Isabella', location: 'Dubai', time: 2 },
    { name: 'Adam', location: 'Abu Dhabi', time: 1 },
    { name: 'Layla', location: 'Doha', time: 3 },
    { name: 'Omar', location: 'Cairo', time: 2 },
    { name: 'Jasmine', location: 'Cape Town', time: 4 },
    { name: 'Ahmed', location: 'Riyadh', time: 1 },
    { name: 'Fatima', location: 'Casablanca', time: 2 },
    // South America
    { name: 'Sebastian', location: 'São Paulo', time: 3 },
    { name: 'Valentina', location: 'Buenos Aires', time: 1 },
    { name: 'Mateo', location: 'Mexico City', time: 2 },
    { name: 'Camila', location: 'Lima', time: 4 },
    { name: 'Diego', location: 'Bogotá', time: 1 },
    { name: 'Lucia', location: 'Santiago', time: 3 },
    // More variety
    { name: 'Victoria', location: 'Atlanta', time: 2 },
    { name: 'Andrew', location: 'Philadelphia', time: 1 },
    { name: 'Natalie', location: 'San Diego', time: 3 },
    { name: 'Joshua', location: 'Las Vegas', time: 2 },
    { name: 'Hannah', location: 'Portland', time: 1 },
    { name: 'Christopher', location: 'Nashville', time: 4 },
    { name: 'Samantha', location: 'Orlando', time: 2 },
    { name: 'Nicholas', location: 'Minneapolis', time: 3 },
    { name: 'Elizabeth', location: 'Charlotte', time: 1 },
    { name: 'Jonathan', location: 'Detroit', time: 2 }
  ];

  useEffect(() => {
    // Show purchase notification every 15-30 seconds
    const showNotification = () => {
      const randomPerson = fakeNames[Math.floor(Math.random() * fakeNames.length)];
      setCurrentNotif(randomPerson);
      setShowPurchaseNotif(true);

      setTimeout(() => {
        setShowPurchaseNotif(false);
      }, 4000);
    };

    // First notification after 8 seconds
    const firstTimer = setTimeout(showNotification, 8000);

    // Then every 15-30 seconds
    const interval = setInterval(() => {
      showNotification();
      // Occasionally decrease spots
      if (Math.random() > 0.7) {
        setSpotsLeft(prev => Math.max(3, prev - 1));
      }
    }, Math.random() * 15000 + 15000);

    return () => {
      clearTimeout(firstTimer);
      clearInterval(interval);
    };
  }, []);

  // Exit intent detection
  useEffect(() => {
    const handleMouseLeave = (e) => {
      if (e.clientY < 10 && !hasShownExit && step === 'landing') {
        setShowExitIntent(true);
        setHasShownExit(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [hasShownExit, step]);

  // Price pulse effect
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setPulsePrice(true);
      setTimeout(() => setPulsePrice(false), 1000);
    }, 10000);
    return () => clearInterval(pulseInterval);
  }, []);

  // 결제 완료 시 자동으로 AI 분석 시작
  useEffect(() => {
    if (step === 'result' && isPaid && !aiAnalysis && !isLoadingAI && !aiError) {
      fetchAIAnalysis();
    }
  }, [step, isPaid]);

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
    if (birthData.year && birthData.month && birthData.day) {
      setIsAnalyzing(true);
      setTimeout(() => {
        setIsAnalyzing(false);
        setStep('result');
      }, 3000);
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
      background: linear-gradient(135deg, #d4af37 0%, #aa8c2c 50%, #d4af37 100%);
      background-size: 200% auto;
      border: none;
      color: #0a0a0f;
      font-family: 'Cinzel', serif;
      font-weight: 600;
      padding: 18px 48px;
      font-size: 16px;
      letter-spacing: 2px;
      cursor: pointer;
      transition: all 0.3s ease;
      animation: pulse-gold 2s ease-in-out infinite;
      text-transform: uppercase;
    }

    .cta-button:hover {
      background-position: right center;
      transform: translateY(-2px);
      box-shadow: 0 10px 40px rgba(212, 175, 55, 0.4);
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

    .live-indicator {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.3);
      border-radius: 20px;
      font-size: 13px;
      color: #22c55e;
    }

    .live-dot {
      width: 8px;
      height: 8px;
      background: #22c55e;
      border-radius: 50%;
      animation: glow 1.5s ease-in-out infinite;
    }

    /* Purchase notification toast */
    .purchase-notif {
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: rgba(20, 20, 30, 0.95);
      border: 1px solid rgba(212, 175, 55, 0.3);
      padding: 16px 20px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
      z-index: 1000;
      animation: slideInLeft 0.5s ease;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
      max-width: 320px;
    }

    @keyframes slideInLeft {
      from { transform: translateX(-120%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    @keyframes slideOutLeft {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(-120%); opacity: 0; }
    }

    .purchase-notif.hiding {
      animation: slideOutLeft 0.5s ease forwards;
    }

    /* Exit intent popup */
    .exit-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .exit-popup {
      background: linear-gradient(180deg, #1a1a24 0%, #12121a 100%);
      border: 2px solid rgba(212, 175, 55, 0.4);
      padding: 50px 40px;
      max-width: 480px;
      margin: 20px;
      text-align: center;
      position: relative;
      border-radius: 12px;
      animation: scaleIn 0.3s ease;
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

    /* Urgency badge */
    .urgency-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(220, 38, 38, 0.15);
      border: 1px solid rgba(220, 38, 38, 0.4);
      color: #ef4444;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 13px;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.02); }
    }

    /* Price animation */
    .price-highlight {
      transition: all 0.3s ease;
    }

    .price-highlight.pulse {
      transform: scale(1.1);
      text-shadow: 0 0 30px rgba(212, 175, 55, 0.8);
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
      .purchase-notif {
        bottom: 90px;
        left: 10px;
        right: 10px;
        max-width: none;
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
      font-size: 14px;
    }

    .bonus-value {
      margin-left: auto;
      color: rgba(232, 230, 227, 0.5);
      text-decoration: line-through;
      font-size: 13px;
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
            <p style={{ color: 'rgba(232, 230, 227, 0.7)', fontSize: '16px' }}>
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

      {/* Purchase Notification Toast */}
      {showPurchaseNotif && currentNotif && (
        <div className="purchase-notif">
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #d4af37, #aa8c2c)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px'
          }}>
            ✓
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '2px' }}>
              {currentNotif.name} from {currentNotif.location}
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(232, 230, 227, 0.6)' }}>
              Just purchased a reading • {currentNotif.time} min ago
            </div>
          </div>
        </div>
      )}

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
              color: 'rgba(232, 230, 227, 0.7)',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              Complete 15-page personalized destiny report
            </p>

            <div style={{
              background: 'rgba(212, 175, 55, 0.1)',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <span style={{ textDecoration: 'line-through', color: 'rgba(232, 230, 227, 0.5)' }}>$14.99</span>
              <span className="gold-text" style={{ fontSize: '28px', marginLeft: '10px', fontWeight: 600 }}>$5.99</span>
            </div>

            <input
              type="email"
              placeholder="Enter your email for PDF delivery"
              className="payment-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {paymentError && (
              <div className="payment-error">{paymentError}</div>
            )}

            {/* PayPal 버튼 */}
            <div style={{ marginBottom: '15px' }}>
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
                          value: "5.99",
                          currency_code: "USD"
                        },
                        description: "Lumina Destiny Reading - Complete PDF Report"
                      }]
                    });
                  }}
                  onApprove={(data, actions) => {
                    return actions.order.capture().then((details) => {
                      console.log('Payment completed:', details);
                      setIsPaid(true);
                      setShowPaymentModal(false);
                      setDownloadReady(true);
                      // 결제자 이름 저장
                      if (details.payer?.name?.given_name) {
                        console.log('Payer:', details.payer.name.given_name);
                      }
                    });
                  }}
                  onError={(err) => {
                    console.error('PayPal Error:', err);
                    setPaymentError('Payment failed. Please try again.');
                  }}
                />
              </PayPalScriptProvider>
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
      <div className="floating-cta">
        <button className="cta-button" style={{ width: '100%', padding: '16px' }} onClick={handlePayment}>
          GET MY READING — $5.99
        </button>
      </div>

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
          {/* Live Viewers Badge */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <span className="live-indicator">
              <span className="live-dot" />
              {activeViewers} people viewing now
            </span>
          </div>

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
              color: 'rgba(232, 230, 227, 0.7)',
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
                fontSize: '22px',
                color: '#d4af37',
                marginBottom: '8px',
                fontStyle: 'italic'
              }}>
                "命者，天之所賦也"
              </p>
              <p style={{
                fontSize: '13px',
                color: 'rgba(232, 230, 227, 0.5)',
                letterSpacing: '1px'
              }}>
                "Destiny is what Heaven bestows upon you"
                <br />
                <span style={{ fontSize: '11px' }}>— Yuan Hai Zi Ping (淵海子平), Tang Dynasty</span>
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

          {/* Limited Time Offer Banner */}
          <div style={{
            background: 'linear-gradient(90deg, transparent, rgba(139, 37, 37, 0.25), transparent)',
            padding: '24px 20px',
            textAlign: 'center',
            marginBottom: '45px',
            borderTop: '1px solid rgba(212, 175, 55, 0.2)',
            borderBottom: '1px solid rgba(212, 175, 55, 0.2)'
          }}>
            <div style={{
              fontFamily: "'Cinzel', serif",
              letterSpacing: '3px',
              fontSize: '12px',
              marginBottom: '12px',
              color: '#d4af37',
              whiteSpace: 'nowrap'
            }}>
              ⚡ CELESTIAL ALIGNMENT SPECIAL ⚡
            </div>
            <div style={{ fontSize: '18px', marginBottom: '10px' }}>
              <span style={{ textDecoration: 'line-through', color: 'rgba(232, 230, 227, 0.5)' }}>$14.99</span>
              <span className={`gold-text price-highlight ${pulsePrice ? 'pulse' : ''}`} style={{ fontSize: '36px', marginLeft: '15px', fontWeight: 600 }}>$5.99</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '20px',
              flexWrap: 'wrap',
              fontSize: '14px',
              color: 'rgba(232, 230, 227, 0.7)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Offer ends in:</span>
                <span style={{
                  color: '#d4af37',
                  fontFamily: 'monospace',
                  fontSize: '16px',
                  fontWeight: 600
                }}>
                  {String(countdown.hours).padStart(2, '0')}:{String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}
                </span>
              </div>
              <span className="urgency-badge">
                🔥 Only {spotsLeft} spots left at this price
              </span>
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
              REVEAL MY DESTINY
            </button>

            {/* Value Stack */}
            <div style={{
              marginTop: '25px',
              textAlign: 'left',
              borderTop: '1px solid rgba(212, 175, 55, 0.1)',
              paddingTop: '20px'
            }}>
              <div style={{
                fontSize: '12px',
                letterSpacing: '2px',
                color: 'rgba(212, 175, 55, 0.7)',
                marginBottom: '12px',
                textAlign: 'center'
              }}>
                WHAT'S INCLUDED:
              </div>
              <div className="bonus-item">
                <span>📜</span> Complete 15-Page Personalized Report
                <span className="bonus-value">$29</span>
              </div>
              <div className="bonus-item">
                <span>💫</span> 10-Year Life Forecast
                <span className="bonus-value">$19</span>
              </div>
              <div className="bonus-item">
                <span>❤️</span> Love & Compatibility Analysis
                <span className="bonus-value">$15</span>
              </div>
              <div className="bonus-item">
                <span>💰</span> Wealth & Career Guidance
                <span className="bonus-value">$15</span>
              </div>
              <div style={{
                textAlign: 'center',
                marginTop: '15px',
                padding: '12px',
                background: 'rgba(212, 175, 55, 0.08)',
                borderRadius: '4px'
              }}>
                <span style={{ color: 'rgba(232, 230, 227, 0.5)', textDecoration: 'line-through' }}>Total Value: $78</span>
                <span className="gold-text" style={{ marginLeft: '10px', fontSize: '18px', fontWeight: 600 }}>Today: $5.99</span>
              </div>
            </div>

            {/* Guarantee Badge */}
            <div className="guarantee-badge" style={{ marginTop: '20px' }}>
              <span style={{ fontSize: '24px' }}>🛡️</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ color: '#22c55e', fontWeight: 600, fontSize: '13px' }}>100% MONEY-BACK GUARANTEE</div>
                <div style={{ fontSize: '12px', color: 'rgba(232, 230, 227, 0.6)' }}>Not satisfied? Full refund, no questions asked.</div>
              </div>
            </div>

            <p style={{
              marginTop: '18px',
              fontSize: '13px',
              color: 'rgba(232, 230, 227, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <span>🔒</span> Secure 256-bit SSL • Instant PDF delivery
            </p>
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
                    color: 'rgba(232, 230, 227, 0.7)'
                  }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Social Proof Section */}
          <div style={{ marginBottom: '80px' }}>
            <h2 style={{
              textAlign: 'center',
              fontFamily: "'Cinzel', serif",
              fontSize: '26px',
              letterSpacing: '6px',
              marginBottom: '50px',
              fontWeight: 400
            }}>
              TRANSFORMATIONS
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
              maxWidth: '1000px',
              margin: '0 auto'
            }}>
              {[
                { name: 'Sarah M.', location: 'California', text: "I was skeptical, but this reading accurately described challenges I've faced my whole life. The career guidance led me to a promotion within 3 months! The detail in the analysis was incredible.", rating: 5, date: '2 weeks ago' },
                { name: 'James K.', location: 'London', text: "The relationship insights were spot-on. I finally understand why certain patterns kept repeating in my love life. This is worth 100x the price.", rating: 5, date: '1 week ago' },
                { name: 'Michelle T.', location: 'Sydney', text: "I've tried many astrology services but BaZi goes so much deeper. The accuracy of my personality analysis gave me chills. My friends are all getting readings now!", rating: 5, date: '3 days ago' }
              ].map((review, i) => (
                <div key={i} className="testimonial-card" style={{ animationDelay: `${i * 0.2}s` }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px'
                  }}>
                    <span style={{
                      color: '#d4af37',
                      fontSize: '16px',
                      letterSpacing: '2px'
                    }}>
                      {'★'.repeat(review.rating)}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      color: 'rgba(232, 230, 227, 0.4)'
                    }}>
                      {review.date}
                    </span>
                  </div>
                  <p style={{
                    fontSize: '16px',
                    lineHeight: 1.8,
                    marginBottom: '20px',
                    fontStyle: 'italic',
                    color: 'rgba(232, 230, 227, 0.85)'
                  }}>
                    "{review.text}"
                  </p>
                  <div style={{
                    fontSize: '14px',
                    color: 'rgba(212, 175, 55, 0.8)'
                  }}>
                    — {review.name}, {review.location}
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              textAlign: 'center',
              marginTop: '50px',
              display: 'flex',
              justifyContent: 'center',
              gap: '50px',
              flexWrap: 'wrap'
            }}>
              <div>
                <div className="gold-text" style={{ fontSize: '44px', fontWeight: 600 }}>47,892</div>
                <div style={{ fontSize: '13px', color: 'rgba(232, 230, 227, 0.5)', letterSpacing: '2px', marginTop: '5px' }}>READINGS DELIVERED</div>
              </div>
              <div>
                <div className="gold-text" style={{ fontSize: '44px', fontWeight: 600 }}>4.9/5</div>
                <div style={{ fontSize: '13px', color: 'rgba(232, 230, 227, 0.5)', letterSpacing: '2px', marginTop: '5px' }}>AVERAGE RATING</div>
              </div>
              <div>
                <div className="gold-text" style={{ fontSize: '44px', fontWeight: 600 }}>98%</div>
                <div style={{ fontSize: '13px', color: 'rgba(232, 230, 227, 0.5)', letterSpacing: '2px', marginTop: '5px' }}>SATISFACTION</div>
              </div>
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
                { num: '3', title: 'Receive Your Reading', desc: 'Instant 15-page personalized PDF delivered to your email' }
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
                    color: 'rgba(232, 230, 227, 0.7)',
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
              color: 'rgba(232, 230, 227, 0.7)',
              marginBottom: '35px',
              maxWidth: '500px',
              margin: '0 auto 35px',
              lineHeight: 1.8
            }}>
              The universe has been waiting to share its secrets with you.
              <br />Are you ready to listen?
            </p>
            <button className="cta-button" onClick={handlePayment}>
              GET MY READING — $5.99
            </button>
            <p style={{
              marginTop: '22px',
              fontSize: '13px',
              color: 'rgba(232, 230, 227, 0.4)'
            }}>
              30-day money-back guarantee • Instant PDF delivery
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
                  color: 'rgba(232, 230, 227, 0.7)',
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
              © 2024 Lumina • Ancient BaZi Wisdom
              <br />
              <span style={{ fontSize: '11px' }}>
                For entertainment purposes. Results may vary based on individual interpretation.
              </span>
              <br /><br />
              <a href="#" style={{ color: 'rgba(212, 175, 55, 0.5)', textDecoration: 'none', marginRight: '20px' }}>Privacy Policy</a>
              <a href="#" style={{ color: 'rgba(212, 175, 55, 0.5)', textDecoration: 'none', marginRight: '20px' }}>Terms of Service</a>
              <a href="#" style={{ color: 'rgba(212, 175, 55, 0.5)', textDecoration: 'none' }}>Contact</a>
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
              Reading Preview
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
                fontSize: '18px',
                color: '#d4af37',
                marginBottom: '8px',
                fontStyle: 'italic'
              }}>
                "{ELEMENT_QUOTES[element].chinese}"
              </p>
              <p style={{
                fontSize: '13px',
                color: 'rgba(232, 230, 227, 0.6)',
                marginBottom: '5px'
              }}>
                "{ELEMENT_QUOTES[element].english}"
              </p>
              <p style={{
                fontSize: '11px',
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

            {/* Curiosity Gap - Unusual Finding Alert */}
            <div style={{
              background: 'linear-gradient(90deg, rgba(139, 69, 160, 0.2), rgba(212, 175, 55, 0.1))',
              padding: '20px',
              borderRadius: '4px',
              border: '1px solid rgba(139, 69, 160, 0.4)',
              animation: 'pulse 2s ease-in-out infinite'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '10px'
              }}>
                <span style={{
                  background: 'rgba(139, 69, 160, 0.5)',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  letterSpacing: '1px',
                  color: '#e8e6e3'
                }}>
                  ⚡ RARE FINDING
                </span>
              </div>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'rgba(232, 230, 227, 0.9)' }}>
                <strong>Ancient texts reveal an unusual pattern in your chart.</strong>
                <br />
                Your {element}-{animal} combination appears in only <strong style={{ color: '#d4af37' }}>3.2% of the population</strong>.
                Ming Dynasty scholars called this configuration "天赋异禀" (heaven-gifted)—suggesting significant hidden potential that requires deeper analysis to fully understand.
              </p>
            </div>
          </div>

          {/* Element Traits Preview */}
          <div className="mystical-border" style={{
            padding: '35px',
            marginBottom: '25px',
            borderRadius: '8px'
          }}>
            <h3 style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '18px',
              letterSpacing: '3px',
              marginBottom: '10px',
              textAlign: 'center',
              color: '#d4af37'
            }}>
              {element.toUpperCase()} ELEMENT TRAITS
            </h3>
            <p style={{
              fontSize: '12px',
              color: 'rgba(232, 230, 227, 0.5)',
              textAlign: 'center',
              marginBottom: '20px',
              fontStyle: 'italic'
            }}>
              As defined in the Wu Xing (五行) system
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '15px',
              flexWrap: 'wrap'
            }}>
              {ELEMENTS[element].traits.map((trait, i) => (
                <span key={i} style={{
                  padding: '8px 16px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  borderRadius: '20px',
                  fontSize: '14px',
                  color: 'rgba(232, 230, 227, 0.8)'
                }}>
                  {trait}
                </span>
              ))}
            </div>
          </div>

          {/* Locked Premium Sections - 결제 전에만 표시 */}
          {!isPaid && (
          <>
          <div style={{ position: 'relative', marginBottom: '25px' }}>
            <div className="locked-section">
              <div className="mystical-border" style={{
                padding: '35px',
                borderRadius: '8px'
              }}>
                <h3 style={{ fontFamily: "'Cinzel', serif", marginBottom: '15px', letterSpacing: '2px' }}>
                  DETAILED PERSONALITY ANALYSIS
                </h3>
                <p style={{ lineHeight: 1.8 }}>
                  {PERSONALITY_READINGS[element].positive.substring(0, 150)}...
                  <br /><br />
                  According to the "San Ming Tong Hui," your shadow aspects include...
                  <br /><br />
                  The ancient masters offer this cosmic advice for your element...
                </p>
              </div>
            </div>
            <div className="unlock-overlay">
              <span style={{ fontSize: '36px', marginBottom: '12px' }}>🔒</span>
              <span style={{ fontFamily: "'Cinzel', serif", letterSpacing: '3px', fontSize: '14px' }}>ANCIENT SCROLLS SEALED</span>
            </div>
          </div>

          <div style={{ position: 'relative', marginBottom: '25px' }}>
            <div className="locked-section">
              <div className="mystical-border" style={{
                padding: '35px',
                borderRadius: '8px'
              }}>
                <h3 style={{ fontFamily: "'Cinzel', serif", marginBottom: '15px', letterSpacing: '2px' }}>
                  WEALTH & CAREER DESTINY
                </h3>
                <p style={{ lineHeight: 1.8 }}>
                  The imperial texts reveal your {element} element indicates strong potential in...
                  <br /><br />
                  The {ELEMENT_RELATIONS.generates[element]} industries align with your cosmic energy because your element naturally generates...
                  <br /><br />
                  Ancient wisdom warns against careers related to {ELEMENT_RELATIONS.controls[element]} as this element...
                </p>
              </div>
            </div>
            <div className="unlock-overlay">
              <span style={{ fontSize: '36px', marginBottom: '12px' }}>🔒</span>
              <span style={{ fontFamily: "'Cinzel', serif", letterSpacing: '3px', fontSize: '14px' }}>ANCIENT SCROLLS SEALED</span>
            </div>
          </div>

          <div style={{ position: 'relative', marginBottom: '25px' }}>
            <div className="locked-section">
              <div className="mystical-border" style={{
                padding: '35px',
                borderRadius: '8px'
              }}>
                <h3 style={{ fontFamily: "'Cinzel', serif", marginBottom: '15px', letterSpacing: '2px' }}>
                  LOVE & COMPATIBILITY REPORT
                </h3>
                <p style={{ lineHeight: 1.8 }}>
                  The I Ching reveals your {animal} sign has highest compatibility with: {compatibility.best.join(', ')}
                  <br /><br />
                  Your ideal partner possesses {ELEMENTS[ELEMENT_RELATIONS.generates[element]].traits.slice(0, 3).join(', ')} qualities according to the principles of harmony (和)...
                  <br /><br />
                  Ancient sages warn of challenging matches with: {compatibility.avoid.join(', ')} due to...
                </p>
              </div>
            </div>
            <div className="unlock-overlay">
              <span style={{ fontSize: '36px', marginBottom: '12px' }}>🔒</span>
              <span style={{ fontFamily: "'Cinzel', serif", letterSpacing: '3px', fontSize: '14px' }}>ANCIENT SCROLLS SEALED</span>
            </div>
          </div>

          <div style={{ position: 'relative', marginBottom: '25px' }}>
            <div className="locked-section">
              <div className="mystical-border" style={{
                padding: '35px',
                borderRadius: '8px'
              }}>
                <h3 style={{ fontFamily: "'Cinzel', serif", marginBottom: '15px', letterSpacing: '2px' }}>
                  LUCKY ELEMENTS & TIMING
                </h3>
                <p style={{ lineHeight: 1.8 }}>
                  Sacred Numbers (吉数): {luckyNumbers.join(', ')}
                  <br />
                  Auspicious Colors: {luckyColors.join(', ')}
                  <br />
                  Fortunate Direction (方位): {luckyDirection}
                  <br /><br />
                  The celestial calendar reveals your most auspicious months are...
                  <br />
                  Imperial astrologers advise major decisions during...
                </p>
              </div>
            </div>
            <div className="unlock-overlay">
              <span style={{ fontSize: '36px', marginBottom: '12px' }}>🔒</span>
              <span style={{ fontFamily: "'Cinzel', serif", letterSpacing: '3px', fontSize: '14px' }}>ANCIENT SCROLLS SEALED</span>
            </div>
          </div>

          <div style={{ position: 'relative', marginBottom: '40px' }}>
            <div className="locked-section">
              <div className="mystical-border" style={{
                padding: '35px',
                borderRadius: '8px'
              }}>
                <h3 style={{ fontFamily: "'Cinzel', serif", marginBottom: '15px', letterSpacing: '2px' }}>
                  10-YEAR FORECAST (大運)
                </h3>
                <p style={{ lineHeight: 1.8 }}>
                  Your Life Path Number (命数) is {lifePath}, indicating...
                  <br /><br />
                  {DECADE_FORTUNES[Math.floor(lifePath / 2)]}
                  <br /><br />
                  The Da Yun cycle marks key years to watch: {year + 3}, {year + 7}, {year + 12}...
                </p>
              </div>
            </div>
            <div className="unlock-overlay">
              <span style={{ fontSize: '36px', marginBottom: '12px' }}>🔒</span>
              <span style={{ fontFamily: "'Cinzel', serif", letterSpacing: '3px', fontSize: '14px' }}>ANCIENT SCROLLS SEALED</span>
            </div>
          </div>
          </>
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
              color: 'rgba(232, 230, 227, 0.7)',
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
                  color: 'rgba(232, 230, 227, 0.7)',
                  fontSize: '16px'
                }}>
                  Download your complete 15-page personalized destiny report
                </p>

                <button className="download-button" onClick={handleDownloadPDF}>
                  📥 DOWNLOAD PDF REPORT
                </button>

                <p style={{
                  marginTop: '20px',
                  fontSize: '13px',
                  color: 'rgba(232, 230, 227, 0.5)'
                }}>
                  A copy has also been sent to: {email}
                </p>

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
                  color: 'rgba(232, 230, 227, 0.7)',
                  fontSize: '16px'
                }}>
                  Get instant access to your full 15-page personalized destiny report
                </p>

                {/* What's included */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                  marginBottom: '30px',
                  textAlign: 'left',
                  maxWidth: '500px',
                  margin: '0 auto 30px'
                }}>
                  {[
                    'Complete Four Pillars Analysis',
                    'Deep Personality Profile',
                    'Career & Wealth Guidance',
                    'Love Compatibility Report',
                    'Lucky Elements & Colors',
                    '10-Year Life Forecast'
                  ].map((item, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      color: 'rgba(232, 230, 227, 0.8)'
                    }}>
                      <span style={{ color: '#d4af37' }}>✓</span>
                      {item}
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: '25px' }}>
                  <span style={{ textDecoration: 'line-through', color: 'rgba(232, 230, 227, 0.5)', fontSize: '18px' }}>$14.99</span>
                  <span className="gold-text" style={{ fontSize: '42px', marginLeft: '15px', fontWeight: 600 }}>$5.99</span>
                </div>

                <button className="cta-button" onClick={handlePayment}>
                  UNLOCK FULL READING NOW
                </button>
              </>
            )}

            <div style={{
              marginTop: '25px',
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
              flexWrap: 'wrap',
              fontSize: '13px',
              color: 'rgba(232, 230, 227, 0.5)'
            }}>
              <span>🔒 Secure checkout</span>
              <span>📧 Instant PDF delivery</span>
              <span>💯 30-day guarantee</span>
            </div>
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
              <span style={{ fontSize: '14px' }}>✓ Verified Reviews</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
