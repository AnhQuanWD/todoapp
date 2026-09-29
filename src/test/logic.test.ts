import { describe, expect, it } from 'vitest';
import { todoReducer } from '../utils/todoReducer';
import { validateTodo } from '../utils/validation';
import { getStats, isOverdue, queryTodos } from '../utils/todoQuery';
import type { Todo, TodoInput } from '../types';

const input = (over: Partial<TodoInput> = {}): TodoInput => ({
  title: 'Học React',
  description: '',
  priority: 'medium',
  category: '',
  dueDate: '',
  ...over,
});

const make = (over: Partial<Todo> = {}): Todo => ({
  id: Math.random().toString(36),
  ...input(),
  completed: false,
  createdAt: 1,
  updatedAt: 1,
  ...over,
});

describe('todoReducer', () => {
  it('thêm todo mới lên đầu và trim tiêu đề', () => {
    const state = todoReducer([make({ title: 'Cũ' })], { type: 'add', payload: input({ title: '  Mới  ' }) });
    expect(state).toHaveLength(2);
    expect(state[0].title).toBe('Mới');
    expect(state[0].completed).toBe(false);
  });

  it('toggle, update, delete theo id', () => {
    const a = make({ id: 'a' });
    let state = todoReducer([a], { type: 'toggle', id: 'a' });
    expect(state[0].completed).toBe(true);
    state = todoReducer(state, { type: 'update', id: 'a', payload: { title: 'Đã sửa' } });
    expect(state[0].title).toBe('Đã sửa');
    state = todoReducer(state, { type: 'delete', id: 'a' });
    expect(state).toEqual([]);
  });

  it('clearCompleted chỉ xóa việc đã xong', () => {
    const state = todoReducer([make({ completed: true }), make()], { type: 'clearCompleted' });
    expect(state).toHaveLength(1);
    expect(state[0].completed).toBe(false);
  });

  it('reorder di chuyển phần tử', () => {
    const s = [make({ id: '1' }), make({ id: '2' }), make({ id: '3' })];
    expect(todoReducer(s, { type: 'reorder', from: 0, to: 2 }).map((t) => t.id)).toEqual(['2', '3', '1']);
  });

  it('không làm thay đổi state cũ (immutable)', () => {
    const s = [make({ id: 'x' })];
    const frozen = Object.freeze([...s]);
    expect(() => todoReducer(frozen as Todo[], { type: 'toggle', id: 'x' })).not.toThrow();
    expect(s[0].completed).toBe(false);
  });
});

describe('validateTodo', () => {
  const today = new Date('2026-09-29T10:00:00');

  it('hợp lệ với dữ liệu đúng', () => {
    expect(validateTodo(input(), today)).toEqual({});
  });

  it('báo lỗi tiêu đề trống / quá ngắn / quá dài', () => {
    expect(validateTodo(input({ title: '   ' }), today).title).toBe('err.titleRequired');
    expect(validateTodo(input({ title: 'ab' }), today).title).toBe('err.titleMin');
    expect(validateTodo(input({ title: 'a'.repeat(101) }), today).title).toBe('err.titleMax');
  });

  it('báo lỗi hạn chót trong quá khứ, cho phép hôm nay', () => {
    expect(validateTodo(input({ dueDate: '2026-09-28' }), today).dueDate).toBe('err.datePast');
    expect(validateTodo(input({ dueDate: '2026-09-29' }), today).dueDate).toBeUndefined();
  });

  it('báo lỗi mô tả quá dài', () => {
    expect(validateTodo(input({ description: 'x'.repeat(501) }), today).description).toBe('err.descMax');
  });
});

describe('queryTodos & stats', () => {
  const todos = [
    make({ id: '1', title: 'Viết báo cáo', priority: 'low', createdAt: 1 }),
    make({ id: '2', title: 'Đi chợ', priority: 'high', completed: true, createdAt: 2, category: 'Nhà' }),
    make({ id: '3', title: 'Deploy app', priority: 'medium', createdAt: 3, dueDate: '2000-01-01' }),
  ];

  it('lọc theo trạng thái', () => {
    const base = { search: '', sortBy: 'newest' as const, category: '' };
    expect(queryTodos(todos, { ...base, filter: 'active' }).map((t) => t.id)).toEqual(['1', '3']);
    expect(queryTodos(todos, { ...base, filter: 'completed' }).map((t) => t.id)).toEqual(['2']);
  });

  it('tìm kiếm không phân biệt hoa thường và lọc danh mục', () => {
    expect(queryTodos(todos, { filter: 'all', search: 'DEPLOY', sortBy: 'newest', category: '' })).toHaveLength(1);
    expect(queryTodos(todos, { filter: 'all', search: '', sortBy: 'newest', category: 'Nhà' })[0].id).toBe('2');
  });

  it('sắp xếp theo độ ưu tiên', () => {
    const r = queryTodos(todos, { filter: 'all', search: '', sortBy: 'priority', category: '' });
    expect(r.map((t) => t.priority)).toEqual(['high', 'medium', 'low']);
  });

  it('tính quá hạn và thống kê', () => {
    expect(isOverdue(todos[2])).toBe(true);
    const s = getStats(todos);
    expect(s).toMatchObject({ total: 3, completed: 1, active: 2, overdue: 1, percent: 33 });
  });
});
