import Station from '../models/Station.js';
import RatePlan from '../models/RatePlan.js';
import ParkingSession from '../models/ParkingSession.js';
import Payment from '../models/Payment.js';
import { calculateCharge } from '../services/pricingEngine.js';
import { normalizePlate } from '../utils/plate.js';
import { scopedFind, scopedFindOne, withStation } from '../utils/tenantScope.js';

export async function checkIn(req, res) {
  const { plateNumber, vehicleType } = req.body;
  if (!plateNumber || !vehicleType) {
    return res.status(400).json({ error: 'plateNumber and vehicleType are required' });
  }
  const stationId = req.auth.stationId;
  const plate = normalizePlate(plateNumber);

  const existing = await scopedFindOne(ParkingSession, stationId, { plateNumber: plate, status: 'active' });
  if (existing) {
    return res.status(409).json({ error: `Plate ${plate} already has an active session` });
  }

  const station = await Station.findById(stationId);
  const vehicleConfig = station.vehicleTypes.find((vt) => vt.type === vehicleType);
  if (vehicleConfig) {
    const occupied = await ParkingSession.countDocuments({ stationId, vehicleType, status: 'active' });
    if (occupied >= vehicleConfig.totalSlots) {
      return res.status(409).json({ error: `No available slots for vehicle type "${vehicleType}"` });
    }
  }

  const ratePlan = await RatePlan.findOne({ stationId, vehicleType, active: true });
  if (!ratePlan) {
    return res.status(400).json({ error: `No active rate plan configured for vehicle type "${vehicleType}"` });
  }

  const session = await ParkingSession.create(
    withStation(stationId, {
      plateNumber: plate,
      vehicleType,
      entryTime: new Date(),
      status: 'active',
      ratePlanSnapshot: {
        firstHourRate: ratePlan.firstHourRate,
        additionalHourRate: ratePlan.additionalHourRate,
        roundingRule: ratePlan.roundingRule,
        gracePeriodMinutes: ratePlan.gracePeriodMinutes,
        dailyCap: ratePlan.dailyCap,
      },
      createdBy: req.auth.userId,
    })
  );

  res.status(201).json(session);
}

export async function listActiveSessions(req, res) {
  const sessions = await scopedFind(ParkingSession, req.auth.stationId, { status: 'active' }).sort({ entryTime: 1 });
  res.json(sessions);
}

export async function quoteCheckout(req, res) {
  const session = await scopedFindOne(ParkingSession, req.auth.stationId, { _id: req.params.id, status: 'active' });
  if (!session) return res.status(404).json({ error: 'Active session not found' });

  const { durationMinutes, chargeAmount } = calculateCharge({
    entryTime: session.entryTime,
    exitTime: new Date(),
    ratePlan: session.ratePlanSnapshot,
  });

  res.json({ durationMinutes, chargeAmount });
}

export async function checkOut(req, res) {
  const { paymentMethod } = req.body;
  if (!['cash', 'upi'].includes(paymentMethod)) {
    return res.status(400).json({ error: 'paymentMethod must be "cash" or "upi"' });
  }

  const session = await scopedFindOne(ParkingSession, req.auth.stationId, { _id: req.params.id, status: 'active' });
  if (!session) return res.status(404).json({ error: 'Active session not found' });

  const exitTime = new Date();
  const { durationMinutes, chargeAmount } = calculateCharge({
    entryTime: session.entryTime,
    exitTime,
    ratePlan: session.ratePlanSnapshot,
  });

  session.exitTime = exitTime;
  session.durationMinutes = durationMinutes;
  session.chargeAmount = chargeAmount;
  session.status = 'closed';
  session.paymentMethod = paymentMethod;
  await session.save();

  await Payment.create({
    sessionId: session._id,
    stationId: req.auth.stationId,
    amount: chargeAmount,
    method: paymentMethod,
    status: 'paid',
  });

  res.json(session);
}

export async function listHistory(req, res) {
  const { plateNumber, vehicleType, from, to, page = 1, limit = 20 } = req.query;
  const filter = { status: 'closed' };
  if (plateNumber) filter.plateNumber = normalizePlate(plateNumber);
  if (vehicleType) filter.vehicleType = vehicleType;
  if (from || to) {
    filter.entryTime = {};
    if (from) filter.entryTime.$gte = new Date(from);
    if (to) filter.entryTime.$lte = new Date(to);
  }

  const query = scopedFind(ParkingSession, req.auth.stationId, filter).sort({ exitTime: -1 });
  const total = await ParkingSession.countDocuments({ ...filter, stationId: req.auth.stationId });
  const sessions = await query.skip((page - 1) * limit).limit(Number(limit));

  res.json({ sessions, total, page: Number(page), limit: Number(limit) });
}
