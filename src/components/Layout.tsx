import { Suspense, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { useScrolled } from '../hooks';
import { Icon, type IconName } from './Icon';
import { Button } from './Button';
import type { TranslationKey } from '../i18n/translations';

const NAV: { to: string; label: TranslationKey; icon: IconName }[] = [
  { to: '/', label: 'nav.home', icon: 'list' },
  { to: '/new', label: 'nav.new', icon: 'plus' },
  { to: '/stats', label: 'nav.stats', icon: 'chart' },
  { to: '/settings', label: 'nav.settings', icon: 'settings' },
];

export function Header() {
  const { t, resolvedTheme, setTheme, lang, setLang } = useSettings();
  const scrolled = useScrolled();

  return (
    <header className={`header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container header__inner">
        <NavLink to="/" className="logo" aria-label={t('app.name')}>
          <span className="logo__mark" aria-hidden="true">
            <Icon name="check" size={18} />
          </span>
          <span className="logo__text">{t('app.name')}</span>
        </NavLink>

        {/* Nav desktop/tablet; trên mobile chuyển thành thanh tab dưới đáy */}
        <nav className="nav" aria-label="Main">
          <ul className="nav__list">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.to === '/'} className="nav__link">
                  <Icon name={item.icon} size={18} />
                  <span className="nav__label">{t(item.label)}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header__tools">
          <Button
            variant="ghost"
            size="sm"
            icon="globe"
            aria-label={t('lang.toggle')}
            title={t('lang.toggle')}
            onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
          >
            {lang.toUpperCase()}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={resolvedTheme === 'dark' ? 'sun' : 'moon'}
            iconOnly
            aria-label={t('theme.toggle')}
            title={t('theme.toggle')}
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          />
        </div>
      </div>
    </header>
  );
}

const YEAR = new Date().getFullYear();

export function Footer() {
  const { t } = useSettings();
  return (
    <footer className="footer">
      <div className="container">
        <p>{t('footer.text', { year: YEAR })}</p>
      </div>
    </footer>
  );
}

function ScrollTopButton() {
  const { t } = useSettings();
  const show = useScrolled(400);
  return (
    <button
      type="button"
      className={`scroll-top ${show ? 'is-visible' : ''}`}
      aria-label={t('nav.top')}
      tabIndex={show ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <Icon name="arrowUp" size={20} />
    </button>
  );
}

export function Layout() {
  const { t } = useSettings();
  const location = useLocation();

  // Cuộn lên đầu khi chuyển trang; key = pathname để chạy lại animation fade
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="app">
      <a href="#main" className="skip-link">
        {t('nav.skip')}
      </a>
      <Header />
      <main id="main" className="main container" tabIndex={-1}>
        <Suspense fallback={<div className="loader" role="status">{t('loading')}</div>}>
          <div key={location.pathname} className="page fade-in">
            <Outlet />
          </div>
        </Suspense>
      </main>
      <Footer />
      <ScrollTopButton />
    </div>
  );
}
