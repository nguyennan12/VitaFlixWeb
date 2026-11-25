import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { backendClient } from '../services/backendClient';
import { useAuth } from './AuthContext';

const HistoryContext = createContext();

export function HistoryProvider({ children }) {
  const { isLoggedIn, authLoading } = useAuth();
  const [history, setHistory] = useState([]);

  const refreshHistory = useCallback(async () => {
    if (!isLoggedIn) {
      setHistory([]);
      return;
    }

    try {
      const res = await backendClient.get('/history?limit=50');
      setHistory(res.data?.items || []);
    } catch (err) {
      console.error('[History] Fetch error:', err);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!authLoading) {
      refreshHistory();
    }
  }, [authLoading, refreshHistory]);

  const getMovieProgress = useCallback(
    async (slug) => {
      if (!slug || !isLoggedIn) return null;

      try {
        const res = await backendClient.get(`/history/${encodeURIComponent(slug)}`);
        return res.data?.item || null;
      } catch {
        return null;
      }
    },
    [isLoggedIn]
  );

  const saveProgress = useCallback(
    async (payload, { keepalive = false } = {}) => {
      if (!isLoggedIn || !payload?.movie_slug || !payload?.movie_name) return;

      const entry = {
        movie_slug: payload.movie_slug,
        movie_name: payload.movie_name,
        origin_name: payload.origin_name || '',
        poster_url: payload.poster_url || '',
        thumb_url: payload.thumb_url || '',
        episode_index: payload.episode_index ?? 0,
        episode_name: payload.episode_name || '',
        current_time_seconds: Math.max(0, Math.floor(payload.current_time_seconds || 0)),
        duration_seconds: Math.max(0, Math.floor(payload.duration_seconds || 0))
      };

      if (keepalive && typeof fetch === 'function') {
        try {
          fetch('/api/history', {
            method: 'PUT',
            credentials: 'include',
            keepalive: true,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry)
          }).catch(() => {});
        } catch {
          // ignore keepalive errors on unload
        }
        return;
      }

      try {
        const res = await backendClient.put('/history', entry);
        const savedItem = res.data?.item || entry;
        setHistory((prev) => [
          savedItem,
          ...prev.filter((item) => item.movie_slug !== savedItem.movie_slug)
        ]);
      } catch (err) {
        console.error('[History] Save error:', err);
      }
    },
    [isLoggedIn]
  );

  const removeHistoryItem = useCallback(
    async (slug) => {
      if (!slug || !isLoggedIn) return;
      try {
        await backendClient.delete(`/history/${encodeURIComponent(slug)}`);
        setHistory((prev) => prev.filter((item) => item.movie_slug !== slug));
      } catch (err) {
        console.error('[History] Remove error:', err);
      }
    },
    [isLoggedIn]
  );

  const clearHistory = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      await backendClient.delete('/history');
      setHistory([]);
    } catch (err) {
      console.error('[History] Clear error:', err);
    }
  }, [isLoggedIn]);

  return (
    <HistoryContext.Provider
      value={{
        history,
        refreshHistory,
        getMovieProgress,
        saveProgress,
        removeHistoryItem,
        clearHistory
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
}
