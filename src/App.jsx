import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { HistoryProvider } from './context/HistoryContext';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/layout/Layout';

// Pages
import { HomePage } from './pages/HomePage';
import { MovieDetailPage } from './pages/MovieDetailPage';
import { WatchPage } from './pages/WatchPage';
import { CategorizePage } from './pages/CategorizePage';
import { SearchPage } from './pages/SearchPage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { FaqPage } from './pages/static/FaqPage';
import { PolicyPage } from './pages/static/PolicyPage';
import { TermsPage } from './pages/static/TermsPage';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ToastProvider>
        <AuthProvider>
          <FavoritesProvider>
            <HistoryProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route path="movie/:slug" element={<MovieDetailPage />} />
                    <Route path="watch/:slug" element={<WatchPage />} />
                    <Route path="category" element={<CategorizePage />} />
                    <Route path="categorize" element={<CategorizePage />} />
                    <Route path="search" element={<SearchPage />} />
                    <Route path="login" element={<LoginPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="faq" element={<FaqPage />} />
                    <Route path="policy" element={<PolicyPage />} />
                    <Route path="terms" element={<TermsPage />} />
                    {/* Legacy URL redirects */}
                    <Route path="movie-info.html" element={<Navigate to="/" replace />} />
                    <Route path="watch.html" element={<Navigate to="/" replace />} />
                    <Route path="categorize-movie.html" element={<Navigate to="/category" replace />} />
                    <Route path="login.html" element={<Navigate to="/login" replace />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </HistoryProvider>
          </FavoritesProvider>
        </AuthProvider>
      </ToastProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
