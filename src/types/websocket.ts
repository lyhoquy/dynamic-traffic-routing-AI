import type { Incident, IncidentDetection } from './incident';

export type WSMessageType =
  | 'incident_detected'
  | 'incident_resolved'
  | 'traffic_update'
  | 'route_update'
  | 'vehicle_position'
  | 'system_status';

export interface WSMessage<T = unknown> {
  type: WSMessageType;
  payload: T;
  timestamp: string;
}

export interface WSIncidentMessage extends WSMessage<Incident> {
  type: 'incident_detected' | 'incident_resolved';
}

export interface WSTrafficUpdate extends WSMessage<TrafficSegment[]> {
  type: 'traffic_update';
}

export interface WSVehiclePosition extends WSMessage<VehiclePosition> {
  type: 'vehicle_position';
}

export interface TrafficSegment {
  segmentId: string;
  coordinates: [number, number][];
  congestionLevel: 'free' | 'moderate' | 'heavy' | 'blocked';
  speed: number;
  updatedAt: string;
}

export interface VehiclePosition {
  vehicleId: string;
  lng: number;
  lat: number;
  heading: number;
  speed: number;
  timestamp: string;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';
