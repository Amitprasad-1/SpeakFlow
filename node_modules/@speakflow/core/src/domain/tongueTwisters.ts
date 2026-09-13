import { TongueTwister, PhonemeCategory } from '../types/index.js';

export const TONGUE_TWISTERS_CATALOG: TongueTwister[] = [
  // 1. S / SH
  {
    id: 'twister_s_sh_1',
    category: 'S_SH',
    text: 'Selfish shellfish seldom share selfish shallow sea shelters.',
    difficulty: 'medium',
    focusSound: '/s/ vs /ʃ/',
    phoneticBreakdown: '/ˈsɛl.fɪʃ ˈʃɛl.fɪʃ ˈsɛl.dəm ʃɛər ˈsɛl.fɪʃ ˈʃæl.oʊ siː ˈʃɛl.tərz/',
    targetWpm: 120,
    tip: 'Retract your tongue and round your lips for /ʃ/ (sh), but flatten your tongue with smile-shaped lips for /s/.'
  },
  {
    id: 'twister_s_sh_2',
    category: 'S_SH',
    text: 'She sells sea shells on the shiny seashore; sure the shells she sells are seashore shells.',
    difficulty: 'hard',
    focusSound: '/s/ vs /ʃ/',
    phoneticBreakdown: '/ʃiː sɛlz siː ʃɛlz ɒn ðə ˈʃaɪ.ni ˈsiː.ʃɔːr/',
    targetWpm: 140,
    tip: 'Alternate deliberately between the front teeth hiss (/s/) and soft palate hush (/ʃ/).'
  },

  // 2. R / L
  {
    id: 'twister_r_l_1',
    category: 'R_L',
    text: 'Red lorry, yellow lorry, rolling really readily along rural roads.',
    difficulty: 'medium',
    focusSound: '/r/ vs /l/',
    phoneticBreakdown: '/rɛd ˈlɒr.i, ˈjɛl.oʊ ˈlɒr.i, ˈroʊ.lɪŋ ˈrɪə.li ˈrɛd.ɪ.li/',
    targetWpm: 130,
    tip: 'For /r/, pull the tongue body back without touching the roof. For /l/, press the tip firmly behind your top teeth.'
  },
  {
    id: 'twister_r_l_2',
    category: 'R_L',
    text: 'Literally literary rivals rarely relish relevant lyrical revelations.',
    difficulty: 'hard',
    focusSound: '/r/ vs /l/',
    phoneticBreakdown: '/ˈlɪt.ər.əl.i ˈlɪt.ər.ər.i ˈraɪ.vəlz ˈrɛər.li ˈrɛl.ɪʃ ˈrɛl.ə.vənt ˈlɪr.ɪ.kəl/',
    targetWpm: 125,
    tip: 'Pay attention to "literally" where the /l/ and /r/ switch rapidly within a three-syllable sequence.'
  },

  // 3. TH
  {
    id: 'twister_th_1',
    category: 'TH',
    text: 'Thirty-three thoughtful brothers thoroughly thrust three thousand thick thistles.',
    difficulty: 'medium',
    focusSound: 'Voiceless /θ/ & Voiced /ð/',
    phoneticBreakdown: '/ˈθɜː.ti θriː ˈθɔːt.fəl ˈbrʌð.ərz ˈθʌr.ə.li θrʌst/',
    targetWpm: 120,
    tip: 'Gently stick your tongue tip out between your teeth; do not substitute with /s/, /t/, or /f/.'
  },
  {
    id: 'twister_th_2',
    category: 'TH',
    text: 'They thankfully breathed through the soothing northern thermal baths together.',
    difficulty: 'hard',
    focusSound: 'Voiced /ð/ vs Voiceless /θ/',
    phoneticBreakdown: '/ðeɪ ˈθæŋk.fəl.i briːðd θruː ðə ˈsuː.ðɪŋ ˈnɔː.ðən ˈθɜː.məl bæθs/',
    targetWpm: 130,
    tip: 'Feel your vocal cords buzz on "they", "breathed", and "soothing" (voiced), but keep air unvoiced on "thermal" and "baths".'
  },

  // 4. B / P
  {
    id: 'twister_b_p_1',
    category: 'B_P',
    text: 'Peter Piper picked a peck of pickled peppers; a big black bear bit a big black beetle.',
    difficulty: 'medium',
    focusSound: 'Voiceless /p/ vs Voiced /b/',
    phoneticBreakdown: '/ˈpiː.tər ˈpaɪ.pər pɪkt ə pɛk əv ˈpɪk.əld ˈpɛp.ərz/',
    targetWpm: 135,
    tip: 'Ensure a crisp puff of air for /p/ (aspirated stop), and activate vocal fold resonance right at lip release for /b/.'
  },

  // 5. V / W
  {
    id: 'twister_v_w_1',
    category: 'V_W',
    text: 'Valuable vintage velvet vests were worn with vivid warmth by witty visitors.',
    difficulty: 'medium',
    focusSound: '/v/ vs /w/',
    phoneticBreakdown: '/ˈvæl.ju.ə.bəl ˈvɪn.tɪdʒ ˈvɛl.vɪt vɛsts wɜːr wɔːrn wɪð ˈvɪv.ɪd wɔːrmθ/',
    targetWpm: 120,
    tip: 'Touch upper teeth to lower lip for /v/ (friction). Round lips into a circle without teeth contact for /w/.'
  },

  // 6. F / V
  {
    id: 'twister_f_v_1',
    category: 'F_V',
    text: 'Five frantic visual artists viewed vast fascinating velvet valleys fiercely.',
    difficulty: 'medium',
    focusSound: 'Voiceless /f/ vs Voiced /v/',
    phoneticBreakdown: '/faɪv ˈfræn.tɪk ˈvɪʒ.u.əl ˈɑː.tɪsts vjuːd væst ˈfæs.ɪ.neɪ.tɪŋ ˈvɛl.vɪt/',
    targetWpm: 125,
    tip: 'Same mouth shape for both: gently bite lower lip with upper incisors, but turn on voice vibration for /v/.'
  },

  // 7. T / D
  {
    id: 'twister_t_d_1',
    category: 'T_D',
    text: 'Two dedicated digital directors determined demanding data delivery details.',
    difficulty: 'medium',
    focusSound: '/t/ vs /d/',
    phoneticBreakdown: '/tuː ˈdɛd.ɪ.keɪ.tɪd ˈdɪdʒ.ɪ.təl dɪˈrɛk.tərz dɪˈtɜː.mɪnd dɪˈmɑːn.dɪŋ ˈdeɪ.tə/',
    targetWpm: 130,
    tip: 'Strike the alveolar ridge with the tongue tip crisply. Do not let the /t/ turn into a weak glottal stop.'
  },

  // 8. K / G
  {
    id: 'twister_k_g_1',
    category: 'K_G',
    text: 'Crisp cookies quickly crumble while greedy gray geese grab golden grains.',
    difficulty: 'medium',
    focusSound: 'Voiceless /k/ vs Voiced /ɡ/',
    phoneticBreakdown: '/krɪsp ˈkʊk.iz ˈkwɪk.li ˈkrʌm.bəl waɪl ˈɡriː.di ɡreɪ ɡiːs ɡræb/',
    targetWpm: 135,
    tip: 'Seal the back of the tongue firmly against the soft palate; release with explosive burst for /k/.'
  },

  // 9. CH / J
  {
    id: 'twister_ch_j_1',
    category: 'CH_J',
    text: 'Cheerful judges cheerfully jump while charming children choose chocolate chunks.',
    difficulty: 'medium',
    focusSound: '/tʃ/ vs /dʒ/',
    phoneticBreakdown: '/ˈtʃɪə.fəl ˈdʒʌdʒ.ɪz ˈtʃɪə.fəl.i dʒʌmp waɪl ˈtʃɑː.mɪŋ ˈtʃɪl.drən tʃuːz/',
    targetWpm: 130,
    tip: 'Both are affricates: stop airflow then release with friction. /tʃ/ (ch) is unvoiced; /dʒ/ (j) is strongly voiced.'
  },

  // 10. Consonant clusters
  {
    id: 'twister_clusters_1',
    category: 'CONSONANT_CLUSTERS',
    text: 'Strict structured strategies specifically strengthen strong splendid streaming sprint scripts.',
    difficulty: 'hard',
    focusSound: 'Three-consonant clusters /str/, /spl/, /spr/',
    phoneticBreakdown: '/strɪkt ˈstrʌk.tʃəd ˈstræt.ə.dʒiz spəˈsɪf.ɪ.kəl.i ˈstrɛŋ.θən strɒŋ ˈsplɛn.dɪd/',
    targetWpm: 115,
    tip: 'Do not insert vowel sounds between consonants (e.g., avoid saying "es-trict"). Keep the cluster seamless.'
  },

  // 11. Rapid speech
  {
    id: 'twister_rapid_1',
    category: 'RAPID_SPEECH',
    text: 'Which wristwatches are Swiss wristwatches? Swiss wristwatches are switchable wristwatches.',
    difficulty: 'hard',
    focusSound: 'Rapid articulation agility & sibilants',
    phoneticBreakdown: '/wɪtʃ ˈrɪst.wɒtʃ.ɪz ɑːr swɪs ˈrɪst.wɒtʃ.ɪz/',
    targetWpm: 155,
    tip: 'Keep jaw motions compact. Articulate from your lip corners and tongue tip rather than moving your whole head.'
  }
];
