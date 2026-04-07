import { useMapStore } from '../../store/mapStore';
import { useChatStore } from '../../store/chatStore';

export function FloatingControls() {
  const map = useMapStore((s) => s.map);
  const userLocation = useMapStore((s) => s.userLocation);
  const navigationState = useMapStore((s) => s.navigationState);
  const toggleChat = useChatStore((s) => s.toggleOpen);
  const isChatOpen = useChatStore((s) => s.isOpen);

  const handleRecenter = () => {
    if (!map || !userLocation) return;

    if (navigationState === 'navigating') {
      map.easeTo({
        center: [userLocation.lng, userLocation.lat],
        bearing: userLocation.heading ?? map.getBearing(),
        pitch: 60,
        zoom: 17,
        duration: 1000,
      });
    } else {
      map.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 16,
        pitch: 0,
        bearing: 0,
        duration: 1000,
      });
    }
  };

  return (
    <div className="floating-controls">
      <button
        className="fab"
        onClick={handleRecenter}
        aria-label="Về vị trí hiện tại"
        title="Về vị trí hiện tại"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        </svg>
      </button>

      <button
        className={`fab fab--accent ${isChatOpen ? 'fab--active' : ''}`}
        onClick={toggleChat}
        aria-label="Mở trợ lý AI"
        title="Trợ lý AI"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      </button>
    </div>
  );
}
