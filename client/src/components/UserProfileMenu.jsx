import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale } from '../context/LocaleContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/client.js';
import AvatarDisplay from './AvatarDisplay.jsx';
import { LANG_ICONS } from '../constants/langIcons.js';

const MAX_FILE_BYTES = 280_000;

export default function UserProfileMenu({ onLogout }) {
  const { t } = useLocale();
  const { user, refreshUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const wrapRef = useRef(null);
  const fileRef = useRef(null);

  const loadStats = useCallback(async () => {
    try {
      const data = await api.getProfileStats();
      setStats(data.stats);
      if (data.user) await refreshUser(data.user);
    } catch {
      /* offline */
    }
  }, [refreshUser]);

  useEffect(() => {
    if (user) loadStats();
  }, [user?.id, loadStats]);

  useEffect(() => {
    if (!open) return undefined;
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  async function pickAvatar(value) {
    setSaving(true);
    setError('');
    try {
      const data = await api.updateAvatar(value);
      await refreshUser(data.user);
      await loadStats();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError(t('profile.avatarFileType'));
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError(t('profile.avatarFileSize'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') pickAvatar(reader.result);
    };
    reader.onerror = () => setError(t('profile.avatarFileError'));
    reader.readAsDataURL(file);
  }

  if (!user) return null;

  return (
    <div className="profile-menu-wrap" ref={wrapRef}>
      <button
        type="button"
        className="profile-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="profile-trigger-avatar">
          <AvatarDisplay user={user} />
        </span>
        <span className="profile-trigger-name">{user.username}</span>
        <span className="profile-chevron" aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <div className="profile-dropdown">
          <div className="profile-dropdown-header">
            <div className="profile-dropdown-avatar">
              <AvatarDisplay user={user} size="lg" />
            </div>
            <div>
              <strong>{user.username}</strong>
              <span className="profile-role">
                {user.role === 'admin' ? t('auth.admin') : t('auth.participant')}
              </span>
            </div>
          </div>

          <div className="profile-stats-row">
            <div className="profile-stat">
              <span className="profile-stat-num">{stats?.eventsJoined ?? '—'}</span>
              <span className="profile-stat-label">{t('profile.events')}</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-num">{stats?.projectsSubmitted ?? '—'}</span>
              <span className="profile-stat-label">{t('profile.projects')}</span>
            </div>
          </div>

          <div className="profile-avatar-section">
            <p className="profile-section-title">{t('profile.avatar')}</p>

            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="avatar-file-input"
              onChange={handleFileChange}
            />
            <button
              type="button"
              className="btn-primary avatar-upload-btn"
              disabled={saving}
              onClick={() => fileRef.current?.click()}
            >
              {t('profile.uploadFromPc')}
            </button>

            <p className="profile-section-title subtle">{t('profile.orPickLang')}</p>
            <div className="avatar-presets lang-presets">
              {LANG_ICONS.map((icon) => (
                <button
                  key={icon.id}
                  type="button"
                  title={icon.label}
                  className={`avatar-preset-btn ${user.avatar_url === icon.src ? 'active' : ''}`}
                  onClick={() => pickAvatar(icon.src)}
                  disabled={saving}
                >
                  <img src={icon.src} alt={icon.label} />
                </button>
              ))}
            </div>
            {error && <p className="error small">{error}</p>}
          </div>

          <button
            type="button"
            className="profile-logout"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
          >
            {t('auth.logout')}
          </button>
        </div>
      )}
    </div>
  );
}
