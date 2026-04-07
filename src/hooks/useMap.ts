import { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapStore } from '../store/mapStore';
import { useSimulatorStore } from '../store/simulatorStore';
import { useIncidentStore } from '../store/incidentStore';
import { reverseGeocode } from '../services/mapbox';
import type { MapViewState } from '../types/map';

interface UseMapOptions {
  container: React.RefObject<HTMLDivElement | null>;
  style?: string;
  initialViewState?: Partial<MapViewState>;
}

export function useMap({ container, style, initialViewState }: UseMapOptions) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const geolocateRef = useRef<mapboxgl.GeolocateControl | null>(null);
  const destinationMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const { setMap, setLoaded, viewState, currentStyle } = useMapStore();

  const mapStyle = style ?? currentStyle;
  const center = initialViewState?.center ?? viewState.center;
  const zoom = initialViewState?.zoom ?? viewState.zoom;
  const pitch = initialViewState?.pitch ?? viewState.pitch;
  const bearing = initialViewState?.bearing ?? viewState.bearing;

  const handleMapClick = useCallback(async (e: mapboxgl.MapMouseEvent) => {
    const simState = useSimulatorStore.getState();

    if (simState.incidentCreationMode) {
      const lngLat = e.lngLat;
      const { pendingIncidentType, pendingIncidentSeverity } = simState;

      const typeLabels: Record<string, string> = {
        accident: 'Tai nạn',
        congestion: 'Tắc nghẽn',
        road_closure: 'Cấm đường',
        construction: 'Thi công',
        weather: 'Thời tiết xấu',
        other: 'Sự cố',
      };

      useIncidentStore.getState().addIncident({
        id: `inc-${Date.now()}`,
        type: pendingIncidentType,
        severity: pendingIncidentSeverity,
        location: { lng: lngLat.lng, lat: lngLat.lat },
        description: `${typeLabels[pendingIncidentType]} được tạo tại vị trí giả lập`,
        detectedAt: new Date().toISOString(),
        affectedRoutes: [],
        source: 'ai_detection',
      });
      return;
    }

    const state = useMapStore.getState();
    if (state.navigationState === 'navigating') return;

    const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat];

    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.remove();
    }

    const markerEl = document.createElement('div');
    markerEl.className = 'destination-marker';
    markerEl.innerHTML = `
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none">
        <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 24 16 24s16-12 16-24C32 7.16 24.84 0 16 0z" fill="#ea4335"/>
        <circle cx="16" cy="16" r="6" fill="white"/>
      </svg>
    `;

    destinationMarkerRef.current = new mapboxgl.Marker({ element: markerEl, anchor: 'bottom' })
      .setLngLat(lngLat)
      .addTo(state.map!);

    const name = await reverseGeocode(lngLat);
    useMapStore.getState().setDestination({ lng: lngLat[0], lat: lngLat[1], name });
    useMapStore.getState().setNavigationState('route_preview');
  }, []);

  useEffect(() => {
    if (!container.current || mapRef.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_ACCESS_TOKEN;

    const map = new mapboxgl.Map({
      container: container.current,
      style: mapStyle,
      center,
      zoom,
      pitch,
      bearing,
    });

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true,
    });
    geolocateRef.current = geolocate;

    map.addControl(geolocate, 'top-right');
    map.addControl(new mapboxgl.ScaleControl({ maxWidth: 100 }), 'bottom-left');
    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'bottom-right');

    map.on('load', () => {
      setLoaded(true);
      geolocate.trigger();
    });

    geolocate.on('geolocate', (e: unknown) => {
      const pos = e as GeolocationPosition;
      const { longitude, latitude, accuracy, heading, speed } = pos.coords;

      useMapStore.getState().setUserLocation({
        lng: longitude,
        lat: latitude,
        accuracy,
        heading,
        speed,
        timestamp: pos.timestamp,
      });

      const kmh = speed != null ? Math.round(speed * 3.6) : 0;
      useMapStore.getState().setCurrentSpeed(kmh);

      const state = useMapStore.getState();
      if (state.navigationState === 'navigating') {
        map.easeTo({
          center: [longitude, latitude],
          bearing: heading ?? map.getBearing(),
          pitch: 60,
          zoom: 17,
          duration: 1000,
        });
      }
    });

    map.on('click', handleMapClick);

    mapRef.current = map;
    setMap(map);

    return () => {
      map.off('click', handleMapClick);
      destinationMarkerRef.current?.remove();
      setMap(null);
      setLoaded(false);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return mapRef;
}
