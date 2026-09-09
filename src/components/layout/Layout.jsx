import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export function Layout() {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  return (
    <>
      <Header />
      <main style={{ paddingTop: '70px', minHeight: 'calc(100vh - 70px)' }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
