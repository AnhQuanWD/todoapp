import type { Filter, Priority, SortBy, Todo } from '../types';

const PRIORITY_WEIGHT: Record<Priority, number> = { high: 3, medium: 2, low: 1 };

export interface QueryOptions {
  filter: Filter;
  search: string;
  sortBy: SortBy;
  category: string; // '' = tất cả
}

export function queryTodos(todos: Todo[], { filter, search, sortBy, category }: QueryOptions): Todo[] {
  const q = search.trim().toLowerCase();
  const result = todos.filter((t) => {
    if (filter === 'active' && t.completed) return false;
    if (filter === 'completed' && !t.completed) return false;
    if (category && t.category !== category) return false;
    if (q && !`${t.title} ${t.description}`.toLowerCase().includes(q)) return false;
    return true;
  });

  const sorted = [...result];
  switch (sortBy) {
    case 'oldest':
      sorted.sort((a, b) => a.createdAt - b.createdAt);
      break;
    case 'dueDate':
      sorted.sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'));
      break;
    case 'priority':
      sorted.sort((a, b) => PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]);
      break;
    case 'newest':
    default:
      // giữ thứ tự thủ công của người dùng (mới nhất ở trên, có thể kéo thả)
      break;
  }
  return sorted;
}

export function isOverdue(todo: Todo, now = new Date()): boolean {
  if (!todo.dueDate || todo.completed) return false;
  return new Date(`${todo.dueDate}T23:59:59`) < now;
}

export function getStats(todos: Todo[]) {
  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  const overdue = todos.filter((t) => isOverdue(t)).length;
  const byPriority = (['high', 'medium', 'low'] as Priority[]).map((p) => ({
    priority: p,
    total: todos.filter((t) => t.priority === p).length,
    done: todos.filter((t) => t.priority === p && t.completed).length,
  }));
  const categories = new Map<string, number>();
  todos.forEach((t) => {
    const c = t.category || '—';
    categories.set(c, (categories.get(c) ?? 0) + 1);
  });
  return {
    total,
    completed,
    active: total - completed,
    overdue,
    percent: total ? Math.round((completed / total) * 100) : 0,
    byPriority,
    byCategory: [...categories.entries()].sort((a, b) => b[1] - a[1]),
  };
}
