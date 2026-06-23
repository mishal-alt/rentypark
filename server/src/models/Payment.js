import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingSession', required: true, index: true },
    stationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, enum: ['cash', 'upi'], required: true },
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'paid' },
    paidAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('Payment', paymentSchema);
