export type VehicleType = 'car' | 'motorcycle' | 'truck' | 'bus';

export interface SimulatedVehicle {
  id: string;
  type: VehicleType;
  routeIndex: number;
  progress: number;
  speed: number;
  lng: number;
  lat: number;
  heading: number;
}

export interface SimRoute {
  id: string;
  name: string;
  coordinates: [number, number][];
}

export interface YoloDetection {
  vehicleCount: number;
  byType: Record<VehicleType, number>;
  density: 'thấp' | 'trung bình' | 'cao' | 'rất cao';
  avgSpeed: number;
  congestionLevel: number;
  timestamp: number;
  detections: DetectionBox[];
}

export interface DetectionBox {
  id: string;
  label: string;
  confidence: number;
  x: number;
  y: number;
  w: number;
  h: number;
}
