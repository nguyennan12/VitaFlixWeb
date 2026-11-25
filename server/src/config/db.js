import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './env.js';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const needsSsl = env.databaseUrl.includes('sslmode=require') || env.isProd;

export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: needsSsl ? { rejectUnauthorized: false } : false,
  max: 15,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected idle client error:', err);
});

export async function initDatabase() {
  const schemaPath = path.resolve(__dirname, '../../sql/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
  await pool.query(schemaSql);
  console.log('[DB] PostgreSQL connected & schema verified.');
}
