import mongoose from 'mongoose';

const vehicleTypeSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['car', 'bike', 'auto', 'truck', 'bus'], required: true },
    totalSlots: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const stationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    ownerContact: { type: String, trim: true },
    subscriptionStatus: { type: String, enum: ['active', 'trial', 'suspended'], default: 'trial' },
    vehicleTypes: { type: [vehicleTypeSchema], default: [] },
    upiId: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Station', stationSchema);
