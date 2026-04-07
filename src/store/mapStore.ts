import { create } from 'zustand';
// import type mapboxgl from 'mapbox-gl';
import type { MapViewState, RouteData } from '../types/map';
import { DEFAULT_VIEW_STATE, MAPBOX_STYLE } from '../utils/constants';

export type NavigationState = 'idle' | 'searching' | 'route_preview' | 'navigating';

export interface UserLocation {
  lng: number;
  lat: number;
  accuracy: number;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

export interface Destination {
  lng: number;
  lat: number;
  name: string;
}

interface MapState {
  map: mapboxgl.Map | null;
  isLoaded: boolean;
  viewState: MapViewState;
  currentStyle: string;

  navigationState: NavigationState;
  userLocation: UserLocation | null;
  destination: Destination | null;
  activeRoute: RouteData | null;
  alternativeRoutes: RouteData[];
  eta: number | null;
  distanceRemaining: number | null;
  currentSpeed: number;

  setMap: (map: mapboxgl.Map | null) => void;
  setLoaded: (loaded: boolean) => void;
  setViewState: (viewState: Partial<MapViewState>) => void;
  setCurrentStyle: (style: string) => void;
  setNavigationState: (state: NavigationState) => void;
  setUserLocation: (loc: UserLocation) => void;
  setDestination: (dest: Destination | null) => void;
  setActiveRoute: (route: RouteData | null) => void;
  setAlternativeRoutes: (routes: RouteData[]) => void;
  setEta: (eta: number | null) => void;
  setDistanceRemaining: (d: number | null) => void;
  setCurrentSpeed: (speed: number) => void;
  startNavigation: (route: RouteData) => void;
  stopNavigation: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  map: null,
  isLoaded: false,
  viewState: DEFAULT_VIEW_STATE,
  currentStyle: MAPBOX_STYLE.STREETS,

  navigationState: 'idle',
  userLocation: null,
  destination: null,
  activeRoute: null,
  alternativeRoutes: [],
  eta: null,
  distanceRemaining: null,
  currentSpeed: 0,

  setMap: (map) => set({ map }),
  setLoaded: (isLoaded) => set({ isLoaded }),
  setViewState: (partial) =>
    set((state) => ({ viewState: { ...state.viewState, ...partial } })),
  setCurrentStyle: (currentStyle) => set({ currentStyle }),
  setNavigationState: (navigationState) => set({ navigationState }),
  setUserLocation: (userLocation) => set({ userLocation }),
  setDestination: (destination) => set({ destination }),
  setActiveRoute: (activeRoute) => set({ activeRoute }),
  setAlternativeRoutes: (alternativeRoutes) => set({ alternativeRoutes }),
  setEta: (eta) => set({ eta }),
  setDistanceRemaining: (distanceRemaining) => set({ distanceRemaining }),
  setCurrentSpeed: (currentSpeed) => set({ currentSpeed }),

  startNavigation: (route) =>
    set({
      navigationState: 'navigating',
      activeRoute: route,
      eta: route.duration,
      distanceRemaining: route.distance,
    }),

  stopNavigation: () =>
    set({
      navigationState: 'idle',
      activeRoute: null,
      alternativeRoutes: [],
      destination: null,
      eta: null,
      distanceRemaining: null,
    }),
}));
