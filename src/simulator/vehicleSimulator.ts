import type { SimulatedVehicle, VehicleType, YoloDetection, DetectionBox } from './types';
import { DA_NANG_ROUTES } from './routeData';

const VEHICLE_TYPES: VehicleType[] = ['car', 'motorcycle', 'truck', 'bus'];
const VEHICLE_TYPE_WEIGHTS = [0.3, 0.5, 0.12, 0.08];

function pickVehicleType(): VehicleType {
  const r = Math.random();
  let sum = 0;
  for (let i = 0; i < VEHICLE_TYPES.length; i++) {
    sum += VEHICLE_TYPE_WEIGHTS[i];
    if (r < sum) return VEHICLE_TYPES[i];
  }
  return 'motorcycle';
}

function speedForType(type: VehicleType): number {
  switch (type) {
    case 'motorcycle': return 25 + Math.random() * 20;
    case 'car': return 30 + Math.random() * 25;
    case 'truck': return 20 + Math.random() * 15;
    case 'bus': return 20 + Math.random() * 20;
  }
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function interpolateRoute(coords: [number, number][], progress: number): { lng: number; lat: number; heading: number } {
  const totalSegments = coords.length - 1;
  if (totalSegments < 1) return { lng: coords[0][0], lat: coords[0][1], heading: 0 };

  const segPos = progress * totalSegments;
  const segIndex = Math.min(Math.floor(segPos), totalSegments - 1);
  const segT = segPos - segIndex;

  const [lng1, lat1] = coords[segIndex];
  const [lng2, lat2] = coords[segIndex + 1];

  const lng = lerp(lng1, lng2, segT);
  const lat = lerp(lat1, lat2, segT);

  const dLng = lng2 - lng1;
  const dLat = lat2 - lat1;
  const heading = (Math.atan2(dLng, dLat) * 180) / Math.PI;

  return { lng, lat, heading };
}

export function createVehicles(count: number): SimulatedVehicle[] {
  const vehicles: SimulatedVehicle[] = [];

  for (let i = 0; i < count; i++) {
    const routeIndex = Math.floor(Math.random() * DA_NANG_ROUTES.length);
    const route = DA_NANG_ROUTES[routeIndex];
    const type = pickVehicleType();
    const progress = Math.random();
    const { lng, lat, heading } = interpolateRoute(route.coordinates, progress);

    vehicles.push({
      id: `v-${i}`,
      type,
      routeIndex,
      progress,
      speed: speedForType(type),
      lng,
      lat,
      heading,
    });
  }

  return vehicles;
}

/**
 * Update the position of all vehicles every tick (deltaSeconds).
 * Vehicles move along the route, when they reach the end they turn around.
 */
export function updateVehicles(vehicles: SimulatedVehicle[], deltaSeconds: number): SimulatedVehicle[] {
  return vehicles.map((v) => {
    const route = DA_NANG_ROUTES[v.routeIndex];
    if (!route) return v;

    const routeLengthDeg = route.coordinates.reduce((sum, coord, i) => {
      if (i === 0) return 0;
      const prev = route.coordinates[i - 1];
      const dx = coord[0] - prev[0];
      const dy = coord[1] - prev[1];
      return sum + Math.sqrt(dx * dx + dy * dy);
    }, 0);

    const speedDegPerSec = (v.speed / 3600) * 0.00001;
    const progressDelta = routeLengthDeg > 0 ? (speedDegPerSec * deltaSeconds) / routeLengthDeg : 0;

    let newProgress = v.progress + progressDelta;

    if (newProgress >= 1) {
      newProgress = newProgress - Math.floor(newProgress);
    }

    const jitterLng = (Math.random() - 0.5) * 0.0001;
    const jitterLat = (Math.random() - 0.5) * 0.0001;
    const { lng, lat, heading } = interpolateRoute(route.coordinates, newProgress);

    const newSpeed = v.speed + (Math.random() - 0.5) * 2;
    const clampedSpeed = Math.max(5, Math.min(80, newSpeed));

    return {
      ...v,
      progress: newProgress,
      lng: lng + jitterLng,
      lat: lat + jitterLat,
      heading,
      speed: clampedSpeed,
    };
  });
}

export function vehiclesToGeoJSON(vehicles: SimulatedVehicle[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: vehicles.map((v) => ({
      type: 'Feature' as const,
      properties: {
        id: v.id,
        type: v.type,
        speed: Math.round(v.speed),
        heading: v.heading,
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [v.lng, v.lat],
      },
    })),
  };
}

/**
 * Calculate the "YOLO detection" result based on the simulated vehicle data.
 * Assume the camera is at the center of Da Nang, with a viewing radius of ~500m.
 */
export function computeYoloDetection(
  vehicles: SimulatedVehicle[],
  cameraCenter: [number, number] = [108.2022, 16.0544],
  radiusDeg: number = 0.005,
): YoloDetection {
  const nearbyVehicles = vehicles.filter((v) => {
    const dx = v.lng - cameraCenter[0];
    const dy = v.lat - cameraCenter[1];
    return Math.sqrt(dx * dx + dy * dy) < radiusDeg;
  });

  const byType: Record<VehicleType, number> = { car: 0, motorcycle: 0, truck: 0, bus: 0 };
  let totalSpeed = 0;

  nearbyVehicles.forEach((v) => {
    byType[v.type]++;
    totalSpeed += v.speed;
  });

  const count = nearbyVehicles.length;
  const avgSpeed = count > 0 ? Math.round(totalSpeed / count) : 0;

  let density: YoloDetection['density'];
  let congestionLevel: number;
  if (count < 5) {
    density = 'thấp';
    congestionLevel = 0.1;
  } else if (count < 15) {
    density = 'trung bình';
    congestionLevel = 0.4;
  } else if (count < 30) {
    density = 'cao';
    congestionLevel = 0.7;
  } else {
    density = 'rất cao';
    congestionLevel = 0.95;
  }

  const detections: DetectionBox[] = nearbyVehicles.slice(0, 20).map((v, i) => ({
    id: `det-${i}`,
    label: vehicleTypeLabel(v.type),
    confidence: 0.75 + Math.random() * 0.24,
    x: Math.random() * 0.8 + 0.1,
    y: Math.random() * 0.6 + 0.2,
    w: v.type === 'truck' || v.type === 'bus' ? 0.12 : 0.06,
    h: v.type === 'truck' || v.type === 'bus' ? 0.08 : 0.04,
  }));

  return {
    vehicleCount: count,
    byType,
    density,
    avgSpeed,
    congestionLevel,
    timestamp: Date.now(),
    detections,
  };
}

function vehicleTypeLabel(type: VehicleType): string {
  switch (type) {
    case 'car': return 'Ô tô';
    case 'motorcycle': return 'Xe máy';
    case 'truck': return 'Xe tải';
    case 'bus': return 'Xe buýt';
  }
}
