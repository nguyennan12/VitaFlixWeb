import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role || 'user'
    },
    env.jwtAccessSecret,
    { expiresIn: env.accessTokenExpiresIn }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtAccessSecret);
}

export function generateRefreshToken() {
  return crypto.randomBytes(40).toString('hex');
}
