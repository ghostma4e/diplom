import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { mapSupabaseError } from '../utils/supabaseErrors.js';

const router = Router();

function parseTechStack(techStack) {
  if (Array.isArray(techStack)) {
    return techStack.map((t) => String(t).trim()).filter(Boolean);
  }
  if (typeof techStack === 'string') {
    return techStack
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
}

router.get('/', async (req, res) => {
  try {
    const techFilter = req.query.tech
      ? String(req.query.tech)
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : null;

    let query = supabase
      .from('projects')
      .select(
        `id, project_name, description, tech_stack, github_url, team_id, event_id, created_at,
         teams(id, team_name, score),
         hackathon_events(id, topic),
         project_ratings(score, score_design, score_technical, score_tasks, review_note)`
      )
      .order('created_at', { ascending: false });

    if (techFilter && techFilter.length > 0) {
      query = query.overlaps('tech_stack', techFilter);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ error: mapSupabaseError(error) });
    }

    const projects = (data || []).map((row) => {
      const rating = Array.isArray(row.project_ratings)
        ? row.project_ratings[0]
        : row.project_ratings;
      const { project_ratings: _, ...rest } = row;
      return { ...rest, rating: rating || null };
    });

    return res.json({ projects });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/tech-tags', async (_req, res) => {
  try {
    const { data, error } = await supabase.from('projects').select('tech_stack');

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const tagSet = new Set();
    (data || []).forEach((row) => {
      (row.tech_stack || []).forEach((tag) => tagSet.add(tag));
    });

    return res.json({ tags: [...tagSet].sort() });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { projectName, description, techStack, githubUrl, eventId } = req.body;

    if (!projectName || !description) {
      return res.status(400).json({ error: 'projectName and description are required' });
    }

    const stack = parseTechStack(techStack);
    if (stack.length === 0) {
      return res.status(400).json({ error: 'At least one technology in techStack is required' });
    }

    const { data: membership } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (!membership) {
      return res.status(400).json({ error: 'Join or create a team first' });
    }

    let linkedEventId = null;
    if (eventId) {
      const { data: part } = await supabase
        .from('event_participations')
        .select('id')
        .eq('user_id', req.user.id)
        .eq('event_id', eventId)
        .maybeSingle();

      if (!part) {
        return res.status(400).json({ error: 'Join the event before submitting a project to it' });
      }
      linkedEventId = eventId;
    }

    const github = githubUrl?.trim() || null;
    if (github && !/^https?:\/\//i.test(github)) {
      return res.status(400).json({ error: 'githubUrl must start with http:// or https://' });
    }

    const { data, error } = await supabase
      .from('projects')
      .insert({
        project_name: projectName.trim(),
        description: description.trim(),
        tech_stack: stack,
        github_url: github,
        team_id: membership.team_id,
        event_id: linkedEventId,
        submitted_by: req.user.id,
      })
      .select(
        'id, project_name, description, tech_stack, github_url, team_id, event_id, created_at'
      )
      .single();

    if (error) {
      return res.status(500).json({ error: mapSupabaseError(error) });
    }

    return res.status(201).json({ project: data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/event', authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.body;
    const projectId = req.params.id;

    const { data: project, error: projErr } = await supabase
      .from('projects')
      .select('id, team_id')
      .eq('id', projectId)
      .single();

    if (projErr || !project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const { data: membership } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', req.user.id)
      .eq('team_id', project.team_id)
      .maybeSingle();

    if (!membership) {
      return res.status(403).json({ error: 'Only team members can link this project to an event' });
    }

    if (!eventId) {
      const { data, error } = await supabase
        .from('projects')
        .update({ event_id: null })
        .eq('id', projectId)
        .select('id, project_name, event_id')
        .single();

      if (error) {
        return res.status(500).json({ error: mapSupabaseError(error) });
      }
      return res.json({ project: data });
    }

    const { data: part } = await supabase
      .from('event_participations')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('event_id', eventId)
      .maybeSingle();

    if (!part) {
      return res.status(400).json({ error: 'Join the event before linking a project' });
    }

    const { data, error } = await supabase
      .from('projects')
      .update({ event_id: eventId })
      .eq('id', projectId)
      .select('id, project_name, event_id, hackathon_events(id, topic)')
      .single();

    if (error) {
      return res.status(500).json({ error: mapSupabaseError(error) });
    }

    return res.json({ project: data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

function parseCriterion(value, name) {
  if (value === undefined || value === null) {
    return { error: `${name} is required` };
  }
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0 || n > 100) {
    return { error: `${name} must be an integer from 0 to 100` };
  }
  return { value: n };
}

router.patch('/:id/rating', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { score, scoreDesign, scoreTechnical, scoreTasks, reviewNote } = req.body;
    const projectId = req.params.id;

    let design;
    let technical;
    let tasks;

    if (scoreDesign !== undefined) {
      const d = parseCriterion(scoreDesign, 'scoreDesign');
      if (d.error) return res.status(400).json({ error: d.error });
      design = d.value;
      const t = parseCriterion(scoreTechnical, 'scoreTechnical');
      if (t.error) return res.status(400).json({ error: t.error });
      technical = t.value;
      const k = parseCriterion(scoreTasks, 'scoreTasks');
      if (k.error) return res.status(400).json({ error: k.error });
      tasks = k.value;
    } else if (score !== undefined) {
      const legacy = parseCriterion(score, 'score');
      if (legacy.error) return res.status(400).json({ error: legacy.error });
      design = legacy.value;
      technical = legacy.value;
      tasks = legacy.value;
    } else {
      return res.status(400).json({ error: 'scoreDesign, scoreTechnical and scoreTasks are required' });
    }

    const numScore = Math.round((design + technical + tasks) / 3);

    const { data: project, error: projErr } = await supabase
      .from('projects')
      .select('id, event_id')
      .eq('id', projectId)
      .single();

    if (projErr || !project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (!project.event_id) {
      return res.status(400).json({ error: 'Project is not linked to an event' });
    }

    const { data, error } = await supabase
      .from('project_ratings')
      .upsert(
        {
          project_id: projectId,
          event_id: project.event_id,
          score: numScore,
          score_design: design,
          score_technical: technical,
          score_tasks: tasks,
          review_note: (reviewNote || '').trim(),
          rated_by: req.user.id,
          rated_at: new Date().toISOString(),
        },
        { onConflict: 'project_id,event_id' }
      )
      .select(
        'score, score_design, score_technical, score_tasks, review_note, rated_at'
      )
      .single();

    if (error) {
      return res.status(500).json({ error: mapSupabaseError(error) });
    }

    return res.json({ rating: data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
