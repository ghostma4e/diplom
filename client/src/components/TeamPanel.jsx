import { useState } from 'react';
import { useLocale } from '../context/LocaleContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useConfirm } from '../context/ConfirmContext.jsx';

export default function TeamPanel({
  myTeam,
  members,
  onCreateTeam,
  onJoinTeam,
  onUpdateScore,
  onDisbandTeam,
}) {
  const { t } = useLocale();
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const [teamName, setTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [score, setScore] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isLeader = myTeam && user && myTeam.leader_id === user.id;
  const canDisband = myTeam && user && (isLeader || user.role === 'admin');

  async function handleCreate(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onCreateTeam(teamName);
      setTeamName('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onJoinTeam(inviteCode);
      setInviteCode('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleScoreUpdate(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onUpdateScore(Number(score));
      setScore('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDisband() {
    const ok = await confirm({
      title: t('team.disband'),
      message: t('team.disbandConfirm'),
      confirmLabel: t('team.disband'),
      variant: 'danger',
    });
    if (!ok) return;
    setError('');
    setLoading(true);
    try {
      await onDisbandTeam();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function copyInvite() {
    navigator.clipboard?.writeText(myTeam.invite_code);
  }

  if (!myTeam) {
    return (
      <div className="team-layout">
        <section className="panel team-card-empty">
          <h2>{t('team.myTeam')}</h2>
          <p className="team-hint">{t('team.noTeamHint')}</p>
          {error && <p className="error">{error}</p>}
          <div className="team-dual-forms">
            <form onSubmit={handleCreate} className="team-form-block">
              <h3>{t('team.create')}</h3>
              <input
                placeholder={t('team.namePh')}
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
              />
              <button type="submit" className="btn-primary" disabled={loading}>
                {t('team.create')}
              </button>
            </form>
            <form onSubmit={handleJoin} className="team-form-block">
              <h3>{t('team.join')}</h3>
              <input
                placeholder={t('team.invitePh')}
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                required
              />
              <button type="submit" className="btn-outline" disabled={loading}>
                {t('team.join')}
              </button>
            </form>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="team-layout">
      <section className="panel team-card-active">
        <div className="team-card-header">
          <div>
            <span className="team-label">{t('team.myTeam')}</span>
            <h2 className="team-name">{myTeam.team_name}</h2>
          </div>
          <div className="team-score-badge">
            <span>{t('team.points')}</span>
            <strong>{myTeam.score}</strong>
          </div>
        </div>

        <div className="invite-box">
          <span className="invite-label">{t('team.inviteCode')}</span>
          <div className="invite-row">
            <code>{myTeam.invite_code}</code>
            <button type="button" className="btn-outline small-btn" onClick={copyInvite}>
              {t('team.copy')}
            </button>
          </div>
        </div>

        <div className="members-section">
          <h3>{t('team.members')}</h3>
          <ul className="member-chips">
            {(members || []).map((m) => (
              <li key={m.user_id} className={m.user_id === myTeam.leader_id ? 'leader' : ''}>
                {m.users?.username || m.user_id}
                {m.user_id === myTeam.leader_id && (
                  <span className="leader-tag">{t('team.leader')}</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {error && <p className="error">{error}</p>}

        {(isLeader || user?.role === 'admin') && (
          <form onSubmit={handleScoreUpdate} className="score-form">
            <label>
              {t('team.scorePh')}
              <input
                type="number"
                min="0"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="0"
              />
            </label>
            <button type="submit" className="btn-primary" disabled={loading}>
              {t('team.updateScore')}
            </button>
          </form>
        )}

        {canDisband && (
          <button
            type="button"
            className="btn-danger"
            onClick={handleDisband}
            disabled={loading}
          >
            {t('team.disband')}
          </button>
        )}
      </section>
    </div>
  );
}
