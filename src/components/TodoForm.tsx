import { useId, useState, type ChangeEvent, type FormEvent } from 'react';
import type { Priority, TodoInput } from '../types';
import { useSettings } from '../context/SettingsContext';
import { useTodos } from '../context/TodoContext';
import { LIMITS, validateTodo, type FormErrors } from '../utils/validation';
import type { TranslationKey } from '../i18n/translations';
import { Button } from './Button';

interface TodoFormProps {
  initial?: TodoInput;
  submitLabel: string;
  onSubmit: (values: TodoInput) => void;
  onCancel: () => void;
}

const EMPTY: TodoInput = { title: '', description: '', priority: 'medium', category: '', dueDate: '' };
const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

export function TodoForm({ initial = EMPTY, submitLabel, onSubmit, onCancel }: TodoFormProps) {
  const { t } = useSettings();
  const { categories } = useTodos();
  const id = useId();
  const [values, setValues] = useState<TodoInput>(initial);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof TodoInput, boolean>>>({});

  const update =
    (field: keyof TodoInput) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const next = { ...values, [field]: e.target.value };
      setValues(next);
      // validate realtime sau khi người dùng đã chạm vào field
      if (touched[field]) setErrors(validateTodo(next));
    };

  const blur = (field: keyof TodoInput) => () => {
    setTouched((s) => ({ ...s, [field]: true }));
    setErrors(validateTodo(values));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validateTodo(values);
    setErrors(errs);
    setTouched({ title: true, description: true, category: true, dueDate: true });
    if (Object.keys(errs).length) {
      // đưa focus tới field lỗi đầu tiên
      const first = Object.keys(errs)[0];
      document.getElementById(`${id}-${first}`)?.focus();
      return;
    }
    onSubmit({ ...values, title: values.title.trim(), category: values.category.trim() });
  };

  const fieldError = (field: keyof TodoInput) =>
    touched[field] && errors[field] ? (
      <p id={`${id}-${field}-error`} className="field__error" role="alert">
        {t(errors[field] as TranslationKey)}
      </p>
    ) : null;

  const aria = (field: keyof TodoInput, extra?: string) => ({
    id: `${id}-${field}`,
    'aria-invalid': Boolean(touched[field] && errors[field]),
    'aria-describedby': [touched[field] && errors[field] ? `${id}-${field}-error` : '', extra ?? '']
      .filter(Boolean)
      .join(' ') || undefined,
  });

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor={`${id}-title`} className="field__label">
          {t('form.title')} <span className="field__req">({t('form.required')})</span>
        </label>
        <input
          {...aria('title', `${id}-title-count`)}
          className="input"
          type="text"
          value={values.title}
          onChange={update('title')}
          onBlur={blur('title')}
          placeholder={t('form.titlePlaceholder')}
          maxLength={LIMITS.titleMax + 20}
          autoComplete="off"
          required
        />
        <div className="field__row">
          {fieldError('title')}
          <span id={`${id}-title-count`} className="field__hint">
            {t('form.chars', { count: values.title.trim().length, max: LIMITS.titleMax })}
          </span>
        </div>
      </div>

      <div className="field">
        <label htmlFor={`${id}-description`} className="field__label">
          {t('form.description')}
        </label>
        <textarea
          {...aria('description', `${id}-desc-count`)}
          className="input textarea"
          rows={4}
          value={values.description}
          onChange={update('description')}
          onBlur={blur('description')}
          placeholder={t('form.descPlaceholder')}
        />
        <div className="field__row">
          {fieldError('description')}
          <span id={`${id}-desc-count`} className="field__hint">
            {t('form.chars', { count: values.description.length, max: LIMITS.descMax })}
          </span>
        </div>
      </div>

      <div className="form__grid">
        <fieldset className="field">
          <legend className="field__label">{t('priority.label')}</legend>
          <div className="segmented" role="radiogroup">
            {PRIORITIES.map((p) => (
              <label key={p} className={`segmented__item segmented__item--${p}`}>
                <input
                  type="radio"
                  name={`${id}-priority`}
                  value={p}
                  checked={values.priority === p}
                  onChange={update('priority')}
                />
                <span>{t(`priority.${p}`)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="field">
          <label htmlFor={`${id}-category`} className="field__label">
            {t('form.category')}
          </label>
          <input
            {...aria('category')}
            className="input"
            type="text"
            list={`${id}-categories`}
            value={values.category}
            onChange={update('category')}
            onBlur={blur('category')}
            placeholder={t('form.categoryPlaceholder')}
          />
          <datalist id={`${id}-categories`}>
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          {fieldError('category')}
        </div>

        <div className="field">
          <label htmlFor={`${id}-dueDate`} className="field__label">
            {t('form.dueDate')}
          </label>
          <input
            {...aria('dueDate')}
            className="input"
            type="date"
            value={values.dueDate}
            onChange={update('dueDate')}
            onBlur={blur('dueDate')}
          />
          {fieldError('dueDate')}
        </div>
      </div>

      <div className="form__actions">
        <Button variant="secondary" onClick={onCancel}>
          {t('form.cancel')}
        </Button>
        <Button type="submit" icon="check">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
