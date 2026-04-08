import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getTodayISO } from '../../utils/date';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export default function AppShell({ children }: { children: ReactNode }) {
  const today = getTodayISO();
  const { user, logout } = useAuth();

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark">GH</div>
          <div>
            <div className="brand-title">GymHelper</div>
          </div>
        </div>

        {user ? (
          <>
            <nav className="app-nav">
              <NavLink to="/" end className="nav-link">
                Дашборд
              </NavLink>
              <NavLink to="/profile" className="nav-link">
                Профиль
              </NavLink>
              <NavLink to="/plan" className="nav-link">
                План
              </NavLink>
              <NavLink to={`/workout/${today}`} className="nav-link">
                Тренировка
              </NavLink>
              <NavLink to={`/nutrition/${today}`} className="nav-link">
                Питание
              </NavLink>
              <NavLink to={`/rest/${today}`} className="nav-link">
                Отдых
              </NavLink>
              {user.role === 'admin' && (
                <NavLink to="/admin/users" className="nav-link">
                  Админ
                </NavLink>
              )}
            </nav>

            <div className="session-panel">
              <div className="session-info">
                <div className="session-name">{user.name}</div>
                <div className="session-email">{user.email}</div>
              </div>
              <Badge tone={user.role === 'admin' ? 'info' : 'neutral'}>{user.role}</Badge>
              <Button variant="ghost" onClick={() => void logout()}>
                Выйти
              </Button>
            </div>
          </>
        ) : (
          <nav className="app-nav">
            <NavLink to="/login" className="nav-link">
              Вход
            </NavLink>
            <NavLink to="/register" className="nav-link">
              Регистрация
            </NavLink>
          </nav>
        )}
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}
