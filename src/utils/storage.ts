/** Đọc/ghi localStorage an toàn (không crash khi private mode hoặc dữ liệu hỏng). */
export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* bỏ qua: storage đầy hoặc bị chặn */
  }
}

export const STORAGE_KEYS = {
  todos: 'todo-app:todos',
  settings: 'todo-app:settings',
} as const;
