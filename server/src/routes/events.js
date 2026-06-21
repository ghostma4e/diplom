import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { mapSupabaseError } from '../utils/supabaseErrors.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('hackathon_events')
      .select('id, topic, description, format_type, starts_at, ends_at, created_at')
      .order('starts_at', { ascending: true });

    if (error) {
      return res.status(500).json({ error: mapSupabaseError(error) });
    }

    return res.json({ events: data || [] });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { topic, description, formatType, startsAt, endsAt } = req.body;

    if (!topic?.trim() || !startsAt || !endsAt) {
      return res.status(400).json({ error: 'topic, startsAt and endsAt are required' });
    }

    const format = ['team', 'solo', 'mixed'].includes(formatType) ? formatType : 'team';

    if (new Date(endsAt) <= new Date(startsAt)) {
      return res.status(400).json({ error: 'endsAt must be after startsAt' });
    }

    const { data, error } = await supabase
      .from('hackathon_events')
      .insert({
        topic: topic.trim(),
        description: (description || '').trim(),
        format_type: format,
        starts_at: startsAt,
        ends_at: endsAt,
        created_by: req.user.id,
      })
      .select('id, topic, description, format_type, starts_at, ends_at, created_at')
      .single();

    if (error) {
      return res.status(500).json({ error: mapSupabaseError(error) });
    }

    return res.status(201).json({ event: data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.patch('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { topic, description, formatType, startsAt, endsAt } = req.body;
    const updates = {};

    if (topic !== undefined) updates.topic = topic.trim();
    if (description !== undefined) updates.description = description.trim();
    if (formatType && ['team', 'solo', 'mixed'].includes(formatType)) {
      updates.format_type = formatType;
    }
    if (startsAt) updates.starts_at = startsAt;
    if (endsAt) updates.ends_at = endsAt;

    const { data, error } = await supabase
      .from('hackathon_events')
      .update(updates)
      .eq('id', req.params.id)
      .select('id, topic, description, format_type, starts_at, ends_at, created_at')
      .single();

    if (error) {
      return res.status(500).json({ error: mapSupabaseError(error) });
    }

    return res.json({ event: data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/my/participations', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('event_participations')
      .select('event_id, joined_at, hackathon_events(id, topic, starts_at, ends_at)')
      .eq('user_id', req.user.id)
      .order('joined_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: mapSupabaseError(error) });
    }

    return res.json({ participations: data || [] });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/:id/participate', authMiddleware, async (req, res) => {
  try {
    const eventId = req.params.id;

    const { data: event, error: eventErr } = await supabase
      .from('hackathon_events')
      .select('id, starts_at, ends_at')
      .eq('id', eventId)
      .single();

    if (eventErr || !event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const now = Date.now();
    const start = new Date(event.starts_at).getTime();
    const end = new Date(event.ends_at).getTime();
    if (now < start || now > end) {
      return res.status(400).json({ error: 'Participation is only available during the live event' });
    }

    const { data, error } = await supabase
      .from('event_participations')
      .insert({ user_id: req.user.id, event_id: eventId })
      .select('id, event_id, joined_at')
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Already participating in this event' });
      }
      return res.status(500).json({ error: mapSupabaseError(error) });
    }

    return res.status(201).json({ participation: data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/:id/submissions', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(
        `id, project_name, description, tech_stack, github_url, team_id, event_id, created_at,
         teams(team_name),
         project_ratings(score, score_design, score_technical, score_tasks, review_note, rated_at)`
      )
      .eq('event_id', req.params.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: mapSupabaseError(error) });
    }

    const submissions = (data || []).map((row) => {
      const rating = Array.isArray(row.project_ratings)
        ? row.project_ratings[0]
        : row.project_ratings;
      const { project_ratings: _, ...rest } = row;
      return { ...rest, rating: rating || null };
    });

    return res.json({ submissions });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { error } = await supabase.from('hackathon_events').delete().eq('id', req.params.id);

    if (error) {
      return res.status(500).json({ error: mapSupabaseError(error) });
    }

    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
