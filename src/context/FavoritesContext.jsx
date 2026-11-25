import React, { createContext, useContext, useState, useEffect } from 'react';
import { backendClient } from '../services/backendClient';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const { isLoggedIn, authLoading } = useAuth();
  const { showToast } = useToast();
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
      showToast('Vui lòng đăng nhập Google để lưu phim yêu thích!', 'warning');
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
        showToast(`Đã thêm "${payload.name}" vào yêu thích`, 'success');
      } else {
        setFavorites((prev) => prev.filter((m) => m.slug !== payload.slug));
        showToast(`Đã bỏ "${payload.name}" khỏi yêu thích`, 'info');
      }
    } catch (err) {
      console.error('[Favorites] Toggle error:', err);
      showToast('Không thể cập nhật danh sách yêu thích.', 'error');
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
