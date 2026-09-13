import React, { useState } from 'react';
import {
  Button,
  Card,
  Badge,
  RecordingButton,
  VoiceState
} from '../../../design-system';
import {
  BASELINE_PRONUNCIATION_PAIRS,
  BaselinePronunciationPair,
  AssessmentEngine,
  PronunciationItemResult,
  PronunciationAssessmentResult
} from '@speakflow/core';
import { BrowserSpeechProvider } from '../../../speech/BrowserSpeechProvider';
import {
  ArrowRight,
  Volume2,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Mic
} from 'lucide-react';

export interface PronunciationAssessmentStepProps {
  speechProvider: BrowserSpeechProvider;
  onAssessmentCompleted: (result: PronunciationAssessmentResult) => void;
  onSkip: () => void;
}

export const PronunciationAssessmentStep: React.FC<PronunciationAssessmentStepProps> = ({
  speechProvider,
  onAssessmentCompleted,
  onSkip
}) => {
  // Test 3 essential contrasting pairs: R/L, TH, S/SH
  const pairsToTest = BASELINE_PRONUNCIATION_PAIRS.slice(0, 3);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [voiceState, setVoiceState] = useState<VoiceState>('ready');
  const [recordedItems, setRecordedItems] = useState<PronunciationItemResult[]>([]);
  const [transcript, setTranscript] = useState<string>('');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const currentPair = pairsToTest[currentIndex] || pairsToTest[0];
  const isLastPair = currentIndex === pairsToTest.length - 1;

  const handlePlayAudio = async () => {
    setIsPlayingAudio(true);
    await speechProvider.synthesizeSpeech(`${currentPair.wordA}. ${currentPair.wordB}.`, {
      rate: 0.85
    });
    setIsPlayingAudio(false);
  };

  const handleStartRecording = async () => {
    setVoiceState('listening');
    setTranscript('');

    try {
      await speechProvider.startRecording();
      speechProvider.startRealtimeRecognition({
        onTranscriptUpdate: (text) => {
          setTranscript(text);
        }
      });
    } catch (e) {
      console.warn('Pronunciation mic notice:', e);
    }
  };

  const handleStopRecording = async () => {
    setVoiceState('processing');
    speechProvider.stopRealtimeRecognition();
    await speechProvider.stopRecording();

    setTimeout(() => {
      const itemResult = AssessmentEngine.evaluatePronunciationAttempt(
        currentPair.soundGroup,
        [currentPair.wordA, currentPair.wordB],
        transcript || `${currentPair.wordA} ${currentPair.wordB}`
      );

      setRecordedItems((prev) => [...prev.filter(i => i.soundGroup !== currentPair.soundGroup), itemResult]);
      setVoiceState('result');
    }, 600);
  };

  const handleToggle = () => {
    if (voiceState === 'ready') {
      handleStartRecording();
    } else if (voiceState === 'listening') {
      handleStopRecording();
    } else {
      setVoiceState('ready');
      setTranscript('');
    }
  };

  const handleNextPair = () => {
    if (!isLastPair) {
      setCurrentIndex((prev) => prev + 1);
      setVoiceState('ready');
      setTranscript('');
    } else {
      // Build final PronunciationAssessmentResult
      const testedGroups = Array.from(new Set(pairsToTest.map(p => p.soundGroup)));
      const weakGroups = recordedItems
        .filter(i => i.matchStatus.value === 'developing' || i.matchStatus.value === 'unclear')
        .map(i => i.soundGroup);

      const result: PronunciationAssessmentResult = {
        items: recordedItems,
        testedSoundGroups: testedGroups,
        priorityFocusSounds: weakGroups.length > 0 ? weakGroups : ['R_L']
      };
      onAssessmentCompleted(result);
    }
  };

  return (
    <div style={{ maxWidth: '620px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
          <Badge variant="primary" size="sm">Pronunciation Check</Badge>
          <Badge variant="level" size="sm">Pair {currentIndex + 1} of {pairsToTest.length}</Badge>
        </div>
        <h2 className="typography-h2">Listen and Repeat</h2>
        <p className="typography-body" style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
          Listen to the native pronunciation of each word pair, then tap record and repeat them clearly into your microphone.
        </p>
      </div>

      {/* Target Word Pair Card */}
      <Card variant="elevated" padding="lg" style={{ textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <Badge variant="focus" style={{ marginBottom: 'var(--space-4)' }}>
            Focus: {currentPair.groupLabel}
          </Badge>

          {/* Large Word Pair Display */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 'var(--space-6)',
              marginBottom: 'var(--space-4)'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
                {currentPair.wordA}
              </div>
            </div>

            <span style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>vs</span>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--color-primary)' }}>
                {currentPair.wordB}
              </div>
            </div>
          </div>

          <p className="typography-body-sm" style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>
            {currentPair.focusTip}
          </p>

          {/* Coach Listen Button */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
            <Button
              variant="secondary"
              size="md"
              onClick={handlePlayAudio}
              icon={<Volume2 size={16} />}
              disabled={isPlayingAudio}
            >
              {isPlayingAudio ? 'Playing...' : 'Listen to example'}
            </Button>
          </div>

          {/* Recording Button */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-3)' }}>
            <RecordingButton
              state={voiceState}
              onToggle={handleToggle}
              durationSeconds={voiceState === 'listening' ? 3 : 0}
            />
          </div>

          <div style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)', minHeight: '22px' }}>
            {voiceState === 'ready' && `Tap mic and say "${currentPair.wordA}... ${currentPair.wordB}"`}
            {voiceState === 'listening' && 'Listening to your repetition...'}
            {voiceState === 'processing' && 'Checking sound distinction...'}
            {voiceState === 'result' && (
              <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                Attempt recorded!
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-2)' }}>
        <Button variant="ghost" size="md" onClick={onSkip}>
          Skip pronunciation check
        </Button>

        <Button
          variant="primary"
          size="lg"
          onClick={handleNextPair}
          icon={<ArrowRight size={18} />}
          id="btn-step-pron-continue"
        >
          {isLastPair ? 'See My Results' : 'Next Word Pair'}
        </Button>
      </div>
    </div>
  );
};
