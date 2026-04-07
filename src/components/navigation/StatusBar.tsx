import { useMapStore } from '../../store/mapStore';
import { formatDuration, formatDistance } from '../../utils/geoUtils';

export function StatusBar() {
  const navigationState = useMapStore((s) => s.navigationState);
  const eta = useMapStore((s) => s.eta);
  const distanceRemaining = useMapStore((s) => s.distanceRemaining);
  const stopNavigation = useMapStore((s) => s.stopNavigation);
  const map = useMapStore((s) => s.map);

  if (navigationState !== 'navigating') return null;

  const arrivalTime = eta
    ? new Date(Date.now() + eta * 1000).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '--:--';

  const handleStop = () => {
    stopNavigation();
    if (map) {
      map.easeTo({ pitch: 0, bearing: 0, duration: 800 });
    }
  };

  return (
    <div className="status-bar">
      <div className="status-bar__main">
        <span className="status-bar__eta">
          {eta ? formatDuration(eta) : '--'}
        </span>
        <div className="status-bar__details">
          <span className="status-bar__distance">
            {distanceRemaining ? formatDistance(distanceRemaining) : '--'}
          </span>
          <span className="status-bar__separator">&middot;</span>
          <span className="status-bar__arrival">
            Đến lúc {arrivalTime}
          </span>
        </div>
      </div>

      <button className="status-bar__stop" onClick={handleStop}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <rect x="4" y="4" width="16" height="16" rx="2" />
        </svg>
        <span>Dừng</span>
      </button>
    </div>
  );
}
