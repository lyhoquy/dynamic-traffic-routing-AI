import { useEffect, useRef } from 'react';
import { useMapStore } from '../../store/mapStore';
import { useSimulatorStore } from '../../store/simulatorStore';
import { vehiclesToGeoJSON } from '../../simulator/vehicleSimulator';

const VEHICLE_SOURCE = 'sim-vehicles';
const VEHICLE_CIRCLE_LAYER = 'sim-vehicle-circles';
const VEHICLE_LABEL_LAYER = 'sim-vehicle-labels';

export function VehicleLayer() {
  const map = useMapStore((s) => s.map);
  const vehicles = useSimulatorStore((s) => s.vehicles);
  const isRunning = useSimulatorStore((s) => s.isRunning);
  const initialized = useRef(false);

  useEffect(() => {
    if (!map || !isRunning) return;

    if (!map.getSource(VEHICLE_SOURCE)) {
      map.addSource(VEHICLE_SOURCE, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      map.addLayer({
        id: VEHICLE_CIRCLE_LAYER,
        type: 'circle',
        source: VEHICLE_SOURCE,
        paint: {
          'circle-radius': [
            'match', ['get', 'type'],
            'truck', 6,
            'bus', 6,
            'car', 5,
            4,
          ],
          'circle-color': [
            'match', ['get', 'type'],
            'car', '#4285f4',
            'motorcycle', '#fbbc04',
            'truck', '#ea4335',
            'bus', '#34a853',
            '#6b7280',
          ],
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.9,
        },
      });

      initialized.current = true;
    }

    return () => {
      try {
        if (map.getLayer(VEHICLE_LABEL_LAYER)) map.removeLayer(VEHICLE_LABEL_LAYER);
        if (map.getLayer(VEHICLE_CIRCLE_LAYER)) map.removeLayer(VEHICLE_CIRCLE_LAYER);
        if (map.getSource(VEHICLE_SOURCE)) map.removeSource(VEHICLE_SOURCE);
      } catch {
        // map already removed
      }
      initialized.current = false;
    };
  }, [map, isRunning]);

  useEffect(() => {
    if (!map || !initialized.current) return;
    const source = map.getSource(VEHICLE_SOURCE) as mapboxgl.GeoJSONSource | undefined;
    if (!source) return;
    source.setData(vehiclesToGeoJSON(vehicles));
  }, [map, vehicles]);

  return null;
}
