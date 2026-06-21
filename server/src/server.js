import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import teamsRoutes from './routes/teams.js';
import projectsRoutes from './routes/projects.js';
import dashboardRoutes from './routes/dashboard.js';
import eventsRoutes from './routes/events.js';
import profileRoutes from './routes/profile.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'hackathon-panel-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/profile', profileRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Hackathon Panel API running on http://localhost:${port}`);
});
