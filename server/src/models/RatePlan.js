import mongoose from 'mongoose';

const ratePlanSchema = new mongoose.Schema(
  {
    stationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true, index: true },
    vehicleType: { type: String, enum: ['car', 'bike', 'auto', 'truck', 'bus'], required: true },
    firstHourRate: { type: Number, required: true, min: 0 },
    additionalHourRate: { type: Number, required: true, min: 0 },
    roundingRule: { type: String, enum: ['round_up'], default: 'round_up' },
    gracePeriodMinutes: { type: Number, default: 0, min: 0 },
    dailyCap: { type: Number, default: null, min: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ratePlanSchema.index({ stationId: 1, vehicleType: 1 }, { unique: true });

export default mongoose.model('RatePlan', ratePlanSchema);
