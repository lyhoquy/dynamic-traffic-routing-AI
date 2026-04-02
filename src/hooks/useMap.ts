import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapStore } from '../store/mapStore';
import type { MapViewState } from '../types/map';

interface UseMapOptions {
  container: React.RefObject<HTMLDivElement | null>;
  style?: string;
  initialViewState?: Partial<MapViewState>;
}

/**
 * Hook quản lý lifecycle của Mapbox Map instance.
 *
 * Tại sao dùng hook thay vì viết trực tiếp trong component?
 * - Tách biệt logic khởi tạo map khỏi UI
 * - Dễ tái sử dụng cho nhiều page (MapPage, DashboardPage)
 * - Map instance được lưu vào zustand store → các component khác truy cập được
 */
export function useMap({ container, style, initialViewState }: UseMapOptions) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const { setMap, setLoaded, viewState, currentStyle } = useMapStore();

  const mapStyle = style ?? currentStyle;
  const center = initialViewState?.center ?? viewState.center;
  const zoom = initialViewState?.zoom ?? viewState.zoom;
  const pitch = initialViewState?.pitch ?? viewState.pitch;
  const bearing = initialViewState?.bearing ?? viewState.bearing;

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

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      'top-right',
    );
    map.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

    map.on('load', () => {
      setLoaded(true);
    });

    mapRef.current = map;
    setMap(map);

    return () => {
      setMap(null);
      setLoaded(false);
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return mapRef;
}
