import { favoriteModel } from '../models/favoriteModel.js';

export const favoriteController = {
  async getAll(req, res, next) {
    try {
      const items = await favoriteModel.listByUser(req.user.id);
      return res.status(200).json({ items });
    } catch (err) {
      return next(err);
    }
  },

  async toggle(req, res, next) {
    try {
      const { slug, name, origin_name, poster_url, thumb_url, year, quality, episode_current } = req.body;
      if (!slug || !name) {
        return res.status(400).json({ error: 'BadRequest', message: 'Thiếu slug hoặc tên phim.' });
      }

      const alreadyExists = await favoriteModel.exists(req.user.id, slug);
      if (alreadyExists) {
        await favoriteModel.remove(req.user.id, slug);
        return res.status(200).json({ favorited: false, slug });
      }

      const item = await favoriteModel.add({
        userId: req.user.id,
        movieSlug: slug,
        movieName: name,
        originName: origin_name,
        posterUrl: poster_url,
        thumbUrl: thumb_url,
        year: year ? parseInt(year, 10) || null : null,
        quality,
        episodeCurrent: episode_current
      });

      return res.status(200).json({ favorited: true, item });
    } catch (err) {
      return next(err);
    }
  }
};
