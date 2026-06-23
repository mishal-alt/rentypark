import { Menu, ParkingSquare } from 'lucide-react';

export default function Topbar({ onOpenMenu }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:hidden">
      <button
        onClick={onOpenMenu}
        aria-label="Open menu"
        className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600">
          <ParkingSquare className="h-4 w-4 text-white" strokeWidth={2.25} />
        </div>
        <span className="text-base font-semibold tracking-tight text-slate-900">RentyPark</span>
      </div>
    </header>
  );
}
