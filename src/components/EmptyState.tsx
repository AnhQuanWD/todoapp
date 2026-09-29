import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="empty fade-in">
      <svg className="empty__art" viewBox="0 0 120 100" role="img" aria-label={title}>
        <rect x="18" y="14" width="84" height="72" rx="10" className="empty__paper" />
        <rect x="32" y="32" width="10" height="10" rx="3" className="empty__box" />
        <rect x="50" y="34" width="38" height="6" rx="3" className="empty__line" />
        <rect x="32" y="52" width="10" height="10" rx="3" className="empty__box" />
        <rect x="50" y="54" width="28" height="6" rx="3" className="empty__line" />
        <circle cx="96" cy="78" r="14" className="empty__badge" />
        <path d="M90 78h12M96 72v12" className="empty__plus" />
      </svg>
      <h2 className="empty__title">{title}</h2>
      {description && <p className="empty__desc">{description}</p>}
      {action}
    </div>
  );
}
