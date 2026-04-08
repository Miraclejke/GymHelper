import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';

type LocationState = {
  from?: string;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as LocationState | null)?.from ?? '/';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Не удалось войти.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page center">
      <section className="card auth-card">
        <div className="card-header">
          <div>
            <h1>Вход</h1>
            <p className="muted">Вход в учебный аккаунт GymHelper через backend-сессию.</p>
          </div>
        </div>

        <form className="stack" onSubmit={handleSubmit}>
          <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Input
            label="Пароль"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {error && <div className="form-error">{error}</div>}

          <div className="page-actions">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Входим...' : 'Войти'}
            </Button>
          </div>
        </form>

        <div className="auth-footer">
          <span className="muted">Нет аккаунта?</span> <Link to="/register">Регистрация</Link>
        </div>

        <div className="auth-hint">
          <strong>Тестовый admin:</strong> admin@gymhelper.local / admin123
        </div>
      </section>
    </div>
  );
}
