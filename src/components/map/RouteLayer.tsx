import { useEffect } from 'react';
import { useMapStore } from '../../store/mapStore';

const ROUTE_SOURCE = 'route-source';
const ROUTE_LINE_LAYER = 'route-line';
const ROUTE_LINE_CASING = 'route-line-casing';
const ALT_ROUTE_SOURCE = 'alt-route-source';
const ALT_ROUTE_LINE = 'alt-route-line';

export function RouteLayer() {
  const map = useMapStore((s) => s.map);
  const activeRoute = useMapStore((s) => s.activeRoute);
  const alternativeRoutes = useMapStore((s) => s.alternativeRoutes);

  useEffect(() => {
    if (!map) return;

    if (!map.getSource(ROUTE_SOURCE)) {
      map.addSource(ROUTE_SOURCE, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      map.addLayer({
        id: ROUTE_LINE_CASING,
        type: 'line',
        source: ROUTE_SOURCE,
        paint: {
          'line-color': '#1e40af',
          'line-width': 10,
          'line-opacity': 0.3,
        },
      });

      map.addLayer({
        id: ROUTE_LINE_LAYER,
        type: 'line',
        source: ROUTE_SOURCE,
        paint: {
          'line-color': '#3b82f6',
          'line-width': 5,
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
      });
    }

    if (!map.getSource(ALT_ROUTE_SOURCE)) {
      map.addSource(ALT_ROUTE_SOURCE, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      map.addLayer(
        {
          id: ALT_ROUTE_LINE,
          type: 'line',
          source: ALT_ROUTE_SOURCE,
          paint: {
            'line-color': '#94a3b8',
            'line-width': 4,
            'line-dasharray': [2, 2],
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
        },
        ROUTE_LINE_CASING,
      );
    }

    return () => {
      try {
        [ROUTE_LINE_LAYER, ROUTE_LINE_CASING, ALT_ROUTE_LINE].forEach((id) => {
          if (map.getLayer(id)) map.removeLayer(id);
        });
        [ROUTE_SOURCE, ALT_ROUTE_SOURCE].forEach((id) => {
          if (map.getSource(id)) map.removeSource(id);
        });
      } catch {
        // map already removed
      }
    };
  }, [map]);

  useEffect(() => {
    if (!map) return;
    const source = map.getSource(ROUTE_SOURCE) as mapboxgl.GeoJSONSource | undefined;
    if (!source) return;

    if (activeRoute) {
      source.setData({
        type: 'Feature',
        properties: {},
        geometry: activeRoute.geometry,
      });
    } else {
      source.setData({ type: 'FeatureCollection', features: [] });
    }
  }, [map, activeRoute]);

  useEffect(() => {
    if (!map) return;
    const source = map.getSource(ALT_ROUTE_SOURCE) as mapboxgl.GeoJSONSource | undefined;
    if (!source) return;

    source.setData({
      type: 'FeatureCollection',
      features: alternativeRoutes.map((route) => ({
        type: 'Feature' as const,
        properties: { id: route.id },
        geometry: route.geometry,
      })),
    });
  }, [map, alternativeRoutes]);

  return null;
}
