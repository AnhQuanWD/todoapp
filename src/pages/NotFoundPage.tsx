import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { EmptyState } from '../components/EmptyState';

export default function NotFoundPage() {
  const { t } = useSettings();
  return (
    <EmptyState
      title={`404 · ${t('notfound.title')}`}
      description={t('notfound.desc')}
      action={
        <Link to="/" className="btn btn--primary btn--md">
          {t('notfound.home')}
        </Link>
      }
    />
  );
}
