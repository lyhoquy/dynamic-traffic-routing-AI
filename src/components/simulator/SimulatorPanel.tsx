import { useState, useEffect, useRef, useCallback } from 'react';
import { useSimulatorStore } from '../../store/simulatorStore';
import { createVehicles, updateVehicles, computeYoloDetection } from '../../simulator/vehicleSimulator';
import { IncidentCreator } from './IncidentCreator';
import { YoloPanel } from './YoloPanel';

export function SimulatorPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval>>(null);
  const yoloRef = useRef<ReturnType<typeof setInterval>>(null);

  const {
    isRunning,
    setRunning,
    vehicleCount,
    setVehicleCount,
    setVehicles,
    vehicles,
    tickIntervalMs,
    yoloEnabled,
    pushDetection,
  } = useSimulatorStore();

  const tick = useCallback(() => {
    const current = useSimulatorStore.getState().vehicles;
    if (current.length === 0) return;
    const updated = updateVehicles(current, tickIntervalMs / 1000);
    setVehicles(updated);
  }, [setVehicles, tickIntervalMs]);

  const yoloTick = useCallback(() => {
    const state = useSimulatorStore.getState();
    if (!state.yoloEnabled || state.vehicles.length === 0) return;
    const detection = computeYoloDetection(state.vehicles);
    pushDetection(detection);
  }, [pushDetection]);

  const handleStart = () => {
    const newVehicles = createVehicles(vehicleCount);
    setVehicles(newVehicles);
    setRunning(true);
  };

  const handleStop = () => {
    setRunning(false);
    setVehicles([]);
  };

  useEffect(() => {
    if (isRunning) {
      tickRef.current = setInterval(tick, tickIntervalMs);
    }
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [isRunning, tick, tickIntervalMs]);

  useEffect(() => {
    if (isRunning && yoloEnabled) {
      yoloTick();
      yoloRef.current = setInterval(yoloTick, 2000);
    }
    return () => {
      if (yoloRef.current) clearInterval(yoloRef.current);
    };
  }, [isRunning, yoloEnabled, yoloTick]);

  return (
    <>
      <button
        className={`fab fab--sim ${isOpen ? 'fab--active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Mô phỏng giao thông"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      </button>

      {isOpen && (
        <div className="sim-panel">
          <div className="sim-panel__header">
            <h3>Mô phỏng giao thông</h3>
            <button className="sim-panel__close" onClick={() => setIsOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="sim-panel__body">
            {/* Vehicle Simulator */}
            <div className="sim-section">
              <div className="sim-section__header">
                <h4>Xe giả lập</h4>
                {isRunning ? (
                  <button className="sim-toggle sim-toggle--danger" onClick={handleStop}>
                    Dừng
                  </button>
                ) : (
                  <button className="sim-toggle sim-toggle--active" onClick={handleStart}>
                    Bắt đầu
                  </button>
                )}
              </div>

              {!isRunning && (
                <div className="sim-slider-group">
                  <label className="sim-label">
                    Số lượng xe: <strong>{vehicleCount}</strong>
                  </label>
                  <input
                    type="range"
                    className="sim-slider"
                    min={10}
                    max={100}
                    step={5}
                    value={vehicleCount}
                    onChange={(e) => setVehicleCount(Number(e.target.value))}
                  />
                </div>
              )}

              {isRunning && (
                <div className="sim-stats-grid">
                  <div className="sim-stat-row">
                    <span>Tổng xe</span>
                    <span className="sim-stat-value">{vehicles.length}</span>
                  </div>
                  <div className="sim-stat-row">
                    <span>Xe máy</span>
                    <span className="sim-stat-value" style={{ color: '#fbbc04' }}>
                      {vehicles.filter((v) => v.type === 'motorcycle').length}
                    </span>
                  </div>
                  <div className="sim-stat-row">
                    <span>Ô tô</span>
                    <span className="sim-stat-value" style={{ color: '#4285f4' }}>
                      {vehicles.filter((v) => v.type === 'car').length}
                    </span>
                  </div>
                  <div className="sim-stat-row">
                    <span>Xe tải / Xe buýt</span>
                    <span className="sim-stat-value" style={{ color: '#ea4335' }}>
                      {vehicles.filter((v) => v.type === 'truck' || v.type === 'bus').length}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <IncidentCreator />
            <YoloPanel />
          </div>
        </div>
      )}
    </>
  );
}
