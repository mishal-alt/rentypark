import Razorpay from 'razorpay';
import ParkingSession from '../models/ParkingSession.js';
import { scopedFindOne } from '../utils/tenantScope.js';

function getRazorpayClient() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// Creates a Razorpay order for the live (pre-checkout) charge quote so the
// frontend can launch the UPI checkout widget before finalizing checkOut().
export async function createRazorpayOrder(req, res) {
  const session = await scopedFindOne(ParkingSession, req.auth.stationId, { _id: req.params.id, status: 'active' });
  if (!session) return res.status(404).json({ error: 'Active session not found' });

  const { amount } = req.body;
  if (!amount) return res.status(400).json({ error: 'amount is required' });

  const razorpay = getRazorpayClient();
  const order = await razorpay.orders.create({
    amount,
    currency: 'INR',
    receipt: `session_${session._id}`,
  });

  res.status(201).json(order);
}

// Stub webhook endpoint — verify Razorpay's signature header and mark the
// matching Payment record as paid once a real Razorpay account is wired up.
export async function razorpayWebhook(req, res) {
  res.status(200).json({ received: true });
}
