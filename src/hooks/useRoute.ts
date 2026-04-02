import { useCallback, useState } from 'react';
import { useMapStore } from '../store/mapStore';
import { getDirections } from '../services/mapbox';
import type { RouteData } from '../types/map';

/**
 * Hook quản lý routing - tính toán và hiển thị tuyến đường trên map.
 */
export function useRoute() {
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setActiveRoute, setAlternativeRoutes, clearRoutes } = useMapStore();

  const calculateRoute = useCallback(
    async (waypoints: [number, number][]) => {
      if (waypoints.length < 2) {
        setError('Cần ít nhất 2 điểm để tính tuyến đường');
        return null;
      }

      setIsCalculating(true);
      setError(null);

      try {
        const routes = await getDirections(waypoints);
        if (routes.length > 0) {
          setActiveRoute(routes[0]);
          setAlternativeRoutes(routes.slice(1));
        }
        return routes;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Lỗi tính toán tuyến đường';
        setError(message);
        return null;
      } finally {
        setIsCalculating(false);
      }
    },
    [setActiveRoute, setAlternativeRoutes],
  );

  const recalculateRoute = useCallback(
    async (
      origin: [number, number],
      destination: [number, number],
      avoidIncidents: [number, number][] = [],
    ) => {
      const waypoints: [number, number][] = [origin];
      if (avoidIncidents.length > 0) {
        // TODO: Tính waypoint trung gian để tránh sự cố
        // Đây là nơi AI sẽ đề xuất tuyến đường thay thế
      }
      waypoints.push(destination);
      return calculateRoute(waypoints);
    },
    [calculateRoute],
  );

  return {
    isCalculating,
    error,
    calculateRoute,
    recalculateRoute,
    clearRoutes,
  };
}
