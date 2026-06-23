import { useEffect, useState } from 'react';
import { Pencil, Trash2, X, Wallet } from 'lucide-react';
import { api } from '../api/client';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import { formatMoney } from '../utils/format';

const VEHICLE_TYPES = ['car', 'bike', 'auto', 'truck', 'bus'];

const emptyForm = { vehicleType: '', firstHourRate: '', additionalHourRate: '', gracePeriodMinutes: 0, dailyCap: '' };

export default function RatePlans() {
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await api.get('/rate-plans');
    setPlans(data);
  }

  const usedTypes = new Set(plans.map((p) => p.vehicleType));
  const availableTypes = VEHICLE_TYPES.filter((t) => editingId || !usedTypes.has(t));

  // Keep the (uncontrolled-looking) select in sync with reality: if the
  // currently selected type is no longer available — e.g. someone else just
  // created a "car" plan, or one just got created in this form — fall back
  // to the first remaining option instead of silently submitting a stale type.
  useEffect(() => {
    if (editingId) return;
    if (!form.vehicleType || !availableTypes.includes(form.vehicleType)) {
      setForm((f) => ({ ...f, vehicleType: availableTypes[0] || '' }));
    }
  }, [availableTypes, editingId, form.vehicleType]);

  function startEdit(plan) {
    setEditingId(plan._id);
    setForm({
      vehicleType: plan.vehicleType,
      firstHourRate: plan.firstHourRate / 100,
      additionalHourRate: plan.additionalHourRate / 100,
      gracePeriodMinutes: plan.gracePeriodMinutes,
      dailyCap: plan.dailyCap ? plan.dailyCap / 100 : '',
    });
    setError('');
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const payload = {
      vehicleType: form.vehicleType,
      firstHourRate: Math.round(Number(form.firstHourRate) * 100),
      additionalHourRate: Math.round(Number(form.additionalHourRate) * 100),
      gracePeriodMinutes: Number(form.gracePeriodMinutes) || 0,
      dailyCap: form.dailyCap ? Math.round(Number(form.dailyCap) * 100) : null,
    };
    try {
      if (editingId) {
        await api.put(`/rate-plans/${editingId}`, payload);
      } else {
        await api.post('/rate-plans', payload);
      }
      cancelEdit();
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save rate plan');
    }
  }

  async function toggleActive(plan) {
    await api.put(`/rate-plans/${plan._id}`, { active: !plan.active });
    load();
  }

  async function handleDelete(plan) {
    if (!window.confirm(`Delete the rate plan for "${plan.vehicleType}"? This cannot be undone.`)) return;
    await api.delete(`/rate-plans/${plan._id}`);
    if (editingId === plan._id) cancelEdit();
    load();
  }

  return (
    <div>
      <PageHeader icon={Wallet} title="Rate Plans" subtitle="Configure pricing per vehicle type." />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card title={editingId ? 'Edit Rate Plan' : 'New Rate Plan'} className="xl:col-span-1">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Vehicle Type</label>
              <select
                disabled={!!editingId}
                className="min-h-11 w-full rounded-md border border-slate-300 px-3 text-base capitalize disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:disabled:bg-slate-900 md:text-sm"
                value={form.vehicleType}
                onChange={(e) => {
                  setForm({ ...form, vehicleType: e.target.value });
                  setError('');
                }}
              >
                {availableTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {!editingId && availableTypes.length === 0 && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Every vehicle type already has a rate plan.</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">First Hour Rate (₹)</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                className="min-h-11 w-full rounded-md border border-slate-300 px-3 text-base dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 md:text-sm"
                value={form.firstHourRate}
                onChange={(e) => setForm({ ...form, firstHourRate: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Additional Hour Rate (₹)</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                className="min-h-11 w-full rounded-md border border-slate-300 px-3 text-base dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 md:text-sm"
                value={form.additionalHourRate}
                onChange={(e) => setForm({ ...form, additionalHourRate: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Grace Period (minutes)</label>
              <input
                type="number"
                min="0"
                className="min-h-11 w-full rounded-md border border-slate-300 px-3 text-base dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 md:text-sm"
                value={form.gracePeriodMinutes}
                onChange={(e) => setForm({ ...form, gracePeriodMinutes: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Daily Cap (₹, optional)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="min-h-11 w-full rounded-md border border-slate-300 px-3 text-base dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 md:text-sm"
                value={form.dailyCap}
                onChange={(e) => setForm({ ...form, dailyCap: e.target.value })}
              />
            </div>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <div className="flex flex-col gap-2 xs:flex-row">
              <button
                type="submit"
                disabled={!form.vehicleType || (!editingId && availableTypes.length === 0)}
                className="min-h-11 flex-1 rounded-md bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {editingId ? 'Save Changes' : 'Save Rate Plan'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="min-h-11 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </Card>

        <Card title="Existing Rate Plans" className="xl:col-span-2">
          {plans.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No rate plans configured yet.</p>
          ) : (
            <div className="space-y-3">
              {plans.map((p) => (
                <div
                  key={p._id}
                  className={`flex flex-col gap-3 rounded-lg border p-3 text-sm xs:flex-row xs:items-center xs:justify-between ${
                    editingId === p._id ? 'border-blue-300 bg-blue-50/50' : 'border-slate-200'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="font-medium capitalize text-slate-900">{p.vehicleType}</div>
                    <div className="text-slate-500">
                      First hour {formatMoney(p.firstHourRate)} · +{formatMoney(p.additionalHourRate)}/hr
                      {p.gracePeriodMinutes ? ` · ${p.gracePeriodMinutes}m grace` : ''}
                      {p.dailyCap ? ` · cap ${formatMoney(p.dailyCap)}/day` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(p)}
                      className={`min-h-11 flex-1 rounded-md px-3 text-xs font-semibold xs:flex-none ${
                        p.active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {p.active ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      onClick={() => (editingId === p._id ? cancelEdit() : startEdit(p))}
                      aria-label="Edit rate plan"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    >
                      {editingId === p._id ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      aria-label="Delete rate plan"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
