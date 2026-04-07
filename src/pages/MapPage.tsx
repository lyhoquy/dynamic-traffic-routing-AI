import { MapContainer } from '../components/map/MapContainer';
import { NavigationHeader } from '../components/navigation/NavigationHeader';
import { StatusBar } from '../components/navigation/StatusBar';
import { FloatingControls } from '../components/navigation/FloatingControls';
import { AlertToast } from '../components/navigation/AlertToast';
import { SearchBar } from '../components/navigation/SearchBar';
import { RoutePreview } from '../components/navigation/RoutePreview';
import { ChatPanel } from '../components/chat/ChatPanel';
import { MenuDrawer } from '../components/layout/Sidebar';
import { SimulatorPanel } from '../components/simulator/SimulatorPanel';
import { VehicleLayer } from '../components/simulator/VehicleLayer';
import { useGeolocation } from '../hooks/useGeolocation';
import { useMapStore } from '../store/mapStore';
import { useSimulatorStore } from '../store/simulatorStore';

export function MapPage() {
  useGeolocation();
  const navState = useMapStore((s) => s.navigationState);
  const incidentMode = useSimulatorStore((s) => s.incidentCreationMode);

  return (
    <div className={`map-page ${incidentMode ? 'map-page--incident-mode' : ''}`}>
      <MapContainer />
      <VehicleLayer />

      <div className="map-overlay">
        {navState === 'navigating' ? (
          <NavigationHeader />
        ) : (
          <div className="map-overlay__top-row">
            <div className="map-overlay__left-top">
              <MenuDrawer />
            </div>
            <SearchBar />
          </div>
        )}

        <div className="map-overlay__right-controls">
          <FloatingControls />
          <SimulatorPanel />
        </div>

        <AlertToast />

        {navState === 'navigating' && <StatusBar />}
      </div>

      {incidentMode && (
        <div className="incident-mode-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>Chế độ tạo sự cố — Nhấp vào bản đồ để đặt sự cố</span>
        </div>
      )}

      <RoutePreview />
      <ChatPanel />
    </div>
  );
}
