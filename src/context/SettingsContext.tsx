import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Lang, Theme } from '../types';
import { translations, type TranslationKey } from '../i18n/translations';
import { loadJSON, saveJSON, STORAGE_KEYS } from '../utils/storage';

interface Settings {
  theme: Theme;
  lang: Lang;
}

interface SettingsContextValue extends Settings {
  setTheme: (t: Theme) => void;
  setLang: (l: Lang) => void;
  resolvedTheme: 'light' | 'dark';
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  formatDate: (value: string | number) => string;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

const prefersDark = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() =>
    loadJSON<Settings>(STORAGE_KEYS.settings, { theme: 'system', lang: 'vi' }),
  );
  const [systemDark, setSystemDark] = useState(prefersDark);

  // Lắng nghe thay đổi chế độ màu của hệ điều hành
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const resolvedTheme = settings.theme === 'system' ? (systemDark ? 'dark' : 'light') : settings.theme;

  useEffect(() => {
    saveJSON(STORAGE_KEYS.settings, settings);
    document.documentElement.lang = settings.lang;
  }, [settings]);

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolvedTheme === 'dark' ? '#0f172a' : '#4f46e5');
  }, [resolvedTheme]);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      let str: string = translations[settings.lang][key] ?? key;
      if (vars) for (const [k, v] of Object.entries(vars)) str = str.replaceAll(`{${k}}`, String(v));
      return str;
    },
    [settings.lang],
  );

  const formatDate = useCallback(
    (value: string | number) => {
      const d = typeof value === 'string' ? new Date(`${value}T00:00:00`) : new Date(value);
      const opts: Intl.DateTimeFormatOptions =
        typeof value === 'string'
          ? { day: '2-digit', month: '2-digit', year: 'numeric' }
          : { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
      return d.toLocaleString(settings.lang === 'vi' ? 'vi-VN' : 'en-US', opts);
    },
    [settings.lang],
  );

  const value = useMemo<SettingsContextValue>(
    () => ({
      ...settings,
      resolvedTheme,
      setTheme: (theme) => setSettings((s) => ({ ...s, theme })),
      setLang: (lang) => setSettings((s) => ({ ...s, lang })),
      t,
      formatDate,
    }),
    [settings, resolvedTheme, t, formatDate],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings phải dùng bên trong <SettingsProvider>');
  return ctx;
}
