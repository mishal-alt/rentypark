import { NavLink } from 'react-router-dom';
import { LogIn, Car, LogOut } from 'lucide-react';

function NavIcon({ Icon, isActive, raised = false }) {
  return (
    <span
      className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-200 ${raised ? '-mt-4 ring-4 ring-white/80 dark:ring-slate-950/70' : ''} ${
        isActive
          ? 'bg-blue-600 shadow-md shadow-blue-600/40'
          : 'bg-white text-slate-500 shadow-none dark:bg-slate-800'
      }`}
    >
      <Icon className={`h-5.5 w-5.5 transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} strokeWidth={2} />
    </span>
  );
}

export default function BottomNav() {
  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden"
      aria-label="Primary"
    >
      <div className="pointer-events-auto relative w-full max-w-xs overflow-visible">
        {/* Glass capsule */}
        <div className="relative overflow-hidden rounded-full border border-white/60 bg-white/55 shadow-[0_8px_32px_rgba(15,23,42,0.18)] backdrop-blur-2xl backdrop-saturate-150 dark:border-slate-700/60 dark:bg-slate-900/55">
          {/* Specular sheen — the "liquid" highlight along the top edge of the glass */}
          <div className="pointer-events-none absolute inset-0 rounded-full bg-linear-to-b from-white/70 via-white/10 to-transparent dark:from-white/10 dark:via-white/0" />

          <div className="relative z-10 flex items-end justify-between gap-1 px-5 pt-2 pb-2">
            <NavLink to="/check-in" className="flex flex-col items-center justify-center gap-1 text-[11px] font-medium">
              {({ isActive }) => (
                <>
                  <NavIcon Icon={LogIn} isActive={isActive} />
                  <span className={isActive ? 'text-blue-600' : 'text-slate-600 dark:text-slate-300'}>Check-In</span>
                </>
              )}
            </NavLink>

            <NavLink to="/active" className="flex flex-col items-center justify-center gap-1 text-[11px] font-medium">
              {({ isActive }) => (
                <>
                  <NavIcon Icon={Car} isActive={isActive} raised />
                  <span className={isActive ? 'text-blue-600' : 'text-slate-600 dark:text-slate-300'}>Active</span>
                </>
              )}
            </NavLink>

            <NavLink to="/checkout" className="flex flex-col items-center justify-center gap-1 text-[11px] font-medium">
              {({ isActive }) => (
                <>
                  <NavIcon Icon={LogOut} isActive={isActive} />
                  <span className={isActive ? 'text-blue-600' : 'text-slate-600 dark:text-slate-300'}>Check-Out</span>
                </>
              )}
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}
