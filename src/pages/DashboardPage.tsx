import { useIncidentStore } from '../store/incidentStore';

export function DashboardPage() {
  const incidents = useIncidentStore((s) => s.incidents);

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Su co dang hoat dong</h3>
          <span className="dashboard-stat">
            {incidents.filter((i) => !i.resolvedAt).length}
          </span>
        </div>
        <div className="dashboard-card">
          <h3>Da giai quyet</h3>
          <span className="dashboard-stat">
            {incidents.filter((i) => i.resolvedAt).length}
          </span>
        </div>
      </div>
    </div>
  );
}
