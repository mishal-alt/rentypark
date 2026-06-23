import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, IndianRupee, LogIn, Grid3x3, LayoutDashboard } from 'lucide-react';
import { api } from '../api/client';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import { formatMoney, formatIST } from '../utils/format';

export default function Dashboard() {
  const [active, setActive] = useState([]);
  const [occupancy, setOccupancy] = useState([]);
  const [todayStats, setTodayStats] = useState({ revenue: 0, checkIns: 0 });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const [activeRes, occupancyRes, historyRes] = await Promise.all([
      api.get('/sessions/active'),
      api.get('/station/occupancy'),
      api.get('/sessions/history', { params: { from: startOfToday(), limit: 200 } }),
    ]);
    setActive(activeRes.data);
    setOccupancy(occupancyRes.data);
    const revenue = historyRes.data.sessions.reduce((sum, s) => sum + (s.chargeAmount || 0), 0);
    setTodayStats({ revenue, checkIns: historyRes.data.sessions.length + activeRes.data.length });
  }

  function startOfToday() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }

  const totalAvailable = occupancy.reduce((sum, o) => sum + o.available, 0);

  return (
    <div>
      <PageHeader icon={LayoutDashboard} title="Dashboard" subtitle="Live overview of your station, right now." />

      <div className="mb-6 grid grid-cols-1 gap-4 xs:grid-cols-2 md:mb-8 md:grid-cols-4">
        <StatCard label="Active Vehicles" value={active.length} icon={Car} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatCard
          label="Today's Revenue"
          value={formatMoney(todayStats.revenue)}
          accent="text-green-600"
          icon={IndianRupee}
          iconBg="bg-green-50"
          iconColor="text-green-600"
        />
        <StatCard label="Today's Check-ins" value={todayStats.checkIns} icon={LogIn} iconBg="bg-amber-50" iconColor="text-amber-600" />
        <StatCard label="Available Slots" value={totalAvailable} icon={Grid3x3} iconBg="bg-violet-50" iconColor="text-violet-600" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card title="Occupancy by Vehicle Type">
          {occupancy.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No vehicle types configured yet.{' '}
              <Link to="/slots" className="text-blue-600 hover:underline dark:text-blue-400">
                Set up slots
              </Link>
            </p>
          ) : (
            <ul className="space-y-4">
              {occupancy.map((o) => {
                const pct = o.totalSlots > 0 ? Math.min(100, Math.round((o.occupied / o.totalSlots) * 100)) : 0;
                return (
                  <li key={o.type}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium capitalize text-slate-700 dark:text-slate-300">{o.type}</span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {o.occupied} / {o.totalSlots} · {o.available} free
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`h-full rounded-full ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-blue-600'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card title="Recently Checked In">
          {active.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No active vehicles right now.</p>
          ) : (
            <ul className="space-y-2">
              {active.slice(0, 6).map((s) => (
                <li key={s._id} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-800 dark:text-slate-200">{s.plateNumber}</span>
                  <span className="text-slate-500 dark:text-slate-400">{formatIST(s.entryTime)}</span>
                </li>
              ))}
            </ul>
          )}
          <Link to="/active" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
            View all active vehicles →
          </Link>
        </Card>
      </div>
    </div>
  );
}
