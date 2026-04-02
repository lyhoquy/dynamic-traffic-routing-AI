export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export type IncidentType =
  | 'accident'
  | 'congestion'
  | 'road_closure'
  | 'construction'
  | 'weather'
  | 'other';

export interface Incident {
  id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  location: {
    lng: number;
    lat: number;
  };
  description: string;
  detectedAt: string;
  resolvedAt?: string;
  affectedRoutes: string[];
  source: 'camera' | 'report' | 'ai_detection';
}

export interface IncidentDetection {
  incidentId: string;
  cameraId: string;
  confidence: number;
  detectedObjects: DetectedObject[];
  timestamp: string;
}

export interface DetectedObject {
  label: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
