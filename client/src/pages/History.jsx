import { useEffect, useState } from 'react';
import { History as HistoryIcon } from 'lucide-react';
import { api } from '../api/client';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import { formatMoney, formatIST, formatDuration } from '../utils/format';

export default function History() {
  const [filters, setFilters] = useState({ plateNumber: '', vehicleType: '', from: '', to: '' });
  const [result, setResult] = useState({ sessions: [], total: 0, page: 1, limit: 20 });

  useEffect(() => {
    load(1);
  }, []);

  async function load(page) {
    const params = { page, limit: result.limit };
    if (filters.plateNumber) params.plateNumber = filters.plateNumber;
    if (filters.vehicleType) params.vehicleType = filters.vehicleType;
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;
    const { data } = await api.get('/sessions/history', { params });
    setResult(data);
  }

  const totalPages = Math.max(1, Math.ceil(result.total / result.limit));
  const inputClass =
    'min-h-11 rounded-md border border-slate-300 px-3 text-base dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 md:text-sm';

  return (
    <div>
      <PageHeader icon={HistoryIcon} title="Session History" subtitle="Search and review every closed session." />

      <Card className="mb-6">
        <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 md:grid-cols-4">
          <input
            placeholder="Plate number"
            className={inputClass}
            value={filters.plateNumber}
            onChange={(e) => setFilters({ ...filters, plateNumber: e.target.value })}
          />
          <select
            className={`${inputClass} capitalize`}
            value={filters.vehicleType}
            onChange={(e) => setFilters({ ...filters, vehicleType: e.target.value })}
          >
            <option value="">All vehicle types</option>
            <option value="car">Car</option>
            <option value="bike">Bike</option>
            <option value="auto">Auto</option>
            <option value="truck">Truck</option>
            <option value="bus">Bus</option>
          </select>
          <input
            type="date"
            className={inputClass}
            value={filters.from}
            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
          />
          <input
            type="date"
            className={inputClass}
            value={filters.to}
            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
          />
        </div>
        <button
          onClick={() => load(1)}
          className="mt-3 min-h-11 w-full rounded-md bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800 xs:w-auto dark:bg-slate-700 dark:hover:bg-slate-600"
        >
          Search
        </button>
      </Card>

      {result.sessions.length === 0 ? (
        <Card>
          <p className="py-2 text-center text-sm text-slate-500 dark:text-slate-400">No sessions found.</p>
        </Card>
      ) : (
        <>
          {/* Card list — phones and tablets */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {result.sessions.map((s) => (
              <div key={s._id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-slate-900 dark:text-slate-100">{s.plateNumber}</div>
                    <div className="text-sm capitalize text-slate-500 dark:text-slate-400">{s.vehicleType}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-semibold text-slate-900 dark:text-slate-100">{formatMoney(s.chargeAmount)}</div>
                    <div className="text-xs uppercase text-slate-500 dark:text-slate-400">{s.paymentMethod}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <div>In: {formatIST(s.entryTime)}</div>
                  <div>Out: {formatIST(s.exitTime)}</div>
                </div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Duration: {formatDuration(s.durationMinutes)}</div>
              </div>
            ))}
          </div>

          {/* Table — md and up */}
          <Card className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    <th className="py-2 pr-4">Plate</th>
                    <th className="py-2 pr-4">Type</th>
                    <th className="py-2 pr-4">Entry</th>
                    <th className="py-2 pr-4">Exit</th>
                    <th className="py-2 pr-4">Duration</th>
                    <th className="py-2 pr-4">Charge</th>
                    <th className="py-2">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {result.sessions.map((s) => (
                    <tr key={s._id} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="py-3 pr-4 font-medium text-slate-900 dark:text-slate-100">{s.plateNumber}</td>
                      <td className="py-3 pr-4 capitalize text-slate-600 dark:text-slate-400">{s.vehicleType}</td>
                      <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">{formatIST(s.entryTime)}</td>
                      <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">{formatIST(s.exitTime)}</td>
                      <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">{formatDuration(s.durationMinutes)}</td>
                      <td className="py-3 pr-4 font-medium text-slate-900 dark:text-slate-100">{formatMoney(s.chargeAmount)}</td>
                      <td className="py-3 uppercase text-slate-600 dark:text-slate-400">{s.paymentMethod}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      <div className="mt-4 flex flex-col items-center justify-between gap-3 xs:flex-row">
        <span className="text-sm text-slate-500 dark:text-slate-400">
          Page {result.page} of {totalPages} · {result.total} total
        </span>
        <div className="flex gap-2">
          <button
            disabled={result.page <= 1}
            onClick={() => load(result.page - 1)}
            className="min-h-11 rounded-md border border-slate-300 px-4 text-sm disabled:opacity-50 dark:border-slate-700 dark:text-slate-300"
          >
            Previous
          </button>
          <button
            disabled={result.page >= totalPages}
            onClick={() => load(result.page + 1)}
            className="min-h-11 rounded-md border border-slate-300 px-4 text-sm disabled:opacity-50 dark:border-slate-700 dark:text-slate-300"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
