import { useMemo } from 'react';
import { useTodos } from '../context/TodoContext';
import { useSettings } from '../context/SettingsContext';
import { getStats } from '../utils/todoQuery';
import { EmptyState } from '../components/EmptyState';
import type { TranslationKey } from '../i18n/translations';

function ProgressRing({ percent, label }: { percent: number; label: string }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="ring" role="img" aria-label={`${label}: ${percent}%`}>
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r={r} className="ring__track" />
        <circle
          cx="60"
          cy="60"
          r={r}
          className="ring__value"
          strokeDasharray={c}
          strokeDashoffset={c - (percent / 100) * c}
        />
      </svg>
      <span className="ring__label">{percent}%</span>
    </div>
  );
}

export default function StatsPage() {
  const { todos } = useTodos();
  const { t } = useSettings();
  const stats = useMemo(() => getStats(todos), [todos]);

  if (!stats.total) {
    return (
      <>
        <h1 className="page-title">{t('stats.title')}</h1>
        <EmptyState title={t('stats.empty')} />
      </>
    );
  }

  const tiles: { key: TranslationKey; value: number; tone: string }[] = [
    { key: 'stats.total', value: stats.total, tone: 'brand' },
    { key: 'stats.completed', value: stats.completed, tone: 'success' },
    { key: 'stats.active', value: stats.active, tone: 'warning' },
    { key: 'stats.overdue', value: stats.overdue, tone: 'danger' },
  ];
  const maxCat = stats.byCategory[0]?.[1] ?? 1;

  return (
    <>
      <h1 className="page-title">{t('stats.title')}</h1>

      <section className="stat-grid" aria-label={t('stats.title')}>
        {tiles.map((tile) => (
          <div key={tile.key} className={`stat-tile stat-tile--${tile.tone}`}>
            <span className="stat-tile__label">{t(tile.key)}</span>
            <span className="stat-tile__value">{tile.value}</span>
          </div>
        ))}
      </section>

      <div className="stats-layout">
        <section className="card stats-card">
          <h2 className="card__title">{t('stats.progress')}</h2>
          <ProgressRing percent={stats.percent} label={t('stats.progress')} />
        </section>

        <section className="card stats-card">
          <h2 className="card__title">{t('stats.byPriority')}</h2>
          <ul className="bars">
            {stats.byPriority.map((p) => (
              <li key={p.priority} className="bars__row">
                <span className="bars__label">{t(`priority.${p.priority}`)}</span>
                <span className="bars__track">
                  <span
                    className={`bars__fill bars__fill--${p.priority}`}
                    style={{ width: `${p.total ? (p.done / p.total) * 100 : 0}%` }}
                  />
                </span>
                <span className="bars__value">
                  {p.done}/{p.total}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card stats-card">
          <h2 className="card__title">{t('stats.byCategory')}</h2>
          <ul className="bars">
            {stats.byCategory.map(([name, count]) => (
              <li key={name} className="bars__row">
                <span className="bars__label">{name}</span>
                <span className="bars__track">
                  <span className="bars__fill" style={{ width: `${(count / maxCat) * 100}%` }} />
                </span>
                <span className="bars__value">{count}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
