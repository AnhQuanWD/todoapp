import { memo, type DragEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Todo } from '../types';
import { useSettings } from '../context/SettingsContext';
import { isOverdue } from '../utils/todoQuery';
import { Icon } from './Icon';
import { Button } from './Button';
import { PriorityBadge } from './PriorityBadge';

interface TodoCardProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (todo: Todo) => void;
  draggable?: boolean;
  isDragOver?: boolean;
  onDragStart?: (e: DragEvent<HTMLLIElement>) => void;
  onDragOver?: (e: DragEvent<HTMLLIElement>) => void;
  onDrop?: (e: DragEvent<HTMLLIElement>) => void;
  onDragEnd?: () => void;
}

function TodoCardBase({ todo, onToggle, onDelete, draggable, isDragOver, ...drag }: TodoCardProps) {
  const { t, formatDate } = useSettings();
  const navigate = useNavigate();
  const overdue = isOverdue(todo);

  return (
    <li
      className={`todo-card slide-in ${todo.completed ? 'is-done' : ''} ${isDragOver ? 'is-drag-over' : ''} priority-${todo.priority}`}
      draggable={draggable}
      {...drag}
    >
      {draggable && (
        <span className="todo-card__grip" aria-hidden="true">
          <Icon name="grip" size={16} />
        </span>
      )}

      <label className="checkbox">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          aria-label={t('todo.toggle', { title: todo.title })}
        />
        <span className="checkbox__box" aria-hidden="true">
          <Icon name="check" size={14} />
        </span>
      </label>

      <div className="todo-card__body">
        <Link to={`/todo/${todo.id}`} className="todo-card__title">
          {todo.title}
        </Link>
        {todo.description && <p className="todo-card__desc">{todo.description}</p>}
        <div className="todo-card__meta">
          <PriorityBadge priority={todo.priority} />
          {todo.category && (
            <span className="chip">
              <Icon name="tag" size={12} />
              {todo.category}
            </span>
          )}
          {todo.dueDate && (
            <span className={`chip ${overdue ? 'chip--danger' : ''}`}>
              <Icon name="calendar" size={12} />
              {overdue ? `${t('todo.overdue')} · ` : ''}
              {formatDate(todo.dueDate)}
            </span>
          )}
        </div>
      </div>

      <div className="todo-card__actions">
        <Button
          variant="ghost"
          size="sm"
          icon="edit"
          iconOnly
          aria-label={`${t('todo.edit')}: ${todo.title}`}
          title={t('todo.edit')}
          onClick={() => navigate(`/todo/${todo.id}/edit`)}
        />
        <Button
          variant="ghost"
          size="sm"
          icon="trash"
          iconOnly
          className="btn--danger-ghost"
          aria-label={`${t('todo.delete')}: ${todo.title}`}
          title={t('todo.delete')}
          onClick={() => onDelete(todo)}
        />
      </div>
    </li>
  );
}

/** memo: tránh render lại toàn bộ danh sách khi chỉ 1 todo thay đổi */
export const TodoCard = memo(TodoCardBase);
