import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const requiredVars = ['DATABASE_URL', 'GOOGLE_CLIENT_ID', 'JWT_ACCESS_SECRET'];
for (const key of requiredVars) {
  if (!process.env[key]) {
    throw new Error(`[ENV] Missing required environment variable: ${key}`);
  }
}

export const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
  refreshTokenDays: parseInt(process.env.REFRESH_TOKEN_DAYS || '30', 10)
};
