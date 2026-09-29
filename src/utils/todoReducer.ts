import type { Todo, TodoInput } from '../types';

export type TodoAction =
  | { type: 'add'; payload: TodoInput }
  | { type: 'update'; id: string; payload: Partial<TodoInput> }
  | { type: 'toggle'; id: string }
  | { type: 'delete'; id: string }
  | { type: 'clearCompleted' }
  | { type: 'toggleAll'; completed: boolean }
  | { type: 'reorder'; from: number; to: number }
  | { type: 'replace'; todos: Todo[] };

export const createId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

/** Reducer thuần (pure function) — dễ test, không có side effect. */
export function todoReducer(state: Todo[], action: TodoAction): Todo[] {
  switch (action.type) {
    case 'add': {
      const now = Date.now();
      const todo: Todo = {
        id: createId(),
        ...action.payload,
        title: action.payload.title.trim(),
        description: action.payload.description.trim(),
        completed: false,
        createdAt: now,
        updatedAt: now,
      };
      return [todo, ...state];
    }
    case 'update':
      return state.map((t) =>
        t.id === action.id ? { ...t, ...action.payload, updatedAt: Date.now() } : t,
      );
    case 'toggle':
      return state.map((t) =>
        t.id === action.id ? { ...t, completed: !t.completed, updatedAt: Date.now() } : t,
      );
    case 'delete':
      return state.filter((t) => t.id !== action.id);
    case 'clearCompleted':
      return state.filter((t) => !t.completed);
    case 'toggleAll':
      return state.map((t) => ({ ...t, completed: action.completed }));
    case 'reorder': {
      const next = [...state];
      const [moved] = next.splice(action.from, 1);
      if (!moved) return state;
      next.splice(action.to, 0, moved);
      return next;
    }
    case 'replace':
      return action.todos;
    default:
      return state;
  }
}
