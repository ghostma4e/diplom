import { useEffect, useState } from 'react';
import { useLocale } from '../context/LocaleContext.jsx';

export default function AuthModal({ mode, onClose, onLogin, onRegister }) {
  const { t } = useLocale();
  const [formMode, setFormMode] = useState(mode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setFormMode(mode);
    setError('');
  }, [mode]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (formMode === 'register' && password !== passwordConfirm) {
      setError(t('auth.passwordMismatch'));
      return;
    }
    setSubmitting(true);
    try {
      if (formMode === 'login') {
        await onLogin(username, password);
      } else {
        await onRegister(username, password);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog">
        <button type="button" className="modal-close" onClick={onClose} aria-label={t('auth.close')}>
          ×
        </button>
        <h2>{formMode === 'login' ? t('auth.loginTitle') : t('auth.registerTitle')}</h2>
        <p className="modal-hint">{t('auth.hint')}</p>

        <div className="tabs">
          <button
            type="button"
            className={formMode === 'login' ? 'active' : ''}
            onClick={() => setFormMode('login')}
          >
            {t('auth.login')}
          </button>
          <button
            type="button"
            className={formMode === 'register' ? 'active' : ''}
            onClick={() => setFormMode('register')}
          >
            {t('auth.register')}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            {t('auth.username')}
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </label>
          <label>
            {t('auth.password')}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </label>
          {formMode === 'register' && (
            <label>
              {t('auth.passwordConfirm')}
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                minLength={6}
              />
            </label>
          )}
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn-primary full" disabled={submitting}>
            {submitting
              ? t('auth.loading')
              : formMode === 'login'
                ? t('auth.login')
                : t('auth.create')}
          </button>
        </form>
      </div>
    </div>
  );
}
