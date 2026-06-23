import { useEffect, useState } from 'react';
import { Camera } from 'lucide-react';
import { api } from '../api/client';
import Card from '../components/Card';
import CheckoutModal from '../components/CheckoutModal';
import PlateScannerModal from '../components/PlateScannerModal';
import { formatIST } from '../utils/format';
import { normalizePlate } from '../utils/plate';

export default function ActiveVehicles() {
  const [sessions, setSessions] = useState([]);
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
      setScanError(`No active session found for plate "${plate}". Check the list below or try scanning again.`);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="page-title font-semibold text-slate-900">Active Vehicles</h1>
        <button
          onClick={() => {
            setScanError('');
            setScannerOpen(true);
          }}
          className="flex min-h-11 items-center gap-2 rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Camera className="h-4 w-4" />
          Scan to Check Out
        </button>
      </div>

      {scanError && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{scanError}</div>
      )}

      {sessions.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-500">No vehicles currently parked.</p>
        </Card>
      ) : (
        <>
          {/* Card list — phones and tablets */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {sessions.map((s) => (
              <div key={s._id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-slate-900">{s.plateNumber}</div>
                    <div className="text-sm capitalize text-slate-500">{s.vehicleType}</div>
                  </div>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    {liveDuration(s.entryTime)}
                  </span>
                </div>
                <div className="mb-3 text-sm text-slate-500">Entered {formatIST(s.entryTime)}</div>
                <button
                  onClick={() => setSelected(s)}
                  className="min-h-11 w-full rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Check Out
                </button>
              </div>
            ))}
          </div>

          {/* Table — md and up */}
          <Card className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="py-2 pr-4">Plate</th>
                    <th className="py-2 pr-4">Type</th>
                    <th className="py-2 pr-4">Entry Time</th>
                    <th className="py-2 pr-4">Duration</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s._id} className="border-b border-slate-100">
                      <td className="py-3 pr-4 font-medium text-slate-900">{s.plateNumber}</td>
                      <td className="py-3 pr-4 capitalize text-slate-600">{s.vehicleType}</td>
                      <td className="py-3 pr-4 text-slate-600">{formatIST(s.entryTime)}</td>
                      <td className="py-3 pr-4 text-slate-600">{liveDuration(s.entryTime)}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => setSelected(s)}
                          className="min-h-11 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                          Check Out
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
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
