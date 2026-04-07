import { useState } from 'react';
import { NavLink } from 'react-router-dom';

export function MenuDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="menu-trigger"
        onClick={() => setIsOpen(true)}
        aria-label="Mở menu"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="drawer-overlay" onClick={() => setIsOpen(false)} />
          <aside className="drawer">
            <div className="drawer__header">
              <h2 className="drawer__title">Traffic AI</h2>
              <button className="drawer__close" onClick={() => setIsOpen(false)}>
                ✕
              </button>
            </div>

            <nav className="drawer__nav">
              <NavLink
                to="/"
                className={({ isActive }) => `drawer__link ${isActive ? 'drawer__link--active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                Bản đồ
              </NavLink>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `drawer__link ${isActive ? 'drawer__link--active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                Bảng điều khiển
              </NavLink>
            </nav>
          </aside>
        </>
      )}
    </>
  );
}
