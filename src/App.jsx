import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
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

export function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
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
      </FavoritesProvider>
    </AuthProvider>
  );
}

export default App;
