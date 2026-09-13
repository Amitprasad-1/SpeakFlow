import React, { useState, useMemo } from 'react';
import {
  PenTool,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Copy,
  Check,
  ArrowRight,
  Shuffle,
  BookOpen,
  Award,
  ChevronRight,
  Clock,
  Layers,
  FileText
} from 'lucide-react';
import { GeminiAIService, WritingAnalysisReport } from '../../services/GeminiAIService';

interface WritingTopic {
  id: string;
  category: string;
  title: string;
  starterPrompt: string;
  outlinePoints: string[];
}

const CURATED_ESSAY_TOPICS: WritingTopic[] = [
  {
    id: 'w_tech',
    category: 'Technology & Society',
    title: 'Should Smartphone Usage Be Restricted in Schools?',
    starterPrompt: 'In modern education, the presence of smartphones in classrooms sparks continuous debate...',
    outlinePoints: [
      'Introduction: The ubiquity of smartphones among students.',
      'Body: Distractions and academic impact vs emergency access & educational apps.',
      'Conclusion: Balanced policy (e.g., restricted in class, permitted during breaks).'
    ]
  },
  {
    id: 'w_work',
    category: 'Work & Lifestyle',
    title: 'The Pros and Cons of a Four-Day Work Week',
    starterPrompt: 'As companies explore workplace productivity, the four-day work week has emerged as an appealing model...',
    outlinePoints: [
      'Introduction: The shift towards employee well-being and flexibility.',
      'Body: Better work-life balance and mental health vs scheduling hurdles in customer-facing roles.',
      'Conclusion: Why flexibility with output-focused metrics creates the best outcome.'
    ]
  },
  {
    id: 'w_health',
    category: 'Daily Life & Wellness',
    title: 'How Daily Physical Activity Influences Mental Focus and Mood',
    starterPrompt: 'While physical exercise is universally praised for cardiovascular health, its impact on cognitive performance is profound...',
    outlinePoints: [
      'Introduction: Link between regular movement and mental clarity.',
      'Body: Stress reduction and brain function during demanding days.',
      'Conclusion: Small daily commitments lead to compounding wellness.'
    ]
  },
  {
    id: 'w_learning',
    category: 'Personal Development',
    title: 'Practical Experience vs Academic Degrees: Which Matters More?',
    starterPrompt: 'In today\'s dynamic job market, employers increasingly debate the relative worth of university degrees versus hands-on experience...',
    outlinePoints: [
      'Introduction: The evolving criteria for career success.',
      'Body: Theoretical foundations from academia vs problem-solving in real projects.',
      'Conclusion: The most effective professionals combine both.'
    ]
  },
  {
    id: 'w_environment',
    category: 'Environment',
    title: 'Small Individual Habits That Create Large Environmental Impact',
    starterPrompt: 'Combating climate change often feels overwhelming, yet everyday individual actions collectively drive immense change...',
    outlinePoints: [
      'Introduction: Power of micro-habits in sustainability.',
      'Body: Reducing single-use plastics, conserving electricity, and conscious consumption.',
      'Conclusion: Individual accountability inspires systemic reform.'
    ]
  }
];

export const EssayWritingTab: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<WritingTopic>(CURATED_ESSAY_TOPICS[0]);
  const [customTopicInput, setCustomTopicInput] = useState<string>('');
  const [essayText, setEssayText] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [report, setReport] = useState<WritingAnalysisReport | null>(null);
  const [copiedRewrite, setCopiedRewrite] = useState<boolean>(false);

  // Target word count: 150 to 200 words
  const minTarget = 150;
  const maxTarget = 200;

  // Real-time word count calculation
  const words = useMemo(() => {
    return essayText.trim() ? essayText.trim().split(/\s+/).filter(Boolean) : [];
  }, [essayText]);

  const wordCount = words.length;

  // Word count status
  const wordStatus: 'under' | 'ideal' | 'over' = useMemo(() => {
    if (wordCount < minTarget) return 'under';
    if (wordCount > maxTarget) return 'over';
    return 'ideal';
  }, [wordCount, minTarget, maxTarget]);

  // Handle Random Topic
  const handleRandomTopic = () => {
    const others = CURATED_ESSAY_TOPICS.filter(t => t.id !== selectedTopic.id);
    const random = others[Math.floor(Math.random() * others.length)] || CURATED_ESSAY_TOPICS[0];
    setSelectedTopic(random);
    setCustomTopicInput('');
    setEssayText('');
    setReport(null);
  };

  // Submit for AI Analysis
  const handleAnalyzeEssay = async () => {
    if (wordCount < 15) {
      alert('Please write at least a few sentences before analyzing.');
      return;
    }

    setIsAnalyzing(true);
    const effectiveTopic = customTopicInput.trim() || selectedTopic.title;

    try {
      const result = await GeminiAIService.analyzeWritingSubmission({
        topic: effectiveTopic,
        essayText: essayText.trim(),
        targetMinWords: minTarget,
        targetMaxWords: maxTarget
      });
      setReport(result);
    } catch (err) {
      console.error('Error analyzing essay:', err);
      alert('Failed to complete writing analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Insert starter sentence
  const handleInsertStarter = () => {
    if (!essayText) {
      setEssayText(selectedTopic.starterPrompt + ' ');
    } else {
      setEssayText(prev => prev + '\n\n' + selectedTopic.starterPrompt + ' ');
    }
  };

  // Copy polished rewrite
  const handleCopyRewrite = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRewrite(true);
    setTimeout(() => setCopiedRewrite(false), 2000);
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: 'var(--space-12)' }}>
      {/* Top Banner Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(37, 99, 235, 0.08) 100%)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#10b981' }}>
              Writing Lab
            </span>
            <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#059669', fontSize: '0.6875rem', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-pill)' }}>
              Target: 150 – 200 Words
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>
            Essay & Paragraph Writing Diagnostic
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: '6px 0 0 0' }}>
            Practice drafting 150-200 word essays on any topic. Get instant AI diagnostics on what's right vs wrong, with exact sentence-by-sentence grammar replacements and vocabulary upgrades.
          </p>
        </div>

        {report && (
          <button
            onClick={() => setReport(null)}
            className="tap-interactive"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <PenTool size={14} />
            <span>Edit My Essay</span>
          </button>
        )}
      </div>

      {/* =========================================================================
          VIEW 1: WRITING CANVAS (When not viewing report)
          ========================================================================= */}
      {!report && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Topic Selector Card */}
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🎯 Essay Topic</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  ({selectedTopic.category})
                </span>
              </h2>

              <button
                onClick={handleRandomTopic}
                className="tap-interactive"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--color-primary-subtle)',
                  border: '1px solid var(--color-primary-subtle)',
                  color: 'var(--color-primary)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Shuffle size={13} />
                <span>Random Topic</span>
              </button>
            </div>

            {/* Featured Topic Banner */}
            <div
              style={{
                background: 'var(--color-surface-sunken)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '18px 20px',
                marginBottom: '16px'
              }}
            >
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1.35 }}>
                "{selectedTopic.title}"
              </div>

              {/* Outline Points */}
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  Suggested Outline:
                </span>
                {selectedTopic.outlinePoints.map((point, idx) => (
                  <div key={idx} style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>•</span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Topic quick selector chips */}
            <div style={{ marginBottom: '14px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px' }}>
                Or choose from other prompts:
              </span>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {CURATED_ESSAY_TOPICS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedTopic(item);
                      setCustomTopicInput('');
                    }}
                    className="tap-interactive"
                    style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-pill)',
                      border: selectedTopic.id === item.id ? '1px solid #10b981' : '1px solid var(--color-border)',
                      background: selectedTopic.id === item.id ? 'rgba(16, 185, 129, 0.1)' : 'var(--color-surface)',
                      color: selectedTopic.id === item.id ? '#059669' : 'var(--color-text-primary)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {item.title.length > 34 ? `${item.title.slice(0, 32)}...` : item.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Topic Input */}
            <input
              type="text"
              placeholder="Or write your own custom essay topic..."
              value={customTopicInput}
              onChange={(e) => setCustomTopicInput(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface-sunken)',
                color: 'var(--color-text-primary)',
                fontSize: '0.875rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Active Writing Canvas Card */}
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}
          >
            {/* Toolbar: Word Gauge & Starter Helper */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              {/* Dynamic Word Target Gauge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-pill)',
                    fontWeight: 800,
                    fontSize: '0.8125rem',
                    background: wordStatus === 'ideal'
                      ? 'rgba(16, 185, 129, 0.15)'
                      : wordStatus === 'under'
                      ? 'rgba(245, 158, 11, 0.15)'
                      : 'rgba(139, 92, 246, 0.15)',
                    color: wordStatus === 'ideal'
                      ? '#059669'
                      : wordStatus === 'under'
                      ? '#d97706'
                      : '#7c3aed',
                    border: `1px solid ${
                      wordStatus === 'ideal' ? '#10b981' : wordStatus === 'under' ? '#f59e0b' : '#8b5cf6'
                    }`
                  }}
                >
                  <PenTool size={14} />
                  <span>{wordCount} / 150–200 Words</span>
                  {wordStatus === 'ideal' && <span>(Perfect length! ✨)</span>}
                  {wordStatus === 'under' && <span>({minTarget - wordCount} words to minimum)</span>}
                  {wordStatus === 'over' && <span>(Slightly above target)</span>}
                </div>
              </div>

              {/* Helper Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={handleInsertStarter}
                  className="tap-interactive"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'var(--color-surface-sunken)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Sparkles size={13} color="var(--color-primary)" />
                  <span>Insert Starter Sentence</span>
                </button>

                {essayText && (
                  <button
                    onClick={() => setEssayText('')}
                    className="tap-interactive"
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-pill)',
                      background: 'transparent',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-muted)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Textarea Editor */}
            <textarea
              value={essayText}
              onChange={(e) => setEssayText(e.target.value)}
              placeholder="Start drafting your 150 to 200-word essay here... Focus on clear sentence flow and expressing your ideas clearly."
              style={{
                width: '100%',
                minHeight: '260px',
                padding: '18px 20px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface-sunken)',
                color: 'var(--color-text-primary)',
                fontSize: '1rem',
                lineHeight: 1.7,
                resize: 'vertical',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />

            {/* Target Progress Bar */}
            <div style={{ width: '100%', height: '6px', background: 'var(--color-surface-sunken)', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, (wordCount / 200) * 100)}%`,
                  background: wordStatus === 'ideal'
                    ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                    : wordStatus === 'under'
                    ? 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)'
                    : 'linear-gradient(90deg, #8b5cf6 0%, #6d28d9 100%)',
                  transition: 'width 0.25s ease'
                }}
              />
            </div>

            {/* Bottom Action CTA */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '6px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                <span>{essayText.length} characters</span> • <span>~{Math.max(1, Math.round(wordCount / 150))} min read</span>
              </div>

              <button
                onClick={handleAnalyzeEssay}
                disabled={isAnalyzing || wordCount < 15}
                className="cta-breathing tap-interactive"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 28px',
                  borderRadius: 'var(--radius-pill)',
                  background: isAnalyzing
                    ? 'var(--color-surface-sunken)'
                    : 'linear-gradient(135deg, #10b981 0%, #2563eb 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.9375rem',
                  cursor: isAnalyzing || wordCount < 15 ? 'not-allowed' : 'pointer',
                  opacity: wordCount < 15 ? 0.6 : 1,
                  boxShadow: '0 6px 20px rgba(16, 185, 129, 0.3)'
                }}
              >
                <Sparkles size={16} />
                <span>{isAnalyzing ? 'Analyzing Writing with AI...' : 'Analyze Writing with AI ✨'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: DETAILED ESSAY DIAGNOSTIC REPORT
          ========================================================================= */}
      {report && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* 1. Score & Feedback Summary Card */}
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-2xl)',
              padding: '24px',
              boxShadow: '0 6px 24px rgba(0,0,0,0.04)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#10b981' }}>
                  Writing Diagnostic Evaluation
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: '4px 0' }}>
                  "{customTopicInput.trim() || selectedTopic.title}"
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                  {report.summary}
                </p>
              </div>

              {/* Overall Score Badge */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(37, 99, 235, 0.12) 100%)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '12px 24px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#059669', lineHeight: 1 }}>
                  {report.overallScore}
                </div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>
                  CEFR: {report.cefrLevel}
                </div>
              </div>
            </div>

            {/* Metrics Chips */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '12px',
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid var(--color-border-subtle)'
              }}
            >
              <div style={{ background: 'var(--color-surface-sunken)', padding: '10px 14px', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Word Count</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: report.wordCountStatus === 'perfect' ? '#10b981' : 'var(--color-text-primary)' }}>
                  {report.wordCount} Words
                </div>
              </div>

              <div style={{ background: 'var(--color-surface-sunken)', padding: '10px 14px', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Target Range</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  150–200 Words
                </div>
              </div>

              <div style={{ background: 'var(--color-surface-sunken)', padding: '10px 14px', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Corrections Found</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: report.sentenceCorrections.length > 0 ? '#ef4444' : '#10b981' }}>
                  {report.sentenceCorrections.length} Sentences
                </div>
              </div>

              <div style={{ background: 'var(--color-surface-sunken)', padding: '10px 14px', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Engine</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  {report.source === 'gemini' ? 'Gemini 1.5 Flash' : 'Offline Grammar Lab'}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Sentence-by-Sentence Grammar & Phrasing Replacements */}
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-2xl)',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Sparkles size={20} color="#10b981" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                Sentence-by-Sentence Recommendations (What to Replace)
              </h3>
            </div>

            {report.sentenceCorrections.length === 0 ? (
              <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                Your essay structure and grammar were remarkably clean!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {report.sentenceCorrections.map((corr, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--color-surface-sunken)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-xl)',
                      padding: '18px 20px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 800, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '3px 8px', borderRadius: 'var(--radius-pill)' }}>
                        Rule: {corr.grammarRule}
                      </span>
                    </div>

                    {/* What you wrote */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                      <span style={{ color: '#ef4444', fontWeight: 800, fontSize: '0.875rem', width: '20px' }}>❌</span>
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>What you wrote: </span>
                        <span style={{ fontSize: '0.875rem', color: '#dc2626', fontWeight: 600 }}>"{corr.originalSentence}"</span>
                      </div>
                    </div>

                    {/* Recommended replacement */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                      <span style={{ color: '#10b981', fontWeight: 800, fontSize: '0.875rem', width: '20px' }}>✅</span>
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Recommended replacement: </span>
                        <span style={{ fontSize: '0.9375rem', color: '#059669', fontWeight: 800 }}>"{corr.correctedSentence}"</span>
                      </div>
                    </div>

                    {/* Why */}
                    <div style={{ background: 'var(--color-surface)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', display: 'flex', gap: '6px' }}>
                      <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>💡 Explanation:</span>
                      <span>{corr.why}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Vocabulary Recommendations */}
          {report.vocabularyRecommendations.length > 0 && (
            <div
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-2xl)',
                padding: '24px'
              }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} color="#f59e0b" />
                <span>Vocabulary Upgrades</span>
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                {report.vocabularyRecommendations.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--color-surface-sunken)',
                      border: '1px solid var(--color-border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '14px 16px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <span style={{ textDecoration: 'line-through', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                        {item.originalWord}
                      </span>
                      <ArrowRight size={13} color="#10b981" />
                      <span style={{ color: '#059669', fontWeight: 800, fontSize: '0.9375rem' }}>
                        {item.recommendedWord}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                      {item.context}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Complete Polished Native Model Rewrite */}
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-2xl)',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={18} color="var(--color-primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                  Polished Model Rewrite (150–200 Words)
                </h3>
              </div>

              <button
                onClick={() => handleCopyRewrite(report.polishedRewrite)}
                className="tap-interactive"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--color-surface-sunken)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {copiedRewrite ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                <span>{copiedRewrite ? 'Copied to Clipboard!' : 'Copy Rewrite'}</span>
              </button>
            </div>

            <div
              style={{
                background: 'var(--color-surface-sunken)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                fontSize: '0.9375rem',
                lineHeight: 1.75,
                color: 'var(--color-text-primary)'
              }}
            >
              {report.polishedRewrite}
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setReport(null)}
              className="tap-interactive"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              <PenTool size={16} />
              <span>Edit & Improve My Draft</span>
            </button>

            <button
              onClick={() => {
                setReport(null);
                setEssayText('');
                handleRandomTopic();
              }}
              className="tap-interactive"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 28px',
                borderRadius: 'var(--radius-pill)',
                background: 'linear-gradient(135deg, #10b981 0%, #2563eb 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              <span>Write Next Essay</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
