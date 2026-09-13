export interface SpeakingTopicItem {
  id: string;
  category: string;
  topic: string;
  guideQuestions: string[];
  isAiGenerated?: boolean;
}

export interface WritingTopicItem {
  id: string;
  category: string;
  title: string;
  starterPrompt: string;
  outlinePoints: string[];
  isAiGenerated?: boolean;
}

export const SPEAKING_CATEGORIES = [
  'All',
  'Job & Career',
  'IELTS & Extempore',
  'Technology & AI',
  'Debates & Opinions',
  'Daily Life & Habits',
  'Business & Leadership',
  'Storytelling'
] as const;

export const WRITING_CATEGORIES = [
  'All',
  'Technology & Society',
  'Work & Career',
  'Education',
  'Health & Habits',
  'Debates & Opinions',
  'Environment'
] as const;

export const EXTENSIVE_SPEAKING_TOPICS: SpeakingTopicItem[] = [
  // 1. Job & Career
  {
    id: 'spk_job_1',
    category: 'Job & Career',
    topic: 'Tell Me About a Time You Overcame a High-Pressure Challenge at Work',
    guideQuestions: [
      'What was the high-stakes situation and what were the constraints?',
      'What concrete decisions or actions did you take?',
      'What was the quantifiable outcome and what did you learn?'
    ]
  },
  {
    id: 'spk_job_2',
    category: 'Job & Career',
    topic: 'How to Resolve a Heated Disagreement with a Coworker or Manager',
    guideQuestions: [
      'How do you separate personal emotions from professional objectives?',
      'What active listening techniques help defuse tension?',
      'Why is collaborative compromise better than winning an argument?'
    ]
  },
  {
    id: 'spk_job_3',
    category: 'Job & Career',
    topic: 'What Are the Crucial Skills Needed to Thrive in the Next Decade?',
    guideQuestions: [
      'Will technical hard skills or adaptability and communication matter more?',
      'How can professionals proactively future-proof their careers?',
      'What is one skill you are personally investing in today?'
    ]
  },
  {
    id: 'spk_job_4',
    category: 'Job & Career',
    topic: 'Why Making Mistakes is the Fastest Route to Professional Mastery',
    guideQuestions: [
      'Think of a significant blunder that initially felt embarrassing.',
      'How did taking immediate ownership earn trust from leadership?',
      'How did that experience change your working method permanently?'
    ]
  },
  {
    id: 'spk_job_5',
    category: 'Job & Career',
    topic: 'Managing Remote Teams: Trust vs Micromanagement',
    guideQuestions: [
      'Why do some leaders struggle when they cannot physically see their team?',
      'What communication rituals build psychological safety in remote settings?',
      'How should team performance be fairly evaluated based on outcomes?'
    ]
  },

  // 2. IELTS & Extempore
  {
    id: 'spk_ielts_1',
    category: 'IELTS & Extempore',
    topic: 'Describe an Important Decision That Positively Shaped Your Life',
    guideQuestions: [
      'When and why did you have to make this crucial choice?',
      'What risks or alternatives did you have to weigh?',
      'Looking back, how did that decision alter your trajectory?'
    ]
  },
  {
    id: 'spk_ielts_2',
    category: 'IELTS & Extempore',
    topic: 'Describe a Historical Monument or Place You Visited That Left an Impression',
    guideQuestions: [
      'Where is this place located and what is its historical context?',
      'What did you observe, hear, or feel while being there?',
      'Why do you believe preserving such heritage sites is vital for society?'
    ]
  },
  {
    id: 'spk_ielts_3',
    category: 'IELTS & Extempore',
    topic: 'Describe an Elder Person in Your Family or Community Whom You Admire',
    guideQuestions: [
      'Who is this individual and how do you know them?',
      'What qualities or wisdom do they embody that inspires you?',
      'What valuable life lesson have you learned from their experiences?'
    ]
  },
  {
    id: 'spk_ielts_4',
    category: 'IELTS & Extempore',
    topic: 'Describe an Unexpected Gift or Act of Kindness You Received',
    guideQuestions: [
      'Who offered this gesture and what were the circumstances?',
      'Why was it particularly meaningful or touching to you at that moment?',
      'How did it influence how you treat others today?'
    ]
  },
  {
    id: 'spk_ielts_5',
    category: 'IELTS & Extempore',
    topic: 'Describe a Useful Skill You Learned as an Adult Outside of School',
    guideQuestions: [
      'What is the skill (e.g. cooking, coding, negotiation, public speaking)?',
      'What difficulties did you encounter when starting from zero?',
      'How has this skill enhanced your daily life or career?'
    ]
  },

  // 3. Technology & AI
  {
    id: 'spk_tech_1',
    category: 'Technology & AI',
    topic: 'How Generative AI is Reshaping Human Creativity and Critical Thinking',
    guideQuestions: [
      'Does AI augment human imagination or risk making people intellectually lazy?',
      'Which creative fields (writing, design, music) will change the most?',
      'How can learners use AI to think deeper rather than skip thinking?'
    ]
  },
  {
    id: 'spk_tech_2',
    category: 'Technology & AI',
    topic: 'Social Media Algorithms: Community Connector or Addiction Engine?',
    guideQuestions: [
      'How do infinite feeds manipulate dopamine and attention spans?',
      'What are the measurable consequences on youth mental health?',
      'What boundaries do you personally set with your smartphone?'
    ]
  },
  {
    id: 'spk_tech_3',
    category: 'Technology & AI',
    topic: 'The Cashless Society: Convenience vs Privacy and Financial Exclusion',
    guideQuestions: [
      'What are the everyday conveniences of UPI and digital tap-to-pay?',
      'What happens during blackouts, fraud, or to those without smartphones?',
      'Should governments retain physical cash as a legal right?'
    ]
  },
  {
    id: 'spk_tech_4',
    category: 'Technology & AI',
    topic: 'Will Autonomous Cars and Electric Vehicles Fix Traffic Congestion?',
    guideQuestions: [
      'Is swapping petrol cars for electric cars enough to solve gridlock?',
      'Why is investing in high-speed public transit often more impactful?',
      'Would you trust a self-driving car in chaotic city traffic?'
    ]
  },
  {
    id: 'spk_tech_5',
    category: 'Technology & AI',
    topic: 'Data Privacy in the Smart Home Era: Are We Trading Privacy for Convenience?',
    guideQuestions: [
      'Smart speakers, robot vacuums, and ring doorbells collect continuous data.',
      'Do tech corporations adequately protect consumer privacy?',
      'Where do you personally draw the line between comfort and surveillance?'
    ]
  },

  // 4. Debates & Opinions
  {
    id: 'spk_deb_1',
    category: 'Debates & Opinions',
    topic: 'Should University Education Be Completely Free for Everyone?',
    guideQuestions: [
      'Would free tuition create equal opportunity or overburden national budgets?',
      'Does a degree guarantee employment in modern high-skill economies?',
      'What balance between vocational training and universities is optimal?'
    ]
  },
  {
    id: 'spk_deb_2',
    category: 'Debates & Opinions',
    topic: 'Is Success More a Result of Unyielding Hard Work or Good Fortune?',
    guideQuestions: [
      'How does timing, birthplace, and family background factor into outcomes?',
      'Why do successful people often underestimate the role of luck?',
      'How does hard work position someone to seize lucky opportunities?'
    ]
  },
  {
    id: 'spk_deb_3',
    category: 'Debates & Opinions',
    topic: 'Should Companies Implement a Strict Four-Day Work Week Without Pay Cuts?',
    guideQuestions: [
      'What evidence shows productivity increases when workers are well-rested?',
      'Which industries would struggle with a compressed work schedule?',
      'What would you do with an extra free day every single week?'
    ]
  },
  {
    id: 'spk_deb_4',
    category: 'Debates & Opinions',
    topic: 'Is Competition or Collaboration the Truer Driver of Human Progress?',
    guideQuestions: [
      'How does market rivalry spur technological breakthroughs?',
      'Why do monumental achievements (space, healthcare) require teamwork?',
      'In schooling and parenting, which mindset should be emphasized?'
    ]
  },
  {
    id: 'spk_deb_5',
    category: 'Debates & Opinions',
    topic: 'Should Influencers and Celebrities Be Held Responsible for the Products They Endorse?',
    guideQuestions: [
      'Do young followers blindly trust celebrity endorsements?',
      'What happens when financial or crypto schemes promoted turn out to be scams?',
      'Should legal penalties apply to influencers who promote misleading products?'
    ]
  },

  // 5. Daily Life & Habits
  {
    id: 'spk_life_1',
    category: 'Daily Life & Habits',
    topic: 'The Psychological Power of an Uninterrupted Morning Routine',
    guideQuestions: [
      'How does the first hour of your morning dictate the rest of your day?',
      'Why is checking phone notifications upon waking detrimental to peace?',
      'What are 2 simple habits (hydration, reading, walking) that recharge you?'
    ]
  },
  {
    id: 'spk_life_2',
    category: 'Daily Life & Habits',
    topic: 'Why Deep Sleep is the Most Undervalued Productivity Superpower',
    guideQuestions: [
      'How does sleep deprivation impair emotional regulation and decision-making?',
      'Why has hustle culture glorified sacrificing sleep for output?',
      'What simple sleep hygiene changes transform daily energy levels?'
    ]
  },
  {
    id: 'spk_life_3',
    category: 'Daily Life & Habits',
    topic: 'The Art of Saying "No" Without Feeling Guilty or Burning Bridges',
    guideQuestions: [
      'Why do many agreeable professionals suffer from over-commitment?',
      'How does saying no to distractions protect your biggest priorities?',
      'What polite, professional phrasing can you use to decline requests gracefully?'
    ]
  },
  {
    id: 'spk_life_4',
    category: 'Daily Life & Habits',
    topic: 'How Journaling Daily Clarifies Anxiety and Overthinking',
    guideQuestions: [
      'Why does writing down scattered thoughts immediately bring mental calm?',
      'Do you need a structured method, or is freewriting sufficient?',
      'How does reviewing past journal entries give perspective on personal growth?'
    ]
  },
  {
    id: 'spk_life_5',
    category: 'Daily Life & Habits',
    topic: 'Digital Detox: What Happens When You Disconnect for 48 Hours',
    guideQuestions: [
      'What initial withdrawal or FOMO (fear of missing out) occurs?',
      'How does conversational depth improve when devices are put away?',
      'What hobbies or passions resurface when screen time drops?'
    ]
  },

  // 6. Business & Leadership
  {
    id: 'spk_biz_1',
    category: 'Business & Leadership',
    topic: 'Why Empathy and Psychological Safety Are Hard Business Advantages',
    guideQuestions: [
      'Why do fear-driven cultures stifle innovation and product quality?',
      'How can a leader encourage employees to voice dissent without backlash?',
      'What is the difference between being empathetic and being a pushover?'
    ]
  },
  {
    id: 'spk_biz_2',
    category: 'Business & Leadership',
    topic: 'Bootstrapping vs Venture Capital: The Founder’s Critical Dilemma',
    guideQuestions: [
      'What are the trade-offs between rapid hyper-growth and sustainable profits?',
      'Why do many VC-funded startups burn out before finding product-market fit?',
      'If you founded a company today, which philosophy would you choose?'
    ]
  },
  {
    id: 'spk_biz_3',
    category: 'Business & Leadership',
    topic: 'The Secret to Retaining Top Talent Beyond Offering Higher Salaries',
    guideQuestions: [
      'Why do high-performing employees leave good-paying jobs?',
      'How significant is autonomy, learning growth, and recognition?',
      'How can managers conduct honest "stay interviews" before it is too late?'
    ]
  },
  {
    id: 'spk_biz_4',
    category: 'Business & Leadership',
    topic: 'Customer Obsession: How Great Brands Turn Users into Evangelists',
    guideQuestions: [
      'Think of a brand (Apple, Amazon, Patagonia) with loyal advocates.',
      'How does solving customer pain points reliably create organic word-of-mouth?',
      'What is an unforgettable customer service experience you personally received?'
    ]
  },

  // 7. Storytelling
  {
    id: 'spk_story_1',
    category: 'Storytelling',
    topic: 'The Most Terrifying or Exhilarating Risk I Have Ever Taken',
    guideQuestions: [
      'What was the situation and why was the stakes so high?',
      'What internal doubts were whispering in your head before taking the leap?',
      'How did that decision ultimately transform who you are today?'
    ]
  },
  {
    id: 'spk_story_2',
    category: 'Storytelling',
    topic: 'A Chance Encounter with a Complete Stranger That Changed My Perspective',
    guideQuestions: [
      'Where were you and what prompted the conversation?',
      'What unexpected story or insight did they share?',
      'Why does that brief memory still resonate in your mind today?'
    ]
  },
  {
    id: 'spk_story_3',
    category: 'Storytelling',
    topic: 'If You Could Travel Back in Time 10 Years, What Advice Would You Give Yourself?',
    guideQuestions: [
      'What mistakes or worries was your past self consumed with?',
      'What wisdom would have saved you unnecessary stress?',
      'Would you actually change anything, or did those hurdles build your character?'
    ]
  }
];

export const EXTENSIVE_WRITING_TOPICS: WritingTopicItem[] = [
  // 1. Technology & Society
  {
    id: 'wrt_tech_1',
    category: 'Technology & Society',
    title: 'Should Smartphone Usage Be Restricted in Primary and Secondary Schools?',
    starterPrompt: 'In modern education, the presence of smartphones in classrooms sparks continuous debate among educators and parents...',
    outlinePoints: [
      'Introduction: Pervasive nature of personal devices in student hands.',
      'Body: Academic distraction and cyberbullying vs educational tools and safety.',
      'Conclusion: Why clear bell-to-bell restriction policies yield superior learning outcomes.'
    ]
  },
  {
    id: 'wrt_tech_2',
    category: 'Technology & Society',
    title: 'Can Artificial Intelligence Completely Replace Human Customer Service?',
    starterPrompt: 'As conversational AI agents become remarkably sophisticated, enterprises are rapidly automating client support channels...',
    outlinePoints: [
      'Introduction: Automation driving speed and 24/7 availability.',
      'Body: Resolution efficiency for routine inquiries vs lack of empathy in nuanced crises.',
      'Conclusion: The hybrid model: AI handling baseline logistics while humans manage complex relationships.'
    ]
  },
  {
    id: 'wrt_tech_3',
    category: 'Technology & Society',
    title: 'The Psychological Cost of Infinite Scrolling on Modern Attention Spans',
    starterPrompt: 'Behind sleek smartphone interfaces lies psychological engineering specifically designed to maximize digital dwell time...',
    outlinePoints: [
      'Introduction: Transition from deliberate browsing to algorithmic content feeds.',
      'Body: Erosion of deep reading capacity and heightened baseline anxiety.',
      'Conclusion: The urgent necessity of personal digital hygiene and mindful consumption.'
    ]
  },

  // 2. Work & Career
  {
    id: 'wrt_work_1',
    category: 'Work & Career',
    title: 'The Pros and Cons of a Four-Day Work Week for Knowledge Workers',
    starterPrompt: 'As forward-thinking organizations reevaluate productivity metrics, the four-day work week has emerged as a promising structural reform...',
    outlinePoints: [
      'Introduction: The shift towards employee wellness and output-driven culture.',
      'Body: Enhanced focus and lower burnout vs coverage scheduling challenges.',
      'Conclusion: Why flexibility and objective-based evaluation benefit modern enterprises.'
    ]
  },
  {
    id: 'wrt_work_2',
    category: 'Work & Career',
    title: 'Why Soft Skills and Emotional Intelligence Trump Technical Genius in Leadership',
    starterPrompt: 'While technical proficiency secures initial employment, long-term leadership efficacy depends largely on emotional intelligence...',
    outlinePoints: [
      'Introduction: Shifting definitions of effective management in modern workplaces.',
      'Body: Conflict mediation, active listening, and building psychological safety.',
      'Conclusion: Cultivating empathetic leaders directly correlates with team retention and innovation.'
    ]
  },
  {
    id: 'wrt_work_3',
    category: 'Work & Career',
    title: 'Is Pure Remote Work Eroding Company Culture and Mentorship for Junior Talent?',
    starterPrompt: 'The global pivot to distributed remote work unlocked unprecedented autonomy, yet emerging professionals face unforeseen trade-offs...',
    outlinePoints: [
      'Introduction: Balance between individual flexibility and communal identity.',
      'Body: Loss of spontaneous watercooler osmosis and informal apprenticeship.',
      'Conclusion: Intentional hybrid structures that preserve mentorship without sacrificing autonomy.'
    ]
  },

  // 3. Education
  {
    id: 'wrt_edu_1',
    category: 'Education',
    title: 'Hands-On Apprenticeships vs Traditional University Degrees: The Evolving Value',
    starterPrompt: 'In an economy where technological tools evolve quarterly, the traditional four-year collegiate model faces legitimate scrutiny...',
    outlinePoints: [
      'Introduction: Escalating tuition debt paired with shifting corporate hiring standards.',
      'Body: Hands-on real-world experience accelerating competency vs foundational academic theory.',
      'Conclusion: Embracing diverse educational pathways tailored to modern market realities.'
    ]
  },
  {
    id: 'wrt_edu_2',
    category: 'Education',
    title: 'Should Financial Literacy Be a Mandatory Subject in High School Curriculums?',
    starterPrompt: 'Millions of students graduate each year fluent in algebra and history, yet completely illiterate regarding personal finance...',
    outlinePoints: [
      'Introduction: Disconnect between standardized school syllabi and practical adulthood.',
      'Body: Understanding compound interest, budgeting, taxation, and debt traps.',
      'Conclusion: Empowering teenagers with money management prevents long-term socioeconomic vulnerability.'
    ]
  },

  // 4. Health & Habits
  {
    id: 'wrt_hlth_1',
    category: 'Health & Habits',
    title: 'How Daily Physical Activity Influences Mental Focus and Emotional Resilience',
    starterPrompt: 'While cardiovascular exercise is traditionally celebrated for physical fitness, its neurological benefits are equally revolutionary...',
    outlinePoints: [
      'Introduction: The biological connection between body movement and brain neurochemistry.',
      'Body: Dopamine regulation, cortisol reduction, and enhanced memory retention.',
      'Conclusion: Framing daily workouts not as a chore, but as essential cognitive maintenance.'
    ]
  },
  {
    id: 'wrt_hlth_2',
    category: 'Health & Habits',
    title: 'The Compounding Power of Small Daily Habits Over Massive Occasional Efforts',
    starterPrompt: 'Human nature gravitates toward dramatic overnight transformations, yet lasting greatness is invariably forged through quiet consistency...',
    outlinePoints: [
      'Introduction: The myth of sudden overnight achievement.',
      'Body: James Clear’s 1% marginal gains compounding over months and years.',
      'Conclusion: Focusing on sustainable systems rather than overwhelming short-term goals.'
    ]
  },

  // 5. Environment
  {
    id: 'wrt_env_1',
    category: 'Environment',
    title: 'Small Individual Daily Choices That Collectively Drive Environmental Preservation',
    starterPrompt: 'Combating global climate degradation often feels like an impossible task for the individual citizen, yet micro-actions matter...',
    outlinePoints: [
      'Introduction: Moving past climate defeatism toward grassroots personal accountability.',
      'Body: Reducing single-use plastics, minimizing food waste, and mindful energy consumption.',
      'Conclusion: How collective grassroots habits pressure institutions and corporations to accelerate green policy.'
    ]
  }
];
