import type { MapViewState } from '../types/map';

export const MAPBOX_STYLE = {
  STREETS: 'mapbox://styles/mapbox/streets-v12',
  LIGHT: 'mapbox://styles/mapbox/light-v11',
  DARK: 'mapbox://styles/mapbox/dark-v11',
  SATELLITE: 'mapbox://styles/mapbox/satellite-streets-v12',
} as const;

export const DA_NANG_CENTER: [number, number] = [108.2022, 16.0544];

export const DEFAULT_VIEW_STATE: MapViewState = {
  center: DA_NANG_CENTER,
  zoom: 14,
  pitch: 0,
  bearing: 0,
};

export const MAPBOX_DIRECTIONS_API = 'https://api.mapbox.com/directions/v5/mapbox';

export const INCIDENT_COLORS: Record<string, string> = {
  accident: '#ef4444',
  congestion: '#f59e0b',
  road_closure: '#dc2626',
  construction: '#f97316',
  weather: '#6366f1',
  other: '#6b7280',
};

export const CONGESTION_COLORS: Record<string, string> = {
  free: '#22c55e',
  moderate: '#f59e0b',
  heavy: '#ef4444',
  blocked: '#7f1d1d',
};

export const WS_RECONNECT_INTERVAL = 3000;
export const WS_MAX_RECONNECT_ATTEMPTS = 10;

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000/ws';
