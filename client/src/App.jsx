import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { useLocale } from './context/LocaleContext.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import AuthModal from './components/AuthModal.jsx';
import { api } from './api/client.js';
import HomePage from './pages/HomePage.jsx';
import EventsPage from './pages/EventsPage.jsx';
import MiniGamesPage from './pages/MiniGamesPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import RatingsPage from './pages/RatingsPage.jsx';
import TeamPage from './pages/TeamPage.jsx';
import DocsPage from './pages/DocsPage.jsx';

export default function App() {
  const { user, loading, login, register, logout } = useAuth();
  const { t } = useLocale();
  const [activePage, setActivePage] = useState('home');
  const [authModal, setAuthModal] = useState(null);
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  const isGuest = !user;

  const loadPublicData = useCallback(async () => {
    try {
      const [statsData, boardData] = await Promise.all([
        api.getStats(),
        api.getLeaderboard(),
      ]);
      setStats(statsData.stats);
      setLeaderboard(boardData.leaderboard);
    } catch {
      /* API may be offline */
    }
  }, []);

  useEffect(() => {
    if (!loading) loadPublicData();
  }, [loading, loadPublicData]);

  function renderPage() {
    switch (activePage) {
      case 'home':
        return <HomePage stats={stats} leaderboard={leaderboard} />;
      case 'events':
        return (
          <EventsPage
            isGuest={isGuest}
            isAdmin={user?.role === 'admin'}
            onRequestLogin={() => setAuthModal('login')}
            onParticipate={() => setActivePage('team')}
          />
        );
      case 'minigames':
        return <MiniGamesPage />;
      case 'projects':
        return <ProjectsPage isGuest={isGuest} onRequestLogin={() => setAuthModal('login')} />;
      case 'ratings':
        return <RatingsPage stats={stats} leaderboard={leaderboard} />;
      case 'team':
        return (
          <TeamPage
            isGuest={isGuest}
            user={user}
            onRequestLogin={() => setAuthModal('login')}
          />
        );
      case 'docs':
        return <DocsPage />;
      default:
        return <HomePage stats={stats} leaderboard={leaderboard} />;
    }
  }

  if (loading) {
    return <div className="loading-screen">{t('app.loading')}</div>;
  }

  return (
    <>
      <AppLayout
        activePage={activePage}
        onNavigate={setActivePage}
        user={user}
        onOpenRegister={() => setAuthModal('register')}
        onOpenLogin={() => setAuthModal('login')}
        onLogout={logout}
      >
        {renderPage()}
      </AppLayout>

      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => setAuthModal(null)}
          onLogin={login}
          onRegister={register}
        />
      )}
    </>
  );
}
