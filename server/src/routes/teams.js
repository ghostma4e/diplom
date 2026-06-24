import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { authMiddleware } from '../middleware/auth.js';
import { generateInviteCode } from '../utils/inviteCode.js';
import { mapSupabaseError } from '../utils/supabaseErrors.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('id, team_name, invite_code, score, created_at, leader_id')
      .order('score', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ teams: data || [] });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { teamName } = req.body;

    if (!teamName || !teamName.trim()) {
      return res.status(400).json({ error: 'teamName is required' });
    }

    const { data: existingMember } = await supabase
      .from('team_members')
      .select('id')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (existingMember) {
      return res.status(400).json({ error: 'You are already in a team' });
    }

    const inviteCode = generateInviteCode();

    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({
        team_name: teamName.trim(),
        invite_code: inviteCode,
        leader_id: req.user.id,
      })
      .select('id, team_name, invite_code, leader_id, score, created_at')
      .single();

    if (teamError) {
      return res.status(500).json({ error: mapSupabaseError(teamError) });
    }

    const { error: memberError } = await supabase.from('team_members').insert({
      team_id: team.id,
      user_id: req.user.id,
    });

    if (memberError) {
      await supabase.from('teams').delete().eq('id', team.id);
      return res.status(500).json({ error: mapSupabaseError(memberError) });
    }

    return res.status(201).json({ team });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/join', authMiddleware, async (req, res) => {
  try {
    const { inviteCode } = req.body;

    if (!inviteCode) {
      return res.status(400).json({ error: 'inviteCode is required' });
    }

    const { data: existingMember } = await supabase
      .from('team_members')
      .select('id')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (existingMember) {
      return res.status(400).json({ error: 'You are already in a team' });
    }

    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id, team_name, invite_code, leader_id, score, created_at')
      .eq('invite_code', inviteCode.trim().toUpperCase())
      .single();

    if (teamError || !team) {
      return res.status(404).json({ error: 'Invalid invite code' });
    }

    const { error: joinError } = await supabase.from('team_members').insert({
      team_id: team.id,
      user_id: req.user.id,
    });

    if (joinError) {
      return res.status(500).json({ error: joinError.message });
    }

    return res.json({ team });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/my', authMiddleware, async (req, res) => {
  try {
    const { data: membership, error: memberError } = await supabase
      .from('team_members')
      .select('team_id, joined_at')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (memberError) {
      return res.status(500).json({ error: memberError.message });
    }

    if (!membership) {
      return res.json({ team: null });
    }

    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id, team_name, invite_code, leader_id, score, created_at')
      .eq('id', membership.team_id)
      .single();

    if (teamError) {
      return res.status(500).json({ error: teamError.message });
    }

    const { data: members } = await supabase
      .from('team_members')
      .select('user_id, joined_at, users(id, username)')
      .eq('team_id', team.id);

    return res.json({ team, members: members || [] });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/score', authMiddleware, async (req, res) => {
  try {
    const { score } = req.body;
    const teamId = req.params.id;

    if (typeof score !== 'number' || score < 0) {
      return res.status(400).json({ error: 'Valid score (number >= 0) is required' });
    }

    const { data: team } = await supabase
      .from('teams')
      .select('leader_id')
      .eq('id', teamId)
      .single();

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (req.user.role !== 'admin') {
  return res.status(403).json({ error: 'Only admin can update score' });
}

    const { data, error } = await supabase
      .from('teams')
      .update({ score })
      .eq('id', teamId)
      .select('id, team_name, score')
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ team: data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.delete('/my', authMiddleware, async (req, res) => {
  try {
    const { data: membership } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (!membership) {
      return res.status(404).json({ error: 'You are not in a team' });
    }

    const { data: team } = await supabase
      .from('teams')
      .select('leader_id')
      .eq('id', membership.team_id)
      .single();

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (team.leader_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only team leader or admin can disband the team' });
    }

    const { error } = await supabase.from('teams').delete().eq('id', membership.team_id);

    if (error) {
      return res.status(500).json({ error: mapSupabaseError(error) });
    }

    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
