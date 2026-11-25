import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { backendClient } from '../services/backendClient';
import { ASSETS } from '../config/constants';

const AuthContext = createContext();

function normalizeUser(rawUser) {
  if (!rawUser) return null;
  return {
    id: rawUser.id,
    email: rawUser.email,
    fullname: rawUser.full_name || rawUser.email?.split('@')[0] || 'Người dùng',
    username: rawUser.email?.split('@')[0] || 'user',
    avatar: rawUser.avatar_url || ASSETS.DEFAULT_AVATAR,
    role: rawUser.role || 'user',
    createdAt: rawUser.created_at
  };
}

let inflightMePromise = null;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      if (!inflightMePromise) {
        inflightMePromise = backendClient.get('/auth/me').finally(() => {
          inflightMePromise = null;
        });
      }
      const res = await inflightMePromise;
      setUser(normalizeUser(res.data?.user));
    } catch {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
    };
    window.addEventListener('auth:session-expired', handleExpired);
    return () => window.removeEventListener('auth:session-expired', handleExpired);
  }, []);

  const loginWithGoogle = async (credential) => {
    try {
      const res = await backendClient.post('/auth/google', { credential });
      const normalized = normalizeUser(res.data?.user);
      setUser(normalized);
      return { success: true, user: normalized };
    } catch (err) {
      const message = err.response?.data?.message || 'Đăng nhập Google thất bại.';
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await backendClient.post('/auth/logout');
    } catch (err) {
      console.warn('[Auth] Logout request failed:', err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        authLoading,
        loginWithGoogle,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
