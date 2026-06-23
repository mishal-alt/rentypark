import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../api/client';
import { formatMoney, formatDuration } from '../utils/format';

function buildUpiUri({ upiId, payeeName, amountPaise, note }) {
  const params = new URLSearchParams({
    pa: upiId,
    pn: payeeName,
    am: (amountPaise / 100).toFixed(2),
    cu: 'INR',
    tn: note,
  });
  return `upi://pay?${params.toString()}`;
}

export default function CheckoutModal({ session, onClose, onComplete }) {
  const [quote, setQuote] = useState(null);
  const [station, setStation] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/sessions/${session._id}/quote`).then(({ data }) => setQuote(data));
    api.get('/station').then(({ data }) => setStation(data));
  }, [session._id]);

  async function handleConfirm() {
    setError('');
    setLoading(true);
    try {
      await api.post(`/sessions/${session._id}/check-out`, { paymentMethod });
      onComplete();
    } catch (err) {
      setError(err.response?.data?.error || 'Check-out failed');
    } finally {
      setLoading(false);
    }
  }

  const upiUri =
    quote && station?.upiId
      ? buildUpiUri({
          upiId: station.upiId,
          payeeName: station.name,
          amountPaise: quote.chargeAmount,
          note: `Parking ${session.plateNumber}`,
        })
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-xl bg-white p-5 shadow-lg xs:p-6">
        <h2 className="mb-1 text-lg font-semibold text-slate-900">Check Out {session.plateNumber}</h2>
        <p className="mb-4 text-sm capitalize text-slate-500">{session.vehicleType}</p>

        {quote ? (
          <div className="mb-4 rounded-lg bg-slate-50 p-4 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Duration</span>
              <span className="font-medium text-slate-900">{formatDuration(quote.durationMinutes)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Charge</span>
              <span className="text-lg font-semibold text-slate-900">{formatMoney(quote.chargeAmount)}</span>
            </div>
          </div>
        ) : (
          <p className="mb-4 text-sm text-slate-500">Calculating charge...</p>
        )}

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-slate-700">Payment Method</label>
          <div className="flex gap-2">
            {['cash', 'upi'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setPaymentMethod(m)}
                className={`min-h-11 flex-1 rounded-md border px-3 text-sm font-medium uppercase ${
                  paymentMethod === m
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {paymentMethod === 'upi' && quote && (
          <div className="mb-4 rounded-lg border border-slate-200 p-4 text-center">
            {station?.upiId ? (
              <>
                <div className="flex justify-center">
                  <div className="rounded-lg bg-white p-3 ring-1 ring-slate-200">
                    <QRCodeSVG value={upiUri} size={168} />
                  </div>
                </div>
                <p className="mt-3 text-sm font-medium text-slate-700">Scan to pay {formatMoney(quote.chargeAmount)}</p>
                <p className="mt-0.5 text-xs text-slate-500">to {station.upiId}</p>
              </>
            ) : (
              <p className="text-sm text-slate-500">
                No UPI ID configured for this station yet. Add one in{' '}
                <Link to="/settings" onClick={onClose} className="font-medium text-blue-600 hover:underline">
                  Settings
                </Link>{' '}
                to show a scannable QR code here.
              </p>
            )}
          </div>
        )}

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <div className="flex gap-2">
          <button onClick={onClose} className="min-h-11 flex-1 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !quote}
            className="min-h-11 flex-1 rounded-md bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
