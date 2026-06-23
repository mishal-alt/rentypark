import { useEffect, useState } from 'react';
import { Camera, Search, X, LogOut } from 'lucide-react';
import { api } from '../api/client';
import Card from '../components/Card';
import CheckoutModal from '../components/CheckoutModal';
import PlateScannerModal from '../components/PlateScannerModal';
import ScanFab from '../components/ScanFab';
import PageHeader from '../components/PageHeader';
import { formatIST } from '../utils/format';
import { normalizePlate } from '../utils/plate';

export default function Checkout() {
  const [sessions, setSessions] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanError, setScanError] = useState('');

  useEffect(() => {
    load();
    const tick = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(tick);
  }, []);

  async function load() {
    const { data } = await api.get('/sessions/active');
    setSessions(data);
  }

  function liveDuration(entryTime) {
    const minutes = Math.floor((now - new Date(entryTime).getTime()) / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  function handleScannedPlate(plate) {
    const target = normalizePlate(plate);
    const match = sessions.find((s) => normalizePlate(s.plateNumber) === target);
    if (match) {
      setScanError('');
      setSelected(match);
    } else {
      setScanError(`No active session found for plate "${plate}". Search for it below or try scanning again.`);
    }
  }

  const filtered = search.trim()
    ? sessions.filter((s) => normalizePlate(s.plateNumber).includes(normalizePlate(search)))
    : sessions;

  return (
    <div>
      <PageHeader
        icon={LogOut}
        title="Checkout"
        subtitle="Find a parked vehicle and settle its charge."
        action={
          <button
            onClick={() => {
              setScanError('');
              setScannerOpen(true);
            }}
            className="hidden min-h-11 items-center gap-2 rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 lg:flex dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Camera className="h-4 w-4" />
            Scan to Check Out
          </button>
        }
      />

      <Card className="mb-6">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            autoFocus
            placeholder="Search by number plate..."
            className="min-h-11 w-full rounded-md border border-slate-300 pl-10 pr-10 text-base uppercase tracking-wide focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 md:text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </Card>

      {scanError && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
          {scanError}
        </div>
      )}

      {filtered.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {sessions.length === 0 ? 'No vehicles currently parked.' : `No active vehicle matches "${search}".`}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((s) => (
            <div
              key={s._id}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm xs:flex-row xs:items-center xs:justify-between dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center gap-3">
                <div>
                  <div className="text-base font-semibold text-slate-900 dark:text-slate-100">{s.plateNumber}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    <span className="capitalize">{s.vehicleType}</span> · Entered {formatIST(s.entryTime)}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 xs:justify-end">
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
                  {liveDuration(s.entryTime)}
                </span>
                <button
                  onClick={() => setSelected(s)}
                  className="min-h-11 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Check Out
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <CheckoutModal
          session={selected}
          onClose={() => setSelected(null)}
          onComplete={() => {
            setSelected(null);
            load();
          }}
        />
      )}

      <ScanFab
        label="Scan plate to check out"
        onClick={() => {
          setScanError('');
          setScannerOpen(true);
        }}
      />

      {scannerOpen && (
        <PlateScannerModal
          title="Scan Plate to Check Out"
          onCapture={handleScannedPlate}
          onClose={() => setScannerOpen(false)}
        />
      )}
    </div>
  );
}
