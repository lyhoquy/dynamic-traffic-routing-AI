import { useEffect } from 'react';
import { useMapStore } from '../../store/mapStore';
import { useIncidentStore } from '../../store/incidentStore';
import { INCIDENT_COLORS } from '../../utils/constants';
import type { Incident } from '../../types/incident';

const INCIDENT_SOURCE = 'incident-source';
const INCIDENT_CIRCLE_LAYER = 'incident-circles';
const INCIDENT_PULSE_LAYER = 'incident-pulse';

function incidentsToGeoJSON(incidents: Incident[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: incidents
      .filter((i) => !i.resolvedAt)
      .map((incident) => ({
        type: 'Feature' as const,
        properties: {
          id: incident.id,
          type: incident.type,
          severity: incident.severity,
          description: incident.description,
          color: INCIDENT_COLORS[incident.type] ?? INCIDENT_COLORS.other,
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [incident.location.lng, incident.location.lat],
        },
      })),
  };
}

/**
 * IncidentLayer - Hiển thị các sự cố giao thông trên bản đồ.
 *
 * Sử dụng circle layer thay vì Marker DOM elements vì:
 * - Hiệu suất tốt hơn khi có nhiều sự cố (GPU-rendered)
 * - Data-driven styling: màu sắc, kích thước thay đổi theo severity
 * - Dễ cập nhật real-time (chỉ cần setData trên source)
 */
export function IncidentLayer() {
  const map = useMapStore((s) => s.map);
  const incidents = useIncidentStore((s) => s.incidents);
  const setSelectedIncident = useIncidentStore((s) => s.setSelectedIncident);

  useEffect(() => {
    if (!map) return;

    if (!map.getSource(INCIDENT_SOURCE)) {
      map.addSource(INCIDENT_SOURCE, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      map.addLayer({
        id: INCIDENT_PULSE_LAYER,
        type: 'circle',
        source: INCIDENT_SOURCE,
        paint: {
          'circle-radius': 20,
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.15,
        },
      });

      map.addLayer({
        id: INCIDENT_CIRCLE_LAYER,
        type: 'circle',
        source: INCIDENT_SOURCE,
        paint: {
          'circle-radius': [
            'match',
            ['get', 'severity'],
            'critical', 12,
            'high', 10,
            'medium', 8,
            6,
          ],
          'circle-color': ['get', 'color'],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      map.on('click', INCIDENT_CIRCLE_LAYER, (e) => {
        const feature = e.features?.[0];
        if (feature?.properties) {
          const incident = incidents.find((i) => i.id === feature.properties!.id);
          if (incident) setSelectedIncident(incident);
        }
      });

      map.on('mouseenter', INCIDENT_CIRCLE_LAYER, () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', INCIDENT_CIRCLE_LAYER, () => {
        map.getCanvas().style.cursor = '';
      });
    }

    return () => {
      try {
        [INCIDENT_CIRCLE_LAYER, INCIDENT_PULSE_LAYER].forEach((id) => {
          if (map.getLayer(id)) map.removeLayer(id);
        });
        if (map.getSource(INCIDENT_SOURCE)) map.removeSource(INCIDENT_SOURCE);
      } catch {
        // Map đã bị remove() → style = undefined → bỏ qua.
        // map.remove() tự dọn sạch tất cả sources/layers rồi.
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useEffect(() => {
    if (!map) return;
    const source = map.getSource(INCIDENT_SOURCE) as mapboxgl.GeoJSONSource | undefined;
    if (!source) return;
    source.setData(incidentsToGeoJSON(incidents));
  }, [map, incidents]);

  return null;
}
