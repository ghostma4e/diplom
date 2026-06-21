import { useState } from 'react';

export default function AuthForm({ onLogin, onRegister }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (mode === 'register' && password !== passwordConfirm) {
      setError('Пароли не совпадают');
      return;
    }
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await onLogin(username, password);
      } else {
        await onRegister(username, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-card">
      <h1>Хакатон панель</h1>
      <p className="subtitle">Управление ИТ-соревнованиями</p>

      <div className="tabs">
        <button
          type="button"
          className={mode === 'login' ? 'active' : ''}
          onClick={() => setMode('login')}
        >
          Вход
        </button>
        <button
          type="button"
          className={mode === 'register' ? 'active' : ''}
          onClick={() => setMode('register')}
        >
          Регистрация
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <label>
          Имя пользователя
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
        </label>
        <label>
          Пароль
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </label>
        {mode === 'register' && (
          <label>
            Подтвердите пароль
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </label>
        )}

        {error && <p className="error">{error}</p>}

        <button type="submit" className="primary" disabled={submitting}>
          {submitting ? 'Загрузка...' : mode === 'login' ? 'Войти' : 'Создать аккаунт'}
        </button>
      </form>
    </div>
  );
}
