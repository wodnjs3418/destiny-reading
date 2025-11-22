// Comprehensive BaZi Analysis Content
// 상세 사주 분석 콘텐츠
// Based on classical texts including the San Ming Tong Hui (三命通會) and Yuan Hai Zi Ping (淵海子平)

// Classical Chinese quotes for each element
export const ELEMENT_QUOTES = {
  Wood: {
    chinese: "木曰曲直，味酸，主仁",
    english: "Wood bends and straightens, tastes sour, governs benevolence",
    source: "Shang Shu (尚書), Zhou Dynasty"
  },
  Fire: {
    chinese: "火曰炎上，味苦，主禮",
    english: "Fire blazes upward, tastes bitter, governs propriety",
    source: "Shang Shu (尚書), Zhou Dynasty"
  },
  Earth: {
    chinese: "土爰稼穡，味甘，主信",
    english: "Earth enables sowing and reaping, tastes sweet, governs faithfulness",
    source: "Shang Shu (尚書), Zhou Dynasty"
  },
  Metal: {
    chinese: "金曰從革，味辛，主義",
    english: "Metal submits and transforms, tastes pungent, governs righteousness",
    source: "Shang Shu (尚書), Zhou Dynasty"
  },
  Water: {
    chinese: "水曰潤下，味鹹，主智",
    english: "Water moistens and descends, tastes salty, governs wisdom",
    source: "Shang Shu (尚書), Zhou Dynasty"
  }
};

// Ancient proverbs about destiny
export const DESTINY_PROVERBS = [
  { chinese: "知命者不怨天", english: "One who knows their destiny does not blame Heaven", source: "Xunzi (荀子)" },
  { chinese: "天行健，君子以自強不息", english: "As Heaven's movement is ever vigorous, the superior man makes himself strong and untiring", source: "I Ching (易經)" },
  { chinese: "順天者昌，逆天者亡", english: "Those who follow Heaven flourish; those who oppose Heaven perish", source: "Mengzi (孟子)" },
  { chinese: "盡人事，聽天命", english: "Do your best and leave the rest to destiny", source: "Ancient Proverb" },
  { chinese: "命由天定，運由己造", english: "Destiny is set by Heaven, but fortune is created by oneself", source: "Folk Wisdom" }
];

export const ELEMENT_ANALYSIS = {
  Wood: {
    overview: `According to the ancient text "Yuan Hai Zi Ping" (淵海子平), those born under the Wood element embody the energy of spring—growth, expansion, and new beginnings. The Tang Dynasty scholars wrote: "Wood is the essence of benevolence (仁), the first virtue."

Like a mighty tree rooted in ancient soil, you possess remarkable resilience and an innate ability to adapt while maintaining your core integrity. Your Wood essence, what the masters called "Jia Mu" (甲木), gives you natural creativity and long-term vision. This forward-thinking nature made Wood element individuals prized advisors in imperial courts.`,

    personality: {
      strengths: [
        "Exceptional creativity and innovative thinking",
        "Strong sense of ethics and justice",
        "Natural leadership through inspiration rather than force",
        "Remarkable adaptability and flexibility",
        "Deep compassion and empathy for others",
        "Visionary mindset with long-term perspective",
        "Excellent at initiating new projects and ventures"
      ],
      challenges: [
        "Tendency to scatter energy across too many pursuits",
        "Can become rigid when feeling threatened",
        "May struggle with completing projects once started",
        "Prone to frustration when growth is blocked",
        "Sometimes overly idealistic expectations"
      ],
      advice: "Channel your abundant creative energy into focused endeavors. Your greatest achievements will come when you commit fully to a singular vision rather than pursuing multiple paths simultaneously. Practice patience—like a tree, your growth is steady and cumulative."
    },

    career: {
      ideal: [
        "Creative industries (design, art, writing, music)",
        "Education and teaching",
        "Environmental and sustainability sectors",
        "Healthcare and healing professions",
        "Entrepreneurship and startups",
        "Publishing and media",
        "Architecture and urban planning",
        "Fashion and textile industries"
      ],
      strengths: "Your innovative thinking and ability to see the big picture make you invaluable in roles requiring vision and creativity. You excel at launching new initiatives and inspiring teams.",
      warning: "Avoid careers that are too rigid or repetitive. You need room to grow and innovate. Highly bureaucratic environments will stifle your natural energy.",
      timing: "Spring (February-April) is your power season for career moves. Wood years and months amplify your professional success."
    },

    wealth: {
      tendency: "You have a natural talent for identifying growth opportunities, making you potentially excellent at long-term investments. However, your generous nature may lead to overspending on others.",
      advice: "Focus on investments that grow over time—real estate, stocks, businesses. Avoid get-rich-quick schemes. Your wealth builds like a forest: slowly but substantially.",
      lucky_industries: ["Technology", "Green energy", "Education", "Healthcare", "Publishing"]
    },

    health: {
      organs: "Liver and gallbladder are your associated organs. Take special care of your eyes and tendons.",
      vulnerabilities: "Prone to stress-related issues, eye strain, and muscle tension. May experience headaches when frustrated.",
      recommendations: [
        "Practice stress management through meditation or gentle exercise",
        "Eat plenty of green leafy vegetables",
        "Avoid excessive alcohol consumption",
        "Get adequate sleep, especially between 11pm-3am (liver recovery time)",
        "Regular stretching and yoga benefit your tendons"
      ]
    }
  },

  Fire: {
    overview: `The ancient masters of the Song Dynasty declared: "Fire is the essence of propriety (禮), the light that illuminates truth." As a Fire element person, you carry the blazing energy of summer—passion, transformation, and illumination.

According to the "San Ming Tong Hui" (三命通會), Fire individuals are the spark that ignites inspiration in others. Your Fire essence, "Bing Huo" (丙火), gives you exceptional charisma that emperors sought in their most trusted diplomats. You live life with intensity, and ancient texts note that Fire souls have the rare gift of transforming the ordinary into the extraordinary.`,

    personality: {
      strengths: [
        "Magnetic charisma and natural leadership",
        "Infectious enthusiasm and optimism",
        "Excellent communication and persuasion skills",
        "Quick thinking and sharp intuition",
        "Ability to inspire and motivate others",
        "Passionate commitment to causes you believe in",
        "Natural performer with strong presence"
      ],
      challenges: [
        "Tendency to burn out from overexertion",
        "May overwhelm others with intensity",
        "Impatience with slower-paced individuals",
        "Risk of impulsive decisions",
        "Can struggle with sustained focus"
      ],
      advice: "Learn to bank your fire when rest is needed. Your flame burns longest when you nurture it with patience. Not every situation requires your full intensity—sometimes a gentle warmth is more effective than a blazing inferno."
    },

    career: {
      ideal: [
        "Entertainment and performing arts",
        "Sales and marketing",
        "Public relations and communications",
        "Politics and public speaking",
        "Hospitality and event management",
        "Motivational speaking and coaching",
        "Restaurant and food industry",
        "Fashion and beauty industries"
      ],
      strengths: "Your natural charisma and communication skills make you excel in any role requiring persuasion, presentation, or public interaction. You're a natural leader who inspires teams.",
      warning: "Avoid isolated roles with little human interaction. You need an audience and social stimulation. Beware of burning out by taking on too many high-intensity projects.",
      timing: "Summer (May-July) is your power season. Fire years bring peak opportunities for career advancement."
    },

    wealth: {
      tendency: "You're drawn to exciting, high-potential investments but may lack patience for long-term growth. Your generous nature often means spending freely on experiences and others.",
      advice: "Balance your love of excitement with stable investments. Build a core portfolio of reliable assets before pursuing higher-risk opportunities. Your wealth grows best when you collaborate with Earth-type advisors.",
      lucky_industries: ["Entertainment", "Marketing", "Technology", "Hospitality", "Luxury goods"]
    },

    health: {
      organs: "Heart and small intestine are your associated organs. Pay attention to your cardiovascular system and blood circulation.",
      vulnerabilities: "Prone to heart palpitations, anxiety, insomnia, and circulation issues. May experience overheating and inflammation.",
      recommendations: [
        "Prioritize cardiovascular exercise",
        "Practice calming activities to balance intensity",
        "Avoid excessive caffeine and stimulants",
        "Eat bitter foods (good for heart in Chinese medicine)",
        "Ensure adequate rest between high-energy periods",
        "Stay hydrated, especially in summer"
      ]
    }
  },

  Earth: {
    overview: `The I Ching (易經) teaches that Earth occupies the sacred center, governing all transitions. As an Earth element person, you embody the energy of late summer—stability, nurturing, and groundedness. Ancient scholars called Earth "the mother of the ten thousand things."

Your Earth essence, "Wu Tu" (戊土), gives you the same steadfast nature that Chinese emperors sought in their most trusted ministers. The "Di Tian Sui" (滴天髓), a classical text from the Ming Dynasty, notes that Earth souls possess wisdom born of patience—your decisions carry the weight of mountains because they arise from deep contemplation.`,

    personality: {
      strengths: [
        "Exceptional reliability and trustworthiness",
        "Deep wisdom and thoughtful perspective",
        "Natural mediator and peacemaker",
        "Strong nurturing and supportive nature",
        "Patient and methodical approach",
        "Excellent at seeing all sides of an issue",
        "Grounded presence that calms others"
      ],
      challenges: [
        "Can become overly stubborn or inflexible",
        "Tendency toward worry and overthinking",
        "May neglect own needs while caring for others",
        "Risk of becoming stuck in routines",
        "Sometimes too cautious, missing opportunities"
      ],
      advice: "Embrace change as the natural way of things. Your strength lies not in resistance but in thoughtful adaptation. Remember to nurture yourself as generously as you nurture others. Movement prevents stagnation."
    },

    career: {
      ideal: [
        "Real estate and property development",
        "Agriculture and food production",
        "Human resources and personnel management",
        "Counseling and therapy",
        "Banking and financial planning",
        "Construction and architecture",
        "Social work and community services",
        "Healthcare administration"
      ],
      strengths: "Your reliability and ability to see all perspectives make you invaluable in management and advisory roles. You excel at building stable, lasting systems and organizations.",
      warning: "Avoid highly volatile or rapidly changing industries. You need time to assess and adapt. Roles requiring constant quick decisions may stress your methodical nature.",
      timing: "Late summer (August-September) and seasonal transitions are your power periods. Earth years favor property and long-term investments."
    },

    wealth: {
      tendency: "You have excellent instincts for stable, long-term wealth building. Real estate and tangible assets appeal to your practical nature. You're neither a big spender nor a miser.",
      advice: "Your natural inclination toward stability serves you well. Focus on real estate, land, and established businesses. Avoid speculative investments. Your wealth builds like sedimentary rock—layer by layer, virtually indestructible.",
      lucky_industries: ["Real estate", "Agriculture", "Banking", "Construction", "Food industry"]
    },

    health: {
      organs: "Spleen, stomach, and digestive system are your associated organs. Muscle tone and the mouth are also connected to Earth.",
      vulnerabilities: "Prone to digestive issues, weight fluctuations, and overthinking that affects appetite. May experience bloating and fatigue.",
      recommendations: [
        "Maintain regular, balanced meals",
        "Avoid excessive dampening foods (dairy, raw foods, sugar)",
        "Eat warm, cooked foods that support digestion",
        "Practice regular, moderate exercise",
        "Manage worry through grounding practices",
        "Chew food thoroughly for better digestion"
      ]
    }
  },

  Metal: {
    overview: `The ancient "Qiong Tong Bao Jian" (穷通宝鉴) describes Metal as "the essence of righteousness (義), forged in heaven's furnace." As a Metal element person, you embody the energy of autumn—refinement, precision, and the distillation of essence.

Like the legendary swords of ancient China, your Metal essence "Geng Jin" (庚金) has been shaped by life's pressures into something valuable and enduring. Imperial judges were often Metal souls, prized for their unwavering integrity. The old masters wrote that Metal individuals possess "the blade that cuts through illusion to reveal truth."`,

    personality: {
      strengths: [
        "Exceptional precision and attention to detail",
        "Strong sense of justice and fairness",
        "Unwavering integrity and principles",
        "Natural ability to organize and systematize",
        "Discerning taste and appreciation for quality",
        "Courage to make difficult decisions",
        "Self-discipline and determination"
      ],
      challenges: [
        "Can become rigid or overly critical",
        "Difficulty letting go of past grievances",
        "Tendency toward perfectionism",
        "May appear cold or distant to others",
        "Risk of isolation due to high standards"
      ],
      advice: "Temper your sharp edges with compassion. True strength includes the ability to yield when necessary. Not everything needs to meet your exacting standards—some of life's greatest treasures are found in imperfection."
    },

    career: {
      ideal: [
        "Law and legal services",
        "Finance and accounting",
        "Engineering and precision manufacturing",
        "Jewelry and precious metals",
        "Surgery and medical specialties",
        "Quality control and auditing",
        "Military and law enforcement",
        "IT and systems architecture"
      ],
      strengths: "Your precision, integrity, and systematic thinking make you invaluable in roles requiring accuracy and ethical standards. You excel at refining processes and maintaining quality.",
      warning: "Avoid roles that reward quantity over quality or require ethical compromises. Your integrity is your greatest asset—never trade it for short-term gains.",
      timing: "Autumn (August-October) is your power season. Metal years favor career advancement and recognition of your abilities."
    },

    wealth: {
      tendency: "You have excellent instincts for value and quality, making you skilled at identifying genuine opportunities. You prefer proven investments over speculative ones.",
      advice: "Your discernment serves you well in wealth building. Focus on quality assets—precious metals, established companies, proven real estate. Your wealth grows through careful selection rather than aggressive accumulation.",
      lucky_industries: ["Finance", "Legal services", "Technology", "Luxury goods", "Mining and minerals"]
    },

    health: {
      organs: "Lungs and large intestine are your associated organs. Skin and respiratory system are connected to Metal.",
      vulnerabilities: "Prone to respiratory issues, skin problems, and grief-related ailments. May experience constipation and breathing difficulties.",
      recommendations: [
        "Practice deep breathing exercises",
        "Avoid dry, polluted environments",
        "Maintain skin hydration",
        "Eat white foods (radish, pear, almonds—good for lungs)",
        "Process grief and loss rather than suppressing",
        "Regular aerobic exercise supports lung capacity"
      ]
    }
  },

  Water: {
    overview: `Lao Tzu wrote in the Tao Te Ching: "Nothing in the world is softer than water, yet nothing is better at overcoming the hard and strong." As a Water element person, you embody the energy of winter—depth, wisdom, and the power of stillness.

Your Water essence, "Ren Shui" (壬水), connects you to the deepest mysteries of existence. The "Yuan Hai Zi Ping" notes that Water souls were sought as royal advisors for their profound intuition—they could sense what others could not see. You understand what ancient sages knew: true power lies not in force but in flow, persistence, and the wisdom to find another way.`,

    personality: {
      strengths: [
        "Exceptional intuition and perceptiveness",
        "Deep wisdom and philosophical nature",
        "Remarkable adaptability and flexibility",
        "Strong inner resources and resilience",
        "Ability to influence without force",
        "Natural diplomat and communicator",
        "Access to deep emotional and creative wells"
      ],
      challenges: [
        "Can become too passive or withdrawn",
        "Tendency toward fear and anxiety",
        "May lose sense of self in others' currents",
        "Risk of emotional overwhelm",
        "Sometimes avoids confrontation excessively"
      ],
      advice: "Trust your intuition but anchor yourself with purpose. Flow around obstacles rather than crashing against them, but remember that even water must sometimes surge to break through barriers. Maintain your depth while engaging with the surface world."
    },

    career: {
      ideal: [
        "Psychology and counseling",
        "Research and academia",
        "Writing and journalism",
        "Diplomacy and international relations",
        "Spiritual and healing professions",
        "Marine industries and shipping",
        "Beverage and water-related industries",
        "Philosophy and consulting"
      ],
      strengths: "Your intuition and ability to understand hidden currents make you invaluable in roles requiring insight, diplomacy, and deep understanding. You excel at research and discovering what others miss.",
      warning: "Avoid highly confrontational or aggressive environments. You work best in roles that value wisdom over force. Protect yourself from environments that might overwhelm your sensitive nature.",
      timing: "Winter (November-January) is your power season. Water years favor deep learning, research, and spiritual development."
    },

    wealth: {
      tendency: "You have intuitive insights about money flows and hidden opportunities. You're not materialistic but understand money as a form of energy to be directed wisely.",
      advice: "Follow your intuition in financial matters—it's often correct. Water-related industries and investments that flow (communications, transportation, beverages) suit you well. Build wealth like water collecting in a well: slowly, surely, from multiple small streams.",
      lucky_industries: ["Communications", "Transportation", "Beverages", "Shipping", "Research"]
    },

    health: {
      organs: "Kidneys and bladder are your associated organs. Bones, teeth, and hearing are connected to Water.",
      vulnerabilities: "Prone to kidney and urinary issues, bone weakness, hearing problems, and fear-based conditions. May experience water retention and hormonal imbalances.",
      recommendations: [
        "Stay well-hydrated with warm water",
        "Support kidney health with black foods (black beans, sesame)",
        "Avoid excessive cold foods and environments",
        "Get adequate rest—kidneys recover during sleep",
        "Practice courage-building activities to counter fear tendency",
        "Regular bone-strengthening exercise"
      ]
    }
  }
};

export const ANIMAL_ANALYSIS = {
  Rat: {
    overview: "The Rat is the first animal of the Chinese zodiac, symbolizing new beginnings, cleverness, and resourcefulness. As a Rat, you possess quick wit and remarkable adaptability.",
    traits: ["Quick-witted", "Resourceful", "Versatile", "Charming", "Opportunistic"],
    lucky: { numbers: [2, 3, 6], colors: ["Blue", "Gold", "Green"], direction: "North" },
    career: "Finance, sales, entrepreneurship, writing, detective work",
    love: "Most compatible with Dragon, Monkey, and Ox. Challenging with Horse, Goat, and Rabbit."
  },
  Ox: {
    overview: "The Ox represents diligence, dependability, and strength. As an Ox, you are the backbone of any organization—reliable, methodical, and tireless in pursuit of your goals.",
    traits: ["Diligent", "Dependable", "Determined", "Patient", "Strong-willed"],
    lucky: { numbers: [1, 4, 9], colors: ["White", "Yellow", "Green"], direction: "North" },
    career: "Agriculture, real estate, engineering, medicine, military",
    love: "Most compatible with Rat, Snake, and Rooster. Challenging with Tiger, Dragon, Horse, and Goat."
  },
  Tiger: {
    overview: "The Tiger embodies courage, confidence, and competitive spirit. As a Tiger, you are a natural leader who faces challenges head-on with unwavering bravery.",
    traits: ["Brave", "Confident", "Competitive", "Charismatic", "Protective"],
    lucky: { numbers: [1, 3, 4], colors: ["Blue", "Gray", "Orange"], direction: "East" },
    career: "Leadership roles, politics, entertainment, athletics, adventure sports",
    love: "Most compatible with Dragon, Horse, and Pig. Challenging with Ox, Tiger, Snake, and Monkey."
  },
  Rabbit: {
    overview: "The Rabbit symbolizes grace, elegance, and gentle strength. As a Rabbit, you navigate life with diplomacy and possess a refined aesthetic sensibility.",
    traits: ["Gentle", "Elegant", "Responsible", "Diplomatic", "Artistic"],
    lucky: { numbers: [3, 4, 6], colors: ["Red", "Pink", "Purple"], direction: "East" },
    career: "Art, design, diplomacy, writing, healthcare, counseling",
    love: "Most compatible with Goat, Pig, and Dog. Challenging with Snake and Rooster."
  },
  Dragon: {
    overview: "The Dragon is the most auspicious sign, representing power, luck, and success. As a Dragon, you carry an air of nobility and are destined for remarkable achievements.",
    traits: ["Confident", "Ambitious", "Intelligent", "Enthusiastic", "Charismatic"],
    lucky: { numbers: [1, 6, 7], colors: ["Gold", "Silver", "Gray"], direction: "East" },
    career: "Leadership, entrepreneurship, arts, law, politics, architecture",
    love: "Most compatible with Rooster, Rat, and Monkey. Challenging with Ox, Goat, and Dog."
  },
  Snake: {
    overview: "The Snake represents wisdom, mystery, and intuition. As a Snake, you possess deep insight and a magnetic presence that draws others to you.",
    traits: ["Enigmatic", "Intelligent", "Wise", "Intuitive", "Sophisticated"],
    lucky: { numbers: [2, 8, 9], colors: ["Black", "Red", "Yellow"], direction: "South" },
    career: "Research, psychology, astrology, politics, investigation, fashion",
    love: "Most compatible with Dragon, Rooster, and Ox. Challenging with Tiger, Rabbit, Snake, and Pig."
  },
  Horse: {
    overview: "The Horse embodies freedom, energy, and adventure. As a Horse, you have an irrepressible spirit and a need for independence and movement.",
    traits: ["Animated", "Active", "Energetic", "Independent", "Adventurous"],
    lucky: { numbers: [2, 3, 7], colors: ["Yellow", "Green", "Red"], direction: "South" },
    career: "Travel, sports, sales, journalism, entertainment, public relations",
    love: "Most compatible with Tiger, Goat, and Rabbit. Challenging with Rat, Ox, Rooster, and Horse."
  },
  Goat: {
    overview: "The Goat symbolizes peace, harmony, and artistic sensitivity. As a Goat, you possess gentle nature and create beauty wherever you go.",
    traits: ["Calm", "Gentle", "Sympathetic", "Creative", "Peaceful"],
    lucky: { numbers: [2, 7, 8], colors: ["Brown", "Red", "Purple"], direction: "South" },
    career: "Art, music, design, childcare, healthcare, philanthropy",
    love: "Most compatible with Rabbit, Horse, and Pig. Challenging with Ox, Tiger, and Dog."
  },
  Monkey: {
    overview: "The Monkey represents intelligence, curiosity, and versatility. As a Monkey, you have an agile mind and endless enthusiasm for new experiences.",
    traits: ["Sharp", "Smart", "Curious", "Playful", "Versatile"],
    lucky: { numbers: [4, 9, 0], colors: ["White", "Blue", "Gold"], direction: "West" },
    career: "Technology, science, engineering, entertainment, finance, sports",
    love: "Most compatible with Ox, Rabbit, and Dragon. Challenging with Tiger and Pig."
  },
  Rooster: {
    overview: "The Rooster embodies confidence, precision, and hard work. As a Rooster, you have exacting standards and the determination to meet them.",
    traits: ["Observant", "Hardworking", "Courageous", "Confident", "Honest"],
    lucky: { numbers: [5, 7, 8], colors: ["Gold", "Brown", "Yellow"], direction: "West" },
    career: "Military, police, surgery, journalism, performance, public speaking",
    love: "Most compatible with Ox, Snake, and Dragon. Challenging with Rat, Rabbit, Horse, and Rooster."
  },
  Dog: {
    overview: "The Dog represents loyalty, honesty, and justice. As a Dog, you are a faithful friend and fierce protector of those you love.",
    traits: ["Loyal", "Honest", "Faithful", "Courageous", "Responsible"],
    lucky: { numbers: [3, 4, 9], colors: ["Red", "Green", "Purple"], direction: "East" },
    career: "Law, healthcare, social work, education, security, counseling",
    love: "Most compatible with Rabbit, Tiger, and Horse. Challenging with Dragon, Goat, and Rooster."
  },
  Pig: {
    overview: "The Pig symbolizes prosperity, generosity, and good fortune. As a Pig, you attract abundance through your genuine kindness and optimistic nature.",
    traits: ["Compassionate", "Generous", "Diligent", "Sociable", "Sincere"],
    lucky: { numbers: [2, 5, 8], colors: ["Yellow", "Gray", "Brown"], direction: "North" },
    career: "Entertainment, hospitality, social work, retail, food industry",
    love: "Most compatible with Tiger, Rabbit, and Goat. Challenging with Snake, Pig, and Monkey."
  }
};

export const TEN_YEAR_FORECAST = {
  1: "This period marks the beginning of a significant life chapter. Focus on building foundations—education, skills, and core relationships. Seeds planted now will bear fruit for decades to come. Don't rush; invest in yourself.",
  2: "A time of partnerships and balance. Relationships take center stage. You may find significant collaborations in both personal and professional realms. Learn to harmonize your needs with others'.",
  3: "Creative expression and communication flourish. Your voice grows stronger, and opportunities to share your ideas multiply. This is an excellent period for learning, writing, and artistic pursuits.",
  4: "Stability and structure become priorities. You're building the frameworks that will support future growth. Hard work now creates lasting security. Focus on practical matters and long-term investments.",
  5: "Change and transformation define this period. What no longer serves you falls away. Embrace freedom and new experiences. Travel, adventure, and expanding horizons bring growth.",
  6: "Responsibility and nurturing come to the fore. Family matters, home, and community need your attention. This is a time of giving and receiving care. Beautify your surroundings.",
  7: "Introspection and spiritual development deepen. You're drawn to understand life's deeper meanings. Research, study, and solitary pursuits bring satisfaction. Trust your intuition.",
  8: "Material manifestation and power peak. Your efforts are recognized and rewarded. Financial abundance becomes possible. With power comes responsibility—use it wisely.",
  9: "Completion and humanitarianism mark this phase. You're wrapping up old cycles and preparing for new beginnings. Give back to others. Release what you've outgrown gracefully."
};

export const COMPATIBILITY_DETAILS = {
  excellent: "This is a highly auspicious match with natural harmony. You complement each other's strengths and balance each other's weaknesses. Communication flows easily, and you share similar values and life goals.",
  good: "A favorable combination with solid potential. While you may have different approaches, you respect each other's perspectives. With mutual effort, this relationship can flourish.",
  challenging: "This pairing requires extra effort and understanding. Your energies may clash at times, leading to friction. However, with conscious awareness and compromise, you can learn valuable lessons from each other.",
  neutral: "Neither particularly harmonious nor challenging. The success of this relationship depends largely on other factors in your charts and your personal growth. Approach with openness."
};

export const WEALTH_ANALYSIS = {
  Wood: {
    tendency: "Growth-oriented investor with long-term vision",
    strengths: ["Identifying emerging opportunities", "Patience for investments to mature", "Creative business ideas"],
    risks: ["Overextending into too many ventures", "Underestimating risks in enthusiasm"],
    advice: "Focus your energy on 2-3 key investments rather than scattering resources. Your wealth grows like a forest—slowly but substantially."
  },
  Fire: {
    tendency: "Enthusiastic investor drawn to exciting opportunities",
    strengths: ["Quick decision-making", "Inspiring others to invest", "Spotting trends early"],
    risks: ["Impulsive investments", "Overconfidence in hot opportunities", "Spending on experiences over savings"],
    advice: "Balance your love of excitement with stable, boring investments. Build a safety net before pursuing high-risk opportunities."
  },
  Earth: {
    tendency: "Conservative investor focused on tangible assets",
    strengths: ["Real estate intuition", "Patient wealth building", "Risk management"],
    risks: ["Missing opportunities due to over-caution", "Holding assets too long"],
    advice: "Your instincts for stable investments serve you well. Trust them, but occasionally take calculated risks for growth."
  },
  Metal: {
    tendency: "Discerning investor with high standards",
    strengths: ["Quality assessment", "Systematic approach", "Discipline in saving"],
    risks: ["Analysis paralysis", "Waiting for perfect opportunities", "Rigidity in strategy"],
    advice: "Your precision is an asset, but don't wait for perfection. Good opportunities acted upon beat perfect opportunities missed."
  },
  Water: {
    tendency: "Intuitive investor who senses hidden value",
    strengths: ["Reading market currents", "Adapting to change", "Finding hidden opportunities"],
    risks: ["Emotional decisions", "Being swayed by others", "Lack of concrete strategy"],
    advice: "Trust your intuition but verify with research. Create structures to protect yourself from emotional decisions."
  }
};

export const generateReadingDate = () => {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
