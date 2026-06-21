import { Router } from 'express';
import { supabase } from '../config/supabase.js';

const router = Router();

router.get('/stats', async (_req, res) => {
  try {
    const [usersRes, teamsRes, projectsRes, membersRes] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('teams').select('id', { count: 'exact', head: true }),
      supabase.from('projects').select('id', { count: 'exact', head: true }),
      supabase.from('team_members').select('id', { count: 'exact', head: true }),
    ]);

    if (usersRes.error || teamsRes.error || projectsRes.error || membersRes.error) {
      const err =
        usersRes.error || teamsRes.error || projectsRes.error || membersRes.error;
      return res.status(500).json({ error: err.message });
    }

    return res.json({
      stats: {
        usersCount: usersRes.count ?? 0,
        teamsCount: teamsRes.count ?? 0,
        projectsCount: projectsRes.count ?? 0,
        participantsCount: membersRes.count ?? 0,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/leaderboard', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select(
        `
        id,
        team_name,
        score,
        created_at,
        projects(id, project_name),
        team_members(id)
      `
      )
      .order('score', { ascending: false })
      .limit(20);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const leaderboard = (data || []).map((team, index) => ({
      rank: index + 1,
      id: team.id,
      teamName: team.team_name,
      score: team.score,
      projectsCount: team.projects?.length ?? 0,
      membersCount: team.team_members?.length ?? 0,
    }));

    return res.json({ leaderboard });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
