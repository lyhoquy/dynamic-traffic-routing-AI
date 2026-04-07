import { create } from 'zustand';
import type { SimulatedVehicle, YoloDetection } from '../simulator/types';
import type { IncidentType, IncidentSeverity } from '../types/incident';

interface SimulatorState {
  isRunning: boolean;
  vehicleCount: number;
  vehicles: SimulatedVehicle[];
  tickIntervalMs: number;

  incidentCreationMode: boolean;
  pendingIncidentType: IncidentType;
  pendingIncidentSeverity: IncidentSeverity;

  yoloEnabled: boolean;
  latestDetection: YoloDetection | null;
  detectionHistory: YoloDetection[];

  setRunning: (running: boolean) => void;
  setVehicleCount: (count: number) => void;
  setVehicles: (vehicles: SimulatedVehicle[]) => void;
  setIncidentCreationMode: (mode: boolean) => void;
  setPendingIncidentType: (type: IncidentType) => void;
  setPendingIncidentSeverity: (severity: IncidentSeverity) => void;
  setYoloEnabled: (enabled: boolean) => void;
  pushDetection: (detection: YoloDetection) => void;
}

export const useSimulatorStore = create<SimulatorState>((set) => ({
  isRunning: false,
  vehicleCount: 40,
  vehicles: [],
  tickIntervalMs: 1000,

  incidentCreationMode: false,
  pendingIncidentType: 'congestion',
  pendingIncidentSeverity: 'medium',

  yoloEnabled: false,
  latestDetection: null,
  detectionHistory: [],

  setRunning: (isRunning) => set({ isRunning }),
  setVehicleCount: (vehicleCount) => set({ vehicleCount }),
  setVehicles: (vehicles) => set({ vehicles }),
  setIncidentCreationMode: (incidentCreationMode) => set({ incidentCreationMode }),
  setPendingIncidentType: (pendingIncidentType) => set({ pendingIncidentType }),
  setPendingIncidentSeverity: (pendingIncidentSeverity) => set({ pendingIncidentSeverity }),
  setYoloEnabled: (yoloEnabled) => set({ yoloEnabled }),

  pushDetection: (detection) =>
    set((state) => ({
      latestDetection: detection,
      detectionHistory: [detection, ...state.detectionHistory].slice(0, 30),
    })),
}));
