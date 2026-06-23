export function normalizePlate(plate) {
  return plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

// Pulls out the most plate-like run of characters from noisy OCR text —
// Indian plates are 9-10 alphanumeric chars (e.g. KL13AB1234) once normalized.
export function extractPlateCandidate(rawText) {
  const cleaned = normalizePlate(rawText || '');
  const match = cleaned.match(/[A-Z0-9]{6,11}/);
  return match ? match[0] : cleaned;
}
