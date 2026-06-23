import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    stationName: '',
    location: '',
    ownerContact: '',
    adminName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm xs:p-8">
        <h1 className="page-title mb-1 font-semibold text-slate-900">Create your station</h1>
        <p className="mb-6 text-sm text-slate-500">Set up RentyPark for your parking station</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Station name" value={form.stationName} onChange={update('stationName')} required />
          <Field label="Location" value={form.location} onChange={update('location')} />
          <Field label="Owner contact" value={form.ownerContact} onChange={update('ownerContact')} />
          <Field label="Your name (admin)" value={form.adminName} onChange={update('adminName')} required />
          <Field label="Email" type="email" value={form.email} onChange={update('email')} required />
          <Field label="Password" type="password" value={form.password} onChange={update('password')} required />

          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="min-h-11 w-full rounded-md bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create station'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required = false }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        required={required}
        className="min-h-11 w-full rounded-md border border-slate-300 px-3 text-base focus:border-blue-500 focus:outline-none md:text-sm"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
