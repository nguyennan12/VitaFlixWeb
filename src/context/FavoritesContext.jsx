import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { STORAGE_KEYS } from '../config/constants';

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  // Store array of favorite movie objects and slugs
  const [favorites, setFavorites] = useState(() => storage.get(STORAGE_KEYS.FAVORITES, []));

  useEffect(() => {
    // Migration helper: if old fav slugs exist, keep them in sync
    const oldSlugs = storage.get(STORAGE_KEYS.FAV_SLUGS, []);
    if (oldSlugs.length > 0 && favorites.length === 0) {
      const initialFavs = oldSlugs.map(slug => ({ slug, name: slug }));
      setFavorites(initialFavs);
      storage.set(STORAGE_KEYS.FAVORITES, initialFavs);
    }
  }, []);

  const isFavorite = (slug) => {
    if (!slug) return false;
    return favorites.some(m => m.slug === slug);
  };

  const toggleFavorite = (movie) => {
    if (!movie || !movie.slug) return;
    
    let updated;
    if (isFavorite(movie.slug)) {
      updated = favorites.filter(m => m.slug !== movie.slug);
    } else {
      const newFav = {
        _id: movie._id || movie.id || movie.slug,
        slug: movie.slug,
        name: movie.name,
        origin_name: movie.origin_name || '',
        thumb_url: movie.thumb_url || movie.poster_url || '',
        poster_url: movie.poster_url || movie.thumb_url || '',
        year: movie.year || new Date().getFullYear(),
        quality: movie.quality || 'HD',
        episode_current: movie.episode_current || 'Full'
      };
      updated = [newFav, ...favorites];
    }
    
    setFavorites(updated);
    storage.set(STORAGE_KEYS.FAVORITES, updated);
    storage.set(STORAGE_KEYS.FAV_SLUGS, updated.map(m => m.slug));
  };

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
