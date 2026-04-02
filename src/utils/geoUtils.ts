/**
 * Haversine formula - tính khoảng cách (km) giữa 2 tọa độ GPS
 */
export function haversineDistance(
  coord1: [number, number],
  coord2: [number, number],
): number {
  const R = 6371;
  const dLat = toRad(coord2[1] - coord1[1]);
  const dLng = toRad(coord2[0] - coord1[0]);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(coord1[1])) *
      Math.cos(toRad(coord2[1])) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes} phút`;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * Tạo GeoJSON FeatureCollection từ mảng tọa độ
 */
export function coordsToLineGeoJSON(
  coordinates: [number, number][],
): GeoJSON.Feature<GeoJSON.LineString> {
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates,
    },
  };
}

export function coordToPointGeoJSON(
  coordinate: [number, number],
  properties: Record<string, unknown> = {},
): GeoJSON.Feature<GeoJSON.Point> {
  return {
    type: 'Feature',
    properties,
    geometry: {
      type: 'Point',
      coordinates: coordinate,
    },
  };
}
