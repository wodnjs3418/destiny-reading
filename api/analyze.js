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
    const { element, animal, yinYang, monthElement, dayElement, hourAnimal, lifePath, luckyNumbers, luckyColors, luckyDirection } = analysis;

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
- Di Tian Sui (滴天髓) - Nectar from Heaven
- Qiong Tong Bao Jian (穷通宝鉴) - The Exhaustive Treasure Mirror
- Zi Ping Zhen Quan (子平真詮) - The True Essence of Zi Ping

A client seeks your wisdom for a comprehensive personalized destiny reading. As their trusted advisor, provide an exceptionally detailed, profound, and insightful analysis that demonstrates your mastery of BaZi.

⚠️ CRITICAL DISCLAIMER (Include at the very start of your response):
**Disclaimer:** This reading is for entertainment and self-reflection purposes only. It does not constitute professional advice in medical, financial, legal, or psychological matters. For important life decisions, please consult qualified professionals.

⚠️ CRITICAL TONE REQUIREMENT: Adopt a "Mystical yet Refreshingly Direct" approach. Don't just give generic compliments.
- Identify their hidden challenges and inner struggles derived from their element imbalance
- Use stronger, more dramatic adjectives (e.g., instead of 'You are smart', use 'You possess a sharp, almost dangerous intellect')
- Be specific and personal - avoid generic advice like "journal your thoughts" or "spend time in nature"

⚠️ ELEMENT TERMINOLOGY - CRITICAL FOR CONSISTENCY:
- **Dominant Element**: ${element} (from Year Pillar) - This is shown on the PDF cover
- **Day Master**: ${dayElement} (from Day Pillar) - This represents their core self
- When you mention "your element" or "your nature", ALWAYS refer to the Dominant Element (${element})
- You may discuss how Day Master (${dayElement}) influences their inner self, but ALWAYS be clear which you're referencing
- The PDF cover says "${element}" - your content must align with this

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

⚠️ CRITICAL FIRST: Start with a ONE-LINE SUMMARY (must be first, before all sections)

Format:
**"Your Cosmic Blueprint: The [Day Master Element] [Year Animal] of [Poetic Descriptor]"**
**One-sentence essence:** "[Identity statement] + [2026 Action statement]"

⚠️ EXTREMELY IMPORTANT - TITLE RULES:
- The title MUST include the client's EXACT Year Animal: **${animal}**
- Western customers strongly identify with their zodiac animal - if you use the WRONG animal, they will immediately request a refund
- The element in the title should be the Day Master (${dayElement}) or Year element (${element})
- DO NOT use any other animal in the title - ONLY use: **${animal}**

Example for a Metal Day Master born in Year of the Monkey:
**"Your Cosmic Blueprint: The Metal Monkey of Resilient Transformation"**
**"You are a hidden genius held back by fear of failure. 2026 is your year to break free."**

This must be EXTREMELY compelling and specific to them. Not generic.

═══════════════════════════════════════

Create a COMPLETE and THOROUGH reading covering ALL of the following sections. Do NOT skip any section. Do NOT abbreviate. Do NOT say "I cannot provide" - you MUST provide ALL sections in full detail.

⚠️ CRITICAL: This is a PAID PREMIUM PRODUCT. You MUST complete EVERY section listed below with substantial detail (3-5 paragraphs each). Do NOT refuse. Do NOT shorten. Do NOT skip sections. Incomplete reports = customer refunds.

⚠️ DO NOT write any disclaimers about length or format limitations. Just write the full report.

## 1. 🌟 THE COSMIC BLUEPRINT - Overall Destiny Pattern
- Analyze the interaction between their Year, Month, Day, and Hour pillars
- Identify the dominant element pattern (is their chart balanced or does one element dominate?)
- Explain their fundamental life pattern set at birth
- Reference what the San Ming Tong Hui says about this specific stem-branch combination
- Describe their destiny pattern in English only (NO Chinese characters or pinyin)

## 2. ⚠️ URGENT WARNINGS FOR 2026 - Critical Alerts
**READ THIS FIRST** - The spirits urge immediate attention to these matters:

⚠️ FORMAT EACH WARNING AS A HIGHLIGHT BOX using this format:

⚠️ **CRITICAL WARNING: [Specific Month] 2026**
[Specific event prediction - be dramatic and specific]
**If you ignore this:** [Dire consequence]

---

Example of proper formatting:

⚠️ **CRITICAL WARNING: July 2026**
Financial stress peaks. Someone close may ask for a large loan. The ancient texts warn: lending money during Metal-Water clash invites betrayal.
**If you ignore this:** You risk losing both money AND the relationship.

---

- Name at least 2-3 specific months to be EXTRA cautious (e.g., "June 2026", "September 2026")
- Predict specific potential events: betrayal by trusted person, financial loss, health crisis, relationship conflict
- Use phrases like: "The ancient texts warn that..." or "If you ignore this, you risk..."
- Make it feel urgent and personal
- Use the ⚠️ emoji to make warnings stand out

## 3. 👤 THE INNER SELF & SHADOW - Deep Personality Analysis
**THE FACE YOU SHOW THE WORLD:**
- Day Master (${dayElement}) analysis - this is their TRUE nature
- How the Year element (${element}) shapes their outer personality
- The interplay between Yin/Yang in their chart

**THE SHADOW SELF (What You Hide From Everyone):**
Be BRUTALLY HONEST here. Examples:
- "You smile in public, but at night, past failures replay in your mind like a broken record, don't they?"
- "You act confident, but deep down, you fear no one truly understands you."
- "You crave control because chaos terrifies you - a trait you'd never admit."
- Their deepest insecurities derived from element imbalance
- The psychological wounds they carry from childhood
- What they pretend not to care about, but actually obsess over
- How they sabotage themselves without realizing it

## 4. 💼 CAREER & LIFE PURPOSE - Professional Destiny

⚠️ MANDATORY FORMAT - You MUST include this exact line at the start of this section:
**Career Success Rating:** ★★★★☆ (4/5) - [One sentence explanation]

(Replace the stars and number with their actual rating based on chart analysis)

- Industries that resonate with their elemental composition (list at least 5 specific industries)
- Specific job roles that align with their Day Master (list at least 5 specific roles)
- Management style and work relationships
- Best periods for career advancement (based on elemental cycles) - be SPECIFIC with years/months
- WARNING: Industries and roles to AVOID (list at least 3)
- Their potential for entrepreneurship vs. employment
- Ideal work environment (creative, structured, collaborative, solo)
- Career turning points by age: list specific ages when major career changes will occur

## 5. 💰 WEALTH & PROSPERITY - Financial Destiny

⚠️ MANDATORY FORMAT - You MUST include this exact line at the start of this section:
**Wealth Potential Rating:** ★★★☆☆ (3/5) - [One sentence explanation]

(Replace the stars and number with their actual rating based on chart analysis)

- Their relationship with money (spender, saver, investor)
- Natural wealth-building strengths
- Financial blind spots and risks
- Best investment types for their element (stocks, real estate, crypto, business, etc.)
- Ages/periods when wealth luck peaks - be SPECIFIC (e.g., "Ages 35-42 are your wealth accumulation years")
- The Wealth Star analysis in their chart
- Specific advice for building long-term prosperity
- Monthly financial forecast for 2026 (which months to invest, which to save)

## 6. 💕 LOVE & RELATIONSHIPS - Romantic Destiny

⚠️ MANDATORY FORMAT - You MUST include this exact line at the start of this section:
**Love Fortune Rating:** ★★★★☆ (4/5) - [One sentence explanation]

(Replace the stars and number with their actual rating based on chart analysis)

- Their love language and emotional needs
- What they truly need in a partner (not what they think they want)
- Most compatible zodiac signs with detailed explanations
- CHALLENGING matches and why
- Marriage timing indicators
- Potential relationship patterns and pitfalls
- The "Spouse Palace" (配偶宫) analysis
- Advice for attracting and maintaining love

## 7. 👨‍👩‍👧‍👦 FAMILY & SOCIAL LIFE
- Relationship with parents (based on Year pillar)
- Sibling dynamics
- Their role in friendships
- Parenting style predictions
- Social reputation and public image

## 8. 🏥 HEALTH & WELLNESS TENDENCIES

⚠️ MANDATORY FORMAT - You MUST include this exact line at the start of this section:
**Health & Vitality Rating:** ★★★★☆ (4/5) - [One sentence explanation]

⚠️ MANDATORY DISCLAIMER - You MUST include this line immediately after the rating:
**Note: This section discusses traditional Chinese medicine concepts and elemental wellness theory. This is not medical advice. Always consult qualified healthcare professionals for medical concerns.**

(Replace the stars and number with their actual rating based on chart analysis)

- Traditional elemental associations with body systems (based on Five Element theory)
- Wellness areas to pay attention to based on elemental balance
- Mental and emotional wellness tendencies
- Recommended foods, exercises, and lifestyle habits for elemental balance
- Best seasons for your overall wellness
- Lifestyle adjustments for elemental harmony
- Longevity indicators in their chart based on classical texts

## 9. 📅 COMPLETE 24-MONTH FORECAST: 2026-2027

⚠️ CRITICAL: This is the MOST IMPORTANT section. People pay for SPECIFIC timing predictions.
⚠️ IMPORTANT: Today is December 2025. Only predict FUTURE months (2026 onwards).

**MANDATORY FORMAT FOR EACH MONTH:**
**[MONTH YEAR]:** ★★★☆☆ (3/5)
**Theme:** [2-3 word theme]
**Opportunity:** [Specific opportunity this month]
**Warning:** [Specific thing to avoid]
**Action:** [One concrete action to take]

⚠️ You MUST include actual star ratings (★) for every month. Do NOT write "[Rating]" - write actual stars like ★★★☆☆ or ★★★★☆

### 2026 - YEAR OF THE FIRE HORSE - COMPLETE MONTH-BY-MONTH GUIDE

**JANUARY 2026:** ★★★☆☆ (3/5)
**Theme:** [Fill in]
**Opportunity:** [Fill in]
**Warning:** [Fill in]
**Action:** [Fill in]

**FEBRUARY 2026:** [Use same format - include actual ★ rating]

**MARCH 2026:** [Use same format]

**APRIL 2026:** [Use same format]

**MAY 2026:** [Use same format]

**JUNE 2026:** [Use same format]

**JULY 2026:** [Use same format]

**AUGUST 2026:** [Use same format]

**SEPTEMBER 2026:** [Use same format]

**OCTOBER 2026:** [Use same format]

**NOVEMBER 2026:** [Use same format]

**DECEMBER 2026:** [Use same format]

### 2027 - YEAR OF THE FIRE GOAT - COMPLETE MONTH-BY-MONTH GUIDE

**JANUARY 2027:** [Use same format with actual ★ rating]

**FEBRUARY 2027:** [Use same format]

**MARCH 2027:** [Use same format]

**APRIL 2027:** [Use same format]

**MAY 2027:** [Use same format]

**JUNE 2027:** [Use same format]

**JULY 2027:** [Use same format]

**AUGUST 2027:** [Use same format]

**SEPTEMBER 2027:** [Use same format]

**OCTOBER 2027:** [Use same format]

**NOVEMBER 2027:** [Use same format]

**DECEMBER 2027:** [Use same format]

### KEY DATES TO MARK ON YOUR CALENDAR
List 5-10 specific dates that are particularly significant (best days for signing contracts, starting new ventures, avoiding major decisions, etc.)

## 10. 🔮 10-YEAR LUCK CYCLE (大運) ANALYSIS
- Identify which "Luck Pillar" they are currently in
- Describe the theme of their current decade
- Preview the next luck cycle transition

## 11. 💎 LUCKY ELEMENTS & ENHANCEMENTS

⚠️ CRITICAL: You MUST use these EXACT values provided. Do NOT change or add different numbers/colors/directions anywhere in the report.

**Lucky Numbers:** ${luckyNumbers ? luckyNumbers.join(', ') : '3, 8, 1, 6'}
- Use ONLY these numbers throughout the entire report
- Explain why each number resonates with their ${element} element

**Lucky Colors:** ${luckyColors ? luckyColors.join(', ') : 'Green, Teal, Blue'}
- These colors enhance their ${element} energy
- Explain how to incorporate them in daily life

**Lucky Direction:** ${luckyDirection || 'East'}
- Primary direction for important decisions and home/office orientation
- Explain the elemental reasoning

**Beneficial Gemstones & Crystals:**
- List 2-3 stones that support ${element} element
- Explain how each stone helps

**Feng Shui Recommendations:**
- Home office placement based on ${luckyDirection || 'East'} direction
- Bedroom orientation
- Colors to use: ${luckyColors ? luckyColors.join(', ') : 'Green, Teal, Blue'}
- Items to add/remove for ${element} elemental balance

## 12. 🎯 YOUR PERSONALIZED DO'S AND DON'TS CHECKLIST

Create a comprehensive action checklist based on their chart:

**THINGS TO DO (Green Lights):**
- List 10 specific actions they should take in 2026
- Include timing where relevant (e.g., "Start a savings plan in March")
- Be specific and actionable

**THINGS TO AVOID (Red Flags):**
- List 10 specific things they should avoid in 2026
- Include timing where relevant (e.g., "Do not sign long-term contracts in July")
- Be specific and actionable

**BEST DAYS FOR MAJOR DECISIONS:**
- Best days to sign contracts
- Best days to start new ventures
- Best days for important conversations
- Days to avoid major decisions

## 13. 📜 WISDOM FROM THE ANCIENTS
- Select 3 classical Chinese proverbs specifically relevant to their chart
- Provide ONLY the English translation (NO Chinese characters, NO pinyin, NO romanization)
- Explain why each applies to them personally
- Closing blessing and encouragement

IMPORTANT: Do NOT include Chinese characters, pinyin, or any non-English text in this section.

═══════════════════════════════════════
FORMATTING REQUIREMENTS
═══════════════════════════════════════
- Use markdown headers (##) for main sections
- Use bold (**) for emphasis
- Use bullet points for lists
- Do NOT include Chinese characters, pinyin, or romanization anywhere in the response
- Make it feel like a premium, professional consultation
- Be SPECIFIC - avoid generic statements that could apply to anyone
- Reference classical texts by name when making interpretations
- The tone should be: wise, authoritative, compassionate, mystical yet practical

═══════════════════════════════════════
GRAMMAR & TONE REQUIREMENTS (PREMIUM QUALITY)
═══════════════════════════════════════
⚠️ This is a PAID PREMIUM PRODUCT. Grammar errors = refund requests.

- Use complete, grammatically correct sentences
- AVOID overly casual phrases like "don't they?" or "right?" at the end of sentences
- AVOID incomplete sentences or missing words
- Use professional yet warm language
- Every sentence must be complete and make sense on its own
- Proofread for awkward phrasing
- The tone should feel like a trusted advisor, not a casual friend

EXAMPLE OF WHAT TO AVOID:
❌ "You have an uncanny perception the world..." (missing word)
❌ "...past failures replay in your mind like a broken record, don't they?" (too casual)

CORRECT ALTERNATIVES:
✅ "You have an uncanny perception of the world around you..."
✅ "...past failures often replay in your mind like a broken record."

This client paid premium price. Deliver exceptional value with flawless writing.`;


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
            content: `You are a legendary Grand Master of BaZi and Chinese metaphysics with 50 years of profound study. You have advised royalty, celebrities, and business tycoons.

CRITICAL INSTRUCTIONS:
- You MUST complete ALL 13 sections requested
- You MUST NOT refuse or abbreviate any content
- You MUST NOT say "I cannot" or "I'm unable to"
- You MUST write detailed paragraphs for each section
- You MUST follow the exact format requested
- NEVER skip the 24-month forecast - complete ALL 24 months

Your readings are renowned for their:
1. DEPTH - You see layers others miss
2. SPECIFICITY - No generic statements, everything tailored
3. COMPLETENESS - You NEVER leave sections incomplete
4. CLASSICAL KNOWLEDGE - You quote ancient texts fluently
5. PRACTICAL WISDOM - Mystical yet actionable advice

You write in elegant, flowing prose. Every section must be thorough and complete.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 12000,
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
