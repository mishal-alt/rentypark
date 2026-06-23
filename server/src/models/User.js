import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    stationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'operator'], required: true },
  },
  { timestamps: true }
);

userSchema.index({ stationId: 1, email: 1 }, { unique: true });

export default mongoose.model('User', userSchema);
