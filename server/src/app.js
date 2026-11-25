import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { env } from './config/env.js';
import { pool } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();
app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' }
  })
);

app.use(
  cors({
    origin: env.clientOrigins,
    credentials: true
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Health check
app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'disconnected', message: err.message });
  }
});

// PhimAPI proxy fallback for Express
app.get('/api/proxy', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'Missing url parameter' });

    const apiUrl = decodeURIComponent(url);
    if (!apiUrl.startsWith('https://phimapi.com')) {
      return res.status(403).json({ error: 'Invalid API endpoint' });
    }

    const response = await fetch(apiUrl);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch data', message: err.message });
  }
});

// MVC Routes
app.use('/api/auth', authRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/favorites', favoriteRoutes);

app.use(errorHandler);

export default app;
