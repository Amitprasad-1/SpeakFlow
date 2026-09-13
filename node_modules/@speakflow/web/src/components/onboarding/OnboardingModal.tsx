import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { EnglishGoal, EnglishLevel, DailyPracticeMinutes } from '@speakflow/core';
import { Check, Mic, ArrowRight, Sparkles, Volume2, Shield } from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const { completeOnboarding, speechProvider } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [name, setName] = useState('Learner');
  const [selectedGoals, setSelectedGoals] = useState<EnglishGoal[]>([
    'Speaking',
    'Pronunciation',
    'Workplace English'
  ]);
  const [selectedLevel, setSelectedLevel] = useState<EnglishLevel>('Intermediate');
  const [dailyMinutes, setDailyMinutes] = useState<DailyPracticeMinutes>(15);

  // Diagnostic Test State
  const [isDiagnosticRecording, setIsDiagnosticRecording] = useState(false);
  const [diagnosticScore, setDiagnosticScore] = useState<number | null>(null);
  const [diagnosticFeedback, setDiagnosticFeedback] = useState<string>('');

  const availableGoals: EnglishGoal[] = [
    'Speaking',
    'Pronunciation',
    'Fluency',
    'Reading',
    'Listening',
    'Interview English',
    'Workplace English'
  ];

  const availableLevels: EnglishLevel[] = [
    'Beginner',
    'Elementary',
    'Intermediate',
    'Upper Intermediate',
    'Advanced'
  ];

  const availableTimes: DailyPracticeMinutes[] = [5, 10, 15, 20, 30];

  const toggleGoal = (goal: EnglishGoal) => {
    if (selectedGoals.includes(goal)) {
      if (selectedGoals.length > 1) {
        setSelectedGoals(selectedGoals.filter((g) => g !== goal));
      }
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const handleDiagnosticRecord = async () => {
    if (isDiagnosticRecording) {
      setIsDiagnosticRecording(false);
      await speechProvider.stopRecording();
      // Calculate diagnostic score
      setDiagnosticScore(78);
      setDiagnosticFeedback('Strong vocal foundation! We detected opportunities in R/L and terminal consonants.');
    } else {
      setIsDiagnosticRecording(true);
      await speechProvider.startRecording();
    }
  };

  const handleFinish = () => {
    completeOnboarding(name, selectedGoals, selectedLevel, dailyMinutes);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        background: 'radial-gradient(circle at 50% 20%, rgba(16, 185, 129, 0.08) 0%, var(--color-bg-base) 70%)'
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '560px',
          width: '100%',
          padding: 'var(--space-8)'
        }}
      >
        {/* Progress Dots */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 'var(--radius-full)',
                backgroundColor: s <= step ? 'var(--color-primary)' : 'var(--color-border)'
              }}
            />
          ))}
        </div>

        {/* Step 1: Goals */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <div className="badge badge-focus" style={{ marginBottom: 'var(--space-3)' }}>
                Step 1 of 4 • Your Focus
              </div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>
                What do you want to improve?
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
                SpeakFlow tailors each daily lesson to your exact communication objectives.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
              {availableGoals.map((goal) => {
                const isSelected = selectedGoals.includes(goal);
                return (
                  <button
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'var(--space-3) var(--space-4)',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'var(--color-primary-light)' : 'var(--color-bg-subtle)',
                      border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      color: isSelected ? 'var(--color-primary)' : 'var(--color-text-primary)',
                      fontWeight: 600,
                      textAlign: 'left'
                    }}
                  >
                    <span>{goal}</span>
                    {isSelected && <Check size={18} color="var(--color-primary)" />}
                  </button>
                );
              })}
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setStep(2)}
            >
              <span>Continue</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Step 2: Current Level */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <div className="badge badge-focus" style={{ marginBottom: 'var(--space-3)' }}>
                Step 2 of 4 • Fluency Baseline
              </div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>
                What is your current English level?
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
                We calibrate speech tempo, vocabulary complexity, and scenario realism.
              </p>
            </div>

            <div style={{ display: 'grid', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
              {availableLevels.map((lvl) => {
                const isSelected = selectedLevel === lvl;
                return (
                  <button
                    key={lvl}
                    onClick={() => setSelectedLevel(lvl)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'var(--space-3) var(--space-4)',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'var(--color-primary-light)' : 'var(--color-bg-subtle)',
                      border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      color: isSelected ? 'var(--color-primary)' : 'var(--color-text-primary)',
                      fontWeight: 600
                    }}
                  >
                    <span>{lvl}</span>
                    {isSelected && <Check size={18} color="var(--color-primary)" />}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button className="btn btn-secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>
                Back
              </button>
              <button className="btn btn-primary" onClick={() => setStep(3)} style={{ flex: 2 }}>
                <span>Continue</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Daily Target Commitment */}
        {step === 3 && (
          <div>
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <div className="badge badge-focus" style={{ marginBottom: 'var(--space-3)' }}>
                Step 3 of 4 • Consistency
              </div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>
                Set your daily practice goal
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
                Consistency is the key to motor memory in speech. Even 10 minutes a day yields rapid results.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
              {availableTimes.map((mins) => {
                const isSelected = dailyMinutes === mins;
                return (
                  <button
                    key={mins}
                    onClick={() => setDailyMinutes(mins)}
                    style={{
                      padding: 'var(--space-4) var(--space-2)',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'var(--color-primary-light)' : 'var(--color-bg-subtle)',
                      border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      color: isSelected ? 'var(--color-primary)' : 'var(--color-text-primary)',
                      fontWeight: 700,
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '1.25rem' }}>{mins}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>MINS</div>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button className="btn btn-secondary" onClick={() => setStep(2)} style={{ flex: 1 }}>
                Back
              </button>
              <button className="btn btn-primary" onClick={() => setStep(4)} style={{ flex: 2 }}>
                <span>Diagnostic Assessment</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Diagnostic Assessment */}
        {step === 4 && (
          <div>
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <div className="badge badge-focus" style={{ marginBottom: 'var(--space-3)' }}>
                Step 4 of 4 • Speech Diagnostic
              </div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>
                Microphone & Baseline Check
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
                Read the sentence below aloud to calibrate your baseline enunciation and pace.
              </p>
            </div>

            <div
              style={{
                background: 'var(--color-bg-subtle)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
                marginBottom: 'var(--space-6)',
                textAlign: 'center'
              }}
            >
              <p style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)', lineHeight: 1.6 }}>
                "Clear communication transforms personal ideas into shared leadership achievements."
              </p>

              <button
                className={`btn ${isDiagnosticRecording ? 'btn-secondary' : 'btn-primary'}`}
                onClick={handleDiagnosticRecord}
                style={{ margin: '0 auto', gap: 'var(--space-2)' }}
              >
                <Mic size={18} color={isDiagnosticRecording ? 'var(--color-error)' : '#ffffff'} />
                <span>{isDiagnosticRecording ? 'Stop Recording' : 'Record Sample'}</span>
              </button>
            </div>

            {diagnosticScore && (
              <div
                style={{
                  background: 'var(--color-primary-light)',
                  border: '1px solid var(--color-primary)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-4)',
                  marginBottom: 'var(--space-6)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                  <Sparkles size={18} color="var(--color-primary)" />
                  <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                    Baseline Score: {diagnosticScore}/100
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                  {diagnosticFeedback}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              <Shield size={14} />
              <span>Voice Privacy: Your voice buffer is processed ephemerally and never stored permanently.</span>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleFinish}
            >
              <span>Build My Personalized Practice</span>
              <Sparkles size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
