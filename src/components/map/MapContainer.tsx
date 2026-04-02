import { useRef } from 'react';
import { useMap } from '../../hooks/useMap';
import { useMapStore } from '../../store/mapStore';
import RouteLayer from './RouteLayer';
import IncidentLayer from './IncidentLayer';
import 'mapbox-gl/dist/mapbox-gl.css';

/**
 * MapContainer - Component chứa bản đồ chính.
 *
 * Kiến trúc:
 * ┌─────────────────────────────────────┐
 * │  MapContainer                       │
 * │  ┌───────────────────────────────┐  │
 * │  │  Mapbox GL Canvas             │  │
 * │  │  (render bởi useMap hook)     │  │
 * │  └───────────────────────────────┘  │
 * │  ┌─────────┐  ┌──────────────────┐  │
 * │  │ Route   │  │ Incident         │  │
 * │  │ Layer   │  │ Layer            │  │
 * │  └─────────┘  └──────────────────┘  │
 * └─────────────────────────────────────┘
 *
 * - MapContainer chỉ lo việc render div container
 * - useMap hook lo khởi tạo map instance
 * - RouteLayer / IncidentLayer lo việc thêm/cập nhật sources & layers
 * - Các layer component KHÔNG render DOM, chỉ tương tác với map instance từ store
 */
export function MapContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  useMap({ container: containerRef });
  const isLoaded = useMapStore((s) => s.isLoaded);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%' }}
      />
      {isLoaded && (
        <>
          <RouteLayer />
          <IncidentLayer />
        </>
      )}
    </div>
  );
}
