import React, { useState } from 'react';
import { Compass, ShieldAlert, CheckCircle, Footprints, Train, Bus, Ambulance, Car, ArrowRight, MapPin, CloudRain, Zap, Loader2, Search, Settings } from 'lucide-react';
import type { CityInfo, RouteRequest, RouteResult, StreetSegment, TransitMode, UserLocationState } from '../types';
import { calculateFloodSafeRouteAsync, TRANSIT_PROFILES } from '../engine/routingEngine';
import { searchLocations, type RealTimeWeatherData } from '../services/weatherApi';

interface EmergencyRoutingPanelProps {
  city: CityInfo;
  streets: StreetSegment[];
  liveWeather?: RealTimeWeatherData | null;
  userLocationState?: UserLocationState;
  onRouteCalculated: (result: RouteResult) => void;
}

export const EmergencyRoutingPanel: React.FC<EmergencyRoutingPanelProps> = ({
  city,
  streets,
  liveWeather,
  userLocationState,
  onRouteCalculated
}) => {
  const landmarks = city.landmarks || [];

  // Origin & Destination State
  const [originId, setOriginId] = useState<string>('USER_GPS');
  const [destinationId, setDestinationId] = useState<string>(landmarks[0]?.id || 'DEST_CUSTOM');
  const [selectedMode, setSelectedMode] = useState<TransitMode>('ambulance');
  const [customClearanceCm, setCustomClearanceCm] = useState<number>(35);
  const [allowBypass, setAllowBypass] = useState<boolean>(true);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [activeRouteResult, setActiveRouteResult] = useState<RouteResult | null>(null);

  // Custom Searched Location State
  const [originSearchQuery, setOriginSearchQuery] = useState<string>('');
  const [destSearchQuery, setDestSearchQuery] = useState<string>('');
  const [originSearchResults, setOriginSearchResults] = useState<Array<{ name: string; lat: number; lng: number }>>([]);
  const [destSearchResults, setDestSearchResults] = useState<Array<{ name: string; lat: number; lng: number }>>([]);
  const [customOrigin, setCustomOrigin] = useState<{ name: string; coords: [number, number] } | null>(null);
  const [customDest, setCustomDest] = useState<{ name: string; coords: [number, number] } | null>(null);

  const handleSearchOrigin = async (query: string) => {
    setOriginSearchQuery(query);
    if (query.trim().length >= 2) {
      const res = await searchLocations(query);
      setOriginSearchResults(res);
    } else {
      setOriginSearchResults([]);
    }
  };

  const handleSearchDest = async (query: string) => {
    setDestSearchQuery(query);
    if (query.trim().length >= 2) {
      const res = await searchLocations(query);
      setDestSearchResults(res);
    } else {
      setDestSearchResults([]);
    }
  };

  const handleComputeRoute = async () => {
    setIsCalculating(true);

    let originCoords: [number, number] = city.center;
    let originName = 'Selected Origin';

    if (customOrigin) {
      originCoords = customOrigin.coords;
      originName = customOrigin.name;
    } else if (originId === 'USER_GPS' && userLocationState?.coords) {
      originCoords = userLocationState.coords;
      originName = `📍 ${userLocationState.areaName || 'My Current GPS Location'}`;
    } else {
      const lm = landmarks.find(l => l.id === originId) || landmarks[0];
      if (lm) {
        originCoords = lm.coordinates;
        originName = lm.name;
      }
    }

    let destCoords: [number, number] = [city.center[0] + 0.02, city.center[1] + 0.02];
    let destName = 'Selected Destination';

    if (customDest) {
      destCoords = customDest.coords;
      destName = customDest.name;
    } else {
      const destLm = landmarks.find(l => l.id === destinationId);
      if (destLm) {
        destCoords = destLm.coordinates;
        destName = destLm.name;
      } else if (landmarks[1]) {
        destCoords = landmarks[1].coordinates;
        destName = landmarks[1].name;
      }
    }

    const req: RouteRequest = {
      cityId: city.id,
      origin: originCoords,
      originName,
      destination: destCoords,
      destinationName: destName,
      vehicleType: selectedMode,
      customClearanceCm: selectedMode === 'custom' ? customClearanceCm : undefined,
      allowRiskBypass: allowBypass
    };

    const result = await calculateFloodSafeRouteAsync(req, streets);
    setActiveRouteResult(result);
    setIsCalculating(false);
    onRouteCalculated(result);
  };

  const getModeIcon = (mode: TransitMode) => {
    switch (mode) {
      case 'metro': return <Train className="h-5 w-5 text-purple-400" />;
      case 'walk': return <Footprints className="h-5 w-5 text-cyan-400" />;
      case 'bus': return <Bus className="h-5 w-5 text-amber-400" />;
      case 'ambulance': return <Ambulance className="h-5 w-5 text-rose-400" />;
      case 'car': return <Car className="h-5 w-5 text-emerald-400" />;
      case 'custom': return <Settings className="h-5 w-5 text-amber-400" />;
    }
  };

  return (
    <div className="glass-panel h-full rounded-2xl p-5 border border-slate-800 flex flex-col gap-5 overflow-y-auto">
      
      {/* Top Banner: Live Weather API Telemetry Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
            <CloudRain className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100">Live Weather Radar & Hydraulic API</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                liveWeather?.isLiveApiData ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}>
                {liveWeather?.isLiveApiData ? '⚡ Open-Meteo Live API Active' : '📡 Nowcast Sim Active'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live Rain: <span className="font-bold text-cyan-300">{liveWeather?.currentPrecipitationMmHr || 0} mm/h</span> | Temp: {liveWeather?.temperatureC || 27}°C | Wind: {liveWeather?.windSpeedKmh || 14} km/h
            </p>
          </div>
        </div>

        <div className="text-right text-[11px] text-slate-400">
          Last Synced: <span className="text-slate-200 font-mono">{liveWeather?.lastUpdated || 'Now'}</span>
        </div>
      </div>

      {/* Step 1 & Step 2 Selection Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Origin (Src) & Destination (Dest) Picker */}
        <div className="flex flex-col gap-3 rounded-xl bg-slate-900/80 p-4 border border-slate-800">
          <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-cyan-400" /> Step 1: Select Journey Origin & Destination ({city.name})
          </h3>

          {/* Search Any Origin Location */}
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
              <span>Origin Point (Src):</span>
              <span className="text-[10px] text-cyan-400 font-mono">Search any street/place in India</span>
            </label>

            <div className="relative">
              <input
                type="text"
                placeholder="Type any street, colony, or landmark (e.g. Connaught Place, HSR Layout)..."
                value={customOrigin ? customOrigin.name : originSearchQuery}
                onChange={(e) => {
                  setCustomOrigin(null);
                  handleSearchOrigin(e.target.value);
                }}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 pl-8 pr-3 py-2 text-xs font-semibold text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* Origin Dropdown Suggestions */}
            {originSearchResults.length > 0 && !customOrigin && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-slate-900 border border-cyan-500/50 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                <button
                  onClick={() => {
                    setOriginId('USER_GPS');
                    setCustomOrigin(null);
                    setOriginSearchResults([]);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-cyan-300 hover:bg-slate-800 border-b border-slate-800"
                >
                  📍 Use My Current GPS Location ({userLocationState?.areaName || 'Detected GPS'})
                </button>
                {originSearchResults.map((res, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCustomOrigin({ name: res.name.split(',')[0], coords: [res.lat, res.lng] });
                      setOriginSearchResults([]);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 border-b border-slate-800/60"
                  >
                    📍 {res.name}
                  </button>
                ))}
              </div>
            )}

            {!customOrigin && (
              <select
                value={originId}
                onChange={(e) => {
                  setOriginId(e.target.value);
                  setCustomOrigin(null);
                }}
                className="rounded-lg bg-slate-950/80 border border-slate-800 px-3 py-1.5 text-[11px] font-medium text-slate-300 focus:outline-none"
              >
                <option value="USER_GPS">📍 My Current GPS Location ({userLocationState?.areaName || 'Detected GPS'})</option>
                {landmarks.map((lm) => (
                  <option key={lm.id} value={lm.id}>📍 Landmark: {lm.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Search Any Destination Location */}
          <div className="flex flex-col gap-1.5 relative mt-2">
            <label className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
              <span>Destination Point (Dest):</span>
              <span className="text-[10px] text-cyan-400 font-mono">Search target destination</span>
            </label>

            <div className="relative">
              <input
                type="text"
                placeholder="Type destination address, hospital, station, or city..."
                value={customDest ? customDest.name : destSearchQuery}
                onChange={(e) => {
                  setCustomDest(null);
                  handleSearchDest(e.target.value);
                }}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 pl-8 pr-3 py-2 text-xs font-semibold text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* Destination Dropdown Suggestions */}
            {destSearchResults.length > 0 && !customDest && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-slate-900 border border-cyan-500/50 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                {destSearchResults.map((res, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCustomDest({ name: res.name.split(',')[0], coords: [res.lat, res.lng] });
                      setDestSearchResults([]);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 border-b border-slate-800/60"
                  >
                    🎯 {res.name}
                  </button>
                ))}
              </div>
            )}

            {!customDest && (
              <select
                value={destinationId}
                onChange={(e) => {
                  setDestinationId(e.target.value);
                  setCustomDest(null);
                }}
                className="rounded-lg bg-slate-950/80 border border-slate-800 px-3 py-1.5 text-[11px] font-medium text-slate-300 focus:outline-none"
              >
                {landmarks.map((lm) => (
                  <option key={lm.id} value={lm.id}>🎯 Landmark: {lm.name}</option>
                ))}
                <option value="USER_GPS">🎯 My Current GPS Location ({userLocationState?.areaName || 'Detected GPS'})</option>
              </select>
            )}
          </div>
        </div>

        {/* Multi-Modal Transit Mode Selector */}
        <div className="flex flex-col gap-3 rounded-xl bg-slate-900/80 p-4 border border-slate-800">
          <h3 className="text-xs font-bold text-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" /> Step 2: Select Transit & Clearance Mode
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Pedestrian vs Vehicle Routing</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TRANSIT_PROFILES.map((prof) => {
              const isSelected = selectedMode === prof.id;
              const isPedestrian = prof.id === 'walk';
              return (
                <button
                  key={prof.id}
                  onClick={() => setSelectedMode(prof.id)}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-cyan-950 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                    {getModeIcon(prof.id)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-100">{prof.name}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
                        isPedestrian ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : prof.isMultiModalMetro ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}>
                        {isPedestrian ? '🚶 Walk Path' : prof.isMultiModalMetro ? '🚆 Rail' : '🚘 Vehicle'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {prof.isMultiModalMetro ? 'Flood-Proof Train' : prof.id === 'custom' ? `Custom: ${customClearanceCm}cm` : `Clearance: ${prof.maxWaterDepthClearanceCm}cm`}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive Custom Ground Clearance Slider (0 - 150 cm) */}
          {selectedMode === 'custom' && (
            <div className="mt-2 p-3.5 rounded-xl bg-slate-950/90 border border-amber-500/50 flex flex-col gap-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Settings className="h-4 w-4 text-amber-400" /> Custom Vehicle Ground Clearance:
                </span>
                <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-extrabold text-xs border border-amber-500/40">
                  {customClearanceCm} cm max water cutoff
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-400 font-mono">0 cm</span>
                <input
                  type="range"
                  min="0"
                  max="150"
                  step="1"
                  value={customClearanceCm}
                  onChange={(e) => setCustomClearanceCm(parseInt(e.target.value) || 0)}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <span className="text-[10px] text-slate-400 font-mono">150 cm</span>
              </div>
              
              {/* Preset Vehicle Clearance Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold mr-1">Clearance Presets:</span>
                {[
                  { label: 'Hatchback (15cm)', val: 15 },
                  { label: 'Sedan (18cm)', val: 18 },
                  { label: 'SUV (25cm)', val: 25 },
                  { label: 'Ambulance (20cm)', val: 20 },
                  { label: 'Offroad 4x4 (35cm)', val: 35 },
                  { label: 'Rescue Truck (60cm)', val: 60 },
                  { label: 'Amphibious (100cm)', val: 100 }
                ].map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => setCustomClearanceCm(preset.val)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                      customClearanceCm === preset.val
                        ? 'bg-amber-400 text-slate-950 border-amber-300'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Compute Button */}
      <div className="flex items-center justify-between rounded-xl bg-slate-900/90 p-3 border border-slate-800">
        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={allowBypass}
            onChange={(e) => setAllowBypass(e.target.checked)}
            className="accent-cyan-400 h-4 w-4"
          />
          <span>Automatically bypass submerged streets exceeding clearance threshold</span>
        </label>

        <button
          onClick={handleComputeRoute}
          disabled={isCalculating}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
        >
          {isCalculating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
              <span>Fetching OSRM Real Driving Route...</span>
            </>
          ) : (
            <>
              <Compass className="h-4 w-4" />
              <span>Compute Safest Multi-Modal Route</span>
            </>
          )}
        </button>
      </div>

      {/* Route Result Comparison & Guidance */}
      {activeRouteResult && (
        <div className="flex flex-col gap-4 mt-1">
          
          {/* Side-by-Side Route Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Safe Bypass Route */}
            <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/40 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4" /> UrbanGo Safest Route
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-900/80 text-[10px] font-extrabold text-emerald-300">
                    RECOMMENDED
                  </span>
                </div>

                {/* Mode Category Distinction Badge */}
                <div className="mb-2.5">
                  {activeRouteResult.transitMode === 'walk' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800 text-[11px] font-bold">
                      <Footprints className="h-3.5 w-3.5" /> 🚶 Pedestrian Walk Path (Footpaths & Walkways, Pace: 4.5 km/h)
                    </span>
                  ) : activeRouteResult.transitMode === 'metro' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-950 text-purple-300 border border-purple-800 text-[11px] font-bold">
                      <Train className="h-3.5 w-3.5" /> 🚆 Multi-Modal Metro Line (Elevated Rail Corridor)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-bold">
                      <Car className="h-3.5 w-3.5" /> 🚘 Vehicle Driving Path (Roadways, Clearance Cutoff: {activeRouteResult.transitMode === 'custom' ? `${customClearanceCm} cm` : `${TRANSIT_PROFILES.find(p => p.id === activeRouteResult.transitMode)?.maxWaterDepthClearanceCm} cm`})
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-300 font-semibold mb-2">
                  {activeRouteResult.originName} <ArrowRight className="inline h-3.5 w-3.5 text-slate-500" /> {activeRouteResult.destinationName}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center mt-3">
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400">Total Distance</div>
                  <div className="text-sm font-bold text-emerald-300">{activeRouteResult.totalDistanceKm} km</div>
                </div>

                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400">Estimated ETA</div>
                  <div className="text-sm font-bold text-emerald-300">{activeRouteResult.estimatedTimeMin} min</div>
                </div>

                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400">Max Flood Depth</div>
                  <div className="text-sm font-bold text-emerald-300">{activeRouteResult.maxWaterDepthCm} cm</div>
                </div>
              </div>
            </div>

            {/* Standard Shortest Route (Submerged) */}
            {activeRouteResult.alternativeShortestSubmergedPath && (
              <div className="rounded-xl bg-rose-950/40 border border-rose-500/40 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4" /> Standard Shortest Path (Submerged)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-rose-900/80 text-[10px] font-extrabold text-rose-300">
                      {activeRouteResult.transitMode === 'walk' ? 'WADING HAZARD' : 'STALL HAZARD'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 mb-2">
                    {activeRouteResult.transitMode === 'walk'
                      ? 'Direct pedestrian walkway passing through deep flooded dips (>10cm depth).'
                      : 'Direct shortest road path passing through low-elevation flood dips exceeding clearance threshold.'}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center mt-3">
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400">Distance</div>
                    <div className="text-sm font-bold text-slate-300">{activeRouteResult.alternativeShortestSubmergedPath.totalDistanceKm} km</div>
                  </div>

                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400">Submerged ETA</div>
                    <div className="text-sm font-bold text-rose-400">{activeRouteResult.alternativeShortestSubmergedPath.estimatedTimeMin} min</div>
                  </div>

                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400">Max Depth</div>
                    <div className="text-sm font-bold text-rose-400">{activeRouteResult.alternativeShortestSubmergedPath.maxWaterDepthCm} cm</div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Turn-by-Turn Journey Breakdown with Transit Mode Badges */}
          <div className="rounded-xl bg-slate-900/70 p-4 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-200 mb-3">Step-by-Step Multi-Modal Guidance Breakdown:</h4>
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
              {activeRouteResult.steps.map((step, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded-lg border text-xs ${
                    step.isFlooded
                      ? 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                    {step.mode === 'metro' ? <Train className="h-4 w-4 text-purple-400" /> : step.mode === 'walk' ? <Footprints className="h-4 w-4 text-cyan-400" /> : <Car className="h-4 w-4 text-emerald-400" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-100">{step.streetName}</span>
                      <span className="text-[10px] font-mono text-cyan-300">{step.distanceMeters} meters</span>
                    </div>
                    <div className="text-[11px] mt-1 text-slate-300">{step.instruction}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
