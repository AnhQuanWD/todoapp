import type { TodoInput } from '../types';

export type FormErrors = Partial<Record<keyof TodoInput, string>>;

export const LIMITS = { titleMin: 3, titleMax: 100, descMax: 500, categoryMax: 30 } as const;

/** Trả về object lỗi, key là tên field, value là key i18n. Rỗng = hợp lệ. */
export function validateTodo(input: TodoInput, today = new Date()): FormErrors {
  const errors: FormErrors = {};
  const title = input.title.trim();

  if (!title) errors.title = 'err.titleRequired';
  else if (title.length < LIMITS.titleMin) errors.title = 'err.titleMin';
  else if (title.length > LIMITS.titleMax) errors.title = 'err.titleMax';

  if (input.description.length > LIMITS.descMax) errors.description = 'err.descMax';

  if (input.category.trim().length > LIMITS.categoryMax) errors.category = 'err.categoryMax';

  if (input.dueDate) {
    const due = new Date(`${input.dueDate}T23:59:59`);
    if (Number.isNaN(due.getTime())) errors.dueDate = 'err.dateInvalid';
    else {
      const start = new Date(today);
      start.setHours(0, 0, 0, 0);
      if (due < start) errors.dueDate = 'err.datePast';
    }
  }
  return errors;
}
