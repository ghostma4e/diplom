import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'username and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('users')
      .insert({ username, hashed_password: hashedPassword })
      .select('id, username, role, avatar_url, created_at')
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Username already exists' });
      }
      // Сюда прилетит ошибка от Supabase (например, если нет таблицы users)
      console.error('❌ Ошибка Supabase при регистрации:', error); 
      return res.status(500).json({ error: error.message });
    }

    const token = jwt.sign(
      { id: data.id, username: data.username, role: data.role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({ user: { ...data, role: data.role || 'user' }, token });
  } catch (error) {
    // Сюда прилетит ошибка, если сломался сам код бэкенда (например, нет JWT_SECRET в .env)
    console.error('❌ Системная ошибка в роуте /register:', error); 
    return res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'username and password are required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, hashed_password, role, avatar_url, created_at')
      .eq('username', username)
      .single();

    if (error || !user) {
      if (error && error.code !== 'PGRST116') { // PGRST116 — это просто "не найдено", её логировать не обязательно
        console.error('❌ Ошибка Supabase при логине:', error);
      }
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.hashed_password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { hashed_password: _, ...safeUser } = user;
    return res.json({ user: { ...safeUser, role: safeUser.role || 'user' }, token });
  } catch (error) {
    console.error('❌ Системная ошибка в роуте /login:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, role, avatar_url, created_at')
      .eq('id', req.user.id)
      .single();

    if (error || !data) {
      if (error) console.error('❌ Ошибка Supabase в роуте /me:', error);
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user: data });
  } catch (error) {
    console.error('❌ Системная ошибка в роуте /me:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;