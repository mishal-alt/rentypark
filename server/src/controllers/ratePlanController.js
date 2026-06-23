import RatePlan from '../models/RatePlan.js';
import { scopedFind, scopedFindById, scopedFindOne, withStation } from '../utils/tenantScope.js';

export async function listRatePlans(req, res) {
  const plans = await scopedFind(RatePlan, req.auth.stationId);
  res.json(plans);
}

export async function createRatePlan(req, res) {
  const { vehicleType, firstHourRate, additionalHourRate, gracePeriodMinutes, dailyCap } = req.body;
  if (!vehicleType || firstHourRate == null || additionalHourRate == null) {
    return res.status(400).json({ error: 'vehicleType, firstHourRate and additionalHourRate are required' });
  }

  const existing = await scopedFindOne(RatePlan, req.auth.stationId, { vehicleType });
  if (existing) {
    return res.status(409).json({ error: `A rate plan for "${vehicleType}" already exists — edit it instead of creating a new one` });
  }

  const plan = await RatePlan.create(
    withStation(req.auth.stationId, {
      vehicleType,
      firstHourRate,
      additionalHourRate,
      gracePeriodMinutes: gracePeriodMinutes || 0,
      dailyCap: dailyCap ?? null,
    })
  );
  res.status(201).json(plan);
}

export async function updateRatePlan(req, res) {
  const plan = await scopedFindById(RatePlan, req.auth.stationId, req.params.id);
  if (!plan) return res.status(404).json({ error: 'Rate plan not found' });

  const { firstHourRate, additionalHourRate, gracePeriodMinutes, dailyCap, active } = req.body;
  if (firstHourRate != null) plan.firstHourRate = firstHourRate;
  if (additionalHourRate != null) plan.additionalHourRate = additionalHourRate;
  if (gracePeriodMinutes != null) plan.gracePeriodMinutes = gracePeriodMinutes;
  if (dailyCap !== undefined) plan.dailyCap = dailyCap;
  if (active != null) plan.active = active;
  await plan.save();

  res.json(plan);
}

export async function deleteRatePlan(req, res) {
  const plan = await scopedFindById(RatePlan, req.auth.stationId, req.params.id);
  if (!plan) return res.status(404).json({ error: 'Rate plan not found' });

  await plan.deleteOne();
  res.status(204).end();
}
