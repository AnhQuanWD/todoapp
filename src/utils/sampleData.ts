import type { Lang, Priority, Todo } from '../types';
import { createId } from './todoReducer';

const addDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

type Row = [string, string, Priority, string, number | null, boolean];

const DATA: Record<Lang, Row[]> = {
  vi: [
    ['Hoàn thành báo cáo Web UI', 'Viết 5–10 trang, kèm ảnh chụp màn hình và sơ đồ component.', 'high', 'Học tập', 3, false],
    ['Quay video demo 2 phút', 'Giới thiệu các tính năng chính, dark mode, responsive.', 'high', 'Học tập', 5, false],
    ['Deploy lên Vercel', '', 'medium', 'Học tập', 6, false],
    ['Đi chợ cuối tuần', 'Rau, trứng, sữa, trái cây.', 'low', 'Cá nhân', 2, false],
    ['Tập thể dục 30 phút', '', 'medium', 'Sức khỏe', null, true],
    ['Đọc 20 trang sách', '', 'low', 'Cá nhân', null, true],
  ],
  en: [
    ['Finish Web UI report', 'Write 5–10 pages with screenshots and a component diagram.', 'high', 'Study', 3, false],
    ['Record a 2-minute demo video', 'Show main features, dark mode, responsiveness.', 'high', 'Study', 5, false],
    ['Deploy to Vercel', '', 'medium', 'Study', 6, false],
    ['Weekend grocery shopping', 'Vegetables, eggs, milk, fruit.', 'low', 'Personal', 2, false],
    ['Work out for 30 minutes', '', 'medium', 'Health', null, true],
    ['Read 20 pages', '', 'low', 'Personal', null, true],
  ],
};

export function sampleTodos(lang: Lang): Todo[] {
  const now = Date.now();
  return DATA[lang].map(([title, description, priority, category, due, completed], i) => ({
    id: createId(),
    title,
    description,
    priority,
    category,
    dueDate: due === null ? '' : addDays(due),
    completed,
    createdAt: now - i * 60_000,
    updatedAt: now - i * 60_000,
  }));
}
