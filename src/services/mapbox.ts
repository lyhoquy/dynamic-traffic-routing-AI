import type { RouteData } from '../types/map';
import { MAPBOX_DIRECTIONS_API } from '../utils/constants';

const accessToken = import.meta.env.VITE_ACCESS_TOKEN;

function generateSessionToken(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `session-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

type DirectionsProfile = 'driving' | 'driving-traffic' | 'walking' | 'cycling';

interface DirectionsOptions {
  profile?: DirectionsProfile;
  alternatives?: boolean;
  geometries?: 'geojson' | 'polyline';
  overview?: 'full' | 'simplified' | 'false';
  steps?: boolean;
}

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
    language: 'vi',
    voice_instructions: 'true',
    banner_instructions: 'true',
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
      (step: unknown) => {
        const s = step as Record<string, unknown>;
        const maneuver = s.maneuver as Record<string, unknown> | undefined;
        return {
          instruction: (maneuver?.instruction as string | undefined) ?? '',
          distance: s.distance as number,
          duration: s.duration as number,
          maneuver: {
            type: (maneuver?.type as string | undefined) ?? '',
            location: maneuver?.location as [number, number],
          },
        };
      },
    ),
  }));
}


let sessionToken = generateSessionToken();

export function resetSearchSession() {
  sessionToken = generateSessionToken();
}

export interface SearchSuggestion {
  mapboxId: string;
  name: string;
  fullAddress: string;
  featureType: string;
  poiCategory?: string;
}

export interface SearchPlace {
  mapboxId: string;
  name: string;
  fullAddress: string;
  center: [number, number];
}

export async function suggestPlaces(
  query: string,
  proximity?: [number, number],
): Promise<SearchSuggestion[]> {
  if (!query.trim()) return [];

  const params = new URLSearchParams({
    q: query,
    access_token: accessToken,
    session_token: sessionToken,
    language: 'vi',
    limit: '8',
    country: 'VN',
    types: 'poi,address,street,place,locality,neighborhood',
  });

  if (proximity) {
    params.set('proximity', proximity.join(','));
  }

  try {
    const response = await fetch(
      `https://api.mapbox.com/search/searchbox/v1/suggest?${params}`,
    );
    if (!response.ok) return [];

    const data = await response.json();

    return (data.suggestions ?? []).map((s: Record<string, unknown>) => ({
      mapboxId: s.mapbox_id as string,
      name: (s.name as string) ?? '',
      fullAddress: (s.full_address as string) || (s.place_formatted as string) || (s.address as string) || '',
      featureType: (s.feature_type as string) ?? '',
      poiCategory: Array.isArray(s.poi_category) ? (s.poi_category as string[])[0] : undefined,
    }));
  } catch {
    return [];
  }
}

/**
 * Get the exact coordinates of a suggestion.
 */
export async function retrievePlace(
  mapboxId: string,
): Promise<SearchPlace | null> {
  const params = new URLSearchParams({
    access_token: accessToken,
    session_token: sessionToken,
  });

  try {
    const response = await fetch(
      `https://api.mapbox.com/search/searchbox/v1/retrieve/${mapboxId}?${params}`,
    );
    if (!response.ok) return null;

    const data = await response.json();
    const feature = data.features?.[0];
    if (!feature) return null;

    const coords = feature.geometry?.coordinates as [number, number] | undefined;
    const props = feature.properties ?? {};

    if (!coords) return null;

    return {
      mapboxId,
      name: (props.name as string) ?? '',
      fullAddress: (props.full_address as string) || (props.place_formatted as string) || '',
      center: coords,
    };
  } catch {
    return null;
  }
}

export async function reverseGeocode(
  lngLat: [number, number],
): Promise<string> {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lngLat[0]},${lngLat[1]}.json?access_token=${accessToken}&language=vi&country=vn`,
    );

    if (!response.ok) return `${lngLat[1].toFixed(4)}, ${lngLat[0].toFixed(4)}`;

    const data = await response.json();
    const feature = data.features?.[0];
    return (feature?.place_name_vi ?? feature?.place_name) ?? `${lngLat[1].toFixed(4)}, ${lngLat[0].toFixed(4)}`;
  } catch {
    return `${lngLat[1].toFixed(4)}, ${lngLat[0].toFixed(4)}`;
  }
}
