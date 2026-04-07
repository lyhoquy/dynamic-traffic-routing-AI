import { useIncidentStore } from '../store/incidentStore';

export function DashboardPage() {
  const incidents = useIncidentStore((s) => s.incidents);

  return (
    <div className="dashboard-page">
      <h1>Bảng điều khiển</h1>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Sự cố đang hoạt động</h3>
          <span className="dashboard-stat">
            {incidents.filter((i) => !i.resolvedAt).length}
          </span>
        </div>
        <div className="dashboard-card">
          <h3>Đã giải quyết</h3>
          <span className="dashboard-stat">
            {incidents.filter((i) => i.resolvedAt).length}
          </span>
        </div>
      </div>
    </div>
  );
}
