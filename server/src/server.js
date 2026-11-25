import app from './app.js';
import { env } from './config/env.js';
import { initDatabase } from './config/db.js';

async function start() {
  try {
    await initDatabase();
    app.listen(env.port, () => {
      console.log(`[Server] VitaFlix Express API running at http://localhost:${env.port}`);
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err);
    process.exit(1);
  }
}

start();
