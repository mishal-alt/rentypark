import { useEffect, useState } from 'react';
import { IndianRupee, CalendarDays, CalendarRange, Receipt } from 'lucide-react';
import { api } from '../api/client';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import PageHeader from '../components/PageHeader';
import { formatMoney } from '../utils/format';

function dayLabel(dateKey) {
  return Number(dateKey.slice(8, 10));
}

function monthLabel(monthKey) {
  const [year, month] = monthKey.split('-');
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('en-IN', { month: 'short' });
}

function BarChart({ data, labelFor, emptyMessage }) {
  if (data.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{emptyMessage}</p>;
  }

  const max = Math.max(1, ...data.map((d) => d.revenue));

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max items-end gap-2 sm:min-w-0 sm:gap-3" style={{ height: '160px' }}>
        {data.map((d) => {
          const pct = Math.max(2, Math.round((d.revenue / max) * 100));
          return (
            <div key={d.key} className="flex h-full w-8 flex-col items-center justify-end gap-1 sm:w-full" title={`${formatMoney(d.revenue)} · ${d.count} session(s)`}>
              <div className="flex h-full w-full items-end">
                <div
                  className={`w-full rounded-t-sm ${d.revenue > 0 ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                  style={{ height: `${pct}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">{labelFor(d.key)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Revenue() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api.get('/revenue/summary').then(({ data }) => setSummary(data));
  }, []);

  if (!summary) {
    return (
      <div>
        <PageHeader icon={IndianRupee} title="Revenue" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading...</p>
      </div>
    );
  }

  const dailyChartData = summary.daily.map((d) => ({ key: d.date, revenue: d.revenue, count: d.count }));
  const monthlyChartData = summary.monthly.map((m) => ({ key: m.month, revenue: m.revenue, count: m.count }));
  const totalSessions = summary.allTime.count;

  return (
    <div>
      <PageHeader icon={IndianRupee} title="Revenue" subtitle="Earnings across every closed session at this station." />

      <div className="mb-6 grid grid-cols-1 gap-4 xs:grid-cols-2 md:mb-8 md:grid-cols-4">
        <StatCard
          label="Today's Revenue"
          value={formatMoney(summary.today.revenue)}
          accent="text-green-600"
          icon={IndianRupee}
          iconBg="bg-green-50"
          iconColor="text-green-600"
        />
        <StatCard
          label="This Month"
          value={formatMoney(summary.thisMonth.revenue)}
          icon={CalendarDays}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          label="All-Time Revenue"
          value={formatMoney(summary.allTime.revenue)}
          icon={CalendarRange}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
        />
        <StatCard label="Total Sessions" value={totalSessions} icon={Receipt} iconBg="bg-amber-50" iconColor="text-amber-600" />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 md:mb-8 lg:grid-cols-2">
        <Card title="Daily Revenue (last 31 days)">
          <BarChart data={dailyChartData} labelFor={dayLabel} emptyMessage="No revenue recorded yet." />
        </Card>
        <Card title="Monthly Revenue (last 12 months)">
          <BarChart data={monthlyChartData} labelFor={monthLabel} emptyMessage="No revenue recorded yet." />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card title="Revenue by Vehicle Type">
          {summary.byVehicleType.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No closed sessions yet.</p>
          ) : (
            <div className="space-y-3">
              {summary.byVehicleType.map((v) => (
                <div key={v.vehicleType} className="flex items-center justify-between text-sm">
                  <span className="font-medium capitalize text-slate-700 dark:text-slate-300">{v.vehicleType}</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {formatMoney(v.revenue)} · {v.count} session{v.count === 1 ? '' : 's'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Revenue by Payment Method">
          {summary.byPaymentMethod.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No closed sessions yet.</p>
          ) : (
            <div className="space-y-3">
              {summary.byPaymentMethod.map((p) => (
                <div key={p.method || 'unknown'} className="flex items-center justify-between text-sm">
                  <span className="font-medium uppercase text-slate-700 dark:text-slate-300">{p.method || '—'}</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {formatMoney(p.revenue)} · {p.count} session{p.count === 1 ? '' : 's'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
