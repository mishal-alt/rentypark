export default function StatCard({ label, value, icon: Icon, accent = 'text-slate-900', iconBg = 'bg-blue-50', iconColor = 'text-blue-600' }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-medium text-slate-500">{label}</div>
          <div className={`mt-1.5 text-2xl font-semibold ${accent}`}>{value}</div>
        </div>
        {Icon && (
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} strokeWidth={2} />
          </div>
        )}
      </div>
    </div>
  );
}
