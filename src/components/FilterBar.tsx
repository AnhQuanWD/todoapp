import { useId } from 'react';
import type { Filter, SortBy } from '../types';
import { useSettings } from '../context/SettingsContext';
import { Icon } from './Icon';

interface FilterBarProps {
  filter: Filter;
  onFilterChange: (f: Filter) => void;
  search: string;
  onSearchChange: (s: string) => void;
  sortBy: SortBy;
  onSortChange: (s: SortBy) => void;
  category: string;
  categories: string[];
  onCategoryChange: (c: string) => void;
  counts: Record<Filter, number>;
}

const FILTERS: Filter[] = ['all', 'active', 'completed'];
const SORTS: SortBy[] = ['newest', 'oldest', 'dueDate', 'priority'];

export function FilterBar(props: FilterBarProps) {
  const { t } = useSettings();
  const id = useId();

  return (
    <section className="filter-bar" aria-label={t('filter.label')}>
      <div className="search">
        <label htmlFor={`${id}-search`} className="sr-only">
          {t('home.search')}
        </label>
        <Icon name="search" size={18} className="search__icon" />
        <input
          id={`${id}-search`}
          type="search"
          className="input search__input"
          value={props.search}
          onChange={(e) => props.onSearchChange(e.target.value)}
          placeholder={t('home.searchPlaceholder')}
        />
      </div>

      <div className="tabs" role="group" aria-label={t('filter.label')}>
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className={`tabs__item ${props.filter === f ? 'is-active' : ''}`}
            aria-pressed={props.filter === f}
            onClick={() => props.onFilterChange(f)}
          >
            {t(`filter.${f}`)}
            <span className="tabs__count">{props.counts[f]}</span>
          </button>
        ))}
      </div>

      <div className="filter-bar__selects">
        <div className="select-wrap">
          <label htmlFor={`${id}-cat`} className="sr-only">
            {t('category.label')}
          </label>
          <select
            id={`${id}-cat`}
            className="input select"
            value={props.category}
            onChange={(e) => props.onCategoryChange(e.target.value)}
          >
            <option value="">{t('category.all')}</option>
            {props.categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="select-wrap">
          <label htmlFor={`${id}-sort`} className="sr-only">
            {t('sort.label')}
          </label>
          <select
            id={`${id}-sort`}
            className="input select"
            value={props.sortBy}
            onChange={(e) => props.onSortChange(e.target.value as SortBy)}
          >
            {SORTS.map((s) => (
              <option key={s} value={s}>
                {t(`sort.${s}`)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
