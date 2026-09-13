import React from 'react';
import { Button } from '../../../design-system';
import { OptionCard } from '../OptionCard';
import {
  ArrowRight,
  Briefcase,
  Mic,
  MessageSquare,
  Sparkles,
  Award,
  BookOpen,
  Headphones,
  Users
} from 'lucide-react';

export interface GoalsStepProps {
  selectedGoals: string[];
  onToggleGoal: (goal: string) => void;
  onContinue: () => void;
}

export const GoalsStep: React.FC<GoalsStepProps> = ({
  selectedGoals,
  onToggleGoal,
  onContinue
}) => {
  const goalOptions: { id: string; title: string; desc: string; icon: any }[] = [
    {
      id: 'confidence',
      title: 'Speak Confidently',
      desc: 'Overcome hesitation and feel relaxed speaking English',
      icon: <Sparkles size={20} />
    },
    {
      id: 'interviews',
      title: 'Job Interviews',
      desc: 'Answer behavioral and professional questions with poise',
      icon: <Briefcase size={20} />
    },
    {
      id: 'workplace',
      title: 'Workplace & Meetings',
      desc: 'Express viewpoints and contribute smoothly in team discussions',
      icon: <Users size={20} />
    },
    {
      id: 'pronunciation',
      title: 'Pronunciation Clarity',
      desc: 'Master challenging consonant sounds like R/L, TH, and endings',
      icon: <Mic size={20} />
    },
    {
      id: 'fluency',
      title: 'Speaking Rhythm & Pacing',
      desc: 'Develop connected speech and a steady conversational cadence',
      icon: <Award size={20} />
    },
    {
      id: 'conversation',
      title: 'Daily Conversations',
      desc: 'Chat naturally with friends, colleagues, and new acquaintances',
      icon: <MessageSquare size={20} />
    },
    {
      id: 'reading',
      title: 'Reading Aloud Flow',
      desc: 'Read articles and documents aloud smoothly with inflection',
      icon: <BookOpen size={20} />
    },
    {
      id: 'listening',
      title: 'Listening & Comprehension',
      desc: 'Catch natural speed English dialogue and accents easily',
      icon: <Headphones size={20} />
    }
  ];

  const canContinue = selectedGoals.length > 0;

  return (
    <div style={{ maxWidth: '620px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h2 className="typography-h2">What do you want to improve most?</h2>
        <p className="typography-body" style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
          Select all that matter to you. SpeakFlow will tailor your practice topics around these goals.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-2-5)'
        }}
      >
        {goalOptions.map((opt) => {
          const isSelected = selectedGoals.includes(opt.title);
          return (
            <OptionCard
              key={opt.id}
              id={opt.id}
              title={opt.title}
              description={opt.desc}
              icon={opt.icon}
              selected={isSelected}
              onSelect={() => onToggleGoal(opt.title)}
              multiSelect={true}
            />
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-4)' }}>
        <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>
          {selectedGoals.length === 0 ? 'Select at least one goal' : `${selectedGoals.length} selected`}
        </span>

        <Button
          variant="primary"
          size="lg"
          disabled={!canContinue}
          onClick={onContinue}
          icon={<ArrowRight size={18} />}
          id="btn-step-goals-continue"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
