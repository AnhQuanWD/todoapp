export type Priority = 'low' | 'medium' | 'high';
export type Filter = 'all' | 'active' | 'completed';
export type SortBy = 'newest' | 'oldest' | 'dueDate' | 'priority';
export type Theme = 'light' | 'dark' | 'system';
export type Lang = 'vi' | 'en';

export interface Todo {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  category: string;
  dueDate: string; // yyyy-mm-dd hoặc ''
  completed: boolean;
  createdAt: number;
  updatedAt: number;
}

export type TodoInput = Pick<Todo, 'title' | 'description' | 'priority' | 'category' | 'dueDate'>;
