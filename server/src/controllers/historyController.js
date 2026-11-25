import { historyModel } from '../models/historyModel.js';

export const historyController = {
  async getAll(req, res, next) {
    try {
      const limit = Math.min(parseInt(req.query.limit || '50', 10), 100);
      const items = await historyModel.listByUser(req.user.id, limit);
      return res.status(200).json({ items });
    } catch (err) {
      return next(err);
    }
  },

  async getBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const item = await historyModel.getByUserAndSlug(req.user.id, slug);
      return res.status(200).json({ item });
    } catch (err) {
      return next(err);
    }
  },

  async upsert(req, res, next) {
    try {
      const {
        movie_slug,
        movie_name,
        origin_name,
        poster_url,
        thumb_url,
        episode_index,
        episode_name,
        current_time_seconds,
        duration_seconds
      } = req.body;

      if (!movie_slug || !movie_name) {
        return res.status(400).json({ error: 'BadRequest', message: 'Thiếu movie_slug hoặc movie_name.' });
      }

      const item = await historyModel.upsert({
        userId: req.user.id,
        movieSlug: movie_slug,
        movieName: movie_name,
        originName: origin_name,
        posterUrl: poster_url,
        thumbUrl: thumb_url,
        episodeIndex: Number.isFinite(Number(episode_index)) ? parseInt(episode_index, 10) : 0,
        episodeName: episode_name,
        currentTimeSeconds: Number(current_time_seconds) || 0,
        durationSeconds: Number(duration_seconds) || 0
      });

      return res.status(200).json({ item });
    } catch (err) {
      return next(err);
    }
  },

  async removeOne(req, res, next) {
    try {
      const { slug } = req.params;
      await historyModel.removeOne(req.user.id, slug);
      return res.status(200).json({ success: true });
    } catch (err) {
      return next(err);
    }
  },

  async clearAll(req, res, next) {
    try {
      await historyModel.clearAll(req.user.id);
      return res.status(200).json({ success: true });
    } catch (err) {
      return next(err);
    }
  }
};
