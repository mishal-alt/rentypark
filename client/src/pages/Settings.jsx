import { useEffect, useState } from 'react';
import { Pencil, X } from 'lucide-react';
import { api } from '../api/client';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const [station, setStation] = useState(null);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', location: '', ownerContact: '', upiId: '' });
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    loadStation();
    if (user.role === 'admin') {
      api.get('/users').then(({ data }) => setUsers(data));
    }
  }, [user.role]);

  async function loadStation() {
    const { data } = await api.get('/station');
    setStation(data);
  }

  async function handleCreateOperator(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/users', form);
      setForm({ name: '', email: '', password: '' });
      setSuccess('Operator account created.');
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create operator');
    }
  }

  function startEditProfile() {
    setProfileForm({
      name: station.name || '',
      location: station.location || '',
      ownerContact: station.ownerContact || '',
      upiId: station.upiId || '',
    });
    setProfileError('');
    setEditingProfile(true);
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    setProfileError('');
    try {
      await api.put('/station', profileForm);
      setEditingProfile(false);
      loadStation();
    } catch (err) {
      setProfileError(err.response?.data?.error || 'Failed to save station profile');
    }
  }

  return (
    <div>
      <h1 className="page-title mb-6 font-semibold text-slate-900">Settings</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Station Profile</h2>
            {station && user.role === 'admin' && (
              <button
                onClick={() => (editingProfile ? setEditingProfile(false) : startEditProfile())}
                aria-label={editingProfile ? 'Cancel editing' : 'Edit station profile'}
                className="flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              >
                {editingProfile ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
              </button>
            )}
          </div>

          {!station ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : editingProfile ? (
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <Field label="Name" value={profileForm.name} onChange={(v) => setProfileForm({ ...profileForm, name: v })} required />
              <Field label="Location" value={profileForm.location} onChange={(v) => setProfileForm({ ...profileForm, location: v })} />
              <Field
                label="Owner Contact"
                value={profileForm.ownerContact}
                onChange={(v) => setProfileForm({ ...profileForm, ownerContact: v })}
              />
              <Field
                label="UPI ID"
                value={profileForm.upiId}
                onChange={(v) => setProfileForm({ ...profileForm, upiId: v })}
                placeholder="yourname@bank"
              />
              <p className="text-xs text-slate-500">
                Used to generate the UPI QR code shown to customers at checkout, with the exact amount pre-filled.
              </p>
              {profileError && <p className="text-sm text-red-600">{profileError}</p>}
              <button type="submit" className="min-h-11 w-full rounded-md bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700">
                Save Changes
              </button>
            </form>
          ) : (
            <dl className="space-y-2 text-sm">
              <Row label="Name" value={station.name} />
              <Row label="Location" value={station.location || '—'} />
              <Row label="Owner Contact" value={station.ownerContact || '—'} />
              <Row label="UPI ID" value={station.upiId || 'Not set'} capitalize={false} />
              <Row label="Subscription" value={station.subscriptionStatus} />
            </dl>
          )}
        </Card>

        {user.role === 'admin' && (
          <Card title="Operators">
            <ul className="mb-4 space-y-2 text-sm">
              {users.map((u) => (
                <li key={u._id || u.id} className="flex items-center justify-between gap-3">
                  <span className="truncate text-slate-700">{u.name}</span>
                  <span className="shrink-0 capitalize text-slate-500">{u.role}</span>
                </li>
              ))}
            </ul>
            <form onSubmit={handleCreateOperator} className="space-y-2">
              <input
                placeholder="Name"
                required
                className="min-h-11 w-full rounded-md border border-slate-300 px-3 text-base md:text-sm"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                placeholder="Email"
                type="email"
                required
                className="min-h-11 w-full rounded-md border border-slate-300 px-3 text-base md:text-sm"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                placeholder="Password"
                type="password"
                required
                className="min-h-11 w-full rounded-md border border-slate-300 px-3 text-base md:text-sm"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              {success && <p className="text-sm text-green-600">{success}</p>}
              <button type="submit" className="min-h-11 w-full rounded-md bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700">
                Add Operator
              </button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, capitalize = true }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className={`truncate font-medium text-slate-900 ${capitalize ? 'capitalize' : ''}`}>{value}</dd>
    </div>
  );
}

function Field({ label, value, onChange, required = false, placeholder = '' }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <input
        required={required}
        placeholder={placeholder}
        className="min-h-11 w-full rounded-md border border-slate-300 px-3 text-base md:text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
