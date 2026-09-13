export interface ArticleRuleItem {
  rule: string;
  article: 'a' | 'an' | 'the' | 'no_article';
  explanation: string;
  exampleSentence: string;
  commonMistake: string;
  correction: string;
}

export interface PrepositionItem {
  preposition: string;
  usageContext: string;
  explanation: string;
  exampleSentence: string;
  commonMistake: string;
  correction: string;
}

export interface DailyIdiomPhrase {
  phrase: string;
  meaning: string;
  context: 'Workplace' | 'Casual Conversation' | 'Professional Email';
  exampleDialogue: {
    speakerA: string;
    speakerB: string;
  };
  audioText: string;
}

export interface DailyGrammarLabData {
  dayIndex: number;
  theme: string;
  articles: ArticleRuleItem[];
  prepositions: PrepositionItem[];
  idiomsAndPhrases: DailyIdiomPhrase[];
}

export const DAILY_GRAMMAR_CATALOG: DailyGrammarLabData[] = [
  {
    dayIndex: 1,
    theme: 'Workplace & Daily Office Life',
    articles: [
      {
        article: 'the',
        rule: 'Specific vs General Objects',
        explanation: 'Use "the" when both speaker and listener know the specific item or place being talked about.',
        exampleSentence: 'I left the report on the manager\'s desk before leaving.',
        commonMistake: 'I left a report on a manager\'s desk (when referring to your known manager).',
        correction: 'Use "the manager\'s desk" when there is one specific manager in mind.'
      },
      {
        article: 'an',
        rule: 'Vowel Sounds (Not Just Letters)',
        explanation: 'Use "an" before words that START WITH A VOWEL SOUND (a, e, i, o, u sounds), including silent "h".',
        exampleSentence: 'She has an MBA degree and works an hour late on Thursdays.',
        commonMistake: 'He arrived in a hour.',
        correction: 'He arrived in an hour (because "hour" begins with an "ow" vowel sound).'
      },
      {
        article: 'no_article',
        rule: 'Meals & General Plural Nouns',
        explanation: 'Do not use "the" before general meals (breakfast, lunch, dinner) or plural concepts.',
        exampleSentence: 'Let\'s discuss this over lunch tomorrow.',
        commonMistake: 'Let\'s discuss this over the lunch.',
        correction: 'Say "over lunch" without "the".'
      }
    ],
    prepositions: [
      {
        preposition: 'in time vs on time',
        usageContext: 'Punctuality',
        explanation: '"On time" means at the exact scheduled minute. "In time" means early enough before something happens.',
        exampleSentence: 'The train arrived on time, and I got to the station in time to buy a coffee.',
        commonMistake: 'Please be in time for the 9:00 AM interview.',
        correction: 'Please be on time for the 9:00 AM interview.'
      },
      {
        preposition: 'at vs in (Workplace Location)',
        usageContext: 'Location',
        explanation: 'Use "at" for building/institution points (at work, at the office). Use "in" for inside a specific room (in the conference room).',
        exampleSentence: 'She is at work right now, sitting in the main conference room.',
        commonMistake: 'I am on work right now.',
        correction: 'I am at work right now.'
      },
      {
        preposition: 'by vs until',
        usageContext: 'Deadlines vs Durations',
        explanation: '"By" means no later than that deadline. "Until" describes an activity continuing up to that point.',
        exampleSentence: 'Please send the proposal by Friday. I will be in meetings until 4 PM.',
        commonMistake: 'I will finish the project until Friday.',
        correction: 'I will finish the project by Friday.'
      }
    ],
    idiomsAndPhrases: [
      {
        phrase: 'Touch base',
        meaning: 'Briefly connect or make contact with someone to share updates.',
        context: 'Workplace',
        exampleDialogue: {
          speakerA: 'Do you have five minutes today?',
          speakerB: 'Sure, let\'s touch base right after our afternoon client call.'
        },
        audioText: "Let's touch base right after our afternoon client call."
      },
      {
        phrase: 'Circle back',
        meaning: 'Return to discuss a topic or question at a later time.',
        context: 'Workplace',
        exampleDialogue: {
          speakerA: 'Do we have the final budget numbers yet?',
          speakerB: 'Not quite. Let me circle back with you once the finance team confirms.'
        },
        audioText: 'Let me circle back with you once the finance team confirms.'
      },
      {
        phrase: 'Hit the ground running',
        meaning: 'Start a new project or job immediately with full energy and enthusiasm.',
        context: 'Professional Email',
        exampleDialogue: {
          speakerA: 'Welcome to the team! How are you feeling?',
          speakerB: 'Excited! I\'m ready to hit the ground running on the mobile project.'
        },
        audioText: "I'm ready to hit the ground running on the mobile project."
      },
      {
        phrase: 'Call it a day',
        meaning: 'Decide to stop working for the rest of the day.',
        context: 'Casual Conversation',
        exampleDialogue: {
          speakerA: 'It\'s already 7 PM and we fixed the major bugs.',
          speakerB: 'Great work! Let\'s call it a day and head home.'
        },
        audioText: "Great work! Let's call it a day and head home."
      }
    ]
  },
  {
    dayIndex: 2,
    theme: 'Everyday Social & Travel Conversations',
    articles: [
      {
        article: 'a',
        rule: 'Consonant Sounds & First Mentions',
        explanation: 'Use "a" before consonant sounds, including words starting with "u" that sound like "you" (university, user).',
        exampleSentence: 'She joined a university in Chicago and created a useful daily study habit.',
        commonMistake: 'She studies at an university.',
        correction: 'She studies at a university ("u" makes a "y" consonant sound).'
      },
      {
        article: 'the',
        rule: 'Unique Things in the World',
        explanation: 'Always use "the" for things that are unique or one of a kind (the sun, the internet, the sky).',
        exampleSentence: 'I searched for the best flight options on the internet.',
        commonMistake: 'I looked up prices on internet.',
        correction: 'I looked up prices on the internet.'
      },
      {
        article: 'no_article',
        rule: 'Cities, Countries & Languages',
        explanation: 'Most countries, cities, and languages do not take an article (English, Tokyo, India).',
        exampleSentence: 'He is learning English before moving to London next summer.',
        commonMistake: 'He speaks the English very fluently.',
        correction: 'He speaks English very fluently (no "the" before language names).'
      }
    ],
    prepositions: [
      {
        preposition: 'in vs on (Transportation)',
        usageContext: 'Travel & Commuting',
        explanation: 'Use "on" for public transport where you can stand/walk (on the bus, on the train, on a plane). Use "in" for small private vehicles (in a car, in a taxi).',
        exampleSentence: 'I am on the metro right now, but I will get in a cab after the station.',
        commonMistake: 'I am in the bus right now.',
        correction: 'I am on the bus right now.'
      },
      {
        preposition: 'for vs since',
        usageContext: 'Time & Duration',
        explanation: '"For" is used for a duration/length of time (for 3 years). "Since" marks a starting point in the past (since 2021).',
        exampleSentence: 'I have worked here for five years, ever since I graduated.',
        commonMistake: 'I am living here since five years.',
        correction: 'I have lived here for five years.'
      },
      {
        preposition: 'listen to (Never just listen)',
        usageContext: 'Everyday Actions',
        explanation: '"Listen" ALWAYS requires the preposition "to" when an object follows.',
        exampleSentence: 'I like to listen to podcasts while cooking dinner.',
        commonMistake: 'Please listen me carefully.',
        correction: 'Please listen to me carefully.'
      }
    ],
    idiomsAndPhrases: [
      {
        phrase: 'Under the weather',
        meaning: 'Feeling slightly sick, tired, or unwell.',
        context: 'Casual Conversation',
        exampleDialogue: {
          speakerA: 'Are you joining us for dinner tonight?',
          speakerB: 'I think I\'ll pass. I\'m feeling a bit under the weather today.'
        },
        audioText: "I think I'll pass. I'm feeling a bit under the weather today."
      },
      {
        phrase: 'Cut corners',
        meaning: 'Do something in the easiest or cheapest way, usually reducing quality.',
        context: 'Workplace',
        exampleDialogue: {
          speakerA: 'Can we deliver the project two days earlier?',
          speakerB: 'We can, but we shouldn\'t cut corners on product testing.'
        },
        audioText: "We shouldn't cut corners on product testing."
      },
      {
        phrase: 'Bite the bullet',
        meaning: 'Decide to do something difficult or unpleasant that has been delayed.',
        context: 'Casual Conversation',
        exampleDialogue: {
          speakerA: 'Have you scheduled your dental appointment yet?',
          speakerB: 'Not yet, but I need to bite the bullet and call them today.'
        },
        audioText: 'I need to bite the bullet and call them today.'
      },
      {
        phrase: 'See eye to eye',
        meaning: 'Fully agree with someone on an idea or decision.',
        context: 'Workplace',
        exampleDialogue: {
          speakerA: 'How was the meeting with the product designer?',
          speakerB: 'Very smooth! We really see eye to eye on the new interface.'
        },
        audioText: 'We really see eye to eye on the new interface.'
      }
    ]
  },
  {
    dayIndex: 3,
    theme: 'Career Growth, Networking & Interviews',
    articles: [
      {
        article: 'a',
        rule: 'Job Titles & Professions (a vs the)',
        explanation: 'Use "a" or "an" when stating your job or role. Use "the" only if you are the single person with that title.',
        exampleSentence: 'I work as a software engineer, and she is the lead architect of the project.',
        commonMistake: 'I am software engineer.',
        correction: 'I am a software engineer.'
      },
      {
        article: 'the',
        rule: 'Superlatives & Ordinal Numbers',
        explanation: 'Always use "the" before superlatives (the best, the most) and ordinals (the first, the third).',
        exampleSentence: 'This was the most challenging interview I have taken, but the first one where I felt confident.',
        commonMistake: 'It is best option for us.',
        correction: 'It is the best option for us.'
      },
      {
        article: 'no_article',
        rule: 'Abstract Qualities & Skills',
        explanation: 'Do not use "the" before abstract nouns when speaking generally (patience, experience, confidence).',
        exampleSentence: 'Confidence comes from regular speaking practice.',
        commonMistake: 'The confidence is very important in interviews.',
        correction: 'Confidence is very important in interviews.'
      }
    ],
    prepositions: [
      {
        preposition: 'good at (Never good in)',
        usageContext: 'Skills & Talents',
        explanation: 'When describing proficiency or skills, English always uses "good at", "great at", or "bad at".',
        exampleSentence: 'She is very good at explaining complex ideas simply.',
        commonMistake: 'He is very good in English speaking.',
        correction: 'He is very good at speaking English.'
      },
      {
        preposition: 'interested in (Never interested for)',
        usageContext: 'Interests & Curiosity',
        explanation: 'Always pair "interested" with the preposition "in".',
        exampleSentence: 'I am genuinely interested in product design and customer experience.',
        commonMistake: 'I am interested for this job position.',
        correction: 'I am interested in this job position.'
      },
      {
        preposition: 'responsible for (Never responsible of)',
        usageContext: 'Work Roles & Accountability',
        explanation: 'When describing your daily duties, always use "responsible for".',
        exampleSentence: 'In my current role, I am responsible for managing team sprints.',
        commonMistake: 'I am responsible of client communications.',
        correction: 'I am responsible for client communications.'
      }
    ],
    idiomsAndPhrases: [
      {
        phrase: 'Think outside the box',
        meaning: 'Think creatively and approach a problem from a fresh, unconventional angle.',
        context: 'Workplace',
        exampleDialogue: {
          speakerA: 'The traditional marketing channels aren\'t working well.',
          speakerB: 'Let\'s think outside the box and try interactive community challenges.'
        },
        audioText: "Let's think outside the box and try interactive community challenges."
      },
      {
        phrase: 'On the same page',
        meaning: 'Having the same understanding, goals, and expectations as others.',
        context: 'Workplace',
        exampleDialogue: {
          speakerA: 'Before we build the feature, let\'s sync with the client.',
          speakerB: 'Definitely, I want to make sure everyone is on the same page.'
        },
        audioText: 'I want to make sure everyone is on the same page.'
      },
      {
        phrase: 'Go the extra mile',
        meaning: 'Make an extra effort beyond what is strictly required to achieve great results.',
        context: 'Workplace',
        exampleDialogue: {
          speakerA: 'Customers really love our support team lately.',
          speakerB: 'Yes, the team always goes the extra mile to answer questions thoroughly.'
        },
        audioText: 'The team always goes the extra mile to answer questions thoroughly.'
      },
      {
        phrase: 'In a nutshell',
        meaning: 'Expressed briefly in very few words; in summary.',
        context: 'Casual Conversation',
        exampleDialogue: {
          speakerA: 'Can you summarize what the CEO announced?',
          speakerB: 'In a nutshell, we are launching two new products this quarter.'
        },
        audioText: 'In a nutshell, we are launching two new products this quarter.'
      }
    ]
  }
];

export class DailyGrammarLabEngine {
  /**
   * Retrieves grammar lab data associated with a specific calendar date (YYYY-MM-DD).
   * Automatically cycles through daily themes so learners receive fresh content every day.
   */
  public static getDailyGrammar(dateString?: string): DailyGrammarLabData {
    let dayNum = 0;
    if (dateString) {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        dayNum = parseInt(parts[2], 10) || 0;
      }
    } else {
      dayNum = new Date().getDate();
    }

    const index = dayNum % DAILY_GRAMMAR_CATALOG.length;
    return DAILY_GRAMMAR_CATALOG[index];
  }
}
