import { useMapStore } from '../../store/mapStore';
import { formatDuration, formatDistance } from '../../utils/geoUtils';

export function RoutePreview() {
  const navigationState = useMapStore((s) => s.navigationState);
  const activeRoute = useMapStore((s) => s.activeRoute);
  const destination = useMapStore((s) => s.destination);
  const startNavigation = useMapStore((s) => s.startNavigation);
  const stopNavigation = useMapStore((s) => s.stopNavigation);
  const map = useMapStore((s) => s.map);
  const userLocation = useMapStore((s) => s.userLocation);

  if (navigationState !== 'route_preview' || !activeRoute) return null;

  const handleStart = () => {
    startNavigation(activeRoute);

    if (map && userLocation) {
      map.easeTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 17,
        pitch: 60,
        bearing: userLocation.heading ?? 0,
        duration: 1500,
      });
    }
  };

  const handleCancel = () => {
    stopNavigation();
    if (map) {
      map.easeTo({ pitch: 0, bearing: 0, duration: 800 });
    }
  };

  return (
    <div className="route-preview">
      <div className="route-preview__handle" />

      <div className="route-preview__summary">
        <div className="route-preview__time">
          {formatDuration(activeRoute.duration)}
        </div>
        <div className="route-preview__meta">
          <span>{formatDistance(activeRoute.distance)}</span>
          <span className="route-preview__dot">&middot;</span>
          <span>
            Đến lúc{' '}
            {new Date(Date.now() + activeRoute.duration * 1000).toLocaleTimeString(
              'vi-VN',
              { hour: '2-digit', minute: '2-digit' },
            )}
          </span>
        </div>
      </div>

      {destination && (
        <div className="route-preview__dest">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>{destination.name}</span>
        </div>
      )}

      <div className="route-preview__actions">
        <button className="route-preview__start" onClick={handleStart}>
          Bắt đầu
        </button>
        <button className="route-preview__cancel" onClick={handleCancel}>
          Huỷ
        </button>
      </div>
    </div>
  );
}
