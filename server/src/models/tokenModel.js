import { pool } from '../config/db.js';

export const tokenModel = {
  async createToken({ userId, tokenHash, expiresAt }) {
    const { rows } = await pool.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, expires_at, revoked`,
      [userId, tokenHash, expiresAt]
    );
    return rows[0];
  },

  async findByHash(tokenHash) {
    const { rows } = await pool.query(
      'SELECT id, user_id, token_hash, expires_at, revoked FROM refresh_tokens WHERE token_hash = $1',
      [tokenHash]
    );
    return rows[0] || null;
  },

  async revokeById(id) {
    await pool.query('UPDATE refresh_tokens SET revoked = TRUE WHERE id = $1', [id]);
  },

  async revokeByHash(tokenHash) {
    await pool.query('UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash = $1', [tokenHash]);
  },

  async revokeAllForUser(userId) {
    await pool.query('UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1', [userId]);
  },

  async deleteExpiredForUser(userId) {
    await pool.query(
      'DELETE FROM refresh_tokens WHERE user_id = $1 AND (expires_at < NOW() OR revoked = TRUE)',
      [userId]
    );
  }
};
