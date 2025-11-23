// Vercel Serverless Function - OpenAI API 호출
// API 키가 서버에서만 사용되므로 안전합니다

export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  try {
    const { birthData, analysis } = req.body;
    const { year, month, day, hour } = birthData;
    const { element, animal, yinYang, monthElement, dayElement, hourAnimal, lifePath } = analysis;

    // 천간 계산
    const heavenlyStems = ['Geng (庚)', 'Xin (辛)', 'Ren (壬)', 'Gui (癸)', 'Jia (甲)', 'Yi (乙)', 'Bing (丙)', 'Ding (丁)', 'Wu (戊)', 'Ji (己)'];
    const earthlyBranches = ['Shen (申)', 'You (酉)', 'Xu (戌)', 'Hai (亥)', 'Zi (子)', 'Chou (丑)', 'Yin (寅)', 'Mao (卯)', 'Chen (辰)', 'Si (巳)', 'Wu (午)', 'Wei (未)'];

    const yearStem = heavenlyStems[parseInt(year) % 10];
    const yearBranch = earthlyBranches[parseInt(year) % 12];

    function getSeasonEnergy(month) {
      if (month >= 2 && month <= 4) return 'Spring (Wood energy rising)';
      if (month >= 5 && month <= 7) return 'Summer (Fire energy peak)';
      if (month >= 8 && month <= 10) return 'Autumn (Metal energy gathering)';
      return 'Winter (Water energy deep)';
    }

    const prompt = `You are a legendary Grand Master of BaZi (四柱推命), with 50 years of study in classical Chinese metaphysics. You have memorized and deeply understood:
- San Ming Tong Hui (三命通會) - The Complete Book of Three Fates
- Yuan Hai Zi Ping (淵海子平) - The Original Sea of Zi Ping
- Di Tian Sui (滴天髓) -Erta from Heaven
- Qiong Tong Bao Jian (穷通宝鉴) - The Exhaustive Treasure Mirror
- Zi Ping Zhen Quan (子平真詮) - The True Essence of Zi Ping

A client seeks your wisdom for a comprehensive personalized destiny reading. As their trusted advisor, provide an exceptionally detailed, profound, and insightful analysis that demonstrates your mastery of BaZi.

═══════════════════════════════════════
CLIENT'S FOUR PILLARS (四柱八字)
═══════════════════════════════════════

📅 **Birth Date:** ${year}년 ${month}월 ${day}일 ${hour !== '' ? `${hour}시` : '(Time Unknown)'}

**YEAR PILLAR (年柱):**
- Heavenly Stem: ${yearStem}
- Earthly Branch: ${yearBranch}
- Element: ${element} (${yinYang})
- Chinese Zodiac: ${animal}

**MONTH PILLAR (月柱):**
- Element: ${monthElement}
- Season Energy: ${getSeasonEnergy(parseInt(month))}

**DAY PILLAR (日柱) - The Self:**
- Day Master Element: ${dayElement}
- This represents the client's TRUE SELF

${hourAnimal ? `**HOUR PILLAR (時柱):**
- Hour Animal: ${hourAnimal}
- This reveals hidden talents and late-life fortune` : '**HOUR PILLAR:** Unknown (limits some analysis depth)'}

**Numerological Life Path:** ${lifePath}

═══════════════════════════════════════
REQUIRED ANALYSIS SECTIONS
═══════════════════════════════════════

Create an EXTENSIVE reading (3000+ words) covering ALL of the following. Each section must be detailed and specific to THIS person's unique elemental combination:

## 1. 🌟 THE COSMIC BLUEPRINT - Overall Destiny Pattern
- Analyze the interaction between their Year, Month, Day, and Hour pillars
- Identify the dominant element pattern (is their chart balanced or does one element dominate?)
- Explain their "Ming" (命) - their fundamental life pattern set at birth
- Reference what the San Ming Tong Hui says about this specific stem-branch combination
- Include the classical Chinese term for their destiny pattern

## 2. 👤 THE INNER SELF - Deep Personality Analysis
- Day Master (${dayElement}) analysis - this is their TRUE nature
- How the Year element (${element}) shapes their outer personality
- The interplay between Yin/Yang in their chart
- Their "hidden" personality (what others don't see)
- Shadow aspects and psychological blind spots
- Core fears and deepest motivations
- How they handle stress and conflict

## 3. 💼 CAREER & LIFE PURPOSE - Professional Destiny
- Industries that resonate with their elemental composition
- Specific job roles that align with their Day Master
- Management style and work relationships
- Best periods for career advancement (based on elemental cycles)
- WARNING: Industries and roles to AVOID
- Their potential for entrepreneurship vs. employment
- Ideal work environment (creative, structured, collaborative, solo)

## 4. 💰 WEALTH & PROSPERITY - Financial Destiny
- Their relationship with money (spender, saver, investor)
- Natural wealth-building strengths
- Financial blind spots and risks
- Best investment types for their element
- Ages/periods when wealth luck peaks
- The "Wealth Star" (財星) analysis in their chart
- Specific advice for building long-term prosperity

## 5. 💕 LOVE & RELATIONSHIPS - Romantic Destiny
- Their love language and emotional needs
- What they truly need in a partner (not what they think they want)
- Most compatible zodiac signs with detailed explanations
- CHALLENGING matches and why
- Marriage timing indicators
- Potential relationship patterns and pitfalls
- The "Spouse Palace" (配偶宫) analysis
- Advice for attracting and maintaining love

## 6. 👨‍👩‍👧‍👦 FAMILY & SOCIAL LIFE
- Relationship with parents (based on Year pillar)
- Sibling dynamics
- Their role in friendships
- Parenting style predictions
- Social reputation and public image

## 7. 🏥 HEALTH & LONGEVITY
- Organs associated with their dominant element
- Specific health vulnerabilities
- Mental health tendencies
- Recommended foods, exercises, and lifestyle habits
- Best seasons for their health
- Warning signs to watch for
- Longevity indicators in their chart

## 8. 📅 DETAILED FORECAST 2024-2026
Provide SPECIFIC predictions for:

**2024 (Year of the Wood Dragon 甲辰):**
- How this year's energy interacts with their chart
- Key opportunities and challenges
- Best months for major decisions
- Areas requiring caution

**2025 (Year of the Wood Snake 乙巳):**
- Major themes and energy shifts
- Career and financial outlook
- Relationship developments
- Health focus areas

**2026 Preview (Year of the Fire Horse 丙午):**
- Early indicators and preparation advice

## 9. 🔮 10-YEAR LUCK CYCLE (大運) ANALYSIS
- Identify which "Luck Pillar" they are currently in
- Describe the theme of their current decade
- Preview the next luck cycle transition

## 10. 💎 LUCKY ELEMENTS & ENHANCEMENTS
- Lucky colors with specific shades
- Lucky numbers and their meanings
- Favorable directions for home/office
- Beneficial gemstones and crystals
- Auspicious dates for major decisions
- Feng Shui recommendations

## 11. ⚠️ WARNINGS & CHALLENGES
- Years or periods requiring extra caution
- Relationship red flags specific to their chart
- Career traps to avoid
- Health risks by life stage

## 12. 📜 WISDOM FROM THE ANCIENTS
- Select 3 classical Chinese proverbs specifically relevant to their chart
- Provide the Chinese characters, pinyin, and English translation
- Explain why each applies to them personally
- Closing blessing and encouragement

═══════════════════════════════════════
FORMATTING REQUIREMENTS
═══════════════════════════════════════
- Use markdown headers (##) for main sections
- Use bold (**) for emphasis
- Use bullet points for lists
- Include occasional Chinese characters for authenticity
- Make it feel like a premium, professional consultation
- Be SPECIFIC - avoid generic statements that could apply to anyone
- Reference classical texts by name when making interpretations
- The tone should be: wise, authoritative, compassionate, mystical yet practical

This client paid premium price. Deliver exceptional value.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a legendary Grand Master of BaZi (四柱推命) and Chinese metaphysics with 50 years of profound study. You have advised royalty, celebrities, and business tycoons. Your readings are renowned for their:

1. DEPTH - You see layers others miss
2. SPECIFICITY - No generic statements, everything tailored
3. CLASSICAL KNOWLEDGE - You quote ancient texts fluently
4. PRACTICAL WISDOM - Mystical yet actionable advice
5. COMPASSION - Warnings delivered with care

You write in elegant, flowing prose that feels like a premium consultation worth hundreds of dollars. Every sentence should make the client feel their money was well spent.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 8000,
        temperature: 0.85
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API request failed');
    }

    const data = await response.json();
    const analysisResult = data.choices[0].message.content;

    return res.status(200).json({ analysis: analysisResult });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
