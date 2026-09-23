export interface FluencySentence {
  text: string;
  levelNumber: 1 | 2 | 3 | 4;
  levelLabel: string;
  levelTone: 'warmup' | 'flow' | 'agility' | 'climax';
  ipaHint?: string;
  focusTip?: string;
}

export interface FluencyDrillPassage {
  id: string;
  title: string;
  category: 'Fluency Drill' | 'Tongue Twister Story' | 'Speed Cadence';
  targetPhonemes: string[];
  totalWords: number;
  sentences: FluencySentence[];
  keyVocabulary: {
    word: string;
    ipa: string;
    definition: string;
  }[];
}

export const FLUENCY_DRILLS_CATALOG: FluencyDrillPassage[] = [
  // Day 1: The Calculating Calculators (The Viral Reel Challenge)
  {
    id: 'fluency_calculator_challenge',
    title: 'The Calculating Calculators Cadence',
    category: 'Fluency Drill',
    targetPhonemes: ['K', 'L', 'T_D'],
    totalWords: 78,
    sentences: [
      {
        text: 'Do you speak English fluently? Then test your speech articulation with today’s rapid cadence challenge!',
        levelNumber: 1,
        levelLabel: 'Level 1 · Warmup Rhythm',
        levelTone: 'warmup',
        focusTip: 'Open your jaw wide and establish a steady, rhythmic baseline.'
      },
      {
        text: 'A calculator calculated a complicated calculation while another calculator was calculating the calculation the first calculator had calculated.',
        levelNumber: 2,
        levelLabel: 'Level 2 · Cadence Building',
        levelTone: 'flow',
        focusTip: 'Focus on crisp /k/ and /l/ transitions without dropping syllables.'
      },
      {
        text: 'Then a calculating calculator calculated the calculated calculation again, but the first calculator couldn’t calculate whether the calculation was calculated correctly!',
        levelNumber: 3,
        levelLabel: 'Level 3 · Speed & Agility',
        levelTone: 'agility',
        focusTip: 'Keep your tongue tip nimble behind your upper front teeth for "calculated correctly".'
      },
      {
        text: 'So both calculators kept calculating, recalculating, and checking each calculation, until nobody knew which calculator had calculated the correct calculation first!!',
        levelNumber: 4,
        levelLabel: 'Level 4 · Articulation Climax',
        levelTone: 'climax',
        focusTip: 'Deliver with high vocal energy and sharp terminal consonants.'
      }
    ],
    keyVocabulary: [
      { word: 'calculated', ipa: '/ˈkæl.kjə.leɪ.tɪd/', definition: 'Determined mathematically or evaluated deliberately.' },
      { word: 'complicated', ipa: '/ˈkɒm.plɪ.keɪ.tɪd/', definition: 'Consisting of many interconnected, complex parts.' },
      { word: 'recalculating', ipa: '/ˌriːˈkæl.kjə.leɪ.tɪŋ/', definition: 'Computing or assessing a numerical problem a second time.' }
    ]
  },

  // Day 2: The Phenomenal Phonetic Phenomenon
  {
    id: 'fluency_phenomenal_phonetics',
    title: 'The Phenomenal Phonetic Phenomenon',
    category: 'Speed Cadence',
    targetPhonemes: ['P_B', 'F_V', 'TH'],
    totalWords: 84,
    sentences: [
      {
        text: 'Every articulate speaker masters the subtle interplay of acoustic resonance and rhythmic breath support.',
        levelNumber: 1,
        levelLabel: 'Level 1 · Breath & Resonance',
        levelTone: 'warmup',
        focusTip: 'Take a relaxed diaphragmatic breath before starting.'
      },
      {
        text: 'Philip photographed phenomenal physicists philosophy while foreign philosophers fervently praised Philip’s photographic precision.',
        levelNumber: 2,
        levelLabel: 'Level 2 · Consonant Flow',
        levelTone: 'flow',
        focusTip: 'Differentiate between unvoiced /f/ and voiced /v/ cleanly.'
      },
      {
        text: 'Consequently, five philosophical photographers formed forty ferocious focus groups to formulate fully functional phonetic frameworks.',
        levelNumber: 3,
        levelLabel: 'Level 3 · Rhythmic Velocity',
        levelTone: 'agility',
        focusTip: 'Keep the rhythm steady like a musical metronome.'
      },
      {
        text: 'Frankly, perfecting phenomenal phonetic projection transforms flat pronunciation into profoundly persuasive professional eloquence!',
        levelNumber: 4,
        levelLabel: 'Level 4 · Projection Climax',
        levelTone: 'climax',
        focusTip: 'Project forward from the diaphragm for authoritative clarity.'
      }
    ],
    keyVocabulary: [
      { word: 'phenomenal', ipa: '/fəˈnɒm.ɪ.nəl/', definition: 'Remarkable, exceptional, or extraordinary in execution.' },
      { word: 'philosophical', ipa: '/ˌfɪl.əˈsɒf.ɪ.kəl/', definition: 'Relating to the fundamental nature of knowledge and reality.' },
      { word: 'eloquence', ipa: '/ˈɛl.ə.kwəns/', definition: 'Fluent, persuasive, and graceful verbal expression.' }
    ]
  },

  // Day 3: The Sophisticated Swiss Chronometer
  {
    id: 'fluency_swiss_chronometer',
    title: 'The Sophisticated Swiss Chronometer',
    category: 'Tongue Twister Story',
    targetPhonemes: ['S_SH', 'W_V', 'CH_J'],
    totalWords: 82,
    sentences: [
      {
        text: 'Time measurement requires microscopic precision, matching the discipline of clear spoken articulation.',
        levelNumber: 1,
        levelLabel: 'Level 1 · Articulation Setup',
        levelTone: 'warmup',
        focusTip: 'Start slow and focus on the distinct clarity of every vowel.'
      },
      {
        text: 'Six sophisticated Swiss watchmakers systematically synchronized sixty-six specialized silver stopwatches.',
        levelNumber: 2,
        levelLabel: 'Level 2 · Sibilant Cadence',
        levelTone: 'flow',
        focusTip: 'Control the /s/ sound so it sounds crisp without sharp hissing.'
      },
      {
        text: 'While watching which Swiss wristwatch switched swiftest, swift watchmakers wished which wristwatch would withstand water widest.',
        levelNumber: 3,
        levelLabel: 'Level 3 · Cluster Agility',
        levelTone: 'agility',
        focusTip: 'Practice switching between /w/ (rounded lips) and /v/ (teeth on lip).'
      },
      {
        text: 'Ultimately, such systematically synchronized Swiss wristwatches showcase stunning craftsmanship that silence skepticism seamlessly!',
        levelNumber: 4,
        levelLabel: 'Level 4 · Precision Climax',
        levelTone: 'climax',
        focusTip: 'Finish strong with crisp ending consonants on "seamlessly" and "skepticism".'
      }
    ],
    keyVocabulary: [
      { word: 'synchronized', ipa: '/ˈsɪŋ.krə.naɪzd/', definition: 'Occurring or operating at the exact same rate and time.' },
      { word: 'sophisticated', ipa: '/səˈfɪs.tɪ.keɪ.tɪd/', definition: 'Developed to a high degree of complexity and refinement.' },
      { word: 'craftsmanship', ipa: '/ˈkrɑːfts.mən.ʃɪp/', definition: 'Skill in a particular craft or superior quality of execution.' }
    ]
  },

  // Day 4: The Astute Statistician's Stochastic Calculations
  {
    id: 'fluency_statistician_stochastic',
    title: 'The Astute Statistician’s Stochastic Flow',
    category: 'Speed Cadence',
    targetPhonemes: ['S_SH', 'T_D', 'R_L'],
    totalWords: 86,
    sentences: [
      {
        text: 'Data science thrives on probability, structure, and the deliberate communication of intricate discoveries.',
        levelNumber: 1,
        levelLabel: 'Level 1 · Steady Baseline',
        levelTone: 'warmup',
        focusTip: 'Pace yourself evenly without rushing through the transition words.'
      },
      {
        text: 'An astute statistician strategically structured sixty stochastic statistics to systematically simulate stock market scenarios.',
        levelNumber: 2,
        levelLabel: 'Level 2 · Multisyllabic Rhythm',
        levelTone: 'flow',
        focusTip: 'Accentuate primary stressed syllables: "stra-TE-gi-cally" and "sto-CHAS-tic".'
      },
      {
        text: 'Stressing statistical significance, several seasoned scientists scrutinized substantial stochastic shifts across systemic sectors.',
        levelNumber: 3,
        levelLabel: 'Level 3 · Velocity Sprint',
        levelTone: 'agility',
        focusTip: 'Maintain breath pressure through the alliterative "s" chain.'
      },
      {
        text: 'Subsequently, these systematically synthesized statistics substantiated strategic solutions that stimulated substantial stakeholder success!',
        levelNumber: 4,
        levelLabel: 'Level 4 · Articulation Mastery',
        levelTone: 'climax',
        focusTip: 'Deliver with confident cadence, pausing cleanly at commas.'
      }
    ],
    keyVocabulary: [
      { word: 'stochastic', ipa: '/stəˈkæs.tɪk/', definition: 'Having a random probability distribution or pattern.' },
      { word: 'scrutinized', ipa: '/ˈskruː.tɪ.naɪzd/', definition: 'Examined or inspected closely and thoroughly.' },
      { word: 'substantiated', ipa: '/səbˈstæn.ʃi.eɪ.tɪd/', definition: 'Provided evidence to support or prove the truth of.' }
    ]
  },

  // Day 5: The Resilient Architect's Multidimensional Blueprint
  {
    id: 'fluency_resilient_architect',
    title: 'The Resilient Architect’s Blueprint',
    category: 'Fluency Drill',
    targetPhonemes: ['R_L', 'T_D', 'CH_J'],
    totalWords: 80,
    sentences: [
      {
        text: 'Visionary design unites aesthetic beauty with disciplined structural engineering.',
        levelNumber: 1,
        levelLabel: 'Level 1 · Vocal Warmup',
        levelTone: 'warmup',
        focusTip: 'Enunciate the vowels in "visionary" and "aesthetic" with full resonance.'
      },
      {
        text: 'A brilliant architect drafted multidimensional blueprints demonstrating dramatic structural durability during turbulent weather transitions.',
        levelNumber: 2,
        levelLabel: 'Level 2 · R and L Cadence',
        levelTone: 'flow',
        focusTip: 'Ensure the tongue retracts for /r/ and touches the alveolar ridge for /l/.'
      },
      {
        text: 'Rigorous structural reviews required rapid recalculation regarding reinforced retaining walls and revolutionary rectangular roofs.',
        levelNumber: 3,
        levelLabel: 'Level 3 · Tongue Gymnastics',
        levelTone: 'agility',
        focusTip: 'Glide smoothly between "reinforced retaining" and "revolutionary rectangular".'
      },
      {
        text: 'Remarkably, robust residential towers successfully resisted catastrophic turbulence, triumphantly proving resilient architectural brilliance!',
        levelNumber: 4,
        levelLabel: 'Level 4 · Cadence Climax',
        levelTone: 'climax',
        focusTip: 'Land firmly on the final consonants with crisp conviction.'
      }
    ],
    keyVocabulary: [
      { word: 'multidimensional', ipa: '/ˌmʌl.ti.daɪˈmɛn.ʃən.əl/', definition: 'Involving or having several different aspects or dimensions.' },
      { word: 'durability', ipa: '/ˌdjʊə.rəˈbɪl.ə.ti/', definition: 'The ability to withstand wear, pressure, or damage over time.' },
      { word: 'resilient', ipa: '/rɪˈzɪl.i.ənt/', definition: 'Able to withstand or recover quickly from difficult conditions.' }
    ]
  },

  // Day 6: The Inquisitive Linguistics Symposium
  {
    id: 'fluency_linguistics_symposium',
    title: 'The Inquisitive Linguistics Symposium',
    category: 'Speed Cadence',
    targetPhonemes: ['S_SH', 'TH', 'K_G'],
    totalWords: 85,
    sentences: [
      {
        text: 'Human language evolves when curious minds investigate how sounds convey emotional nuance.',
        levelNumber: 1,
        levelLabel: 'Level 1 · Intonation Warmup',
        levelTone: 'warmup',
        focusTip: 'Keep your pitch flexible and conversational.'
      },
      {
        text: 'Three thoughtful phoneticians thoroughly theorized thirty theoretical themes throughout twelve thrilling Thursday conferences.',
        levelNumber: 2,
        levelLabel: 'Level 2 · Dental Fricative Drill',
        levelTone: 'flow',
        focusTip: 'Lightly place tongue between teeth for /θ/ ("thoughtful", "thoroughly").'
      },
      {
        text: 'These enthusiastic linguists meticulously tackled tricky tongue twisters to test true tonal transitions through tailored acoustic technology.',
        levelNumber: 3,
        levelLabel: 'Level 3 · Alliterative Agility',
        levelTone: 'agility',
        focusTip: 'Bounce lightly through the /t/ consonants without building tension.'
      },
      {
        text: 'Truly, mastering nuanced oral communication guarantees that your thoughts reverberate with captivating distinction and authority!',
        levelNumber: 4,
        levelLabel: 'Level 4 · Authority Climax',
        levelTone: 'climax',
        focusTip: 'Project into the room as if addressing an international symposium.'
      }
    ],
    keyVocabulary: [
      { word: 'theorized', ipa: '/ˈθɪə.raɪzd/', definition: 'Formulated or developed ideas to explain an observed fact.' },
      { word: 'meticulously', ipa: '/məˈtɪk.jə.ləs.li/', definition: 'Taking or showing extreme care about minute details; precise.' },
      { word: 'reverberate', ipa: '/rɪˈvɜː.bə.reɪt/', definition: 'Echo with great impact or produce enduring positive resonance.' }
    ]
  },

  // Day 7: The Synchronized Symphony of Articulate Eloquence
  {
    id: 'fluency_symphony_eloquence',
    title: 'The Symphony of Articulate Eloquence',
    category: 'Fluency Drill',
    targetPhonemes: ['S_SH', 'CH_J', 'R_L'],
    totalWords: 83,
    sentences: [
      {
        text: 'Spoken fluency is not about hurried speed, but rather purposeful resonance, steady breath, and rhythmic flow.',
        levelNumber: 1,
        levelLabel: 'Level 1 · Rhythm & Breath',
        levelTone: 'warmup',
        focusTip: 'Relax your shoulders and breathe deeply from the lower ribs.'
      },
      {
        text: 'A skillful speaker shapes sound seamlessly, sending sparkling sentences straight to listeners’ sympathetic sentiments.',
        levelNumber: 2,
        levelLabel: 'Level 2 · Connected Speech',
        levelTone: 'flow',
        focusTip: 'Connect words naturally using liaison (e.g. "sound-seamlessly").'
      },
      {
        text: 'Deliberate diction, dynamic dynamism, and disciplined delivery delightfully demolish doubts during demanding discussions.',
        levelNumber: 3,
        levelLabel: 'Level 3 · Consonant Cascade',
        levelTone: 'agility',
        focusTip: 'Crisply enunciate the /d/ plosives without stumbling.'
      },
      {
        text: 'By harmonizing articulation with passion, you transform every conversation into an unforgettable symphony of personal leadership!',
        levelNumber: 4,
        levelLabel: 'Level 4 · Grand Cadence Climax',
        levelTone: 'climax',
        focusTip: 'Deliver with inspirational warmth and unshakeable confidence.'
      }
    ],
    keyVocabulary: [
      { word: 'harmonizing', ipa: '/ˈhɑː.mə.naɪ.zɪŋ/', definition: 'Bringing elements into a pleasing, coherent, or consistent whole.' },
      { word: 'dynamism', ipa: '/ˈdaɪ.nə.mɪ.zəm/', definition: 'The quality of being characterized by vigorous activity and progress.' },
      { word: 'diction', ipa: '/ˈdɪk.ʃən/', definition: 'The style of enunciation in speaking or clarity of speech.' }
    ]
  }
];

export const getDailyFluencyDrill = (dateStr?: string): FluencyDrillPassage => {
  let dayNum = new Date().getDate();
  if (dateStr) {
    const parts = dateStr.split('-');
    if (parts.length === 3) dayNum = parseInt(parts[2], 10) || dayNum;
  }
  const safeDay = Math.abs(dayNum);
  const idx = safeDay % FLUENCY_DRILLS_CATALOG.length;
  return FLUENCY_DRILLS_CATALOG[idx] || FLUENCY_DRILLS_CATALOG[0];
};
