import React, { createContext, useContext, useState, useEffect } from 'react';
import { backendClient } from '../services/backendClient';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const { isLoggedIn, authLoading } = useAuth();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (authLoading) return;

    if (!isLoggedIn) {
      setFavorites([]);
      return;
    }

    backendClient
      .get('/favorites')
      .then((res) => {
        setFavorites(res.data?.items || []);
      })
      .catch((err) => {
        console.error('[Favorites] Fetch error:', err);
      });
  }, [isLoggedIn, authLoading]);

  const isFavorite = (slug) => {
    if (!slug) return false;
    return favorites.some((m) => m.slug === slug);
  };

  const toggleFavorite = async (movie) => {
    if (!movie || !movie.slug) return;
    if (!isLoggedIn) {
      alert('Vui lòng đăng nhập Google để lưu phim yêu thích!');
      return;
    }

    const payload = {
      slug: movie.slug,
      name: movie.name || movie.slug,
      origin_name: movie.origin_name || '',
      thumb_url: movie.thumb_url || movie.poster_url || '',
      poster_url: movie.poster_url || movie.thumb_url || '',
      year: movie.year || new Date().getFullYear(),
      quality: movie.quality || 'HD',
      episode_current: movie.episode_current || 'Full'
    };

    try {
      const res = await backendClient.post('/favorites/toggle', payload);
      if (res.data?.favorited) {
        setFavorites((prev) => [res.data.item || payload, ...prev.filter((m) => m.slug !== payload.slug)]);
      } else {
        setFavorites((prev) => prev.filter((m) => m.slug !== payload.slug));
      }
    } catch (err) {
      console.error('[Favorites] Toggle error:', err);
    }
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
