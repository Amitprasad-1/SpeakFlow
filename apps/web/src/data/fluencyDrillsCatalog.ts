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
  category: 'Viral Reel Challenge' | 'Fluency Drill' | 'Tongue Twister Story' | 'Speed Cadence';
  targetPhonemes: string[];
  totalWords: number;
  difficulty: 'Medium' | 'Hard' | 'Extreme Viral';
  emoji: string;
  viralHook: string;
  speedRatingWpm: number;
  reelLines: string[];
  sentences: FluencySentence[];
  keyVocabulary: {
    word: string;
    ipa: string;
    definition: string;
  }[];
}

export const FLUENCY_DRILLS_CATALOG: FluencyDrillPassage[] = [
  // 1. The Calculating Calculators (The Viral Instagram Reel from Screenshot)
  {
    id: 'fluency_calculator_challenge',
    title: 'The Calculating Calculators Cadence',
    category: 'Viral Reel Challenge',
    targetPhonemes: ['K', 'L', 'T_D'],
    totalWords: 78,
    difficulty: 'Extreme Viral',
    emoji: '📱',
    viralHook: 'Do you speak English fluently? Then try this:',
    speedRatingWpm: 210,
    reelLines: [
      'Do you speak English fluently?',
      'Then try this:',
      'A calculator calculated',
      'a complicated calculation while',
      'another calculator was calculating',
      'the calculation the first calculator',
      'had calculated. Then a calculating',
      'calculator calculated the calculated',
      'calculation again, but the first',
      'calculator couldn’t calculate whether',
      'the calculation was calculated correctly!',
      'So both calculators kept calculating,',
      'recalculating, and checking each calculation,',
      'until nobody knew which calculator had',
      'calculated the correct calculation first!!'
    ],
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

  // 2. The Astute Statistician's Stochastic Calculations (from Screenshot 1)
  {
    id: 'fluency_statistician_stochastic',
    title: 'The Astute Statistician’s Stochastic Flow',
    category: 'Speed Cadence',
    targetPhonemes: ['S_SH', 'T_D', 'R_L'],
    totalWords: 86,
    difficulty: 'Extreme Viral',
    emoji: '📊',
    viralHook: 'Can you master 14 multisyllabic tongue twisters without stumbling?',
    speedRatingWpm: 210,
    reelLines: [
      'Can you speak multisyllabic English fast?',
      'An astute statistician strategically',
      'structured sixty stochastic statistics',
      'to systematically simulate stock market scenarios.',
      'Stressing statistical significance, several',
      'seasoned scientists scrutinized substantial',
      'stochastic shifts across systemic sectors.',
      'Subsequently, these systematically synthesized',
      'statistics substantiated strategic solutions',
      'that stimulated substantial stakeholder success!'
    ],
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

  // 3. Betty Botter's Bitter Butter (World-Famous Plosive Speed Trial)
  {
    id: 'fluency_betty_botter',
    title: 'Betty Botter’s Bitter Butter Cadence',
    category: 'Viral Reel Challenge',
    targetPhonemes: ['P_B', 'T_D'],
    totalWords: 75,
    difficulty: 'Hard',
    emoji: '🧈',
    viralHook: 'Can you recite the /b/ and /t/ speed test in one single breath?',
    speedRatingWpm: 200,
    reelLines: [
      'Betty Botter bought some butter,',
      'but she said the butter’s bitter!',
      'If I put it in my batter,',
      'it will make my batter bitter.',
      'But a bit of better butter',
      'will make my bitter batter better!',
      'So she bought a bit of butter,',
      'better than her bitter butter,',
      'and she baked it in her batter,',
      'and the batter wasn’t bitter!',
      'So ’twas better Betty Botter',
      'bought a bit of better butter!!'
    ],
    sentences: [
      {
        text: 'Vocal warmups begin by releasing jaw tension and focusing on snappy bilabial plosives.',
        levelNumber: 1,
        levelLabel: 'Level 1 · Bilabial Warmup',
        levelTone: 'warmup',
        focusTip: 'Press your lips firmly and pop them cleanly on every /b/ sound.'
      },
      {
        text: 'Betty Botter bought some butter, but she said the butter’s bitter; if I put it in my batter, it will make my batter bitter.',
        levelNumber: 2,
        levelLabel: 'Level 2 · Rhythmic Bounce',
        levelTone: 'flow',
        focusTip: 'Keep a bouncy cadence like a drumbeat between "butter" and "batter".'
      },
      {
        text: 'But a bit of better butter will make my bitter batter better, so she bought a bit of butter better than her bitter butter.',
        levelNumber: 3,
        levelLabel: 'Level 3 · Velocity Sprint',
        levelTone: 'agility',
        focusTip: 'Do not drop the medial /t/ flap sounds in "better" and "bitter".'
      },
      {
        text: 'And she baked it in her batter, and the batter wasn’t bitter; so ’twas better Betty Botter bought a bit of better butter!',
        levelNumber: 4,
        levelLabel: 'Level 4 · Rapid Climax',
        levelTone: 'climax',
        focusTip: 'Finish on a triumphant, crisp cadence!'
      }
    ],
    keyVocabulary: [
      { word: 'bilabial', ipa: '/baɪˈleɪ.bi.əl/', definition: 'Sound formed using both upper and lower lips together.' },
      { word: 'plosive', ipa: '/ˈpləʊ.sɪv/', definition: 'A consonant produced by stopping airflow and suddenly releasing it.' },
      { word: 'cadence', ipa: '/ˈkeɪ.dəns/', definition: 'A rhythmic sequence or flow of sounds in language.' }
    ]
  },

  // 4. The Woodchuck Velocity Challenge
  {
    id: 'fluency_woodchuck_speed',
    title: 'The Woodchuck Velocity Challenge',
    category: 'Viral Reel Challenge',
    targetPhonemes: ['W_V', 'CH_J', 'K_G'],
    totalWords: 72,
    difficulty: 'Hard',
    emoji: '🪵',
    viralHook: 'The legendary American tongue twister taken to maximum speed:',
    speedRatingWpm: 210,
    reelLines: [
      'How much wood would a woodchuck chuck',
      'if a woodchuck could chuck wood?',
      'He would chuck, he would,',
      'as much as he could,',
      'and chuck as much wood as a woodchuck would',
      'if a woodchuck could chuck wood!',
      'A smart woodchuck would chuck',
      'as much wood as he could chuck,',
      'so twenty wild woodchucks chucked',
      'twenty cords of wood quickly!!'
    ],
    sentences: [
      {
        text: 'Rapid lip rounding and palatal release are essential for clear conversational velocity.',
        levelNumber: 1,
        levelLabel: 'Level 1 · Rounding Warmup',
        levelTone: 'warmup',
        focusTip: 'Round your lips tightly on /w/ and snap into the /ch/ palatal consonant.'
      },
      {
        text: 'How much wood would a woodchuck chuck if a woodchuck could chuck wood?',
        levelNumber: 2,
        levelLabel: 'Level 2 · Rhythmic Question',
        levelTone: 'flow',
        focusTip: 'Keep your airflow moving continuously without pausing between "wood would".'
      },
      {
        text: 'He would chuck, he would, as much as he could, and chuck as much wood as a woodchuck would if a woodchuck could chuck wood.',
        levelNumber: 3,
        levelLabel: 'Level 3 · Velocity Agility',
        levelTone: 'agility',
        focusTip: 'Emphasize the rhythmic accents on "chuck" and "wood".'
      },
      {
        text: 'Consequently, twenty wild woodchucks triumphantly chucked twenty cords of weathered wood with remarkable acoustic velocity!',
        levelNumber: 4,
        levelLabel: 'Level 4 · Articulation Climax',
        levelTone: 'climax',
        focusTip: 'Deliver with theatrical confidence and high vocal projection.'
      }
    ],
    keyVocabulary: [
      { word: 'velocity', ipa: '/vəˈlɒs.ə.ti/', definition: 'Speed in a given direction or rapid rate of movement.' },
      { word: 'palatal', ipa: '/ˈpæl.ə.təl/', definition: 'Sound articulated with the body of the tongue against the hard palate.' },
      { word: 'acoustic', ipa: '/əˈkuː.stɪk/', definition: 'Relating to sound or the sense of hearing.' }
    ]
  },

  // 5. The Sophisticated Swiss Chronometer
  {
    id: 'fluency_swiss_chronometer',
    title: 'The Sophisticated Swiss Chronometer',
    category: 'Tongue Twister Story',
    targetPhonemes: ['S_SH', 'W_V', 'CH_J'],
    totalWords: 82,
    difficulty: 'Extreme Viral',
    emoji: '⌚',
    viralHook: 'The most difficult /s/ and /sh/ wristwatch test in English:',
    speedRatingWpm: 210,
    reelLines: [
      'Can you say "Swiss wristwatch" fast?',
      'Six sophisticated Swiss watchmakers',
      'systematically synchronized sixty-six',
      'specialized silver stopwatches.',
      'While watching which Swiss wristwatch switched swiftest,',
      'swift watchmakers wished which wristwatch',
      'would withstand water widest.',
      'I wish to wash my Irish wristwatch while',
      'watching sixty-six Swiss wristwatches tick!'
    ],
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

  // 6. Peter Piper's Pickled Peppers
  {
    id: 'fluency_peter_piper',
    title: 'Peter Piper’s Pickled Peppers Panic',
    category: 'Viral Reel Challenge',
    targetPhonemes: ['P_B', 'K_G'],
    totalWords: 74,
    difficulty: 'Hard',
    emoji: '🌶️',
    viralHook: 'Can you fire off all /p/ plosives without popping the microphone?',
    speedRatingWpm: 210,
    reelLines: [
      'Peter Piper picked a peck of pickled peppers!',
      'A peck of pickled peppers Peter Piper picked.',
      'If Peter Piper picked a peck of pickled peppers,',
      'where’s the peck of pickled peppers',
      'Peter Piper picked?!',
      'Peter picked pickled peppers precisely,',
      'packing plenty of pickled peppers proudly!'
    ],
    sentences: [
      {
        text: 'Explosive bilabial consonants require precise breath support from the diaphragm.',
        levelNumber: 1,
        levelLabel: 'Level 1 · Breath & Pop',
        levelTone: 'warmup',
        focusTip: 'Keep your tongue resting comfortably while lips do the active work.'
      },
      {
        text: 'Peter Piper picked a peck of pickled peppers; a peck of pickled peppers Peter Piper picked.',
        levelNumber: 2,
        levelLabel: 'Level 2 · Plosive Cadence',
        levelTone: 'flow',
        focusTip: 'Emphasize the rhythm: "PEE-ter PY-per PICKED a PECK".'
      },
      {
        text: 'If Peter Piper picked a peck of pickled peppers, where’s the peck of pickled peppers Peter Piper picked?',
        levelNumber: 3,
        levelLabel: 'Level 3 · Question Agility',
        levelTone: 'agility',
        focusTip: 'Speed up on the conditional clause without slurring "pickled".'
      },
      {
        text: 'Promptly, proud Peter Piper packed plenty of perfectly prepared pickled peppers into premium public packages!',
        levelNumber: 4,
        levelLabel: 'Level 4 · Alliterative Climax',
        levelTone: 'climax',
        focusTip: 'Maintain clean separation between /p/ and /k/ in "packed" and "packages".'
      }
    ],
    keyVocabulary: [
      { word: 'bilabial', ipa: '/baɪˈleɪ.bi.əl/', definition: 'Sound made with both lips.' },
      { word: 'plosive', ipa: '/ˈpləʊ.sɪv/', definition: 'Consonant produced with sudden release of air.' },
      { word: 'peck', ipa: '/pɛk/', definition: 'A historic unit of dry volume equal to about eight dry quarts.' }
    ]
  },

  // 7. She Sells Seashells on the Seashore
  {
    id: 'fluency_seashells_sibilance',
    title: 'The Shoreline Sibilance Surge',
    category: 'Tongue Twister Story',
    targetPhonemes: ['S_SH'],
    totalWords: 78,
    difficulty: 'Hard',
    emoji: '🐚',
    viralHook: 'The definitive /s/ vs /ʃ/ phonetic coordination challenge:',
    speedRatingWpm: 190,
    reelLines: [
      'She sells seashells on the seashore,',
      'and the shells she sells are seashells for sure.',
      'For if she sells seashells on the seashore,',
      'then I’m sure she sells seashore shells!',
      'Six shiny seashells shine softly',
      'on the sunny seashore slope.'
    ],
    sentences: [
      {
        text: 'Controlling sibilant airflow prevents microphone distortion and creates crystalline diction.',
        levelNumber: 1,
        levelLabel: 'Level 1 · Airflow Control',
        levelTone: 'warmup',
        focusTip: 'Direct the air stream across the tip of the tongue for /s/.'
      },
      {
        text: 'She sells seashells on the seashore, and the shells she sells are seashells for sure.',
        levelNumber: 2,
        levelLabel: 'Level 2 · S and SH Switch',
        levelTone: 'flow',
        focusTip: 'Notice tongue position: forward for "sells", pulled back for "she".'
      },
      {
        text: 'For if she sells seashells on the seashore, then I’m sure she sells seashore shells!',
        levelNumber: 3,
        levelLabel: 'Level 3 · Inversion Agility',
        levelTone: 'agility',
        focusTip: 'Don’t confuse "she sells" with "sea shells" when accelerating.'
      },
      {
        text: 'Six shimmering shells shine softly on sunny seashore slopes, satisfying several sophisticated seaside shoppers!',
        levelNumber: 4,
        levelLabel: 'Level 4 · Articulation Climax',
        levelTone: 'climax',
        focusTip: 'Crisp ending on "shoppers" with full diaphragmatic authority.'
      }
    ],
    keyVocabulary: [
      { word: 'sibilant', ipa: '/ˈsɪb.ɪ.lənt/', definition: 'A consonant characterized by a hissing sound, such as s or sh.' },
      { word: 'crystalline', ipa: '/ˈkrɪs.tə.laɪn/', definition: 'Very clear, sharp, and sparkling.' },
      { word: 'sophisticated', ipa: '/səˈfɪs.tɪ.keɪ.tɪd/', definition: 'Cultured, refined, or highly developed.' }
    ]
  },

  // 8. Pad Kid Poured Curd (The Scientifically Hardest Tongue Twister by MIT)
  {
    id: 'fluency_pad_kid_mit',
    title: 'The MIT "Pad Kid Poured Curd" Trial',
    category: 'Viral Reel Challenge',
    targetPhonemes: ['P_B', 'K_G', 'T_D'],
    totalWords: 70,
    difficulty: 'Extreme Viral',
    emoji: '🧠',
    viralHook: 'MIT researchers declared this phrase the hardest in the English language:',
    speedRatingWpm: 210,
    reelLines: [
      'MIT psychologists found',
      'this phrase caused 95% of speakers to stop:',
      'Pad kid poured curd pulled cod.',
      'Pad kid poured curd pulled cod.',
      'Pad kid poured curd pulled cod quickly!',
      'Can you repeat it three times fast?'
    ],
    sentences: [
      {
        text: 'Brain plasticity increases when we confront unfamiliar motor sequences in speech enunciation.',
        levelNumber: 1,
        levelLabel: 'Level 1 · Cognitive Setup',
        levelTone: 'warmup',
        focusTip: 'Focus your mind on the alternating /p/ and /k/ tongue and lip movements.'
      },
      {
        text: 'Pad kid poured curd pulled cod; pad kid poured curd pulled cod.',
        levelNumber: 2,
        levelLabel: 'Level 2 · MIT Dual Trial',
        levelTone: 'flow',
        focusTip: 'Do not blend "kid poured" into "kip". Keep the /d/ ending.'
      },
      {
        text: 'Pad kid poured curd pulled cold cod quickly, challenging cognitive motor control and phonetic dexterity.',
        levelNumber: 3,
        levelLabel: 'Level 3 · Neuromotor Agility',
        levelTone: 'agility',
        focusTip: 'Glide from "cold cod" into "quickly" with rapid velar contact.'
      },
      {
        text: 'Remarkably, persistent practice perfects phonetics, triumphantly conquering the scientifically toughest tongue twister in recorded history!',
        levelNumber: 4,
        levelLabel: 'Level 4 · Triumph Climax',
        levelTone: 'climax',
        focusTip: 'Proclaim the victory with commanding vocal resonance!'
      }
    ],
    keyVocabulary: [
      { word: 'plasticity', ipa: '/plæˈstɪs.ə.ti/', definition: 'The adaptability of an organism or brain to changes in environment.' },
      { word: 'dexterity', ipa: '/dɛkˈstɛr.ə.ti/', definition: 'Skill in performing tasks, especially with the hands or vocal articulators.' },
      { word: 'velar', ipa: '/ˈviː.lər/', definition: 'A consonant articulated with the back of the tongue against the soft palate.' }
    ]
  },

  // 9. The Phenomenal Phonetic Phenomenon
  {
    id: 'fluency_phenomenal_phonetics',
    title: 'The Phenomenal Phonetic Phenomenon',
    category: 'Speed Cadence',
    targetPhonemes: ['P_B', 'F_V', 'TH'],
    totalWords: 84,
    difficulty: 'Extreme Viral',
    emoji: '🔬',
    viralHook: 'Test your labiodental fricative velocity with foreign philosophers:',
    speedRatingWpm: 200,
    reelLines: [
      'Philip photographed phenomenal physicists philosophy',
      'while foreign philosophers fervently praised',
      'Philip’s photographic precision.',
      'Consequently, five philosophical photographers',
      'formed forty ferocious focus groups',
      'to formulate fully functional phonetic frameworks!',
      'Frankly, perfecting phenomenal phonetic projection',
      'transforms flat pronunciation into profound eloquence!'
    ],
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

  // 10. The Symphony of Articulate Eloquence
  {
    id: 'fluency_symphony_eloquence',
    title: 'The Symphony of Articulate Eloquence',
    category: 'Fluency Drill',
    targetPhonemes: ['S_SH', 'CH_J', 'R_L'],
    totalWords: 83,
    difficulty: 'Medium',
    emoji: '🎭',
    viralHook: 'Turn speech articulation into a musical instrument:',
    speedRatingWpm: 180,
    reelLines: [
      'Spoken fluency is purposeful resonance,',
      'steady breath, and rhythmic flow.',
      'A skillful speaker shapes sound seamlessly,',
      'sending sparkling sentences straight',
      'to listeners’ sympathetic sentiments.',
      'Deliberate diction, dynamic dynamism,',
      'and disciplined delivery delightfully demolish doubts!'
    ],
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

export const getDailyFluencyDrill = (dateStr?: string, drillId?: string): FluencyDrillPassage => {
  if (drillId) {
    const found = FLUENCY_DRILLS_CATALOG.find(d => d.id === drillId);
    if (found) return found;
  }
  let dayNum = new Date().getDate();
  if (dateStr) {
    const parts = dateStr.split('-');
    if (parts.length === 3) dayNum = parseInt(parts[2], 10) || dayNum;
  }
  const safeDay = Math.abs(dayNum);
  const idx = safeDay % FLUENCY_DRILLS_CATALOG.length;
  return FLUENCY_DRILLS_CATALOG[idx] || FLUENCY_DRILLS_CATALOG[0];
};
