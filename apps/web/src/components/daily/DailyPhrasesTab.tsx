import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, Badge } from '../../design-system';
import { VoiceWaveVisualizer } from '../common/VoiceWaveVisualizer';
import {
  HindiEnglishPhrase,
  PhraseCategory,
  DEFAULT_HINDI_ENGLISH_PHRASES,
  CATEGORY_LABELS,
  getDailyRotatedPhrases
} from '../../data/hindiEnglishPhrasesData';
import { BrowserStorage } from '../../storage/BrowserStorage';
import { GeminiAIService } from '../../services/GeminiAIService';
import {
  Volume2,
  Mic,
  MicOff,
  Sparkles,
  Search,
  Star,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
  Zap,
  ShieldAlert,
  HandMetal,
  MessageCircle,
  Layers,
  X,
  Languages,
  RotateCw,
  Calendar,
  BookOpen
} from 'lucide-react';

export interface DailyPhrasesTabProps {
  currentDateString?: string;
}

export const DailyPhrasesTab: React.FC<DailyPhrasesTabProps> = ({
  currentDateString
}) => {
  // Effective active date (YYYY-MM-DD)
  const effectiveDate = useMemo(() => {
    if (currentDateString) return currentDateString;
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [currentDateString]);

  // View Mode: 'daily' (today's curated dynamic set) vs 'library' (all 88+ phrases)
  const [viewMode, setViewMode] = useState<'daily' | 'library'>('daily');

  // Dynamic daily phrases state
  const [dailyPhrases, setDailyPhrases] = useState<HindiEnglishPhrase[]>(() => {
    const cached = BrowserStorage.getDailyGeneratedPhrases(effectiveDate);
    if (cached && cached.length > 0) return cached;
    return getDailyRotatedPhrases(effectiveDate);
  });

  // Storage & Custom phrases
  const [customPhrases, setCustomPhrases] = useState<HindiEnglishPhrase[]>(() => {
    return BrowserStorage.getCustomPhrases();
  });
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => {
    return new Set(BrowserStorage.getFavoritePhraseIds());
  });

  // Filters & Search
  const [activeCategory, setActiveCategory] = useState<PhraseCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Audio & Practice state
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [practiceResults, setPracticeResults] = useState<Record<string, { spoken: string; matchScore: number }>>({});

  // Dynamic AI Fetching state
  const [isFetchingFresh, setIsFetchingFresh] = useState(false);
  const [freshFeedback, setFreshFeedback] = useState<string | null>(null);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newHindi, setNewHindi] = useState('');
  const [newEnglish, setNewEnglish] = useState('');
  const [newCategory, setNewCategory] = useState<'punchy' | 'assertive' | 'requests' | 'daily'>('daily');
  const [isTranslating, setIsTranslating] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Update daily phrases whenever date changes
  useEffect(() => {
    const cached = BrowserStorage.getDailyGeneratedPhrases(effectiveDate);
    if (cached && cached.length > 0) {
      setDailyPhrases(cached);
    } else {
      setDailyPhrases(getDailyRotatedPhrases(effectiveDate));
    }
  }, [effectiveDate]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  // Dynamically fetch or generate a fresh set
  const handleFetchFreshPack = async () => {
    setIsFetchingFresh(true);
    setFreshFeedback(null);

    try {
      if (GeminiAIService.isConfigured()) {
        const freshList = await GeminiAIService.fetchFreshDailyPhrases();
        if (freshList && freshList.length > 0) {
          setDailyPhrases(freshList as any);
          BrowserStorage.saveDailyGeneratedPhrases(effectiveDate, freshList);
          setFreshFeedback('10 fresh spoken phrases generated via live AI!');
          setTimeout(() => setFreshFeedback(null), 4000);
          return;
        }
      }

      // Offline rotation fallback: shift rotation seed
      const randomSeed = `${effectiveDate}_${Date.now()}`;
      const rotated = getDailyRotatedPhrases(randomSeed);
      setDailyPhrases(rotated);
      BrowserStorage.saveDailyGeneratedPhrases(effectiveDate, rotated);
      setFreshFeedback("Loaded fresh rotating daily phrases!");
      setTimeout(() => setFreshFeedback(null), 4000);
    } catch {
      const rotated = getDailyRotatedPhrases(`${effectiveDate}_fallback`);
      setDailyPhrases(rotated);
    } finally {
      setIsFetchingFresh(false);
    }
  };

  // Base list depending on view mode
  const activeBaseList = useMemo(() => {
    if (viewMode === 'daily') {
      return dailyPhrases;
    }
    return [...customPhrases, ...DEFAULT_HINDI_ENGLISH_PHRASES];
  }, [viewMode, dailyPhrases, customPhrases]);

  // Filtered phrases
  const filteredPhrases = useMemo(() => {
    let list = activeBaseList;

    if (activeCategory === 'favorites') {
      list = list.filter((p) => favoriteIds.has(p.id));
    } else if (activeCategory !== 'all') {
      list = list.filter((p) => p.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.hindi.toLowerCase().includes(q) ||
          p.english.toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeBaseList, activeCategory, favoriteIds, searchQuery]);

  // Audio playback
  const handlePlayAudio = (phrase: HindiEnglishPhrase) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    setPlayingId(phrase.id);

    const utterance = new SpeechSynthesisUtterance(phrase.english);
    utterance.rate = 0.95;
    utterance.lang = 'en-US';

    utterance.onend = () => setPlayingId(null);
    utterance.onerror = () => setPlayingId(null);

    window.speechSynthesis.speak(utterance);
  };

  // Speech Practice
  const handleTogglePractice = (phrase: HindiEnglishPhrase) => {
    if (recordingId === phrase.id) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setRecordingId(null);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome, Edge, or Safari.');
      return;
    }

    window.speechSynthesis?.cancel();
    setPlayingId(null);
    setRecordingId(phrase.id);

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const spoken = event.results[0]?.[0]?.transcript || '';
      const target = phrase.english.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?'"]/g, '').trim();
      const cleanSpoken = spoken.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?'"]/g, '').trim();

      let score = 0;
      if (cleanSpoken === target) {
        score = 100;
      } else {
        const targetWords = target.split(/\s+/);
        const spokenWords = cleanSpoken.split(/\s+/);
        let matchCount = 0;
        targetWords.forEach((w: string) => {
          if (spokenWords.includes(w)) matchCount++;
        });
        score = Math.round((matchCount / Math.max(targetWords.length, 1)) * 100);
      }

      setPracticeResults((prev) => ({
        ...prev,
        [phrase.id]: { spoken, matchScore: Math.min(100, score) }
      }));
      setRecordingId(null);
    };

    recognition.onerror = () => setRecordingId(null);
    recognition.onend = () => setRecordingId(null);

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Toggle Favorite
  const handleToggleFavorite = (id: string) => {
    const isFav = BrowserStorage.toggleFavoritePhrase(id);
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (isFav) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  // Add Custom Phrase
  const handleAddCustomPhrase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHindi.trim() || !newEnglish.trim()) return;

    const created = BrowserStorage.addCustomPhrase({
      hindi: newHindi.trim(),
      english: newEnglish.trim(),
      category: newCategory
    });

    setCustomPhrases((prev) => [created, ...prev]);
    if (viewMode === 'daily') {
      setDailyPhrases((prev) => [created, ...prev]);
    }
    setNewHindi('');
    setNewEnglish('');
    setIsAddModalOpen(false);
  };

  // Delete Custom Phrase
  const handleDeleteCustom = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    BrowserStorage.deleteCustomPhrase(id);
    setCustomPhrases((prev) => prev.filter((p) => p.id !== id));
    setDailyPhrases((prev) => prev.filter((p) => p.id !== id));
  };

  // Auto-translate using Gemini
  const handleAutoTranslate = async () => {
    if (!newHindi.trim()) return;
    setIsTranslating(true);
    try {
      const translated = await GeminiAIService.translateHindiToEnglish(newHindi);
      if (translated) {
        setNewEnglish(translated);
      } else {
        alert('Translation unavailable. Configure your free Gemini API key in Profile & Settings or enter the English translation directly.');
      }
    } catch {
      alert('Could not translate at this moment.');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '960px', margin: '0 auto', width: '100%' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', flexWrap: 'wrap' }}>
            <Badge variant="primary" icon={<Languages size={14} />}>
              हिंदी ➔ English Studio
            </Badge>
            <Badge variant="focus">
              Ref: @VibesOfLearning
            </Badge>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--color-primary)',
                background: 'var(--color-primary-subtle)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Calendar size={12} />
              {effectiveDate}
            </span>
          </div>
          <h1 className="typography-h1" style={{ margin: 0 }}>
            Everyday Spoken Phrases
          </h1>
          <p className="typography-body" style={{ marginTop: 'var(--space-1)', color: 'var(--color-text-secondary)', maxWidth: '65ch' }}>
            Daily curated spoken English sentences for real-world Hindi expressions. Fresh dynamic content updated daily with audio pronunciation and instant voice feedback!
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <button
            onClick={handleFetchFreshPack}
            disabled={isFetchingFresh}
            className="speakflow-btn btn-variant-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-1-5)',
              padding: 'var(--space-2-5) var(--space-3-5)',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: 'var(--text-body-sm)'
            }}
            title="Generate or pull fresh daily spoken phrases"
          >
            <RotateCw size={15} className={isFetchingFresh ? 'animate-spin' : ''} />
            <span>{isFetchingFresh ? 'Fetching Fresh...' : 'Fetch Fresh Daily Set'}</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="speakflow-btn btn-variant-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-1-5)',
              padding: 'var(--space-2-5) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: 'var(--text-body-sm)'
            }}
          >
            <Plus size={16} />
            <span>Add Custom Phrase</span>
          </button>
        </div>
      </div>

      {/* Fresh Feedback Toast */}
      {freshFeedback && (
        <div
          style={{
            padding: 'var(--space-2-5) var(--space-4)',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#10b981',
            fontSize: 'var(--text-body-sm)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Sparkles size={16} />
          <span>{freshFeedback}</span>
        </div>
      )}

      {/* View Mode Switcher & Category Filters */}
      <Card variant="default" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Toggle Mode: Today's Pick vs All Library */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--color-border-subtle)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button
              onClick={() => setViewMode('daily')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-body-sm)',
                fontWeight: viewMode === 'daily' ? 700 : 500,
                background: viewMode === 'daily' ? 'var(--color-primary)' : 'var(--color-surface)',
                color: viewMode === 'daily' ? '#ffffff' : 'var(--color-text-secondary)',
                border: `1px solid ${viewMode === 'daily' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                cursor: 'pointer'
              }}
            >
              <Calendar size={14} />
              <span>Today's Daily Set ({dailyPhrases.length})</span>
            </button>

            <button
              onClick={() => setViewMode('library')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-body-sm)',
                fontWeight: viewMode === 'library' ? 700 : 500,
                background: viewMode === 'library' ? 'var(--color-primary)' : 'var(--color-surface)',
                color: viewMode === 'library' ? '#ffffff' : 'var(--color-text-secondary)',
                border: `1px solid ${viewMode === 'library' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                cursor: 'pointer'
              }}
            >
              <BookOpen size={14} />
              <span>Full Library ({customPhrases.length + DEFAULT_HINDI_ENGLISH_PHRASES.length})</span>
            </button>
          </div>

          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>
            {viewMode === 'daily' ? '📅 Curated fresh phrases for this calendar date' : '📚 Complete searchable expression catalog'}
          </span>
        </div>

        {/* Search Input Bar */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: 'var(--space-3)',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)'
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search phrases in Hindi or English (e.g. 'गुस्सा', 'chance', 'चुप', 'stay')..."
            style={{
              width: '100%',
              padding: 'var(--space-2-5) var(--space-3) var(--space-2-5) 38px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--text-body)',
              outline: 'none'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: 'var(--space-3)',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
          {(['all', 'punchy', 'assertive', 'requests', 'daily', 'favorites'] as PhraseCategory[]).map((cat) => {
            const isSelected = activeCategory === cat;
            const meta = CATEGORY_LABELS[cat];
            const count =
              cat === 'all'
                ? activeBaseList.length
                : cat === 'favorites'
                ? favoriteIds.size
                : activeBaseList.filter((p) => p.category === cat).length;

            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--text-body-sm)',
                  fontWeight: isSelected ? 700 : 500,
                  background: isSelected ? 'var(--color-primary)' : 'var(--color-surface-hover)',
                  color: isSelected ? '#ffffff' : 'var(--color-text-secondary)',
                  border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  cursor: 'pointer',
                  transition: 'all var(--motion-duration-fast) ease'
                }}
              >
                {cat === 'favorites' && <Star size={13} fill={isSelected ? '#ffffff' : 'none'} />}
                {cat === 'punchy' && <Zap size={13} />}
                {cat === 'assertive' && <ShieldAlert size={13} />}
                {cat === 'requests' && <HandMetal size={13} />}
                {cat === 'daily' && <MessageCircle size={13} />}
                {cat === 'all' && <Layers size={13} />}
                <span>{meta.label}</span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-full)',
                    background: isSelected ? 'rgba(255, 255, 255, 0.25)' : 'var(--color-surface)',
                    color: isSelected ? '#ffffff' : 'var(--color-text-muted)'
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Phrases Grid */}
      {filteredPhrases.length === 0 ? (
        <Card variant="default" padding="lg" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: 'var(--text-body)' }}>
            No phrases found matching "{searchQuery}". Click "Fetch Fresh Daily Set" or "Add Custom Phrase" to add more!
          </p>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-3)' }}>
          {filteredPhrases.map((phrase) => {
            const isPlaying = playingId === phrase.id;
            const isRecording = recordingId === phrase.id;
            const isFav = favoriteIds.has(phrase.id);
            const result = practiceResults[phrase.id];

            return (
              <Card
                key={phrase.id}
                variant="default"
                padding="md"
                className="card-hover-lift"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: 'var(--radius-lg)',
                  border: isPlaying ? '1px solid var(--color-primary)' : isRecording ? '1px solid var(--color-error)' : '1px solid var(--color-border)',
                  background: isPlaying ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
                  position: 'relative'
                }}
              >
                <div>
                  {/* Top Bar: Category Pill & Star / Delete */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: 'var(--color-primary)',
                        background: 'var(--color-surface-hover)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      {CATEGORY_LABELS[phrase.category]?.hindiLabel || phrase.category}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {phrase.isCustom && (
                        <button
                          onClick={(e) => handleDeleteCustom(phrase.id, e)}
                          title="Delete custom phrase"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-text-muted)',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleFavorite(phrase.id)}
                        title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: isFav ? '#f59e0b' : 'var(--color-text-muted)',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex'
                        }}
                      >
                        <Star size={15} fill={isFav ? '#f59e0b' : 'none'} />
                      </button>
                    </div>
                  </div>

                  {/* Hindi Source Text */}
                  <div
                    style={{
                      fontSize: '1.15rem',
                      fontWeight: 700,
                      color: 'var(--color-text-primary)',
                      marginBottom: 'var(--space-1-5)',
                      letterSpacing: '0.01em',
                      fontFamily: 'system-ui, -apple-system, sans-serif'
                    }}
                  >
                    {phrase.hindi}
                  </div>

                  {/* English Spoken Translation */}
                  <div
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      color: 'var(--color-primary)',
                      marginBottom: 'var(--space-3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <ArrowRight size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
                    <span>{phrase.english}</span>
                  </div>

                  {/* Speech Match Feedback */}
                  {result && (
                    <div
                      style={{
                        marginBottom: 'var(--space-3)',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-sm)',
                        background: result.matchScore >= 80 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                        border: `1px solid ${result.matchScore >= 80 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                        fontSize: '0.78rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600 }}>
                        <span style={{ color: result.matchScore >= 80 ? '#10b981' : '#f59e0b' }}>
                          {result.matchScore >= 80 ? '✓ Excellent Pronunciation!' : 'Keep practicing!'}
                        </span>
                        <span style={{ color: 'var(--color-text-primary)' }}>{result.matchScore}%</span>
                      </div>
                      <div style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        Heard: "{result.spoken}"
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Action Controls: Listen & Practice Speaking */}
                <div style={{ display: 'flex', gap: 'var(--space-2)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--color-border-subtle)' }}>
                  {/* Listen Button */}
                  <button
                    onClick={() => handlePlayAudio(phrase)}
                    className={`speakflow-btn ${isPlaying ? 'btn-variant-primary' : 'btn-variant-secondary'}`}
                    style={{
                      flex: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: 'var(--space-1-5) var(--space-3)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 'var(--text-caption)',
                      fontWeight: 600
                    }}
                    title="Listen to native pronunciation"
                  >
                    <Volume2 size={14} />
                    <span>{isPlaying ? 'Speaking...' : 'Listen'}</span>
                  </button>

                  {/* Practice Speaking Button */}
                  <button
                    onClick={() => handleTogglePractice(phrase)}
                    className={`speakflow-btn ${isRecording ? 'btn-variant-primary' : 'btn-variant-ghost'}`}
                    style={{
                      flex: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: 'var(--space-1-5) var(--space-3)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 'var(--text-caption)',
                      fontWeight: 600,
                      background: isRecording ? 'var(--color-error)' : undefined,
                      color: isRecording ? '#ffffff' : undefined
                    }}
                    title="Practice speaking into microphone"
                  >
                    {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
                    <span>{isRecording ? 'Listening...' : 'Practice'}</span>
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Custom Phrase Modal */}
      {isAddModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--space-4)'
          }}
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '520px',
              width: '100%',
              padding: 'var(--space-6)',
              boxShadow: 'var(--shadow-xl)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Languages size={20} color="var(--color-primary)" />
                <h2 className="typography-h2" style={{ margin: 0 }}>
                  Add Spoken Expression
                </h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ margin: 0, fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}>
              Add any everyday Hindi sentence with its English translation to your personal practice library.
            </p>

            <form onSubmit={handleAddCustomPhrase} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3-5)' }}>
              {/* Hindi Input */}
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-caption)', fontWeight: 600, marginBottom: '4px', color: 'var(--color-text-secondary)' }}>
                  Hindi Sentence (हिंदी वाक्य)
                </label>
                <input
                  type="text"
                  value={newHindi}
                  onChange={(e) => setNewHindi(e.target.value)}
                  placeholder="e.g. मुझसे पंगा मत लो।"
                  required
                  style={{
                    width: '100%',
                    padding: 'var(--space-2-5) var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface-hover)',
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--text-body)',
                    outline: 'none'
                  }}
                />
              </div>

              {/* AI Auto Translate helper */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleAutoTranslate}
                  disabled={!newHindi.trim() || isTranslating}
                  className="speakflow-btn btn-variant-ghost"
                  style={{
                    fontSize: '0.78rem',
                    padding: '3px 8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: 'var(--color-primary)'
                  }}
                >
                  <Sparkles size={12} />
                  <span>{isTranslating ? 'Translating with AI...' : 'AI Auto-Translate'}</span>
                </button>
              </div>

              {/* English Input */}
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-caption)', fontWeight: 600, marginBottom: '4px', color: 'var(--color-text-secondary)' }}>
                  English Spoken Translation (अंग्रेज़ी अनुवाद)
                </label>
                <input
                  type="text"
                  value={newEnglish}
                  onChange={(e) => setNewEnglish(e.target.value)}
                  placeholder="e.g. Don't mess with me."
                  required
                  style={{
                    width: '100%',
                    padding: 'var(--space-2-5) var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface-hover)',
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--text-body)',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Category Selector */}
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-caption)', fontWeight: 600, marginBottom: '4px', color: 'var(--color-text-secondary)' }}>
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e: any) => setNewCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--space-2-5) var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface-hover)',
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--text-body)',
                    outline: 'none'
                  }}
                >
                  <option value="punchy">Short & Punchy (छोटे व तीखे वाक्य)</option>
                  <option value="assertive">Assertive & Boundaries (हक, गुस्सा व सीमाएं)</option>
                  <option value="requests">Requests & Instructions (अनुरोध व निर्देश)</option>
                  <option value="daily">Conversational & Daily (दैनिक बोलचाल)</option>
                </select>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="speakflow-btn btn-variant-ghost"
                  style={{ padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-md)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newHindi.trim() || !newEnglish.trim()}
                  className="speakflow-btn btn-variant-primary"
                  style={{ padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-md)', fontWeight: 600 }}
                >
                  Save Phrase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
