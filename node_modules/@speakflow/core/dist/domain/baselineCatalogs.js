"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BASELINE_VOCAL_WARMUPS = exports.BASELINE_PRONUNCIATION_PAIRS = exports.BASELINE_READING_PASSAGE = exports.BASELINE_SPEAKING_PROMPTS = void 0;
/* --------------------------------------------------------------------------
   1. Baseline Speaking Prompts (1-2 friendly, conversational prompts)
   -------------------------------------------------------------------------- */
exports.BASELINE_SPEAKING_PROMPTS = [
    {
        id: 'prompt_self_intro',
        title: 'Self-Introduction',
        promptText: 'Tell me about yourself in a few sentences.',
        guideQuestion: 'You could share where you are from, what you do, or what you enjoy doing.',
        recommendedDurationSeconds: 30
    },
    {
        id: 'prompt_enjoyment',
        title: 'Something You Enjoy',
        promptText: 'Describe an activity or topic you really enjoy, and why.',
        guideQuestion: 'Talk about a hobby, a project, a place you visited, or a skill you like practicing.',
        recommendedDurationSeconds: 30
    },
    {
        id: 'prompt_motivation',
        title: 'Your English Goal',
        promptText: 'Why do you want to improve your spoken English right now?',
        guideQuestion: 'Share what inspired you to practice today or where you want to use English most.',
        recommendedDurationSeconds: 30
    }
];
/* --------------------------------------------------------------------------
   2. Baseline Reading Passage (Curated strictly 80–120 words)
   -------------------------------------------------------------------------- */
exports.BASELINE_READING_PASSAGE = {
    id: 'baseline_passage_01',
    title: 'The Art of Clear Communication',
    passageText: 'Clear communication is not about using complex vocabulary or speaking very quickly. In everyday life and at work, the most effective speakers speak with a calm, steady rhythm, allowing their ideas to be understood effortlessly. When you articulate each word with care, especially challenging consonant sounds, your natural confidence shines through. By practicing for just a few minutes every single day, you develop strong speech habits that help you express yourself freely in conversations, job interviews, and presentations. Remember that making progress is a continuous journey that starts with small, positive steps.',
    wordCount: 92,
    keyTargetPhonemes: ['R_L', 'TH', 'S_SH', 'CONSONANT_CLUSTERS']
};
/* --------------------------------------------------------------------------
   3. Baseline Pronunciation Pairs (Key English contrasts)
   -------------------------------------------------------------------------- */
exports.BASELINE_PRONUNCIATION_PAIRS = [
    {
        id: 'pair_rl_01',
        soundGroup: 'R_L',
        groupLabel: 'R and L Sounds',
        wordA: 'red',
        wordB: 'led',
        focusTip: 'For /r/, pull your tongue back without touching the roof. For /l/, press your tongue tip behind your upper teeth.'
    },
    {
        id: 'pair_rl_02',
        soundGroup: 'R_L',
        groupLabel: 'R and L Sounds',
        wordA: 'rice',
        wordB: 'lice',
        focusTip: 'Start with a round mouth shape for /r/, and a relaxed spread shape for /l/.'
    },
    {
        id: 'pair_th_01',
        soundGroup: 'TH',
        groupLabel: 'TH Contrast',
        wordA: 'think',
        wordB: 'sink',
        focusTip: 'Place your tongue gently between your front teeth for /th/, and behind your teeth for /s/.'
    },
    {
        id: 'pair_th_02',
        soundGroup: 'TH',
        groupLabel: 'TH Contrast',
        wordA: 'three',
        wordB: 'free',
        focusTip: 'Avoid replacing /th/ with /f/. Feel the gentle airflow across your tongue.'
    },
    {
        id: 'pair_ssh_01',
        soundGroup: 'S_SH',
        groupLabel: 'S and SH Sounds',
        wordA: 'seat',
        wordB: 'sheet',
        focusTip: 'For /s/, smile slightly. For /sh/, round your lips outward gently.'
    },
    {
        id: 'pair_vw_01',
        soundGroup: 'V_W',
        groupLabel: 'V and W Sounds',
        wordA: 'vine',
        wordB: 'wine',
        focusTip: 'Touch your top teeth to your lower lip for /v/. Round your lips into an O-shape for /w/.'
    }
];
/* --------------------------------------------------------------------------
   4. Baseline Gentle Vocal Warm-Ups
   -------------------------------------------------------------------------- */
exports.BASELINE_VOCAL_WARMUPS = [
    {
        id: 'warmup_lip_trill',
        title: 'Lip Trill',
        description: 'Release facial tension and warm up your breath support.',
        instruction: 'Relax your lips, gently blow air through them to make a steady vibration (like a gentle motor).',
        durationSeconds: 15
    },
    {
        id: 'warmup_gentle_hum',
        title: 'Gentle Humming',
        description: 'Awaken your vocal resonance without straining your vocal cords.',
        instruction: 'Close your lips softly, keep your jaw relaxed, and hum a comfortable mid-range tone on an "mmm" sound.',
        durationSeconds: 15
    },
    {
        id: 'warmup_siren',
        title: 'Pitch Siren',
        description: 'Smoothly glide your voice to flex your vocal range.',
        instruction: 'Hum gently and glide your pitch smoothly from low to high and back down, like a distant siren.',
        durationSeconds: 15
    }
];
//# sourceMappingURL=baselineCatalogs.js.map