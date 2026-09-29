import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTodos } from '../context/TodoContext';
import { useSettings } from '../context/SettingsContext';
import { useDeleteWithUndo } from '../hooks';
import { isOverdue } from '../utils/todoQuery';
import { Button } from '../components/Button';
import { ConfirmDialog } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { PriorityBadge } from '../components/PriorityBadge';

// eslint-disable-next-line react-refresh/only-export-components
export function TodoNotFound() {
  const { t } = useSettings();
  return (
    <EmptyState
      title={t('todo.notFound')}
      description={t('todo.notFoundDesc')}
      action={
        <Link to="/" className="btn btn--primary btn--md">
          {t('todo.back')}
        </Link>
      }
    />
  );
}

export default function TodoDetailPage() {
  const { id } = useParams<{ id: string }>(); // route động /todo/:id
  const { todos, dispatch } = useTodos();
  const { t, formatDate } = useSettings();
  const navigate = useNavigate();
  const deleteWithUndo = useDeleteWithUndo();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const todo = todos.find((x) => x.id === id);
  if (!todo) return <TodoNotFound />;

  const overdue = isOverdue(todo);

  return (
    <div className="narrow">
      <Link to="/" className="back-link">
        {t('todo.back')}
      </Link>

      <article className={`card detail priority-${todo.priority} ${todo.completed ? 'is-done' : ''}`}>
        <header className="detail__head">
          <div className="detail__badges">
            <PriorityBadge priority={todo.priority} />
            <span className={`status ${todo.completed ? 'status--done' : ''}`}>
              {todo.completed ? t('todo.done') : t('todo.notDone')}
            </span>
            {overdue && <span className="chip chip--danger">{t('todo.overdue')}</span>}
          </div>
          <h1 className="detail__title">{todo.title}</h1>
        </header>

        <p className={`detail__desc ${todo.description ? '' : 'is-muted'}`}>{todo.description || t('todo.noDesc')}</p>

        <dl className="detail__meta">
          <div>
            <dt>{t('form.category')}</dt>
            <dd>{todo.category || '—'}</dd>
          </div>
          <div>
            <dt>{t('form.dueDate')}</dt>
            <dd>{todo.dueDate ? formatDate(todo.dueDate) : '—'}</dd>
          </div>
          <div>
            <dt>{t('todo.created')}</dt>
            <dd>{formatDate(todo.createdAt)}</dd>
          </div>
          <div>
            <dt>{t('todo.updated')}</dt>
            <dd>{formatDate(todo.updatedAt)}</dd>
          </div>
        </dl>

        <div className="detail__actions">
          <Button
            variant={todo.completed ? 'secondary' : 'primary'}
            icon="check"
            onClick={() => dispatch({ type: 'toggle', id: todo.id })}
          >
            {todo.completed ? t('todo.markUndone') : t('todo.markDone')}
          </Button>
          <Button variant="secondary" icon="edit" onClick={() => navigate(`/todo/${todo.id}/edit`)}>
            {t('todo.edit')}
          </Button>
          <Button variant="danger" icon="trash" onClick={() => setConfirmDelete(true)}>
            {t('todo.delete')}
          </Button>
        </div>
      </article>

      <ConfirmDialog
        open={confirmDelete}
        title={t('modal.deleteTitle')}
        message={t('modal.deleteDesc', { title: todo.title })}
        confirmLabel={t('modal.confirm')}
        onConfirm={() => {
          deleteWithUndo(todo);
          navigate('/');
        }}
        onClose={() => setConfirmDelete(false)}
      />
    </div>
  );
}
