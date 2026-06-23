import Station from '../models/Station.js';
import ParkingSession from '../models/ParkingSession.js';

const UPI_ID_PATTERN = /^[\w.\-]{2,}@[a-zA-Z]{2,}$/;

export async function getStation(req, res) {
  const station = await Station.findById(req.auth.stationId);
  res.json(station);
}

// Edit station profile fields, including the UPI ID used to generate checkout QR codes.
export async function updateStationProfile(req, res) {
  const { name, location, ownerContact, upiId } = req.body;

  if (upiId && !UPI_ID_PATTERN.test(upiId)) {
    return res.status(400).json({ error: 'Enter a valid UPI ID, e.g. yourname@bank' });
  }

  const update = {};
  if (name !== undefined) update.name = name;
  if (location !== undefined) update.location = location;
  if (ownerContact !== undefined) update.ownerContact = ownerContact;
  if (upiId !== undefined) update.upiId = upiId;

  const station = await Station.findByIdAndUpdate(req.auth.stationId, update, { new: true });
  res.json(station);
}

// Configure total slots per vehicle type for the station.
export async function updateVehicleTypes(req, res) {
  const { vehicleTypes } = req.body;
  if (!Array.isArray(vehicleTypes)) {
    return res.status(400).json({ error: 'vehicleTypes must be an array of { type, totalSlots }' });
  }
  const station = await Station.findByIdAndUpdate(
    req.auth.stationId,
    { vehicleTypes },
    { new: true }
  );
  res.json(station);
}

export async function getOccupancy(req, res) {
  const station = await Station.findById(req.auth.stationId);
  const counts = await ParkingSession.aggregate([
    { $match: { stationId: station._id, status: 'active' } },
    { $group: { _id: '$vehicleType', occupied: { $sum: 1 } } },
  ]);
  const occupiedByType = Object.fromEntries(counts.map((c) => [c._id, c.occupied]));

  const occupancy = station.vehicleTypes.map((vt) => ({
    type: vt.type,
    totalSlots: vt.totalSlots,
    occupied: occupiedByType[vt.type] || 0,
    available: vt.totalSlots - (occupiedByType[vt.type] || 0),
  }));

  res.json(occupancy);
}
