import Sidebar from './Sidebar.jsx';
import LanguageSwitcher from '../LanguageSwitcher.jsx';
import PageFooter from '../PageFooter.jsx';
import UserProfileMenu from '../UserProfileMenu.jsx';
import { useLocale } from '../../context/LocaleContext.jsx';

export default function AppLayout({
  activePage,
  onNavigate,
  user,
  onOpenRegister,
  onOpenLogin,
  onLogout,
  children,
}) {
  const { t } = useLocale();

  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        onNavigate={onNavigate}
        user={user}
        onOpenRegister={onOpenRegister}
        onOpenLogin={onOpenLogin}
        onLogout={onLogout}
        t={t}
        languageSwitcher={<LanguageSwitcher />}
      />
      <main className="main-content">
        {user ? (
          <div className="main-profile-corner">
            <UserProfileMenu onLogout={onLogout} />
          </div>
        ) : null}
        <div className="bg-orbs" aria-hidden="true">
          <span className="orb orb-1" />
          <span className="orb orb-2" />
          <span className="orb orb-3" />
        </div>
        <div className="main-inner page-fade" key={activePage}>
          {children}
          <PageFooter />
        </div>
      </main>
    </div>
  );
}
