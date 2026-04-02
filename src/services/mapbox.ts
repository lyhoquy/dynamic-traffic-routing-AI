import type { RouteData } from '../types/map';
import { MAPBOX_DIRECTIONS_API } from '../utils/constants';

const accessToken = import.meta.env.VITE_ACCESS_TOKEN;

type DirectionsProfile = 'driving' | 'driving-traffic' | 'walking' | 'cycling';

interface DirectionsOptions {
  profile?: DirectionsProfile;
  alternatives?: boolean;
  geometries?: 'geojson' | 'polyline';
  overview?: 'full' | 'simplified' | 'false';
  steps?: boolean;
}

/**
 * Gọi Mapbox Directions API để tính tuyến đường
 * @param coordinates - Mảng tọa độ [[lng, lat], [lng, lat], ...]
 */
export async function getDirections(
  coordinates: [number, number][],
  options: DirectionsOptions = {},
): Promise<RouteData[]> {
  const {
    profile = 'driving-traffic',
    alternatives = true,
    geometries = 'geojson',
    overview = 'full',
    steps = true,
  } = options;

  const coordString = coordinates.map((c) => c.join(',')).join(';');
  const params = new URLSearchParams({
    access_token: accessToken,
    alternatives: String(alternatives),
    geometries,
    overview,
    steps: String(steps),
  });

  const response = await fetch(
    `${MAPBOX_DIRECTIONS_API}/${profile}/${coordString}?${params}`,
  );

  if (!response.ok) {
    throw new Error(`Directions API error: ${response.status}`);
  }

  const data = await response.json();

  return data.routes.map((route: Record<string, unknown>, index: number) => ({
    id: `route-${index}`,
    geometry: route.geometry as GeoJSON.LineString,
    duration: route.duration as number,
    distance: route.distance as number,
    steps: ((route.legs as Array<{ steps: unknown[] }>)?.[0]?.steps ?? []).map(
      (step: Record<string, unknown>) => ({
        instruction: (step.maneuver as Record<string, string>)?.instruction ?? '',
        distance: step.distance as number,
        duration: step.duration as number,
        maneuver: {
          type: (step.maneuver as Record<string, string>)?.type ?? '',
          location: (step.maneuver as Record<string, unknown>)?.location as [number, number],
        },
      }),
    ),
  }));
}

/**
 * Reverse geocoding - lấy tên địa điểm từ tọa độ
 */
export async function reverseGeocode(
  lngLat: [number, number],
): Promise<string> {
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lngLat[0]},${lngLat[1]}.json?access_token=${accessToken}&language=vi`,
  );

  if (!response.ok) return `${lngLat[1].toFixed(4)}, ${lngLat[0].toFixed(4)}`;

  const data = await response.json();
  return data.features?.[0]?.place_name ?? `${lngLat[1].toFixed(4)}, ${lngLat[0].toFixed(4)}`;
}
