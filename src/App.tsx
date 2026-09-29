import { lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { TodoProvider } from './context/TodoContext';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/Layout';
import HomePage from './pages/HomePage';

// Code splitting: các trang phụ chỉ được tải khi người dùng truy cập
const NewTodoPage = lazy(() => import('./pages/NewTodoPage'));
const TodoDetailPage = lazy(() => import('./pages/TodoDetailPage'));
const EditTodoPage = lazy(() => import('./pages/EditTodoPage'));
const StatsPage = lazy(() => import('./pages/StatsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="new" element={<NewTodoPage />} />
        <Route path="todo/:id" element={<TodoDetailPage />} />
        <Route path="todo/:id/edit" element={<EditTodoPage />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <TodoProvider>
        <ToastProvider>
          {/* basename = base của Vite, để chạy được cả trên GitHub Pages (/repo-name/) */}
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </TodoProvider>
    </SettingsProvider>
  );
}
