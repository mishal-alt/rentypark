/**
 * Every station-owned query must go through these helpers so stationId
 * scoping can never be accidentally omitted at a call site.
 */
export function scopedFind(Model, stationId, filter = {}) {
  return Model.find({ ...filter, stationId });
}

export function scopedFindOne(Model, stationId, filter = {}) {
  return Model.findOne({ ...filter, stationId });
}

export function scopedFindById(Model, stationId, id) {
  return Model.findOne({ _id: id, stationId });
}

export function withStation(stationId, doc = {}) {
  return { ...doc, stationId };
}
