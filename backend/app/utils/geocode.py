from typing import Tuple

LOCATION_COORDINATES = {
    "indiranagar": (12.9784, 77.6408),
    "indiranagar metro": (12.9780, 77.6380),
    "whitefield": (12.9698, 77.7500),
    "mg road": (12.9721, 77.5950),
    "koramangala": (12.9352, 77.6245),
    "hebbal": (13.0340, 77.5970),
    "jayanagar": (12.9250, 77.5848),
    "lavelle road": (12.9754, 77.6011),
    "yeshwanthpur": (13.0125, 77.5561),
    "marathahalli": (12.9595, 77.7133),
    "white field": (12.9698, 77.7500),
}


def geocode_location(label: str) -> Tuple[float, float] | None:
    if label is None:
        return None

    normalized = label.strip().lower()
    if normalized in LOCATION_COORDINATES:
        return LOCATION_COORDINATES[normalized]

    for key, coords in LOCATION_COORDINATES.items():
        if key in normalized or normalized in key:
            return coords

    return None
