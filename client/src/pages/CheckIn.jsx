import { useEffect, useState } from 'react';
import { Camera, LogIn } from 'lucide-react';
import { api } from '../api/client';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import PlateScannerModal from '../components/PlateScannerModal';
import ScanFab from '../components/ScanFab';

export default function CheckIn() {
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [form, setForm] = useState({ plateNumber: '', vehicleType: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  useEffect(() => {
    api.get('/station').then(({ data }) => {
      setVehicleTypes(data.vehicleTypes || []);
      if (data.vehicleTypes?.length) {
        setForm((f) => ({ ...f, vehicleType: data.vehicleTypes[0].type }));
      }
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const { data } = await api.post('/sessions/check-in', form);
      setSuccess(`Checked in ${data.plateNumber} at ${new Date(data.entryTime).toLocaleTimeString()}`);
      setForm({ ...form, plateNumber: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <PageHeader icon={LogIn} title="Check-In Vehicle" subtitle="Record a new arrival and start its timer." />
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Number Plate</label>
            <input
              autoFocus
              required
              placeholder="KL 13 AB 1234"
              className="w-full rounded-md border border-slate-300 px-3 py-3 text-lg uppercase tracking-wide focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
              value={form.plateNumber}
              onChange={(e) => setForm({ ...form, plateNumber: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setScannerOpen(true)}
              className="mt-2 hidden min-h-11 w-full items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 px-3 text-sm font-medium text-slate-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 lg:flex dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:bg-blue-950/40 dark:hover:text-blue-400"
            >
              <Camera className="h-4 w-4" />
              Scan Plate with Camera
            </button>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Vehicle Type</label>
            <select
              required
              className="w-full rounded-md border border-slate-300 px-3 py-3 text-base focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              value={form.vehicleType}
              onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
            >
              <option value="" disabled>
                Select vehicle type
              </option>
              {vehicleTypes.map((vt) => (
                <option key={vt.type} value={vt.type} className="capitalize">
                  {vt.type}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          {success && <p className="text-sm text-green-600 dark:text-green-400">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-3 py-3 text-base font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Checking in...' : 'Check In'}
          </button>
        </form>
      </Card>

      <ScanFab label="Scan plate to check in" onClick={() => setScannerOpen(true)} />

      {scannerOpen && (
        <PlateScannerModal
          title="Scan Plate to Check In"
          onCapture={(plate) => setForm((f) => ({ ...f, plateNumber: plate }))}
          onClose={() => setScannerOpen(false)}
        />
      )}
    </div>
  );
}
