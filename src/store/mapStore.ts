import { create } from 'zustand';
import type mapboxgl from 'mapbox-gl';
import type { MapViewState, RouteData } from '../types/map';
import { DEFAULT_VIEW_STATE, MAPBOX_STYLE } from '../utils/constants';

interface MapState {
  map: mapboxgl.Map | null;
  isLoaded: boolean;
  viewState: MapViewState;
  currentStyle: string;
  activeRoute: RouteData | null;
  alternativeRoutes: RouteData[];

  setMap: (map: mapboxgl.Map | null) => void;
  setLoaded: (loaded: boolean) => void;
  setViewState: (viewState: Partial<MapViewState>) => void;
  setCurrentStyle: (style: string) => void;
  setActiveRoute: (route: RouteData | null) => void;
  setAlternativeRoutes: (routes: RouteData[]) => void;
  clearRoutes: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  map: null,
  isLoaded: false,
  viewState: DEFAULT_VIEW_STATE,
  currentStyle: MAPBOX_STYLE.STREETS,
  activeRoute: null,
  alternativeRoutes: [],

  setMap: (map) => set({ map }),
  setLoaded: (isLoaded) => set({ isLoaded }),
  setViewState: (partial) =>
    set((state) => ({ viewState: { ...state.viewState, ...partial } })),
  setCurrentStyle: (currentStyle) => set({ currentStyle }),
  setActiveRoute: (activeRoute) => set({ activeRoute }),
  setAlternativeRoutes: (alternativeRoutes) => set({ alternativeRoutes }),
  clearRoutes: () => set({ activeRoute: null, alternativeRoutes: [] }),
}));
