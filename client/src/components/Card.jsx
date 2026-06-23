export default function Card({ title, children, className = '' }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}>
      {title && <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2>}
      {children}
    </div>
  );
}
