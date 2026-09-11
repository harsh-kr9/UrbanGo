// Core Data Types for Urban Flood Nowcasting System (UrbanGo) - SIH PS085 Compliant

export type CityId = 'kolkata' | 'mumbai' | 'delhi' | 'chennai' | 'bengaluru';

export interface LandmarkPoint {
  id: string;
  name: string;
  coordinates: [number, number]; // [lat, lng]
  category: 'railway' | 'metro_station' | 'hospital' | 'commercial' | 'transit_hub';
}

export interface CityInfo {
  id: CityId;
  name: string;
  state: string;
  center: [number, number]; // [lat, lng]
  zoom: number;
  description: string;
  vulnerableZonesCount: number;
  drainageAuthority: string;
  elevationRange: string;
  historicalHotspots: string[];
  landmarks: LandmarkPoint[];
}

// 1D Drainage Graph Node (Manholes, Inlets, Pumping Stations, Outfalls)
export type NodeType = 'manhole' | 'inlet' | 'pumping_station' | 'outfall' | 'sump';

export interface DrainageNode {
  id: string;
  name: string;
  coordinates: [number, number]; // [lat, lng]
  type: NodeType;
  groundElevation: number; // meters above sea level (DEM)
  invertElevation: number; // meters below ground
  depth: number; // pipe depth in meters
  capacityMax: number; // max throughput rate (m3/s)
  currentSurchargeHead: number; // current surcharge water height (m) above ground
  overflowVolume: number; // overflow onto surface (m3/s)
  status: 'normal' | 'stressed' | 'surcharging' | 'flooded';
  ward: string;
}

// 1D Drainage Graph Edge (Stormwater Pipes, Box Culverts, Canals)
export interface DrainagePipe {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  shape: 'circular' | 'box_culvert' | 'open_canal';
  diameter: number; // meters or width/height
  length: number; // meters
  slope: number; // m/m
  manningN: number; // roughness coefficient (e.g. 0.013 for concrete)
  maxHydraulicCapacity: number; // m3/s via Manning equation
  currentFlow: number; // m3/s
  fillRatio: number; // 0.0 to 1.0+ (1.0 = 100% full, >1.0 = pressurized)
  blockageRatio: number; // 0.0 to 0.95 (0% to 95% blocked by silt/debris)
  geometry: [number, number][]; // polyline lat,lng coordinates
}

// Explainable Prediction Factor Breakdown (PS085 Requirement)
export interface FloodExplainability {
  rainfallContributionPct: number;
  demElevationContributionPct: number;
  drainOverloadContributionPct: number;
  imperviousnessContributionPct: number;
  summaryExplanation: string;
}

// Street Surface Segment (2D Topography vector)
export interface StreetSegment {
  id: string;
  name: string;
  coordinates: [number, number][]; // polyline lat,lng
  associatedDrainNodeId?: string;
  elevationMeters: number; // DEM ground elevation
  lengthMeters: number;
  widthMeters: number;
  imperviousness: number; // Runoff coefficient (e.g. 0.85 for asphalt/concrete)
  currentWaterDepthCm: number; // calculated flood depth in cm
  timeToPeakMinutes?: number; // estimated time to peak depth
  riskLevel: 'clear' | 'low' | 'moderate' | 'high' | 'critical'; // <5cm, 5-15cm, 15-30cm, 30-50cm, >50cm
  aiConfidenceScorePct?: number; // ML + Physics Hybrid Confidence Score (e.g. 94.5%)
  explainability?: FloodExplainability;
}

// Doppler Weather Radar Grid Cell
export interface RadarNowcast {
  timestamp: string; // ISO string
  leadTimeMinutes: number; // 0 to 180 mins
  gridResolutionKm: number; // e.g. 0.5km
  reflectivityDbz: number; // radar dBZ (e.g. 35-65)
  rainfallRateMmHr: number; // converted via Z-R relationship (Z = 200 * R^1.6)
  isConnected: boolean;
  statusMessage: string;
  stormCellVector: {
    headingDeg: number;
    speedKmh: number;
  };
}

// Simulation Crisis Scenario Inputs (What-If Simulator)
export interface ScenarioParams {
  cityId: CityId;
  cloudburstIntensityMmHr: number; // 0 - 180 mm/hr
  rainfallDurationHours: number; // 0.5 - 6 hours
  drainageBlockageGlobalPercent: number; // 0 - 80%
  selectedBlockedPipes: string[]; // specific blocked pipe IDs for What-If tests
  tidalLevelMeters: number; // outfall sea/river tide level (e.g. 0.5m to 4.2m)
  urbanImperviousnessFactor: number; // 0.5 to 1.0
  leadTimeMinutes: number; // forecast slider offset 0 to 180 min
}

// Emergency & Public Transit Vehicles / Modes for Flood Routing
export type TransitMode = 'walk' | 'metro' | 'bus' | 'ambulance' | 'car' | 'custom';

export interface VehicleProfile {
  id: TransitMode;
  name: string;
  iconName: string;
  maxWaterDepthClearanceCm: number; // max depth vehicle can traverse safely
  description: string;
  isMultiModalMetro: boolean;
}

// Route Calculation Types
export interface RouteRequest {
  cityId: CityId;
  origin: [number, number];
  originName?: string;
  destination: [number, number];
  destinationName?: string;
  vehicleType: TransitMode;
  customClearanceCm?: number; // User-defined custom ground clearance in cm
  allowRiskBypass: boolean;
}

export interface RouteStep {
  mode: 'walk' | 'metro' | 'bus' | 'drive';
  streetName: string;
  distanceMeters: number;
  waterDepthCm: number;
  isFlooded: boolean;
  instruction: string;
}

export interface RouteSegmentGeometry {
  mode: 'walk' | 'metro' | 'bus' | 'drive';
  path: [number, number][];
}

export interface RouteResult {
  routeId: string;
  vehicleType: string;
  transitMode: TransitMode;
  originName: string;
  destinationName: string;
  totalDistanceKm: number;
  estimatedTimeMin: number;
  maxWaterDepthCm: number;
  isSafe: boolean;
  hazardWarningsCount: number;
  path: [number, number][];
  segmentedPath: RouteSegmentGeometry[];
  steps: RouteStep[];
  alternativeShortestSubmergedPath?: {
    totalDistanceKm: number;
    estimatedTimeMin: number;
    maxWaterDepthCm: number;
    path: [number, number][];
  };
}

export interface NodeHydraulicTelemetry {
  timestamp: string;
  nodeId: string;
  inflowRateM3s: number;
  outflowRateM3s: number;
  surchargeHeadMeters: number;
  streetInundationCm: number;
  pipeFillRatios: { pipeId: string; ratio: number }[];
}

export type DataMode = 'live' | 'historical';

export type SystemDataStatus = 'live' | 'historical' | 'unavailable';

export interface UserLocationState {
  coords: [number, number] | null;
  areaName?: string;
  status: 'requesting' | 'granted' | 'denied' | 'unsupported';
  errorMessage?: string;
}

export interface HistoricalEvent {
  id: string;
  cityId: CityId;
  name: string;
  date: string;
  source: string;
  cloudburstIntensityMmHr: number;
  durationHours: number;
  tidalLevelMeters: number;
  blockagePercent: number;
  description: string;
}

