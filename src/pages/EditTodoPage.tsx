import { useNavigate, useParams } from 'react-router-dom';
import { TodoForm } from '../components/TodoForm';
import { useTodos } from '../context/TodoContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { TodoNotFound } from './TodoDetailPage';

export default function EditTodoPage() {
  const { id } = useParams<{ id: string }>();
  const { todos, dispatch } = useTodos();
  const { t } = useSettings();
  const toast = useToast();
  const navigate = useNavigate();
  const todo = todos.find((x) => x.id === id);

  if (!todo) return <TodoNotFound />;

  return (
    <div className="narrow">
      <h1 className="page-title">{t('form.editTitle')}</h1>
      <div className="card">
        <TodoForm
          initial={{
            title: todo.title,
            description: todo.description,
            priority: todo.priority,
            category: todo.category,
            dueDate: todo.dueDate,
          }}
          submitLabel={t('form.update')}
          onCancel={() => navigate(-1)}
          onSubmit={(values) => {
            dispatch({ type: 'update', id: todo.id, payload: values });
            toast(t('toast.updated'));
            navigate(`/todo/${todo.id}`);
          }}
        />
      </div>
    </div>
  );
}
