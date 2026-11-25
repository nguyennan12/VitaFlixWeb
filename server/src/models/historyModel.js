import { pool } from '../config/db.js';

export const historyModel = {
  async listByUser(userId, limit = 50) {
    const { rows } = await pool.query(
      `SELECT id, movie_slug, movie_name, origin_name, poster_url, thumb_url,
              episode_index, episode_name, current_time_seconds, duration_seconds, updated_at
       FROM watch_history
       WHERE user_id = $1
       ORDER BY updated_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return rows;
  },

  async getByUserAndSlug(userId, movieSlug) {
    const { rows } = await pool.query(
      `SELECT id, movie_slug, movie_name, origin_name, poster_url, thumb_url,
              episode_index, episode_name, current_time_seconds, duration_seconds, updated_at
       FROM watch_history
       WHERE user_id = $1 AND movie_slug = $2`,
      [userId, movieSlug]
    );
    return rows[0] || null;
  },

  async upsert({
    userId,
    movieSlug,
    movieName,
    originName,
    posterUrl,
    thumbUrl,
    episodeIndex,
    episodeName,
    currentTimeSeconds,
    durationSeconds
  }) {
    const query = `
      INSERT INTO watch_history (
        user_id, movie_slug, movie_name, origin_name, poster_url, thumb_url,
        episode_index, episode_name, current_time_seconds, duration_seconds, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, movie_slug)
      DO UPDATE SET
        movie_name = EXCLUDED.movie_name,
        origin_name = COALESCE(NULLIF(EXCLUDED.origin_name, ''), watch_history.origin_name),
        poster_url = COALESCE(NULLIF(EXCLUDED.poster_url, ''), watch_history.poster_url),
        thumb_url = COALESCE(NULLIF(EXCLUDED.thumb_url, ''), watch_history.thumb_url),
        episode_index = EXCLUDED.episode_index,
        episode_name = EXCLUDED.episode_name,
        current_time_seconds = EXCLUDED.current_time_seconds,
        duration_seconds = GREATEST(EXCLUDED.duration_seconds, 0),
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, movie_slug, movie_name, origin_name, poster_url, thumb_url,
                episode_index, episode_name, current_time_seconds, duration_seconds, updated_at;
    `;
    const { rows } = await pool.query(query, [
      userId,
      movieSlug,
      movieName,
      originName || '',
      posterUrl || '',
      thumbUrl || '',
      episodeIndex,
      episodeName || '',
      Math.max(0, Math.floor(currentTimeSeconds || 0)),
      Math.max(0, Math.floor(durationSeconds || 0))
    ]);
    return rows[0];
  },

  async removeOne(userId, movieSlug) {
    const { rowCount } = await pool.query(
      'DELETE FROM watch_history WHERE user_id = $1 AND movie_slug = $2',
      [userId, movieSlug]
    );
    return rowCount > 0;
  },

  async clearAll(userId) {
    await pool.query('DELETE FROM watch_history WHERE user_id = $1', [userId]);
  }
};
