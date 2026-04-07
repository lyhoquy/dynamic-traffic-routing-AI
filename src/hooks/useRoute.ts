import { useCallback, useState } from 'react';
import { useMapStore } from '../store/mapStore';
import { getDirections } from '../services/mapbox';

export function useRoute() {
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setActiveRoute, setAlternativeRoutes } = useMapStore();

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
        // TODO: calculate intermediate waypoints to avoid incidents
        // This is where AI will suggest alternative routes
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
  };
}
