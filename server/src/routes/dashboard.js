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
      .select(`
        id,
        team_name,
        created_at,
        projects(id, project_name, project_ratings(score)),
        team_members(id)
      `)
      .limit(20);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const leaderboard = (data || [])
      .map((team) => {
        const juryScore = (team.projects || []).reduce((sum, p) => {
          const rating = Array.isArray(p.project_ratings)
            ? p.project_ratings[0]
            : p.project_ratings;
          return sum + (rating?.score ?? 0);
        }, 0);
        return {
          id: team.id,
          teamName: team.team_name,
          score: juryScore,
          projectsCount: team.projects?.length ?? 0,
          membersCount: team.team_members?.length ?? 0,
        };
      })
      .sort((a, b) => b.score - a.score)
      .map((team, index) => ({ rank: index + 1, ...team }));

    return res.json({ leaderboard });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
