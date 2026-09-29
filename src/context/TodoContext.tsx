import { createContext, useContext, useEffect, useMemo, useReducer, type Dispatch, type ReactNode } from 'react';
import type { Todo } from '../types';
import { todoReducer, type TodoAction } from '../utils/todoReducer';
import { loadJSON, saveJSON, STORAGE_KEYS } from '../utils/storage';

interface TodoContextValue {
  todos: Todo[];
  dispatch: Dispatch<TodoAction>;
  categories: string[];
}

const TodoContext = createContext<TodoContextValue | null>(null);

export function TodoProvider({ children, initial }: { children: ReactNode; initial?: Todo[] }) {
  const [todos, dispatch] = useReducer(todoReducer, initial, (init) =>
    init ?? loadJSON<Todo[]>(STORAGE_KEYS.todos, []),
  );

  // Đồng bộ state -> localStorage mỗi khi todos thay đổi
  useEffect(() => {
    saveJSON(STORAGE_KEYS.todos, todos);
  }, [todos]);

  // Đồng bộ giữa nhiều tab trình duyệt
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.todos && e.newValue) {
        try {
          dispatch({ type: 'replace', todos: JSON.parse(e.newValue) });
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const categories = useMemo(
    () => [...new Set(todos.map((t) => t.category).filter(Boolean))].sort(),
    [todos],
  );

  const value = useMemo(() => ({ todos, dispatch, categories }), [todos, categories]);
  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTodos() {
  const ctx = useContext(TodoContext);
  if (!ctx) throw new Error('useTodos phải dùng bên trong <TodoProvider>');
  return ctx;
}
