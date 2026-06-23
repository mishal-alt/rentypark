import { useEffect, useState } from 'react';
import { Trash2, Grid3x3 } from 'lucide-react';
import { api } from '../api/client';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';

const ALL_VEHICLE_TYPES = ['car', 'bike', 'auto', 'truck', 'bus'];

export default function Slots() {
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [occupancy, setOccupancy] = useState([]);
  const [typeToAdd, setTypeToAdd] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const [stationRes, occupancyRes] = await Promise.all([api.get('/station'), api.get('/station/occupancy')]);
    setVehicleTypes(stationRes.data.vehicleTypes || []);
    setOccupancy(occupancyRes.data);
  }

  const configuredTypes = new Set(vehicleTypes.map((vt) => vt.type));
  const addableTypes = ALL_VEHICLE_TYPES.filter((t) => !configuredTypes.has(t));

  function updateSlots(type, totalSlots) {
    setVehicleTypes((vts) => vts.map((vt) => (vt.type === type ? { ...vt, totalSlots: Number(totalSlots) } : vt)));
  }

  function addVehicleType() {
    if (!typeToAdd) return;
    setVehicleTypes((vts) => [...vts, { type: typeToAdd, totalSlots: 0 }]);
    setTypeToAdd('');
  }

  function removeVehicleType(type) {
    const occupied = occupiedFor(type);
    if (occupied > 0 && !window.confirm(`"${type}" has ${occupied} vehicle(s) currently parked. Remove it anyway?`)) {
      return;
    }
    setVehicleTypes((vts) => vts.filter((vt) => vt.type !== type));
  }

  async function handleSave() {
    await api.put('/station/vehicle-types', { vehicleTypes });
    setSaved(true);
    load();
    setTimeout(() => setSaved(false), 2000);
  }

  function occupiedFor(type) {
    return occupancy.find((o) => o.type === type)?.occupied || 0;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader icon={Grid3x3} title="Slot Capacity" subtitle="Set total capacity per vehicle type." />
      <Card title="Total slots per vehicle type">
        {vehicleTypes.length === 0 ? (
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">No vehicle types configured yet. Add one below to get started.</p>
        ) : (
          <div className="space-y-4">
            {vehicleTypes.map((vt) => (
              <div key={vt.type} className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium capitalize text-slate-900 dark:text-slate-100">{vt.type}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{occupiedFor(vt.type)} currently occupied</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    className="min-h-11 w-24 shrink-0 rounded-md border border-slate-300 px-3 text-base sm:w-28 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 md:text-sm"
                    value={vt.totalSlots}
                    onChange={(e) => updateSlots(vt.type, e.target.value)}
                  />
                  <button
                    onClick={() => removeVehicleType(vt.type)}
                    aria-label={`Remove ${vt.type}`}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {addableTypes.length > 0 && (
          <div className="mt-6 flex flex-col gap-2 border-t border-slate-200 pt-4 xs:flex-row dark:border-slate-800">
            <select
              className="min-h-11 flex-1 rounded-md border border-slate-300 px-3 text-base capitalize dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 md:text-sm"
              value={typeToAdd}
              onChange={(e) => setTypeToAdd(e.target.value)}
            >
              <option value="">Add a vehicle type...</option>
              {addableTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <button
              onClick={addVehicleType}
              disabled={!typeToAdd}
              className="min-h-11 rounded-md border border-blue-600 px-4 text-sm font-semibold text-blue-600 hover:bg-blue-50 disabled:opacity-50"
            >
              Add
            </button>
          </div>
        )}

        <button
          onClick={handleSave}
          className="mt-6 min-h-11 w-full rounded-md bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Save Slot Capacity
        </button>
        {saved && <p className="mt-2 text-center text-sm text-green-600 dark:text-green-400">Saved.</p>}
      </Card>
    </div>
  );
}
