import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { authMiddleware } from '../middleware/auth.js';
import { mapSupabaseError } from '../utils/supabaseErrors.js';

const router = Router();

const MAX_AVATAR_BYTES = 350_000;

function isAllowedAvatar(value) {
  if (!value) return true;
  if (value.startsWith('/icons/lang/')) return true;
  if (/^https?:\/\//i.test(value)) return true;
  if (/^data:image\/(png|jpeg|jpg|webp);base64,/i.test(value)) {
    return value.length <= MAX_AVATAR_BYTES;
  }
  return false;
}

router.get('/presets', (_req, res) => {
  const presets = [
    '/icons/lang/java.svg',
    '/icons/lang/javascript.svg',
    '/icons/lang/python.svg',
    '/icons/lang/csharp.svg',
    '/icons/lang/go.svg',
    '/icons/lang/rust.svg',
    '/icons/lang/typescript.svg',
    '/icons/lang/kotlin.svg',
    '/icons/lang/php.svg',
    '/icons/lang/1c.svg',
  ];
  return res.json({ presets });
});

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const [partRes, projRes, userRes] = await Promise.all([
      supabase
        .from('event_participations')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabase
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .eq('submitted_by', userId),
      supabase
        .from('users')
        .select('id, username, role, avatar_url, created_at')
        .eq('id', userId)
        .single(),
    ]);

    if (userRes.error) {
      return res.status(500).json({ error: mapSupabaseError(userRes.error) });
    }

    return res.json({
      user: userRes.data,
      stats: {
        eventsJoined: partRes.count ?? 0,
        projectsSubmitted: projRes.count ?? 0,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.patch('/avatar', authMiddleware, async (req, res) => {
  try {
    const { avatarUrl } = req.body;
    const value = avatarUrl?.trim() || null;

    if (!isAllowedAvatar(value)) {
      return res.status(400).json({
        error: 'Invalid avatar: use PNG/JPG/WebP file upload or a preset icon',
      });
    }

    const { data, error } = await supabase
      .from('users')
      .update({ avatar_url: value })
      .eq('id', req.user.id)
      .select('id, username, role, avatar_url, created_at')
      .single();

    if (error) {
      return res.status(500).json({ error: mapSupabaseError(error) });
    }

    return res.json({ user: data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
