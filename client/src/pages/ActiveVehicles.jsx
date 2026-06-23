import { useEffect, useState } from 'react';
import { Car, Bike, Truck, Bus, Search, X } from 'lucide-react';
import { api } from '../api/client';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import PageHeader from '../components/PageHeader';
import { formatIST } from '../utils/format';
import { normalizePlate } from '../utils/plate';

const TYPE_ICONS = { car: Car, bike: Bike, auto: Car, truck: Truck, bus: Bus };

const SORT_OPTIONS = [
  { value: 'duration_desc', label: 'Longest parked first' },
  { value: 'duration_asc', label: 'Newest arrival first' },
  { value: 'plate_asc', label: 'Plate (A–Z)' },
];

function liveDurationMinutes(entryTime, now) {
  return Math.floor((now - new Date(entryTime).getTime()) / 60000);
}

function formatLiveDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

export default function ActiveVehicles() {
  const [sessions, setSessions] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('duration_desc');

  useEffect(() => {
    load();
    const tick = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(tick);
  }, []);

  async function load() {
    const { data } = await api.get('/sessions/active');
    setSessions(data);
  }

  const byType = sessions.reduce((acc, s) => {
    acc[s.vehicleType] = (acc[s.vehicleType] || 0) + 1;
    return acc;
  }, {});

  const longestStay = sessions.reduce((max, s) => Math.max(max, liveDurationMinutes(s.entryTime, now)), 0);

  const visible = sessions
    .filter((s) => !search.trim() || normalizePlate(s.plateNumber).includes(normalizePlate(search)))
    .filter((s) => !typeFilter || s.vehicleType === typeFilter)
    .sort((a, b) => {
      if (sortBy === 'plate_asc') return a.plateNumber.localeCompare(b.plateNumber);
      const durA = liveDurationMinutes(a.entryTime, now);
      const durB = liveDurationMinutes(b.entryTime, now);
      return sortBy === 'duration_asc' ? durA - durB : durB - durA;
    });

  return (
    <div>
      <PageHeader icon={Car} title="Active Vehicles" subtitle="Everything currently parked at your station, live." />

      <div className="mb-6 grid grid-cols-1 gap-4 xs:grid-cols-2 md:grid-cols-3">
        <StatCard label="Currently Parked" value={sessions.length} icon={Car} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatCard
          label="Vehicle Types Present"
          value={Object.keys(byType).length}
          icon={Bike}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
        />
        <StatCard
          label="Longest Stay Right Now"
          value={sessions.length ? formatLiveDuration(longestStay) : '—'}
          icon={Truck}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
      </div>

      <Card className="mb-6">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
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
          <select
            className="min-h-11 rounded-md border border-slate-300 px-3 text-base capitalize focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 md:text-sm"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All vehicle types</option>
            {Object.keys(byType).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            className="min-h-11 rounded-md border border-slate-300 px-3 text-base focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 md:text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {sessions.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">No vehicles currently parked.</p>
        </Card>
      ) : visible.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">No parked vehicle matches your search/filter.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 lg:grid-cols-3">
          {visible.map((s) => {
            const minutes = liveDurationMinutes(s.entryTime, now);
            const isLongStay = minutes >= 240; // 4h+ called out as a soft "heads up" signal
            const Icon = TYPE_ICONS[s.vehicleType] || Car;
            return (
              <div key={s._id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      isLongStay ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'
                    }`}
                  >
                    {isLongStay ? 'Long stay' : 'Parked'}
                  </span>
                </div>
                <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">{s.plateNumber}</div>
                <div className="mb-3 text-sm capitalize text-slate-500 dark:text-slate-400">{s.vehicleType}</div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Entered {formatIST(s.entryTime)}</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{formatLiveDuration(minutes)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
