import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close the mobile drawer whenever the route changes (e.g. after tapping a nav link).
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 lg:pl-64">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <Topbar onOpenMenu={() => setMenuOpen(true)} />
      <main className="mx-auto max-w-6xl px-4 py-5 xs:px-6 md:px-8 md:py-8">
        <Outlet />
      </main>
    </div>
  );
}
