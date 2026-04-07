// import type mapboxgl from 'mapbox-gl';

export interface MapViewState {
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
}

export interface RouteCoordinate {
  lng: number;
  lat: number;
}

export interface RouteData {
  id: string;
  geometry: GeoJSON.LineString;
  duration: number;
  distance: number;
  steps: RouteStep[];
}

export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  maneuver: {
    type: string;
    location: [number, number];
  };
}

export interface MapLayer {
  id: string;
  source: string;
  type: mapboxgl.LayerSpecification['type'];
  visible: boolean;
}
