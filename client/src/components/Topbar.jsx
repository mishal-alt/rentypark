import { Menu, ParkingSquare, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Topbar({ onOpenMenu }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-white/50 bg-white/70 px-4 backdrop-blur-xl backdrop-saturate-150 lg:hidden dark:border-slate-800/70 dark:bg-slate-900/70">
      <button
        onClick={onOpenMenu}
        aria-label="Open menu"
        className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex flex-1 items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600">
          <ParkingSquare className="h-4 w-4 text-white" strokeWidth={2.25} />
        </div>
        <span className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">RentyPark</span>
      </div>
      <button
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
    </header>
  );
}
