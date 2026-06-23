import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  LogIn,
  Car,
  History as HistoryIcon,
  IndianRupee,
  Wallet,
  Grid3x3,
  Settings as SettingsIcon,
  LogOut,
  ParkingSquare,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/check-in', label: 'Check-In', icon: LogIn },
  { to: '/active', label: 'Active Vehicles', icon: Car },
  { to: '/history', label: 'History', icon: HistoryIcon },
  { to: '/revenue', label: 'Revenue', icon: IndianRupee },
  { to: '/rate-plans', label: 'Rate Plans', icon: Wallet },
  { to: '/slots', label: 'Slots', icon: Grid3x3 },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const initial = user?.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <>
      {/* Backdrop — only present (and clickable) while the mobile drawer is open */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-72 max-w-[85%] flex-col bg-slate-900 text-slate-200 transition-transform duration-200 ease-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:w-64 lg:translate-x-0`}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
              <ParkingSquare className="h-5 w-5 text-white" strokeWidth={2.25} />
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">RentyPark</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex min-h-11 items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-900/40'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`
                }
              >
                <Icon className="h-4.5 w-4.5 shrink-0" strokeWidth={2} />
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-lg px-2 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-700 text-sm font-semibold text-white">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-slate-100">{user?.name}</div>
              <div className="truncate text-xs capitalize text-slate-500">{user?.role}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-800 px-3 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700"
          >
            <LogOut className="h-4 w-4" strokeWidth={2} />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
