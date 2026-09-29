import { useNavigate } from 'react-router-dom';
import { TodoForm } from '../components/TodoForm';
import { useTodos } from '../context/TodoContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';

export default function NewTodoPage() {
  const { dispatch } = useTodos();
  const { t } = useSettings();
  const toast = useToast();
  const navigate = useNavigate();

  return (
    <div className="narrow">
      <h1 className="page-title">{t('form.newTitle')}</h1>
      <div className="card">
        <TodoForm
          submitLabel={t('form.save')}
          onCancel={() => navigate(-1)}
          onSubmit={(values) => {
            dispatch({ type: 'add', payload: values });
            toast(t('toast.added'));
            navigate('/');
          }}
        />
      </div>
    </div>
  );
}
