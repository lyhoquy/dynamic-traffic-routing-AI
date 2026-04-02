import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Ban do', icon: '🗺' },
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">DATN</h1>
        <span className="sidebar-subtitle">Traffic AI</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
            }
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span className="sidebar-link-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
