export type PhraseCategory = 'all' | 'punchy' | 'assertive' | 'requests' | 'daily' | 'favorites';

export interface HindiEnglishPhrase {
  id: string;
  hindi: string;
  english: string;
  category: 'punchy' | 'assertive' | 'requests' | 'daily';
  notes?: string;
  isCustom?: boolean;
}

export const CATEGORY_LABELS: Record<string, { label: string; hindiLabel: string; iconName: string }> = {
  all: { label: 'All Phrases', hindiLabel: 'सभी वाक्य', iconName: 'Layers' },
  punchy: { label: 'Short & Punchy', hindiLabel: 'छोटे व तीखे वाक्य', iconName: 'Zap' },
  assertive: { label: 'Assertive & Boundaries', hindiLabel: 'हक, गुस्सा व सीमाएं', iconName: 'ShieldAlert' },
  requests: { label: 'Requests & Instructions', hindiLabel: 'अनुरोध व निर्देश', iconName: 'HandMetal' },
  daily: { label: 'Conversational & Daily', hindiLabel: 'दैनिक बोलचाल व आदतें', iconName: 'MessageCircle' },
  favorites: { label: 'Starred Favorites', hindiLabel: 'पसंदीदा वाक्य', iconName: 'Star' }
};

export const DEFAULT_HINDI_ENGLISH_PHRASES: HindiEnglishPhrase[] = [
  // ===================== IMAGE 1: SHORT & PUNCHY =====================
  { id: 'he_p1', hindi: 'दूर रहो।', english: 'Stay away.', category: 'punchy' },
  { id: 'he_p2', hindi: 'चुप रहो।', english: 'Be quiet.', category: 'punchy' },
  { id: 'he_p3', hindi: 'निकल जाओ।', english: 'Get out.', category: 'punchy' },
  { id: 'he_p4', hindi: 'पीछे हटो।', english: 'Back off.', category: 'punchy' },
  { id: 'he_p5', hindi: 'होश में रहो।', english: 'Get real.', category: 'punchy' },
  { id: 'he_p6', hindi: 'संभल जाओ।', english: 'Watch yourself.', category: 'punchy' },
  { id: 'he_p7', hindi: 'बात खत्म।', english: 'End of story.', category: 'punchy' },
  { id: 'he_p8', hindi: 'हद में रहो।', english: 'Stay in line.', category: 'punchy' },
  { id: 'he_p9', hindi: 'भूल जाओ।', english: 'Forget it.', category: 'punchy' },
  { id: 'he_p10', hindi: 'हट जाओ।', english: 'Move aside.', category: 'punchy' },
  { id: 'he_p11', hindi: 'शांत रहो।', english: 'Stay calm.', category: 'punchy' },
  { id: 'he_p12', hindi: 'ध्यान रखो।', english: 'Be careful.', category: 'punchy' },
  { id: 'he_p13', hindi: 'आगे बढ़ो।', english: 'Move on.', category: 'punchy' },
  { id: 'he_p14', hindi: 'जल्दी करो।', english: 'Hurry up.', category: 'punchy' },
  { id: 'he_p15', hindi: 'रुक जाओ।', english: 'Hold it.', category: 'punchy' },
  { id: 'he_p16', hindi: 'सुनते रहो।', english: 'Keep listening.', category: 'punchy' },
  { id: 'he_p17', hindi: 'देखते रहो।', english: 'Keep watching.', category: 'punchy' },
  { id: 'he_p18', hindi: 'बैठ जाओ।', english: 'Sit down.', category: 'punchy' },

  // ===================== IMAGE 2: ASSERTIVE & BOUNDARIES =====================
  { id: 'he_a1', hindi: 'मुझ पर हुक्म मत चलाओ।', english: "Don't order me around.", category: 'assertive' },
  { id: 'he_a2', hindi: 'मुझे सफाई देने की ज़रूरत नहीं है।', english: "I don't need to explain myself.", category: 'assertive' },
  { id: 'he_a3', hindi: 'अपनी सलाह अपने पास रखो।', english: 'Keep your advice to yourself.', category: 'assertive' },
  { id: 'he_a4', hindi: 'मैं किसी की नहीं सुनता।', english: 'I listen to no one.', category: 'assertive' },
  { id: 'he_a5', hindi: 'मुझसे बहस मत करो।', english: "Don't argue with me.", category: 'assertive' },
  { id: 'he_a6', hindi: 'अपनी औकात में रहो।', english: 'Know your status.', category: 'assertive' },
  { id: 'he_a7', hindi: 'मुझे फर्क नहीं पड़ता।', english: "It doesn't matter to me.", category: 'assertive' },
  { id: 'he_a8', hindi: 'मुझसे दूर ही रहो।', english: 'Stay away from me.', category: 'assertive' },
  { id: 'he_a9', hindi: 'दिमाग मत खराब करो।', english: "Don't get on my nerves.", category: 'assertive' },
  { id: 'he_a10', hindi: 'मुझे मत सिखाओ क्या करना है।', english: "Don't tell me what to do.", category: 'assertive' },
  { id: 'he_a11', hindi: 'अपनी बकवास बंद करो।', english: 'Cut the nonsense.', category: 'assertive' },
  { id: 'he_a12', hindi: 'मुझे बेवकूफ मत समझो।', english: "Don't take me for a fool.", category: 'assertive' },
  { id: 'he_a13', hindi: 'मेरी नजरों से दूर हो जाओ।', english: 'Get out of my sight.', category: 'assertive' },
  { id: 'he_a14', hindi: 'तुम्हारी हिम्मत कैसे हुई?', english: 'How dare you?', category: 'assertive' },
  { id: 'he_a15', hindi: 'मैं अपनी मर्जी का मालिक हूँ।', english: 'I am my own boss.', category: 'assertive' },
  { id: 'he_a16', hindi: 'मुझे किसी की जरूरत नहीं है।', english: "I don't need anyone.", category: 'assertive' },
  { id: 'he_a17', hindi: 'खुद को संभालो।', english: 'Control yourself.', category: 'assertive' },
  { id: 'he_a18', hindi: 'अपनी जुबान संभालो।', english: 'Mind your language.', category: 'assertive' },
  { id: 'he_a19', hindi: 'अपनी हद पार मत करो।', english: "Don't cross your limits.", category: 'assertive' },
  { id: 'he_a20', hindi: 'मैं तुम्हें नहीं छोड़ूंगा।', english: "I won't spare you.", category: 'assertive' },
  { id: 'he_a21', hindi: 'मुझे काम करने दो।', english: 'Let me do my work.', category: 'assertive' },
  { id: 'he_a22', hindi: 'मुझसे पंगा मत लो।', english: "Don't mess with me.", category: 'assertive' },
  { id: 'he_a23', hindi: 'अपना काम करो।', english: 'Mind your own business.', category: 'assertive' },
  { id: 'he_a24', hindi: 'मुझे परवाह नहीं है।', english: "I don't care.", category: 'assertive' },
  { id: 'he_a25', hindi: 'होश में आओ।', english: 'Get real.', category: 'assertive' },
  { id: 'he_a26', hindi: 'भूल जाओ।', english: 'Let it go.', category: 'assertive' },

  // ===================== IMAGE 3: REQUESTS & INSTRUCTIONS =====================
  { id: 'he_r1', hindi: 'मुझे एक मौका दो।', english: 'Give me a chance.', category: 'requests' },
  { id: 'he_r2', hindi: 'अपनी सीट पर बैठो।', english: 'Sit in your seat.', category: 'requests' },
  { id: 'he_r3', hindi: 'मुझे अंदर आने दो।', english: 'Let me come in.', category: 'requests' },
  { id: 'he_r4', hindi: 'मुझे बाहर जाने दो।', english: 'Let me go out.', category: 'requests' },
  { id: 'he_r5', hindi: 'मेरी बात पर विश्वास करो।', english: 'Believe me.', category: 'requests' },
  { id: 'he_r6', hindi: 'अपना बैग उठाओ।', english: 'Pick up your bag.', category: 'requests' },
  { id: 'he_r7', hindi: 'मुझे थोड़ा समय दो।', english: 'Give me some time.', category: 'requests' },
  { id: 'he_r8', hindi: 'अपना फैसला बदलो।', english: 'Change your decision.', category: 'requests' },
  { id: 'he_r9', hindi: 'मुझे अकेला रहने दो।', english: 'Let me be alone.', category: 'requests' },
  { id: 'he_r10', hindi: 'मेरी मदद करो।', english: 'Help me.', category: 'requests' },
  { id: 'he_r11', hindi: 'अपनी गलती मान लो।', english: 'Admit your mistake.', category: 'requests' },
  { id: 'he_r12', hindi: 'मुझे माफ़ कर दो।', english: 'Forgive me.', category: 'requests' },
  { id: 'he_r13', hindi: 'मेरी बात ध्यान से सुनो।', english: 'Listen to me carefully.', category: 'requests' },
  { id: 'he_r14', hindi: 'अपना कमरा साफ़ करो।', english: 'Clean your room.', category: 'requests' },
  { id: 'he_r15', hindi: 'मुझे परेशान मत करो।', english: "Don't bother me.", category: 'requests' },
  { id: 'he_r16', hindi: 'अपना काम शुरू करो।', english: 'Start your work.', category: 'requests' },
  { id: 'he_r17', hindi: 'मुझे रास्ता दिखाओ।', english: 'Show me the way.', category: 'requests' },
  { id: 'he_r18', hindi: 'अपना समय बर्बाद मत करो।', english: "Don't waste your time.", category: 'requests' },
  { id: 'he_r19', hindi: 'मुझे भूल मत जाना।', english: "Don't forget me.", category: 'requests' },
  { id: 'he_r20', hindi: 'अपना वादा निभाओ।', english: 'Keep your promise.', category: 'requests' },
  { id: 'he_r21', hindi: 'मुझे सच-सच बताओ।', english: 'Tell me the truth.', category: 'requests' },
  { id: 'he_r22', hindi: 'अपनी आवाज़ धीमी रखो।', english: 'Keep your voice down.', category: 'requests' },
  { id: 'he_r23', hindi: 'मुझे एक मिनट दो।', english: 'Give me a minute.', category: 'requests' },
  { id: 'he_r24', hindi: 'अपना ध्यान रखो।', english: 'Take care of yourself.', category: 'requests' },
  { id: 'he_r25', hindi: 'मुझे बाद में कॉल करना।', english: 'Call me later.', category: 'requests' },
  { id: 'he_r26', hindi: 'अपना मोबाइल बंद करो।', english: 'Turn off your phone.', category: 'requests' },

  // ===================== IMAGE 4: DAILY CONVERSATIONS & HABITS =====================
  { id: 'he_d1', hindi: 'ज़रा इधर आओ।', english: 'Come here for a moment.', category: 'daily' },
  { id: 'he_d2', hindi: 'मुझे अकेला छोड़ दो।', english: 'Leave me alone.', category: 'daily' },
  { id: 'he_d3', hindi: 'मेरी बात समझो।', english: 'Understand what I mean.', category: 'daily' },
  { id: 'he_d4', hindi: 'मेरी तरफ देखो।', english: 'Look at me.', category: 'daily' },
  { id: 'he_d5', hindi: 'मुझे जल्दी जाना है।', english: 'I have to leave soon.', category: 'daily' },
  { id: 'he_d6', hindi: 'तुमने मुझे बुलाया?', english: 'Did you call me?', category: 'daily' },
  { id: 'he_d7', hindi: 'इसे वहीं रख दो।', english: 'Put it right there.', category: 'daily' },
  { id: 'he_d8', hindi: 'अभी मत जाओ।', english: "Don't leave yet.", category: 'daily' },
  { id: 'he_d9', hindi: 'मुझे थोड़ी देर दो।', english: 'Give me a little time.', category: 'daily' },
  { id: 'he_d10', hindi: 'यह मेरा नहीं है।', english: "This isn't mine.", category: 'daily' },
  { id: 'he_d11', hindi: 'तुम्हारी बारी है।', english: "It's your turn.", category: 'daily' },
  { id: 'he_d12', hindi: 'मुझे इसकी आदत है।', english: "I'm used to it.", category: 'daily' },
  { id: 'he_d13', hindi: 'मुझे इसकी आदत नहीं है।', english: "I'm not used to it.", category: 'daily' },
  { id: 'he_d14', hindi: 'इतना परेशान मत हो।', english: "Don't worry so much.", category: 'daily' },
  { id: 'he_d15', hindi: 'मुझे सब याद है।', english: 'I remember everything.', category: 'daily' },
  { id: 'he_d16', hindi: 'तुम सही कह रहे हो।', english: "You're right.", category: 'daily' },
  { id: 'he_d17', hindi: 'मैं तुमसे सहमत हूँ।', english: 'I agree with you.', category: 'daily' },
  { id: 'he_d18', hindi: 'मुझे ऐसा नहीं लगता।', english: "I don't think so.", category: 'daily' }
];
