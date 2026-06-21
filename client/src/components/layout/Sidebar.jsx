const NAV_ITEMS = [
  { id: 'home', labelKey: 'nav.home', icon: 'home' },
  { id: 'events', labelKey: 'nav.events', icon: 'bolt' },
  { id: 'minigames', labelKey: 'nav.minigames', icon: 'game', badgeKey: 'badge.new' },
  { id: 'projects', labelKey: 'nav.projects', icon: 'users', badgeKey: 'badge.live' },
  { id: 'ratings', labelKey: 'nav.ratings', icon: 'chart' },
  { id: 'team', labelKey: 'nav.team', icon: 'shield' },
  { id: 'docs', labelKey: 'nav.docs', icon: 'doc' },
];

function NavIcon({ type }) {
  const icons = {
    home: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z" fill="currentColor" />
      </svg>
    ),
    bolt: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill="currentColor" />
      </svg>
    ),
    game: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 8h4V4h2v4h4v2h-4v4H8v-4H4V8zm11 2h6v2h-6v-2zm2 4h6v2h-6v-2z" fill="currentColor" />
      </svg>
    ),
    users: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M16 11c1.66 0 3-1.34 3-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V20h14v-3.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V20h6v-3.5c0-2.33-4.67-3.5-7-3.5z"
          fill="currentColor"
        />
      </svg>
    ),
    chart: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 17h2v-7H3v7zm4 0h2V7H7v10zm4 0h2v-4h-2v4zm4 0h2V4h-2v13zm4 0h2v-6h-2v6z" fill="currentColor" />
      </svg>
    ),
    shield: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2l8 3v6c0 5.25-3.5 9.74-8 11-4.5-1.26-8-5.75-8-11V5l8-3z" fill="currentColor" />
      </svg>
    ),
    doc: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM8 12h8v2H8v-2zm0 4h8v2H8v-2z"
          fill="currentColor"
        />
      </svg>
    ),
  };
  return <span className="nav-icon">{icons[type]}</span>;
}

export default function Sidebar({
  activePage,
  onNavigate,
  user,
  onOpenRegister,
  onOpenLogin,
  onLogout,
  t,
  languageSwitcher,
}) {
  return (
    <aside className="sidebar">
      <button type="button" className="sidebar-logo" onClick={() => onNavigate('home')}>
        <span className="logo-main">HACKATHON</span>
        <span className="logo-year">2026</span>
      </button>

      {languageSwitcher}

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <NavIcon type={item.icon} />
            <span className="nav-label">{t(item.labelKey)}</span>
            {item.badgeKey && <span className="nav-badge">{t(item.badgeKey)}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-auth">
        {user ? (
          <>
            <p className="sidebar-user">
              {user.role === 'admin' ? t('auth.admin') : t('auth.participant')}:{' '}
              <strong>{user.username}</strong>
            </p>
            <button type="button" className="btn-outline" onClick={onLogout}>
              {t('auth.logout')}
            </button>
          </>
        ) : (
          <>
            <p className="sidebar-guest">{t('auth.guestMode')}</p>
            <button type="button" className="btn-primary" onClick={onOpenRegister}>
              {t('auth.createAccount')}
            </button>
            <button type="button" className="btn-outline" onClick={onOpenLogin}>
              {t('auth.login')}
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
