import type { Priority } from '../types';
import { useSettings } from '../context/SettingsContext';

export function PriorityBadge({ priority }: { priority: Priority }) {
  const { t } = useSettings();
  return (
    <span className={`badge badge--${priority}`}>
      <span className="badge__dot" aria-hidden="true" />
      {t(`priority.${priority}`)}
    </span>
  );
}
