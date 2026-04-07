import { useRef } from 'react';
import { useMap } from '../../hooks/useMap';
import { useMapStore } from '../../store/mapStore';
import { RouteLayer } from './RouteLayer';
import { IncidentLayer } from './IncidentLayer';
import 'mapbox-gl/dist/mapbox-gl.css';

export function MapContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  useMap({ container: containerRef });
  const isLoaded = useMapStore((s) => s.isLoaded);

  return (
    <div className="map-wrapper">
      <div ref={containerRef} className="map-canvas" />
      {isLoaded && (
        <>
          <RouteLayer />
          <IncidentLayer />
        </>
      )}
    </div>
  );
}
