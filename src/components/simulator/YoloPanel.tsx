import { useSimulatorStore } from '../../store/simulatorStore';

const TYPE_LABELS: Record<string, string> = {
  car: 'Ô tô',
  motorcycle: 'Xe máy',
  truck: 'Xe tải',
  bus: 'Xe buýt',
};

const TYPE_COLORS: Record<string, string> = {
  car: '#4285f4',
  motorcycle: '#fbbc04',
  truck: '#ea4335',
  bus: '#34a853',
};

export function YoloPanel() {
  const {
    yoloEnabled,
    setYoloEnabled,
    latestDetection,
    isRunning,
  } = useSimulatorStore();

  return (
    <div className="sim-section">
      <div className="sim-section__header">
        <h4>YOLO Detection</h4>
        <button
          className={`sim-toggle ${yoloEnabled ? 'sim-toggle--active' : ''}`}
          onClick={() => setYoloEnabled(!yoloEnabled)}
          disabled={!isRunning}
        >
          {yoloEnabled ? 'Đang bật' : 'Tắt'}
        </button>
      </div>

      {!isRunning && (
        <p className="sim-hint">Bật mô phỏng xe trước để sử dụng YOLO</p>
      )}

      {yoloEnabled && latestDetection && (
        <div className="yolo-results">
          <div className="yolo-camera">
            <div className="yolo-camera__grid">
              {latestDetection.detections.map((det) => (
                <div
                  key={det.id}
                  className="yolo-bbox"
                  style={{
                    left: `${det.x * 100}%`,
                    top: `${det.y * 100}%`,
                    width: `${det.w * 100}%`,
                    height: `${det.h * 100}%`,
                  }}
                >
                  <span className="yolo-bbox__label">
                    {det.label} {Math.round(det.confidence * 100)}%
                  </span>
                </div>
              ))}
            </div>
            <div className="yolo-camera__badge">
              CAM-001 · Trung tâm Đà Nẵng
            </div>
          </div>

          <div className="yolo-density">
            <div className="yolo-density__bar">
              <div
                className="yolo-density__fill"
                style={{
                  width: `${latestDetection.congestionLevel * 100}%`,
                  background: getDensityColor(latestDetection.congestionLevel),
                }}
              />
            </div>
            <div className="yolo-density__info">
              <span>Mật độ: <strong>{latestDetection.density}</strong></span>
              <span>{latestDetection.vehicleCount} phương tiện</span>
            </div>
          </div>

          <div className="yolo-stats">
            {Object.entries(latestDetection.byType).map(([type, count]) => (
              <div key={type} className="yolo-stat-item">
                <div
                  className="yolo-stat-dot"
                  style={{ background: TYPE_COLORS[type] }}
                />
                <span className="yolo-stat-label">{TYPE_LABELS[type]}</span>
                <span className="yolo-stat-count">{count}</span>
              </div>
            ))}
          </div>

          <div className="yolo-meta">
            <span>Tốc độ TB: {latestDetection.avgSpeed} km/h</span>
            <span>
              Cập nhật: {new Date(latestDetection.timestamp).toLocaleTimeString('vi-VN')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function getDensityColor(level: number): string {
  if (level < 0.3) return '#34a853';
  if (level < 0.6) return '#fbbc04';
  if (level < 0.8) return '#ea4335';
  return '#7f1d1d';
}
