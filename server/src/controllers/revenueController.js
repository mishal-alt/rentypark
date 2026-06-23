import mongoose from 'mongoose';
import ParkingSession from '../models/ParkingSession.js';

const IST_TIMEZONE = 'Asia/Kolkata';
const DAILY_SERIES_DAYS = 31;
const MONTHLY_SERIES_MONTHS = 12;

function istDateKey(date) {
  // en-CA formats as YYYY-MM-DD, which matches our $dateToString grouping keys.
  return date.toLocaleDateString('en-CA', { timeZone: IST_TIMEZONE });
}

function istMonthKey(date) {
  return istDateKey(date).slice(0, 7);
}

async function groupByIstPeriod(stationId, format, since) {
  const match = { stationId, status: 'closed' };
  if (since) match.exitTime = { $gte: since };

  const rows = await ParkingSession.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format, date: '$exitTime', timezone: IST_TIMEZONE } },
        revenue: { $sum: '$chargeAmount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return rows.map((r) => ({ key: r._id, revenue: r.revenue, count: r.count }));
}

export async function getRevenueSummary(req, res) {
  const stationId = new mongoose.Types.ObjectId(req.auth.stationId);
  const now = new Date();
  const sinceDaily = new Date(now.getTime() - DAILY_SERIES_DAYS * 24 * 60 * 60 * 1000);
  const sinceMonthly = new Date(now.getTime() - MONTHLY_SERIES_MONTHS * 31 * 24 * 60 * 60 * 1000);

  const [allTimeRows, byVehicleType, byPaymentMethod, daily, monthly] = await Promise.all([
    ParkingSession.aggregate([
      { $match: { stationId, status: 'closed' } },
      { $group: { _id: null, revenue: { $sum: '$chargeAmount' }, count: { $sum: 1 } } },
    ]),
    ParkingSession.aggregate([
      { $match: { stationId, status: 'closed' } },
      { $group: { _id: '$vehicleType', revenue: { $sum: '$chargeAmount' }, count: { $sum: 1 } } },
      { $sort: { revenue: -1 } },
    ]),
    ParkingSession.aggregate([
      { $match: { stationId, status: 'closed' } },
      { $group: { _id: '$paymentMethod', revenue: { $sum: '$chargeAmount' }, count: { $sum: 1 } } },
    ]),
    groupByIstPeriod(stationId, '%Y-%m-%d', sinceDaily),
    groupByIstPeriod(stationId, '%Y-%m', sinceMonthly),
  ]);

  const allTime = allTimeRows[0]
    ? { revenue: allTimeRows[0].revenue, count: allTimeRows[0].count }
    : { revenue: 0, count: 0 };

  const todayKey = istDateKey(now);
  const monthKey = istMonthKey(now);
  const todayRow = daily.find((d) => d.key === todayKey);
  const monthRow = monthly.find((m) => m.key === monthKey);

  res.json({
    today: { date: todayKey, revenue: todayRow?.revenue || 0, count: todayRow?.count || 0 },
    thisMonth: { month: monthKey, revenue: monthRow?.revenue || 0, count: monthRow?.count || 0 },
    allTime,
    daily: daily.map((d) => ({ date: d.key, revenue: d.revenue, count: d.count })),
    monthly: monthly.map((m) => ({ month: m.key, revenue: m.revenue, count: m.count })),
    byVehicleType: byVehicleType.map((v) => ({ vehicleType: v._id, revenue: v.revenue, count: v.count })),
    byPaymentMethod: byPaymentMethod.map((p) => ({ method: p._id, revenue: p.revenue, count: p.count })),
  });
}
