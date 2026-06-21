import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';
import TeamPanel from '../components/TeamPanel.jsx';
import GuestBanner from '../components/GuestBanner.jsx';
import { useLocale } from '../context/LocaleContext.jsx';

export default function TeamPage({ isGuest, user, onRequestLogin }) {
  const { t } = useLocale();
  const [myTeam, setMyTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [error, setError] = useState('');

  const loadTeam = useCallback(async () => {
    if (isGuest) {
      setMyTeam(null);
      setMembers([]);
      return;
    }
    try {
      const teamData = await api.getMyTeam();
      setMyTeam(teamData.team);
      setMembers(teamData.members || []);
    } catch (err) {
      setError(err.message);
    }
  }, [isGuest]);

  useEffect(() => {
    loadTeam();
  }, [loadTeam, user]);

  return (
    <div className="page">
      <header className="page-header">
        <h1>{t('team.title')}</h1>
        <p>{t('team.subtitle')}</p>
        {error && <p className="error inline">{error}</p>}
      </header>

      {isGuest ? (
        <GuestBanner onLogin={onRequestLogin} />
      ) : (
        <TeamPanel
          myTeam={myTeam}
          members={members}
          onCreateTeam={async (name) => {
            await api.createTeam(name);
            await loadTeam();
          }}
          onJoinTeam={async (code) => {
            await api.joinTeam(code);
            await loadTeam();
          }}
          onUpdateScore={async (score) => {
            if (!myTeam) return;
            await api.updateTeamScore(myTeam.id, score);
            await loadTeam();
          }}
          onDisbandTeam={async () => {
            await api.disbandTeam();
            await loadTeam();
          }}
        />
      )}
    </div>
  );
}
