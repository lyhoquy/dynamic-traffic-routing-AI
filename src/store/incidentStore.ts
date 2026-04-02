import { create } from 'zustand';
import type { Incident } from '../types/incident';

interface IncidentState {
  incidents: Incident[];
  selectedIncident: Incident | null;

  addIncident: (incident: Incident) => void;
  removeIncident: (id: string) => void;
  resolveIncident: (id: string) => void;
  setSelectedIncident: (incident: Incident | null) => void;
  setIncidents: (incidents: Incident[]) => void;
}

export const useIncidentStore = create<IncidentState>((set) => ({
  incidents: [],
  selectedIncident: null,

  addIncident: (incident) =>
    set((state) => ({
      incidents: [incident, ...state.incidents],
    })),

  removeIncident: (id) =>
    set((state) => ({
      incidents: state.incidents.filter((i) => i.id !== id),
    })),

  resolveIncident: (id) =>
    set((state) => ({
      incidents: state.incidents.map((i) =>
        i.id === id ? { ...i, resolvedAt: new Date().toISOString() } : i,
      ),
    })),

  setSelectedIncident: (selectedIncident) => set({ selectedIncident }),
  setIncidents: (incidents) => set({ incidents }),
}));
