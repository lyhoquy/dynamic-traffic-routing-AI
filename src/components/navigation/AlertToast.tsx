import type { CSSProperties } from 'react';
import { useIncidentStore } from '../../store/incidentStore';
import { useRoute } from '../../hooks/useRoute';
import { useMapStore } from '../../store/mapStore';
import { INCIDENT_COLORS } from '../../utils/constants';

export function AlertToast() {
  const selectedIncident = useIncidentStore((s) => s.selectedIncident);
  const setSelectedIncident = useIncidentStore((s) => s.setSelectedIncident);
  const { recalculateRoute } = useRoute();
  const userLocation = useMapStore((s) => s.userLocation);
  const destination = useMapStore((s) => s.destination);

  if (!selectedIncident) return null;

  const color = INCIDENT_COLORS[selectedIncident.type] ?? INCIDENT_COLORS.other;

  const handleReroute = () => {
    if (!userLocation || !destination) {
      setSelectedIncident(null);
      return;
    }

    recalculateRoute(
      [userLocation.lng, userLocation.lat],
      [destination.lng, destination.lat],
      [[selectedIncident.location.lng, selectedIncident.location.lat]],
    );
    setSelectedIncident(null);
  };

  const handleDismiss = () => {
    setSelectedIncident(null);
  };

  return (
    <div className="alert-toast" style={{ '--alert-color': color } as CSSProperties}>
      <div className="alert-toast__indicator" />
      <div className="alert-toast__body">
        <div className="alert-toast__header">
          <span className="alert-toast__type">
            {getIncidentLabel(selectedIncident.type)}
          </span>
          <span className="alert-toast__severity">
            {selectedIncident.severity}
          </span>
        </div>
        <p className="alert-toast__desc">
          {selectedIncident.description}
        </p>
        <div className="alert-toast__actions">
          <button className="alert-btn alert-btn--primary" onClick={handleReroute}>
            Chuyển hướng
          </button>
          <button className="alert-btn alert-btn--dismiss" onClick={handleDismiss}>
            Bỏ qua
          </button>
        </div>
      </div>
    </div>
  );
}

function getIncidentLabel(type: string): string {
  const labels: Record<string, string> = {
    accident: 'Tai nạn',
    congestion: 'Tắc nghẽn',
    road_closure: 'Cấm đường',
    construction: 'Thi công',
    weather: 'Thời tiết xấu',
    other: 'Sự cố',
  };
  return labels[type] ?? 'Sự cố';
}
