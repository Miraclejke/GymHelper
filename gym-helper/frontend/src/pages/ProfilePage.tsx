import { useEffect, useState } from 'react';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, changePassword, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [profileError, setProfileError] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    setName(user?.name ?? '');
  }, [user?.name]);

  if (!user) {
    return null;
  }

  const handleProfileSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setIsSavingProfile(true);
    setProfileError('');
    setProfileMessage('');

    try {
      await updateProfile({ name });
      setProfileMessage('Профиль обновлен.');
    } catch (submitError) {
      setProfileError(
        submitError instanceof Error
          ? submitError.message
          : 'Не удалось обновить профиль.',
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setIsSavingPassword(true);
    setPasswordError('');
    setPasswordMessage('');

    try {
      if (newPassword !== confirmPassword) {
        throw new Error('Подтверждение пароля не совпадает.');
      }

      await changePassword({
        currentPassword,
        newPassword,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage('Пароль обновлен.');
    } catch (submitError) {
      setPasswordError(
        submitError instanceof Error
          ? submitError.message
          : 'Не удалось изменить пароль.',
      );
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="page">
      <section className="page-hero simple">
        <div>
          <h1>Профиль</h1>
          <p className="muted">
            Управление именем, активной ролью и паролем текущего пользователя.
          </p>
        </div>
      </section>

      <Card title="Текущая сессия" subtitle="Краткая информация о пользователе.">
        <div className="list-row">
          <div className="list-row-header">
            <div>
              <div className="list-row-title">{user.name}</div>
              <div className="muted">{user.email}</div>
            </div>
            <Badge tone={user.role === 'admin' ? 'info' : 'neutral'}>
              {user.role}
            </Badge>
          </div>
        </div>
      </Card>

      <Card title="Изменить имя" subtitle="Email и роль остаются прежними.">
        <form className="stack" onSubmit={handleProfileSubmit}>
          <Input
            label="Имя"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          {profileError && <div className="form-error">{profileError}</div>}
          {profileMessage && <div className="form-success">{profileMessage}</div>}

          <div className="page-actions">
            <Button type="submit" disabled={isSavingProfile}>
              {isSavingProfile ? 'Сохраняем...' : 'Сохранить имя'}
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Сменить пароль" subtitle="Для изменения нужен текущий пароль.">
        <form className="stack" onSubmit={handlePasswordSubmit}>
          <Input
            label="Текущий пароль"
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
          <Input
            label="Новый пароль"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
          <Input
            label="Повторите новый пароль"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />

          {passwordError && <div className="form-error">{passwordError}</div>}
          {passwordMessage && <div className="form-success">{passwordMessage}</div>}

          <div className="page-actions">
            <Button type="submit" disabled={isSavingPassword}>
              {isSavingPassword ? 'Обновляем...' : 'Изменить пароль'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
