import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SettingsProvider } from '../context/SettingsContext';
import { TodoProvider } from '../context/TodoContext';
import { ToastProvider } from '../context/ToastContext';
import { AppRoutes } from '../App';
import type { Todo } from '../types';

function renderApp(route = '/', initial: Todo[] = []) {
  return render(
    <SettingsProvider>
      <TodoProvider initial={initial}>
        <ToastProvider>
          <MemoryRouter initialEntries={[route]}>
            <AppRoutes />
          </MemoryRouter>
        </ToastProvider>
      </TodoProvider>
    </SettingsProvider>,
  );
}

const sample: Todo = {
  id: 'abc',
  title: 'Nộp bài tập',
  description: 'Nộp lên GitHub',
  priority: 'high',
  category: 'Học tập',
  dueDate: '',
  completed: false,
  createdAt: 1,
  updatedAt: 1,
};

describe('Todo App (UI)', () => {
  it('hiện empty state khi chưa có công việc', () => {
    renderApp();
    expect(screen.getByText('Chưa có công việc nào')).toBeInTheDocument();
  });

  it('thêm nhanh công việc và lưu vào localStorage', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.type(screen.getByLabelText('Thêm nhanh công việc'), 'Mua sữa{enter}');
    expect(screen.getByRole('link', { name: 'Mua sữa' })).toBeInTheDocument();
    expect(localStorage.getItem('todo-app:todos')).toContain('Mua sữa');
  });

  it('báo lỗi validation khi thêm nhanh tiêu đề quá ngắn', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.type(screen.getByLabelText('Thêm nhanh công việc'), 'ab{enter}');
    expect(screen.getByRole('alert')).toHaveTextContent('ít nhất 3 ký tự');
  });

  it('đánh dấu hoàn thành và lọc theo trạng thái', async () => {
    const user = userEvent.setup();
    renderApp('/', [sample, { ...sample, id: 'x', title: 'Việc khác' }]);
    await user.click(screen.getByLabelText('Đánh dấu “Nộp bài tập” là hoàn thành'));
    await user.click(screen.getByRole('button', { name: /Đã xong/ }));
    const list = screen.getByRole('list', { name: 'Danh sách công việc' });
    expect(within(list).getByText('Nộp bài tập')).toBeInTheDocument();
    expect(within(list).queryByText('Việc khác')).not.toBeInTheDocument();
  });

  it('form thêm mới hiển thị lỗi khi submit trống', async () => {
    const user = userEvent.setup();
    renderApp('/new');
    await user.click(await screen.findByRole('button', { name: 'Lưu công việc' }));
    expect(screen.getByText('Vui lòng nhập tiêu đề.')).toBeInTheDocument();
    expect(screen.getByLabelText(/Tiêu đề/)).toHaveAttribute('aria-invalid', 'true');
  });

  it('route động /todo/:id hiển thị chi tiết', async () => {
    renderApp('/todo/abc', [sample]);
    expect(await screen.findByRole('heading', { level: 1, name: 'Nộp bài tập' })).toBeInTheDocument();
    expect(screen.getByText('Nộp lên GitHub')).toBeInTheDocument();
  });

  it('id không tồn tại hiển thị thông báo', async () => {
    renderApp('/todo/khong-co');
    expect(await screen.findByText('Không tìm thấy công việc')).toBeInTheDocument();
  });

  it('chuyển ngôn ngữ sang tiếng Anh', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole('button', { name: 'Chuyển ngôn ngữ' }));
    expect(screen.getByText('No tasks yet')).toBeInTheDocument();
  });
});
