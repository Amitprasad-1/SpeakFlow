import React from 'react';
import { Loader2, AlertCircle, Inbox, ArrowRight } from 'lucide-react';
import { Button } from '../Button/Button';

/* --------------------------------------------------------------------------
   1. SectionHeader
   -------------------------------------------------------------------------- */
export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  badge?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionLabel,
  onAction,
  badge
}) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 'var(--space-4)',
        gap: 'var(--space-3)'
      }}
    >
      <div>
        {badge && <div style={{ marginBottom: 'var(--space-1)' }}>{badge}</div>}
        <h2 className="typography-h2">{title}</h2>
        {subtitle && (
          <p className="typography-body-sm" style={{ marginTop: 'var(--space-0-5)' }}>
            {subtitle}
          </p>
        )}
      </div>

      {actionLabel && onAction && (
        <Button variant="ghost" size="sm" onClick={onAction} icon={<ArrowRight size={14} />} iconPosition="right">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

/* --------------------------------------------------------------------------
   2. LoadingState
   -------------------------------------------------------------------------- */
export interface LoadingStateProps {
  message?: string;
  height?: number | string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Analyzing speech profile...',
  height = 200
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height,
        width: '100%',
        color: 'var(--color-text-secondary)',
        gap: 'var(--space-3)'
      }}
      role="status"
    >
      <Loader2 className="btn-spinner" size={32} color="var(--color-primary)" />
      <span style={{ fontSize: 'var(--text-body-sm)', fontWeight: 500 }}>{message}</span>
    </div>
  );
};

/* --------------------------------------------------------------------------
   3. EmptyState
   -------------------------------------------------------------------------- */
export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'var(--space-10) var(--space-4)',
        background: 'var(--color-bg-subtle)',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--color-border)'
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 'var(--radius-pill)',
          background: 'var(--color-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-muted)',
          marginBottom: 'var(--space-3)'
        }}
      >
        {icon || <Inbox size={22} />}
      </div>

      <h3 className="typography-h3" style={{ marginBottom: 'var(--space-1)' }}>
        {title}
      </h3>
      <p className="typography-body-sm" style={{ maxWidth: '42ch', marginBottom: actionLabel ? 'var(--space-4)' : 0 }}>
        {description}
      </p>

      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

/* --------------------------------------------------------------------------
   4. ErrorState
   -------------------------------------------------------------------------- */
export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Service Notice',
  message,
  onRetry
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--space-3)',
        padding: 'var(--space-4)',
        background: 'var(--color-error-subtle)',
        border: '1px solid var(--color-error)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--color-text-primary)'
      }}
      role="alert"
    >
      <AlertCircle size={20} color="var(--color-error)" style={{ flexShrink: 0, marginTop: '2px' }} />
      <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: 'var(--text-body)', fontWeight: 600, color: 'var(--color-error)', marginBottom: '2px' }}>
          {title}
        </h4>
        <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)', marginBottom: onRetry ? 'var(--space-3)' : 0 }}>
          {message}
        </p>
        {onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Retry Operation
          </Button>
        )}
      </div>
    </div>
  );
};
