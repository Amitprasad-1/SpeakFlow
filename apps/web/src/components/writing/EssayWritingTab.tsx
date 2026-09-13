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
  FileText,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { GeminiAIService, WritingAnalysisReport } from '../../services/GeminiAIService';
import { EXTENSIVE_WRITING_TOPICS, WRITING_CATEGORIES, WritingTopicItem } from '../../data/topicCatalog';

export const EssayWritingTab: React.FC = () => {
  // Topic Catalog & AI Generation
  const [allWritingTopics, setAllWritingTopics] = useState<WritingTopicItem[]>(EXTENSIVE_WRITING_TOPICS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isGeneratingAiTopics, setIsGeneratingAiTopics] = useState<boolean>(false);
  const [isTopicListExpanded, setIsTopicListExpanded] = useState<boolean>(false);

  const [selectedTopic, setSelectedTopic] = useState<WritingTopicItem>(EXTENSIVE_WRITING_TOPICS[0]);
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

  // Filtered writing topics based on category and search query
  const filteredTopics = useMemo(() => {
    return allWritingTopics.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.outlinePoints.some(p => p.toLowerCase().includes(q))
      );
    });
  }, [allWritingTopics, selectedCategory, searchQuery]);

  // Handle Random Topic from filtered or all
  const handleRandomTopic = () => {
    const pool = filteredTopics.length > 0 ? filteredTopics : allWritingTopics;
    const others = pool.filter(t => t.id !== selectedTopic.id);
    const random = others[Math.floor(Math.random() * others.length)] || pool[0];
    setSelectedTopic(random);
    setCustomTopicInput('');
    setEssayText('');
    setReport(null);
  };

  // Generate Fresh AI Essay Prompts
  const handleGenerateAiTopics = async () => {
    if (isGeneratingAiTopics) return;
    setIsGeneratingAiTopics(true);
    try {
      const generated = await GeminiAIService.generateDynamicWritingTopics(selectedCategory);
      if (generated && generated.length > 0) {
        setAllWritingTopics(prev => [...generated, ...prev]);
        setSelectedTopic(generated[0]);
        setCustomTopicInput('');
        setEssayText('');
        setReport(null);
      }
    } catch (err) {
      console.error('Failed to generate writing topics:', err);
    } finally {
      setIsGeneratingAiTopics(false);
    }
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🎯 Essay Topic</span>
                </h2>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: 'var(--radius-pill)', background: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}>
                  {selectedTopic.category}
                </span>
                {selectedTopic.isAiGenerated && (
                  <span style={{ fontSize: '0.6875rem', fontWeight: 800, padding: '2px 8px', borderRadius: 'var(--radius-pill)', background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(168, 85, 247, 0.15))', color: '#a855f7', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={11} />
                    <span>AI Generated</span>
                  </span>
                )}
              </div>

              {/* Action Controls: AI Topic Generator & Randomizer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={handleGenerateAiTopics}
                  disabled={isGeneratingAiTopics}
                  className="tap-interactive"
                  title="Generate 4 fresh essay prompts via AI"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#059669',
                    fontSize: '0.78125rem',
                    fontWeight: 700,
                    cursor: isGeneratingAiTopics ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: isGeneratingAiTopics ? 0.7 : 1
                  }}
                >
                  {isGeneratingAiTopics ? (
                    <>
                      <RefreshCw size={13} className="spin-animation" />
                      <span>Generating AI Prompts...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} />
                      <span>✨ Generate AI Prompts</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleRandomTopic}
                  className="tap-interactive"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.78125rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Shuffle size={13} />
                  <span>Random Topic</span>
                </button>
              </div>
            </div>

            {/* Featured Topic Banner */}
            <div
              style={{
                background: 'linear-gradient(180deg, var(--color-surface-sunken) 0%, rgba(16, 185, 129, 0.03) 100%)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px 22px',
                marginBottom: '18px'
              }}
            >
              <div style={{ fontSize: '1.28rem', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1.4 }}>
                "{selectedTopic.title}"
              </div>

              {/* Outline Points */}
              <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Suggested Outline:
                </span>
                {selectedTopic.outlinePoints.map((point, idx) => (
                  <div key={idx} style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: 1.4 }}>
                    <span style={{ color: '#10b981', fontWeight: 800 }}>•</span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* =========================================================
                EXTENSIVE WRITING LIBRARY BROWSER
                ========================================================= */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Layers size={15} style={{ color: '#10b981' }} />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Browse Essay Library ({allWritingTopics.length}+ Topics)
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  Showing {filteredTopics.length} matches
                </span>
              </div>

              {/* Category Pills Selector */}
              <div
                style={{
                  display: 'flex',
                  gap: '6px',
                  overflowX: 'auto',
                  paddingBottom: '8px',
                  marginBottom: '10px',
                  scrollbarWidth: 'thin'
                }}
              >
                {WRITING_CATEGORIES.map(cat => {
                  const count = cat === 'All'
                    ? allWritingTopics.length
                    : allWritingTopics.filter(t => t.category === cat).length;
                  const isActive = selectedCategory === cat;

                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className="tap-interactive"
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-pill)',
                        border: isActive ? '1px solid #10b981' : '1px solid var(--color-border)',
                        background: isActive ? '#10b981' : 'var(--color-surface)',
                        color: isActive ? '#ffffff' : 'var(--color-text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>{cat}</span>
                      <span style={{
                        fontSize: '0.6875rem',
                        opacity: isActive ? 0.9 : 0.6,
                        background: isActive ? 'rgba(255,255,255,0.2)' : 'var(--color-border-subtle)',
                        padding: '1px 6px',
                        borderRadius: '10px'
                      }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Keyword Search Input */}
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  placeholder={`Search ${allWritingTopics.length}+ essay prompts by keyword (e.g. remote work, AI, environment, degree)...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface-sunken)',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.8125rem',
                    boxSizing: 'border-box'
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-muted)',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Topic Grid List */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '8px',
                  marginBottom: '10px'
                }}
              >
                {(isTopicListExpanded ? filteredTopics : filteredTopics.slice(0, 6)).map(item => {
                  const isSelected = selectedTopic.id === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedTopic(item);
                        setCustomTopicInput('');
                        setEssayText('');
                        setReport(null);
                      }}
                      className="tap-interactive"
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-lg)',
                        border: isSelected ? '1.5px solid #10b981' : '1px solid var(--color-border)',
                        background: isSelected ? 'rgba(16, 185, 129, 0.08)' : 'var(--color-surface)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '6px'
                      }}
                    >
                      <div style={{
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        color: isSelected ? '#059669' : 'var(--color-text-primary)',
                        lineHeight: 1.35
                      }}>
                        {item.title}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginTop: '2px' }}>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                          {item.category}
                        </span>
                        {item.isAiGenerated && (
                          <span style={{ fontSize: '0.625rem', fontWeight: 800, color: '#9333ea', background: 'rgba(168, 85, 247, 0.1)', padding: '1px 6px', borderRadius: '4px' }}>
                            AI Generated
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Expand / Collapse Button if more than 6 topics */}
              {filteredTopics.length > 6 && (
                <button
                  onClick={() => setIsTopicListExpanded(prev => !prev)}
                  className="tap-interactive"
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px dashed var(--color-border)',
                    background: 'var(--color-surface-sunken)',
                    color: '#059669',
                    fontSize: '0.78125rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {isTopicListExpanded ? (
                    <>
                      <ChevronUp size={14} />
                      <span>Show Fewer Prompts</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown size={14} />
                      <span>Show All {filteredTopics.length} Prompts in this Category</span>
                    </>
                  )}
                </button>
              )}
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
                className="cta-breathing tap-interactive btn-shimmer"
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
