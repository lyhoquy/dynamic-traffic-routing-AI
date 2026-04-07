import { useSimulatorStore } from '../../store/simulatorStore';
import { useIncidentStore } from '../../store/incidentStore';
import type { IncidentType, IncidentSeverity } from '../../types/incident';

const INCIDENT_TYPES: { value: IncidentType; label: string }[] = [
  { value: 'accident', label: 'Tai nạn' },
  { value: 'congestion', label: 'Tắc nghẽn' },
  { value: 'road_closure', label: 'Cấm đường' },
  { value: 'construction', label: 'Thi công' },
  { value: 'weather', label: 'Thời tiết xấu' },
];

const SEVERITY_LEVELS: { value: IncidentSeverity; label: string; color: string }[] = [
  { value: 'low', label: 'Nhẹ', color: '#34a853' },
  { value: 'medium', label: 'Trung bình', color: '#fbbc04' },
  { value: 'high', label: 'Nặng', color: '#ea4335' },
  { value: 'critical', label: 'Nghiêm trọng', color: '#7f1d1d' },
];

export function IncidentCreator() {
  const {
    incidentCreationMode,
    setIncidentCreationMode,
    pendingIncidentType,
    setPendingIncidentType,
    pendingIncidentSeverity,
    setPendingIncidentSeverity,
  } = useSimulatorStore();

  const incidentCount = useIncidentStore((s) => s.incidents.filter((i) => !i.resolvedAt).length);

  return (
    <div className="sim-section">
      <div className="sim-section__header">
        <h4>Tạo sự cố giả lập</h4>
        <button
          className={`sim-toggle ${incidentCreationMode ? 'sim-toggle--active' : ''}`}
          onClick={() => setIncidentCreationMode(!incidentCreationMode)}
        >
          {incidentCreationMode ? 'Đang bật' : 'Tắt'}
        </button>
      </div>

      {incidentCreationMode && (
        <div className="sim-incident-config">
          <p className="sim-hint">Nhấp vào bản đồ để tạo sự cố</p>

          <label className="sim-label">Loại sự cố</label>
          <div className="sim-chip-group">
            {INCIDENT_TYPES.map((t) => (
              <button
                key={t.value}
                className={`sim-chip ${pendingIncidentType === t.value ? 'sim-chip--selected' : ''}`}
                onClick={() => setPendingIncidentType(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <label className="sim-label">Mức độ</label>
          <div className="sim-chip-group">
            {SEVERITY_LEVELS.map((s) => (
              <button
                key={s.value}
                className={`sim-chip ${pendingIncidentSeverity === s.value ? 'sim-chip--selected' : ''}`}
                style={pendingIncidentSeverity === s.value ? { borderColor: s.color, color: s.color } : undefined}
                onClick={() => setPendingIncidentSeverity(s.value)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {incidentCount > 0 && (
        <div className="sim-stat-row">
          <span>Sự cố đang hoạt động</span>
          <span className="sim-stat-value sim-stat-value--danger">{incidentCount}</span>
        </div>
      )}
    </div>
  );
}
