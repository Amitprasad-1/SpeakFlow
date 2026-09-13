import React, { useState, useEffect, useMemo } from 'react';
import {
  DailyPracticeSession,
  DailyPracticeEngine,
  ContentHistoryManager,
  VocalWarmupStageData,
  TongueTwisterStageData,
  ReadingStageData,
  SentencesStageData,
  SpeakingStageData,
  ListeningStageData
} from '@speakflow/core';
import { BrowserStorage } from '../../storage/BrowserStorage';
import { BrowserSpeechProvider } from '../../speech/BrowserSpeechProvider';
import { DailyPracticeHeader } from '../practice/DailyPracticeHeader';
import { VocalWarmupStage } from '../practice/VocalWarmupStage';
import { TongueTwisterStage } from '../practice/TongueTwisterStage';
import { ReadingAloudStage } from '../practice/ReadingAloudStage';
import { PracticalSentencesStage } from '../practice/PracticalSentencesStage';
import { SpeakingPracticeStage } from '../practice/SpeakingPracticeStage';
import { ListeningExerciseStage } from '../practice/ListeningExerciseStage';
import { SessionCompletionSummary } from '../practice/SessionCompletionSummary';
import { Card } from '../../design-system';

export interface PracticeViewProps {
  onReturnToHome?: () => void;
  onSessionComplete?: () => void;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  onReturnToHome,
  onSessionComplete
}) => {
  // Speech Provider instance
  const speechProvider = useMemo(() => new BrowserSpeechProvider(), []);

  // Today's local calendar date in user timezone
  const todayLocalDate = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Session state initialized from storage or created dynamically
  const [session, setSession] = useState<DailyPracticeSession>(() => {
    const saved = BrowserStorage.getDailySession(todayLocalDate);
    if (saved) return saved;

    const userProfile = BrowserStorage.getUserProfile() || BrowserStorage.createInitialProfile();
    const historyData = BrowserStorage.getContentHistory();
    const historyManager = new ContentHistoryManager(historyData);

    const freshSession = DailyPracticeEngine.createDailySession(
      userProfile,
      todayLocalDate,
      historyManager
    );

    BrowserStorage.saveDailySession(freshSession);
    return freshSession;
  });

  const [activeStageNumber, setActiveStageNumber] = useState<number>(() => {
    return session.currentStageIndex + 1;
  });

  const [isCompletedView, setIsCompletedView] = useState<boolean>(() => {
    return session.status === 'completed';
  });

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(session.totalElapsedSeconds || 0);

  // Timer loop for overall practice session
  useEffect(() => {
    let timer: number | null = null;
    if (!isCompletedView) {
      timer = window.setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
          return next;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isCompletedView]);

  // Sync elapsed seconds periodically
  useEffect(() => {
    if (elapsedSeconds % 10 === 0 && elapsedSeconds > 0) {
      const updated = { ...session, totalElapsedSeconds: elapsedSeconds };
      BrowserStorage.saveDailySession(updated);
    }
  }, [elapsedSeconds, session]);

  // Dispose speech provider on unmount
  useEffect(() => {
    return () => {
      speechProvider.dispose();
    };
  }, [speechProvider]);

  // Stage completion handler
  const handleStageComplete = (stageNum: number, result?: any) => {
    const updated = DailyPracticeEngine.completeStage(session, stageNum, result);
    updated.totalElapsedSeconds = elapsedSeconds;

    setSession(updated);
    BrowserStorage.saveDailySession(updated);

    if (stageNum < 6) {
      setActiveStageNumber(stageNum + 1);
    } else {
      // Complete full daily practice session!
      setIsCompletedView(true);

      // Record in ContentHistory to avoid immediate multi-day repetition
      const historyData = BrowserStorage.getContentHistory();
      const historyManager = new ContentHistoryManager(historyData);
      const stage3 = updated.stages[2];
      const stage2 = updated.stages[1];
      const stage4 = updated.stages[3];

      historyManager.recordSession(todayLocalDate, {
        readingPassageId: (stage3?.data as ReadingStageData)?.passage?.id,
        tongueTwisterIds: (stage2?.data as TongueTwisterStageData)?.twisters?.map((t) => t.id),
        sentenceIds: (stage4?.data as SentencesStageData)?.sentences?.map((s) => s.id),
        themeTopic: updated.lessonTheme
      });
      BrowserStorage.saveContentHistory(historyManager.getData());

      // Update user streak and practice minutes
      const userProfile = BrowserStorage.getUserProfile();
      if (userProfile) {
        const updatedProfile = DailyPracticeEngine.applySessionCompletion(updated, userProfile, 15);
        BrowserStorage.saveUserProfile(updatedProfile);
      }

      onSessionComplete?.();
    }
  };

  const completedStagesSet = useMemo(() => {
    const set = new Set<number>();
    session.stages.forEach((st) => {
      if (st.isCompleted || st.isSkipped) set.add(st.stageNumber);
    });
    return set;
  }, [session]);

  const activeStage = session.stages[activeStageNumber - 1] || session.stages[0];
  const userProfile = BrowserStorage.getUserProfile();
  const currentStreak = userProfile?.streak?.currentStreak || 1;

  if (isCompletedView) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <SessionCompletionSummary
          session={session}
          onDoneForToday={() => {
            if (onReturnToHome) onReturnToHome();
          }}
          onReviewPractice={() => {
            setIsCompletedView(false);
            setActiveStageNumber(1);
          }}
          streakCount={currentStreak}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header with Navigation Stepper and Time */}
      <DailyPracticeHeader
        currentStage={activeStageNumber}
        totalStages={session.stages.length}
        stageTitle={activeStage.title}
        focusSound={session.focusSounds[0]?.replace('_', ' / ')}
        elapsedSeconds={elapsedSeconds}
        onExit={() => {
          BrowserStorage.saveDailySession({ ...session, totalElapsedSeconds: elapsedSeconds });
          if (onReturnToHome) onReturnToHome();
        }}
        onSelectStage={(num) => setActiveStageNumber(num)}
        completedStages={completedStagesSet}
      />

      {/* Render Active Stage Component */}
      {activeStageNumber === 1 && (
        <VocalWarmupStage
          exercises={(activeStage.data as VocalWarmupStageData).exercises}
          onCompleteStage={() => handleStageComplete(1)}
          speechProvider={speechProvider}
        />
      )}

      {activeStageNumber === 2 && (
        <TongueTwisterStage
          twisters={(activeStage.data as TongueTwisterStageData).twisters}
          onCompleteStage={() => handleStageComplete(2)}
          speechProvider={speechProvider}
        />
      )}

      {activeStageNumber === 3 && (
        <ReadingAloudStage
          passage={(activeStage.data as ReadingStageData).passage}
          onCompleteStage={() => handleStageComplete(3)}
          speechProvider={speechProvider}
        />
      )}

      {activeStageNumber === 4 && (
        <PracticalSentencesStage
          sentences={(activeStage.data as SentencesStageData).sentences}
          onCompleteStage={() => handleStageComplete(4)}
          speechProvider={speechProvider}
        />
      )}

      {activeStageNumber === 5 && (
        <SpeakingPracticeStage
          prompts={(activeStage.data as SpeakingStageData).prompts}
          onCompleteStage={() => handleStageComplete(5)}
          speechProvider={speechProvider}
        />
      )}

      {activeStageNumber === 6 && (
        <ListeningExerciseStage
          exercise={(activeStage.data as ListeningStageData).exercise}
          onCompleteStage={() => handleStageComplete(6)}
          speechProvider={speechProvider}
        />
      )}
    </div>
  );
};
