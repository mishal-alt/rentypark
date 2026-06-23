import mongoose from 'mongoose';

const ratePlanSnapshotSchema = new mongoose.Schema(
  {
    firstHourRate: Number,
    additionalHourRate: Number,
    roundingRule: String,
    gracePeriodMinutes: Number,
    dailyCap: Number,
  },
  { _id: false }
);

const parkingSessionSchema = new mongoose.Schema(
  {
    stationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true, index: true },
    plateNumber: { type: String, required: true, trim: true, uppercase: true },
    vehicleType: { type: String, enum: ['car', 'bike', 'auto', 'truck', 'bus'], required: true },
    entryTime: { type: Date, required: true },
    exitTime: { type: Date, default: null },
    durationMinutes: { type: Number, default: null },
    chargeAmount: { type: Number, default: null },
    status: { type: String, enum: ['active', 'closed'], default: 'active', index: true },
    ratePlanSnapshot: { type: ratePlanSnapshotSchema, required: true },
    paymentMethod: { type: String, enum: ['cash', 'upi', null], default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

parkingSessionSchema.index({ stationId: 1, status: 1 });
parkingSessionSchema.index({ stationId: 1, plateNumber: 1, status: 1 });

export default mongoose.model('ParkingSession', parkingSessionSchema);
