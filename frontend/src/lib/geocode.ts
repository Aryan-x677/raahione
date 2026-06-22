/** Mirrors backend geocode lookup for Bangalore commute areas. */
const LOCATION_COORDINATES: Record<string, [number, number]> = {
  indiranagar: [12.9784, 77.6408],
  "indiranagar metro": [12.978, 77.638],
  whitefield: [12.9698, 77.75],
  "mg road": [12.9721, 77.595],
  koramangala: [12.9352, 77.6245],
  hebbal: [13.034, 77.597],
  jayanagar: [12.925, 77.5848],
  "lavelle road": [12.9754, 77.6011],
  yeshwanthpur: [13.0125, 77.5561],
  marathahalli: [12.9595, 77.7133],
  "white field": [12.9698, 77.75],
};

export function geocodeLocation(label: string): [number, number] | null {
  const normalized = label.trim().toLowerCase();
  if (normalized in LOCATION_COORDINATES) {
    return LOCATION_COORDINATES[normalized];
  }
  for (const [key, coords] of Object.entries(LOCATION_COORDINATES)) {
    if (key.includes(normalized) || normalized.includes(key)) {
      return coords;
    }
  }
  return null;
}

export const SAMPLE_LOCATIONS = [
  "Indiranagar Metro",
  "Whitefield",
  "Koramangala",
  "MG Road",
  "Hebbal",
  "Marathahalli",
];
