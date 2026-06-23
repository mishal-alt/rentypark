export function formatMoney(paise) {
  return `₹${(paise / 100).toFixed(2)}`;
}

export function formatIST(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function formatDuration(minutes) {
  if (minutes == null) return '—';
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}
