'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, clearSession, SessionUser } from '@/lib/session';

interface DashboardLayoutProps {
  children: ReactNode;
  role: string;
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace('/login');
      return;
    }
    // Guard: make sure the user's role matches the dashboard they're trying to access
    if (session.role !== role) {
      router.replace(`/dashboard/${session.role}`);
      return;
    }
    setUser(session);
  }, [role, router]);

  const handleLogout = () => {
    clearSession();
    router.push('/login');
  };

  const roleColors: Record<string, string> = {
    patient: 'from-blue-600 to-blue-700',
    doctor: 'from-green-600 to-green-700',
    pharmacist: 'from-orange-600 to-orange-700',
    admin: 'from-purple-600 to-purple-700',
  };

  const roleBgColors: Record<string, string> = {
    patient: 'bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100',
    doctor: 'bg-gradient-to-br from-green-50 via-emerald-50 to-green-100',
    pharmacist: 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100',
    admin: 'bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100',
  };

  const roleIcons: Record<string, string> = {
    patient: '👤',
    doctor: '⚕️',
    pharmacist: '💊',
    admin: '⚙️',
  };

  const gradient = roleColors[role] ?? roleColors.patient;
  const bgGradient = roleBgColors[role] ?? roleBgColors.patient;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgGradient}`}>
      {/* Top Nav */}
      <nav className={`bg-gradient-to-r ${gradient} shadow-lg sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <svg className="w-7 h-7 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-white leading-tight">Smart Clinic</h1>
                <p className="text-xs text-white text-opacity-80 capitalize">{role} Portal</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-base font-bold text-white">Smart Clinic</h1>
              </div>
            </div>

            {/* Desktop: User info + Logout */}
            <div className="hidden sm:flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white bg-opacity-15 rounded-xl px-3 py-1.5">
                <span className="text-lg">{roleIcons[role] ?? '👤'}</span>
                <div>
                  <p className="text-sm font-semibold text-white leading-tight">{user.name}</p>
                  <p className="text-xs text-white text-opacity-75 capitalize">{user.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition font-semibold text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>

            {/* Mobile: hamburger */}
            <button
              className="sm:hidden p-2 rounded-lg text-white hover:bg-white hover:bg-opacity-20 transition"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="sm:hidden border-t border-white border-opacity-20 px-4 py-3 space-y-2">
            <div className="flex items-center gap-3 py-2">
              <span className="text-xl">{roleIcons[role] ?? '👤'}</span>
              <div>
                <p className="font-semibold text-white">{user.name}</p>
                <p className="text-xs text-white text-opacity-75 capitalize">{user.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2.5 rounded-lg transition font-semibold text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        )}
      </nav>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
