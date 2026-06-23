export default function PageHeader({ icon: Icon, title, subtitle, action, className = '' }) {
  return (
    <div className={`mb-6 flex flex-wrap items-start justify-between gap-3 md:mb-8 ${className}`}>
      <div className="flex items-center gap-3">
        {Icon && (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-blue-700 text-white shadow-sm shadow-blue-600/30">
            <Icon className="h-5.5 w-5.5" strokeWidth={2} />
          </span>
        )}
        <div>
          <h1 className="page-title font-semibold text-slate-900 dark:text-slate-50">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}
