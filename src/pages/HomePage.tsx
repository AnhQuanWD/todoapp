import { useCallback, useMemo, useState, type DragEvent, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { Filter, SortBy, Todo } from '../types';
import { useTodos } from '../context/TodoContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { useDebounce, useDeleteWithUndo } from '../hooks';
import { queryTodos } from '../utils/todoQuery';
import { FilterBar } from '../components/FilterBar';
import { TodoCard } from '../components/TodoCard';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/Button';
import { ConfirmDialog } from '../components/Modal';
import { Icon } from '../components/Icon';

export default function HomePage() {
  const { todos, dispatch, categories } = useTodos();
  const { t } = useSettings();
  const toast = useToast();
  const deleteWithUndo = useDeleteWithUndo();

  // Lưu filter trên URL (?filter=active) để có thể chia sẻ link / back-forward
  const [params, setParams] = useSearchParams();
  const filter = (params.get('filter') as Filter) || 'all';
  const setFilter = (f: Filter) =>
    setParams((p) => {
      if (f === 'all') p.delete('filter');
      else p.set('filter', f);
      return p;
    });

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [category, setCategory] = useState('');
  const [quick, setQuick] = useState('');
  const [quickError, setQuickError] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const debouncedSearch = useDebounce(search);

  const visible = useMemo(
    () => queryTodos(todos, { filter, search: debouncedSearch, sortBy, category }),
    [todos, filter, debouncedSearch, sortBy, category],
  );

  const counts = useMemo(() => {
    const completed = todos.filter((t) => t.completed).length;
    return { all: todos.length, active: todos.length - completed, completed };
  }, [todos]);

  const canDrag = sortBy === 'newest' && filter === 'all' && !debouncedSearch && !category;

  const onToggle = useCallback((id: string) => dispatch({ type: 'toggle', id }), [dispatch]);
  const onDelete = useCallback((todo: Todo) => deleteWithUndo(todo), [deleteWithUndo]);

  const handleQuickAdd = (e: FormEvent) => {
    e.preventDefault();
    const title = quick.trim();
    if (title.length < 3) {
      setQuickError(t(title ? 'err.titleMin' : 'err.titleRequired'));
      return;
    }
    dispatch({
      type: 'add',
      payload: { title, description: '', priority: 'medium', category: category || '', dueDate: '' },
    });
    setQuick('');
    setQuickError('');
    toast(t('toast.added'));
  };

  // Kéo thả sắp xếp (HTML5 Drag and Drop API)
  const dragHandlers = (index: number) => ({
    onDragStart: (e: DragEvent<HTMLLIElement>) => {
      setDragIndex(index);
      e.dataTransfer.effectAllowed = 'move';
    },
    onDragOver: (e: DragEvent<HTMLLIElement>) => {
      e.preventDefault();
      if (overIndex !== index) setOverIndex(index);
    },
    onDrop: (e: DragEvent<HTMLLIElement>) => {
      e.preventDefault();
      if (dragIndex !== null && dragIndex !== index) dispatch({ type: 'reorder', from: dragIndex, to: index });
      setDragIndex(null);
      setOverIndex(null);
    },
    onDragEnd: () => {
      setDragIndex(null);
      setOverIndex(null);
    },
  });

  const allDone = todos.length > 0 && counts.active === 0;

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">{t('home.title')}</h1>
          <p className="page-subtitle">{t('home.subtitle', { active: counts.active, completed: counts.completed })}</p>
        </div>
        <Link to="/new" className="btn btn--primary btn--md">
          <Icon name="plus" size={18} />
          <span>{t('nav.new')}</span>
        </Link>
      </div>

      <form className="quick-add" onSubmit={handleQuickAdd} noValidate>
        <label htmlFor="quick-add" className="sr-only">
          {t('home.quickLabel')}
        </label>
        <input
          id="quick-add"
          className="input quick-add__input"
          value={quick}
          onChange={(e) => {
            setQuick(e.target.value);
            if (quickError) setQuickError('');
          }}
          placeholder={t('home.quickPlaceholder')}
          aria-invalid={Boolean(quickError)}
          aria-describedby={quickError ? 'quick-add-error' : undefined}
          autoComplete="off"
        />
        <Button type="submit" icon="plus" iconOnly aria-label={t('nav.new')} />
        {quickError && (
          <p id="quick-add-error" className="field__error quick-add__error" role="alert">
            {quickError}
          </p>
        )}
      </form>

      {todos.length > 0 && (
        <FilterBar
          filter={filter}
          onFilterChange={setFilter}
          search={search}
          onSearchChange={setSearch}
          sortBy={sortBy}
          onSortChange={setSortBy}
          category={category}
          categories={categories}
          onCategoryChange={setCategory}
          counts={counts}
        />
      )}

      {todos.length === 0 ? (
        <EmptyState
          title={t('empty.title')}
          description={t('empty.desc')}
          action={
            <Link to="/new" className="btn btn--primary btn--md">
              <Icon name="plus" size={18} />
              <span>{t('nav.new')}</span>
            </Link>
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState title={t('empty.noMatch')} description={t('empty.noMatchDesc')} />
      ) : (
        <>
          <p className="results-info" aria-live="polite">
            {t('home.results', { count: visible.length })}
            {canDrag && visible.length > 1 && <span className="results-info__hint"> · {t('home.dragHint')}</span>}
          </p>
          <ul className="todo-list" aria-label={t('home.title')}>
            {visible.map((todo, i) => (
              <TodoCard
                key={todo.id}
                todo={todo}
                onToggle={onToggle}
                onDelete={onDelete}
                draggable={canDrag}
                isDragOver={overIndex === i && dragIndex !== i}
                {...(canDrag ? dragHandlers(i) : {})}
              />
            ))}
          </ul>
        </>
      )}

      {todos.length > 0 && (
        <div className="bulk-actions">
          <Button
            variant="secondary"
            size="sm"
            icon="check"
            onClick={() => dispatch({ type: 'toggleAll', completed: !allDone })}
          >
            {allDone ? t('home.unmarkAll') : t('home.markAll')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon="trash"
            className="btn--danger-ghost"
            disabled={counts.completed === 0}
            onClick={() => setConfirmClear(true)}
          >
            {t('home.clearCompleted')}
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={confirmClear}
        title={t('modal.clearTitle')}
        message={t('modal.clearDesc', { count: counts.completed })}
        confirmLabel={t('modal.confirm')}
        onConfirm={() => dispatch({ type: 'clearCompleted' })}
        onClose={() => setConfirmClear(false)}
      />
    </>
  );
}
