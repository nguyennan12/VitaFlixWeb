import { pool } from '../config/db.js';

export const userModel = {
  async upsertGoogleUser({ googleId, email, fullName, avatarUrl }) {
    const query = `
      INSERT INTO users (google_id, email, full_name, avatar_url, role)
      VALUES ($1, $2, $3, $4, 'user')
      ON CONFLICT (google_id)
      DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), users.full_name),
        avatar_url = COALESCE(NULLIF(EXCLUDED.avatar_url, ''), users.avatar_url),
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, google_id, email, full_name, avatar_url, role, created_at;
    `;
    const { rows } = await pool.query(query, [googleId, email, fullName, avatarUrl]);
    return rows[0];
  },

  async findById(id) {
    const { rows } = await pool.query(
      'SELECT id, google_id, email, full_name, avatar_url, role, created_at FROM users WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  }
};
