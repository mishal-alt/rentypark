import { Scan } from 'lucide-react';

// Mobile-only floating action button that pulses every 2s to draw attention
// to the camera-scan shortcut. Desktop relies on the inline "Scan" buttons instead.
export default function ScanFab({ onClick, label = 'Scan plate with camera' }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="fixed right-4 bottom-28 z-40 flex h-14 w-14 items-center justify-center lg:hidden"
    >
      <span className="animate-scan-fab-ring absolute inset-0 rounded-full bg-blue-500" />
      <span className="animate-scan-fab relative flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_6px_20px_rgba(37,99,235,0.5)] ring-4 ring-white/70">
        <Scan className="h-6 w-6" strokeWidth={2} />
      </span>
    </button>
  );
}
