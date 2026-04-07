import { useMapStore } from '../../store/mapStore';

export function SpeedIndicator() {
  const navigationState = useMapStore((s) => s.navigationState);
  const currentSpeed = useMapStore((s) => s.currentSpeed);

  if (navigationState !== 'navigating') return null;

  return (
    <div className="speed-indicator">
      <span className="speed-indicator__value">{currentSpeed}</span>
      <span className="speed-indicator__unit">km/h</span>
    </div>
  );
}
