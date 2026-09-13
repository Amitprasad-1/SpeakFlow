import React, { useState, useEffect, useMemo } from 'react';
import {
  BaselineAssessment,
  SelfReportedLevel,
  CommunicationContext,
  PracticeDurationChoice,
  SpeakingConfidenceLevel,
  AssessmentEngine,
  PersonalizationEngine,
  UserProfile,
  DailyLesson
} from '@speakflow/core';
import { BrowserStorage } from '../../storage/BrowserStorage';
import { BrowserSpeechProvider } from '../../speech/BrowserSpeechProvider';
import { OnboardingProgress } from './OnboardingProgress';
import { WelcomeStep } from './steps/WelcomeStep';
import { AboutYouStep } from './steps/AboutYouStep';
import { GoalsStep } from './steps/GoalsStep';
import { ContextStep } from './steps/ContextStep';
import { PreferencesStep } from './steps/PreferencesStep';
import { VocalWarmupStep } from './steps/VocalWarmupStep';
import { SpeakingAssessmentStep } from './steps/SpeakingAssessmentStep';
import { ReadingAssessmentStep } from './steps/ReadingAssessmentStep';
import { PronunciationAssessmentStep } from './steps/PronunciationAssessmentStep';
import { ResultsStep } from './steps/ResultsStep';

export interface OnboardingContainerProps {
  onComplete: (profile: UserProfile, lesson: DailyLesson) => void;
  onExit: () => void;
  initialStep?: number;
}

const TOTAL_STEPS = 10;

export const OnboardingContainer: React.FC<OnboardingContainerProps> = ({
  onComplete,
  onExit,
  initialStep
}) => {
  const speechProvider = useMemo(() => new BrowserSpeechProvider(), []);

  // Initialize or resume assessment
  const [assessment, setAssessment] = useState<BaselineAssessment>(() => {
    const saved = BrowserStorage.getBaselineAssessment();
    if (saved && saved.status === 'in_progress') {
      return saved;
    }
    return {
      assessmentId: `asmt_${Date.now()}`,
      userId: `usr_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'in_progress',
      currentStep: initialStep || 1,
      name: '',
      preferredLanguage: 'English',
      selfReportedLevel: 'Intermediate',
      goals: ['Speak Confidently', 'Workplace & Meetings'],
      contexts: ['workplace', 'meetings'],
      dailyPracticePreference: 15,
      speakingConfidence: 'okay',
      observations: [],
      estimatedStrengths: [],
      estimatedWeaknesses: [],
      recommendedFocusAreas: []
    };
  });

  const [step, setStep] = useState<number>(() => {
    if (initialStep) return initialStep;
    const saved = BrowserStorage.getBaselineAssessment();
    if (saved && saved.status === 'in_progress' && saved.currentStep) {
      return saved.currentStep;
    }
    return 1;
  });

  // Autosave progress
  useEffect(() => {
    const updated: BaselineAssessment = {
      ...assessment,
      currentStep: step,
      updatedAt: new Date().toISOString()
    };
    BrowserStorage.saveBaselineAssessment(updated);
  }, [assessment, step]);

  // Clean up speech provider on unmount
  useEffect(() => {
    return () => {
      speechProvider.dispose();
    };
  }, [speechProvider]);

  const updateAssessment = (updates: Partial<BaselineAssessment>) => {
    setAssessment((prev) => ({ ...prev, ...updates }));
  };

  const goToNextStep = () => {
    setStep((prev) => Math.min(TOTAL_STEPS, prev + 1));
  };

  const goToPrevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSkipAll = () => {
    const defaultProfile = BrowserStorage.createInitialProfile(
      assessment.name.trim() || 'Learner',
      ['Speaking', 'Pronunciation', 'Workplace English'],
      'Intermediate',
      15
    );
    defaultProfile.isOnboarded = true;
    defaultProfile.baselineAssessmentCompleted = false;

    const skippedAssessment: BaselineAssessment = {
      ...assessment,
      status: 'skipped',
      name: assessment.name.trim() || 'Learner'
    };
    BrowserStorage.saveBaselineAssessment(skippedAssessment);
    BrowserStorage.saveUserProfile(defaultProfile);

    const initialLesson = PersonalizationEngine.generateLesson(defaultProfile.skills, defaultProfile.level);
    BrowserStorage.saveActiveLesson(initialLesson);

    onComplete(defaultProfile, initialLesson);
  };

  const handleFinishOnboarding = (targetView: 'practice' | 'profile') => {
    const focus = AssessmentEngine.createInitialFocusAreas(assessment);
    const plan = AssessmentEngine.createInitialPracticePlan(assessment);

    const completedAssessment: BaselineAssessment = {
      ...assessment,
      status: 'completed',
      completedAt: new Date().toISOString(),
      estimatedStrengths: focus.strengths,
      estimatedWeaknesses: focus.recommendedSounds,
      recommendedFocusAreas: focus.focusAreas,
      recommendedDailyPlan: plan
    };

    BrowserStorage.saveBaselineAssessment(completedAssessment);

    const newProfile = AssessmentEngine.buildInitialLearnerProfile(completedAssessment);
    BrowserStorage.saveUserProfile(newProfile);

    const adaptiveLesson = PersonalizationEngine.generateLesson(newProfile.skills, newProfile.level);
    BrowserStorage.saveActiveLesson(adaptiveLesson);

    onComplete(newProfile, adaptiveLesson);
  };

  const stepLabels: Record<number, string> = {
    1: 'Welcome',
    2: 'About You',
    3: 'Your Goals',
    4: 'Context',
    5: 'Commitment',
    6: 'Vocal Warm-Up',
    7: 'Speaking Baseline',
    8: 'Reading Baseline',
    9: 'Pronunciation Check',
    10: 'Starting Profile'
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg-app)',
        padding: 'var(--space-6) var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <div style={{ width: '100%', maxWidth: '680px', margin: '0 auto' }}>
        {/* Progress header (hidden on welcome screen) */}
        {step > 1 && (
          <OnboardingProgress
            currentStep={step}
            totalSteps={TOTAL_STEPS}
            stepLabel={stepLabels[step]}
            onBack={step > 2 ? goToPrevStep : undefined}
            onPause={onExit}
            canGoBack={step > 2 && step < 10}
          />
        )}

        {/* Step 1: Welcome */}
        {step === 1 && (
          <WelcomeStep
            onStart={goToNextStep}
            onSkip={handleSkipAll}
          />
        )}

        {/* Step 2: About You */}
        {step === 2 && (
          <AboutYouStep
            name={assessment.name}
            onNameChange={(val) => updateAssessment({ name: val })}
            preferredLanguage={assessment.preferredLanguage}
            onLanguageChange={(val) => updateAssessment({ preferredLanguage: val })}
            level={assessment.selfReportedLevel}
            onLevelChange={(val) => updateAssessment({ selfReportedLevel: val })}
            onContinue={goToNextStep}
          />
        )}

        {/* Step 3: Goals */}
        {step === 3 && (
          <GoalsStep
            selectedGoals={assessment.goals}
            onToggleGoal={(g) => {
              const current = assessment.goals;
              const next = current.includes(g) ? current.filter((item) => item !== g) : [...current, g];
              updateAssessment({ goals: next });
            }}
            onContinue={goToNextStep}
          />
        )}

        {/* Step 4: Context */}
        {step === 4 && (
          <ContextStep
            selectedContexts={assessment.contexts}
            onToggleContext={(c) => {
              const current = assessment.contexts;
              const next = current.includes(c) ? current.filter((item) => item !== c) : [...current, c];
              updateAssessment({ contexts: next });
            }}
            onContinue={goToNextStep}
          />
        )}

        {/* Step 5: Preferences */}
        {step === 5 && (
          <PreferencesStep
            duration={assessment.dailyPracticePreference}
            onDurationChange={(val) => updateAssessment({ dailyPracticePreference: val })}
            confidence={assessment.speakingConfidence}
            onConfidenceChange={(val) => updateAssessment({ speakingConfidence: val })}
            onContinue={goToNextStep}
          />
        )}

        {/* Step 6: Vocal Warm-Up */}
        {step === 6 && (
          <VocalWarmupStep
            onComplete={() => {
              updateAssessment({ vocalWarmupCompleted: true });
              goToNextStep();
            }}
            onSkip={() => {
              updateAssessment({ vocalWarmupCompleted: false });
              goToNextStep();
            }}
          />
        )}

        {/* Step 7: Speaking Assessment */}
        {step === 7 && (
          <SpeakingAssessmentStep
            speechProvider={speechProvider}
            onAssessmentCompleted={(result) => {
              updateAssessment({ speakingAssessment: result });
              goToNextStep();
            }}
            onSkip={goToNextStep}
          />
        )}

        {/* Step 8: Reading Assessment */}
        {step === 8 && (
          <ReadingAssessmentStep
            speechProvider={speechProvider}
            onAssessmentCompleted={(result) => {
              updateAssessment({ readingAssessment: result });
              goToNextStep();
            }}
            onSkip={goToNextStep}
          />
        )}

        {/* Step 9: Pronunciation Assessment */}
        {step === 9 && (
          <PronunciationAssessmentStep
            speechProvider={speechProvider}
            onAssessmentCompleted={(result) => {
              updateAssessment({ pronunciationAssessment: result });
              goToNextStep();
            }}
            onSkip={goToNextStep}
          />
        )}

        {/* Step 10: Results & Starting Profile */}
        {step === 10 && (
          <ResultsStep
            assessment={assessment}
            plan={AssessmentEngine.createInitialPracticePlan(assessment)}
            strengths={AssessmentEngine.createInitialFocusAreas(assessment).strengths}
            focusAreas={AssessmentEngine.createInitialFocusAreas(assessment).focusAreas}
            onStartPractice={() => handleFinishOnboarding('practice')}
            onReviewProfile={() => handleFinishOnboarding('profile')}
          />
        )}
      </div>
    </div>
  );
};
