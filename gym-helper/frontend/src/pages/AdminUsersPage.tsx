import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../api/adminApi';
import type { AdminUser } from '../api/types';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Select from '../components/ui/Select';
import StatusPanel from '../components/ui/StatusPanel';

type LoadStatus = 'loading' | 'error' | 'ready';

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [draftRoles, setDraftRoles] = useState<Record<string, 'user' | 'admin'>>(
    {},
  );
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [savingUserId, setSavingUserId] = useState('');

  const roleOptions = useMemo(
    () => [
      { value: 'user', label: 'User' },
      { value: 'admin', label: 'Admin' },
    ],
    [],
  );

  const applyUsers = (nextUsers: AdminUser[]) => {
    setUsers(nextUsers);
    setDraftRoles(
      nextUsers.reduce<Record<string, 'user' | 'admin'>>(
        (accumulator, entry) => {
          accumulator[entry.id] = entry.role;
          return accumulator;
        },
        {},
      ),
    );
  };

  const loadUsers = async () => {
    setStatus('loading');
    setError('');

    try {
      const nextUsers = await adminApi.listUsers();
      applyUsers(nextUsers);
      setStatus('ready');
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Не удалось загрузить пользователей.',
      );
      setStatus('error');
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const handleRoleSave = async (entry: AdminUser) => {
    setSavingUserId(entry.id);
    setError('');
    setMessage('');

    try {
      const updatedUser = await adminApi.updateUserRole(entry.id, {
        role: draftRoles[entry.id] ?? entry.role,
      });

      const nextUsers = users.map((currentEntry) =>
        currentEntry.id === updatedUser.id ? updatedUser : currentEntry,
      );
      applyUsers(nextUsers);
      setMessage(`Роль пользователя ${updatedUser.email} обновлена.`);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Не удалось обновить роль пользователя.',
      );
    } finally {
      setSavingUserId('');
    }
  };

  return (
    <div className="page">
      <section className="page-hero simple">
        <div>
          <h1>Администрирование пользователей</h1>
          <p className="muted">
            Admin-only раздел для просмотра пользователей и смены ролей.
          </p>
        </div>
        <div className="page-actions">
          <Button variant="ghost" onClick={() => void loadUsers()}>
            Обновить список
          </Button>
        </div>
      </section>

      {error && status !== 'error' && <div className="form-error">{error}</div>}
      {message && <div className="form-success">{message}</div>}

      {status === 'loading' && (
        <StatusPanel
          title="Загружаем пользователей"
          description="Проверяем admin-сессию и читаем список с backend."
          variant="loading"
        />
      )}

      {status === 'error' && (
        <StatusPanel
          title="Не удалось открыть admin-раздел"
          description={error}
          variant="error"
        />
      )}

      {status === 'ready' && (
        <Card
          title="Пользователи"
          subtitle={`Всего записей: ${users.length}. Текущий администратор: ${
            user?.email ?? '—'
          }.`}
        >
          <div className="list">
            {users.map((entry) => {
              const isCurrentUser = entry.id === user?.id;
              const isSaving = savingUserId === entry.id;

              return (
                <div className="list-row" key={entry.id}>
                  <div className="list-row-header">
                    <div>
                      <div className="list-row-title">{entry.name}</div>
                      <div className="muted">{entry.email}</div>
                      <div className="muted">
                        Создан: {new Date(entry.createdAt).toLocaleString('ru-RU')}
                      </div>
                    </div>
                    <Badge tone={entry.role === 'admin' ? 'info' : 'neutral'}>
                      {entry.role}
                    </Badge>
                  </div>

                  <div className="form-grid">
                    <Select
                      label="Роль"
                      options={roleOptions}
                      value={draftRoles[entry.id] ?? entry.role}
                      disabled={isCurrentUser || isSaving}
                      onChange={(event) =>
                        setDraftRoles((currentValue) => ({
                          ...currentValue,
                          [entry.id]: event.target.value as 'user' | 'admin',
                        }))
                      }
                    />

                    <label className="field">
                      <span className="field-label">Действие</span>
                      <Button
                        type="button"
                        disabled={isCurrentUser || isSaving}
                        onClick={() => void handleRoleSave(entry)}
                      >
                        {isSaving ? 'Сохраняем...' : 'Сохранить роль'}
                      </Button>
                    </label>
                  </div>

                  {isCurrentUser && (
                    <div className="muted">
                      Для безопасности собственную роль из интерфейса менять нельзя.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
