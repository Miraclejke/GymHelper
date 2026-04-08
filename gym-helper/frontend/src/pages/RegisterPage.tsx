import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await register({ name, email, password });
      navigate('/', { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Не удалось зарегистрироваться.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page center">
      <section className="card auth-card">
        <div className="card-header">
          <div>
            <h1>Регистрация</h1>
            <p className="muted">Регистрация нового пользователя с сохранением backend-сессии.</p>
          </div>
        </div>

        <form className="stack" onSubmit={handleSubmit}>
          <Input label="Имя" value={name} onChange={(event) => setName(event.target.value)} />
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
              {isSubmitting ? 'Создаем...' : 'Создать аккаунт'}
            </Button>
          </div>
        </form>

        <div className="auth-footer">
          <span className="muted">Уже есть аккаунт?</span> <Link to="/login">Войти</Link>
        </div>
      </section>
    </div>
  );
}
