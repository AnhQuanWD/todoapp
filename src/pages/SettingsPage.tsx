import { useRef, useState, type ChangeEvent } from 'react';
import type { Lang, Theme, Todo } from '../types';
import { useSettings } from '../context/SettingsContext';
import { useTodos } from '../context/TodoContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/Button';
import { ConfirmDialog } from '../components/Modal';
import { createId } from '../utils/todoReducer';
import { sampleTodos } from '../utils/sampleData';

const THEMES: Theme[] = ['light', 'dark', 'system'];
const LANGS: { value: Lang; label: string }[] = [
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'en', label: 'English' },
];

function isTodo(x: unknown): x is Todo {
  const o = x as Todo;
  return !!o && typeof o.title === 'string' && typeof o.completed === 'boolean';
}

export default function SettingsPage() {
  const { t, theme, setTheme, lang, setLang } = useSettings();
  const { todos, dispatch } = useTodos();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(todos, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `todos-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const data: unknown = JSON.parse(await file.text());
      if (!Array.isArray(data) || !data.every(isTodo)) throw new Error('invalid');
      const now = Date.now();
      const normalized: Todo[] = data.map((d) => ({
        id: d.id || createId(),
        title: d.title,
        description: d.description ?? '',
        priority: ['low', 'medium', 'high'].includes(d.priority) ? d.priority : 'medium',
        category: d.category ?? '',
        dueDate: d.dueDate ?? '',
        completed: d.completed,
        createdAt: d.createdAt ?? now,
        updatedAt: d.updatedAt ?? now,
      }));
      dispatch({ type: 'replace', todos: normalized });
      toast(t('toast.imported', { count: normalized.length }));
    } catch {
      toast(t('toast.importError'));
    }
  };

  return (
    <div className="narrow">
      <h1 className="page-title">{t('settings.title')}</h1>

      <section className="card settings-section" aria-labelledby="s-appearance">
        <h2 id="s-appearance" className="card__title">
          {t('settings.appearance')}
        </h2>

        <fieldset className="field">
          <legend className="field__label">{t('settings.theme')}</legend>
          <div className="segmented">
            {THEMES.map((th) => (
              <label key={th} className="segmented__item">
                <input type="radio" name="theme" value={th} checked={theme === th} onChange={() => setTheme(th)} />
                <span>{t(`settings.${th}`)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="field">
          <legend className="field__label">{t('settings.language')}</legend>
          <div className="segmented">
            {LANGS.map((l) => (
              <label key={l.value} className="segmented__item">
                <input
                  type="radio"
                  name="lang"
                  value={l.value}
                  checked={lang === l.value}
                  onChange={() => setLang(l.value)}
                />
                <span lang={l.value}>{l.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <section className="card settings-section" aria-labelledby="s-data">
        <h2 id="s-data" className="card__title">
          {t('settings.data')}
        </h2>
        <p className="muted">{t('settings.dataDesc')}</p>
        <div className="button-row">
          <Button variant="secondary" onClick={exportJSON} disabled={!todos.length}>
            {t('settings.export')}
          </Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            {t('settings.import')}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={importJSON}
          />
          <Button
            variant="secondary"
            onClick={() => {
              dispatch({ type: 'replace', todos: [...sampleTodos(lang), ...todos] });
              toast(t('toast.imported', { count: 6 })); // 6 mục mẫu
            }}
          >
            {t('settings.sample')}
          </Button>
          <Button variant="danger" onClick={() => setConfirmReset(true)} disabled={!todos.length}>
            {t('settings.reset')}
          </Button>
        </div>
      </section>

      <section className="card settings-section" aria-labelledby="s-about">
        <h2 id="s-about" className="card__title">
          {t('settings.about')}
        </h2>
        <p className="muted">{t('settings.aboutDesc')}</p>
      </section>

      <ConfirmDialog
        open={confirmReset}
        title={t('settings.resetTitle')}
        message={t('settings.resetDesc')}
        confirmLabel={t('modal.confirm')}
        onConfirm={() => dispatch({ type: 'replace', todos: [] })}
        onClose={() => setConfirmReset(false)}
      />
    </div>
  );
}
