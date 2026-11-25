import { pool } from '../config/db.js';

export const favoriteModel = {
  async listByUser(userId) {
    const { rows } = await pool.query(
      `SELECT movie_slug AS slug, movie_name AS name, origin_name, poster_url, thumb_url,
              year, quality, episode_current, created_at
       FROM favorites
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    return rows;
  },

  async exists(userId, movieSlug) {
    const { rows } = await pool.query(
      'SELECT id FROM favorites WHERE user_id = $1 AND movie_slug = $2',
      [userId, movieSlug]
    );
    return rows.length > 0;
  },

  async add({ userId, movieSlug, movieName, originName, posterUrl, thumbUrl, year, quality, episodeCurrent }) {
    const query = `
      INSERT INTO favorites (
        user_id, movie_slug, movie_name, origin_name, poster_url, thumb_url, year, quality, episode_current
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (user_id, movie_slug) DO NOTHING
      RETURNING movie_slug AS slug, movie_name AS name, origin_name, poster_url, thumb_url,
                year, quality, episode_current, created_at;
    `;
    const { rows } = await pool.query(query, [
      userId,
      movieSlug,
      movieName,
      originName || '',
      posterUrl || '',
      thumbUrl || '',
      year || null,
      quality || 'HD',
      episodeCurrent || 'Full'
    ]);
    return rows[0] || null;
  },

  async remove(userId, movieSlug) {
    await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND movie_slug = $2',
      [userId, movieSlug]
    );
  }
};
