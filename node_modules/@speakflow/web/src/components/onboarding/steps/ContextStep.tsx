import React from 'react';
import { Button } from '../../../design-system';
import { OptionCard } from '../OptionCard';
import { CommunicationContext } from '@speakflow/core';
import {
  ArrowRight,
  Building2,
  GraduationCap,
  Briefcase,
  Plane,
  Coffee,
  Users,
  Presentation,
  Headphones
} from 'lucide-react';

export interface ContextStepProps {
  selectedContexts: CommunicationContext[];
  onToggleContext: (ctx: CommunicationContext) => void;
  onContinue: () => void;
}

export const ContextStep: React.FC<ContextStepProps> = ({
  selectedContexts,
  onToggleContext,
  onContinue
}) => {
  const contexts: { value: CommunicationContext; title: string; desc: string; icon: any }[] = [
    {
      value: 'workplace',
      title: 'Office & Workplace',
      desc: 'Collaborating with cross-functional teammates and leadership',
      icon: <Building2 size={20} />
    },
    {
      value: 'job_interviews',
      title: 'Job Interviews',
      desc: 'Communicating experience, skills, and problem solving clearly',
      icon: <Briefcase size={20} />
    },
    {
      value: 'meetings',
      title: 'Meetings & Discussions',
      desc: 'Speaking up, proposing ideas, and answering questions live',
      icon: <Users size={20} />
    },
    {
      value: 'presentations',
      title: 'Presentations & Pitches',
      desc: 'Delivering structured talks to clients, managers, or audiences',
      icon: <Presentation size={20} />
    },
    {
      value: 'daily_life',
      title: 'Daily Life & Socializing',
      desc: 'Casual conversations, shopping, ordering, and neighborhood life',
      icon: <Coffee size={20} />
    },
    {
      value: 'college',
      title: 'College & Academics',
      desc: 'Seminars, group assignments, and campus communication',
      icon: <GraduationCap size={20} />
    },
    {
      value: 'travel',
      title: 'Travel & International Trips',
      desc: 'Airports, hotels, asking directions, and navigating abroad',
      icon: <Plane size={20} />
    },
    {
      value: 'customer_support',
      title: 'Client & Customer Calls',
      desc: 'Handling inquiries, technical assistance, and relationship building',
      icon: <Headphones size={20} />
    }
  ];

  const canContinue = selectedContexts.length > 0;

  return (
    <div style={{ maxWidth: '620px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h2 className="typography-h2">Where do you use English most often?</h2>
        <p className="typography-body" style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
          Select the real-world situations you find yourself in. Your daily speaking exercises will be grounded in these scenarios.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-2-5)'
        }}
      >
        {contexts.map((ctx) => {
          const isSelected = selectedContexts.includes(ctx.value);
          return (
            <OptionCard
              key={ctx.value}
              id={`ctx-${ctx.value}`}
              title={ctx.title}
              description={ctx.desc}
              icon={ctx.icon}
              selected={isSelected}
              onSelect={() => onToggleContext(ctx.value)}
              multiSelect={true}
            />
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-4)' }}>
        <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>
          {selectedContexts.length === 0 ? 'Select at least one situation' : `${selectedContexts.length} selected`}
        </span>

        <Button
          variant="primary"
          size="lg"
          disabled={!canContinue}
          onClick={onContinue}
          icon={<ArrowRight size={18} />}
          id="btn-step-context-continue"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
