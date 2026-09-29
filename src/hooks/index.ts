import { useCallback, useEffect, useState } from 'react';
import type { Todo } from '../types';
import { useTodos } from '../context/TodoContext';
import { useToast } from '../context/ToastContext';
import { useSettings } from '../context/SettingsContext';

/** Trì hoãn cập nhật giá trị (dùng cho ô tìm kiếm). */
export function useDebounce<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/** Trả về true khi trang đã cuộn quá `offset` px (dùng cho header đổ bóng, nút lên đầu trang). */
export function useScrolled(offset = 8): boolean {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > offset);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [offset]);
  return scrolled;
}

/** Xóa công việc và hiện toast có nút "Hoàn tác". */
export function useDeleteWithUndo() {
  const { todos, dispatch } = useTodos();
  const toast = useToast();
  const { t } = useSettings();

  return useCallback(
    (todo: Todo) => {
      const snapshot = todos;
      dispatch({ type: 'delete', id: todo.id });
      toast(t('toast.deleted'), {
        label: t('toast.undo'),
        onClick: () => dispatch({ type: 'replace', todos: snapshot }),
      });
    },
    [todos, dispatch, toast, t],
  );
}
