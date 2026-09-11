import React, { useState } from 'react';
import { Activity, AlertTriangle, CloudRain, Code2, Compass, Home, Layers, ShieldAlert, Navigation, History, CheckCircle2, AlertCircle, Sun, Moon, Lock, ChevronDown } from 'lucide-react';
import type { CityId, DataMode, HistoricalEvent, UserLocationState } from '../types';
import { CITIES } from '../data/metroDatasets';
import type { RealTimeWeatherData } from '../services/weatherApi';

interface HeaderProps {
  activeCityId: CityId;
  onSelectCity: (cityId: CityId) => void;
  activeTab: 'map' | 'routing' | 'driving' | 'scenario' | 'api' | 'analytics';
  onSelectTab: (tab: 'map' | 'routing' | 'driving' | 'scenario' | 'api' | 'analytics') => void;
  totalFloodedKm: number;
  maxWaterDepthCm: number;
  surchargedNodeCount: number;
  rainfallRateMmHr: number | null;
  onApplyPresetScenario?: (scenarioType: string) => void;
  onReturnToHome?: () => void;
  dataMode: DataMode;
  onToggleDataMode: (mode: DataMode) => void;
  historicalEvents: HistoricalEvent[];
  selectedHistoricalEventId: string;
  onSelectHistoricalEvent: (eventId: string) => void;
  userLocationState: UserLocationState;
  onRequestUserLocation: () => void;
  liveWeather: RealTimeWeatherData | null;
  themeMode?: 'dark' | 'light';
  onToggleTheme?: () => void;
  isMunicipalOfficial?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeCityId,
  onSelectCity,
  activeTab,
  onSelectTab,
  totalFloodedKm,
  maxWaterDepthCm,
  surchargedNodeCount,
  rainfallRateMmHr,
  onReturnToHome,
  dataMode,
  onToggleDataMode,
  historicalEvents,
  selectedHistoricalEventId,
  onSelectHistoricalEvent,
  userLocationState,
  onRequestUserLocation,
  liveWeather,
  themeMode = 'dark',
  onToggleTheme,
  isMunicipalOfficial = false
}) => {
  const [isTelemetryOpen, setIsTelemetryOpen] = useState<boolean>(false);
  const isLiveMode = dataMode === 'live';
  const isLiveAvailable = isLiveMode && (liveWeather?.isLiveApiData ?? false);

  return (
    <header className="glass-panel sticky top-0 z-50 border-b border-slate-800 px-4 py-3 text-white shadow-2xl">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        
        {/* Logo & City/Location Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 shadow-lg shadow-cyan-500/30">
              <CloudRain className="h-6 w-6 text-white animate-bounce" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                  UrbanGo
                </h1>
              </div>
              <p className="text-xs text-slate-400">Coupled 1D-2D Rainfall & Drainage Nowcast System</p>
            </div>
          </div>

          {/* Mode Switcher: LIVE vs HISTORICAL REPLAY */}
          <div className="flex items-center gap-1.5 bg-slate-950/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onToggleDataMode('live')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                isLiveMode
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-950 animate-pulse"></span>
              <span>LIVE MODE</span>
            </button>

            <button
              onClick={() => onToggleDataMode('historical')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                !isLiveMode
                  ? 'bg-blue-500 text-slate-950 shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <History className="h-3.5 w-3.5" />
              <span>HISTORICAL REPLAY</span>
            </button>
          </div>

          {/* Location Request & City Dropdown */}
          <div className="flex items-center gap-2">
            {onReturnToHome && (
              <button
                onClick={onReturnToHome}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-800"
                title="Return to Landing Page"
              >
                <Home className="h-3.5 w-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Landing Page</span>
              </button>
            )}

            {/* User GPS Geolocation Button */}
            <button
              onClick={onRequestUserLocation}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                userLocationState.status === 'granted'
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                  : userLocationState.status === 'requesting'
                  ? 'bg-amber-950 text-amber-300 border-amber-800 animate-pulse'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
              title="Locate me on GIS Map"
            >
              <Navigation className="h-3.5 w-3.5 text-cyan-400" />
              <span className="hidden md:inline">
                {userLocationState.status === 'granted'
                  ? userLocationState.areaName || 'Location Active'
                  : userLocationState.status === 'requesting'
                  ? 'Locating...'
                  : 'Locate Me'}
              </span>
            </button>

            {/* City Switcher */}
            <select
              value={activeCityId}
              onChange={(e) => onSelectCity(e.target.value as CityId)}
              className="rounded-lg bg-slate-900/90 border border-cyan-500/40 px-3 py-1.5 text-sm font-semibold text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 shadow-inner"
            >
              {CITIES.map((city) => (
                <option key={city.id} value={city.id} className="bg-slate-900 text-slate-200">
                  📍 {city.name} ({city.state})
                </option>
              ))}
            </select>

            {/* Historical Replay Event Picker Dropdown (Only visible in Historical Replay mode) */}
            {!isLiveMode && (
              <select
                value={selectedHistoricalEventId}
                onChange={(e) => onSelectHistoricalEvent(e.target.value)}
                className="rounded-lg bg-blue-950 border border-blue-600 px-3 py-1.5 text-xs font-bold text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {historicalEvents.map((evt) => (
                  <option key={evt.id} value={evt.id} className="bg-slate-900 text-slate-200">
                    📜 {evt.name} ({evt.date})
                  </option>
                ))}
              </select>
            )}

            {/* Dark / Light Theme Toggle Button */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  themeMode === 'dark'
                    ? 'bg-slate-900 text-cyan-300 border-cyan-500/40 hover:bg-slate-800'
                    : 'bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-100 shadow-sm'
                }`}
                title={`Switch to ${themeMode === 'dark' ? 'Light' : 'Dark'} Mode`}
              >
                {themeMode === 'dark' ? (
                  <>
                    <Sun className="h-3.5 w-3.5 text-amber-400" />
                    <span className="hidden sm:inline">LIGHT MODE</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-3.5 w-3.5 text-indigo-600" />
                    <span className="hidden sm:inline">DARK MODE</span>
                  </>
                )}
              </button>
            )}

            {/* Collapsible Live Telemetry & Metrics Dropdown Toggle */}
            <button
              onClick={() => setIsTelemetryOpen(prev => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                isTelemetryOpen
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
              title="Show or hide Live Telemetry & Metrics Dropdown"
            >
              <Activity className="h-3.5 w-3.5 text-cyan-400" />
              <span>Live Status & Metrics</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isTelemetryOpen ? 'rotate-180 text-cyan-400' : 'text-slate-400'}`} />
            </button>

          </div>
        </div>

        {/* Collapsible Live Status Dropdown Panel */}
        {isTelemetryOpen && (
          <div className="flex flex-wrap items-center gap-3 bg-slate-950/90 rounded-xl p-2.5 border border-cyan-900/40 text-xs shadow-xl animate-in fade-in zoom-in-95 duration-150">
            
            {/* System Data Status Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
              {isLiveAvailable ? (
                <span className="flex items-center gap-1 text-emerald-400 font-extrabold text-[11px]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>🟢 LIVE</span>
                </span>
              ) : !isLiveMode ? (
                <span className="flex items-center gap-1 text-blue-400 font-extrabold text-[11px]">
                  <History className="h-3.5 w-3.5 text-blue-400" />
                  <span>🔵 HISTORICAL REPLAY</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-400 font-extrabold text-[11px]">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                  <span>⚠️ DATA UNAVAILABLE</span>
                </span>
              )}
            </div>

            {/* Rainfall Value */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
              <CloudRain className="h-4 w-4 text-cyan-400" />
              <span className="text-slate-400">Rainfall:</span>
              <span className="font-bold text-cyan-300">
                {rainfallRateMmHr !== null ? `${rainfallRateMmHr} mm/h` : '0 mm/h'}
              </span>
            </div>

            {/* Surcharged Drains */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
              <AlertTriangle className={`h-4 w-4 ${surchargedNodeCount > 0 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`} />
              <span className="text-slate-400">Surcharged Drains:</span>
              <span className={`font-bold ${surchargedNodeCount > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
                {surchargedNodeCount} Nodes
              </span>
            </div>

            {/* Flooded Roads */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              <span className="text-slate-400">Flooded Roads:</span>
              <span className="font-bold text-amber-300">{totalFloodedKm} km</span>
            </div>

            {/* Max Depth */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
              <Activity className="h-4 w-4 text-rose-400" />
              <span className="text-slate-400">Max Depth:</span>
              <span className="font-bold text-rose-400">{maxWaterDepthCm} cm</span>
            </div>

          </div>
        )}

        {/* View Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onSelectTab('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'map'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>GIS Map & Radar</span>
          </button>

          <button
            onClick={() => onSelectTab('routing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'routing'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Emergency Routing</span>
          </button>

          <button
            onClick={() => onSelectTab('driving')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'driving'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-lg shadow-emerald-500/30 font-black'
                : 'text-emerald-400 hover:text-emerald-300 hover:bg-slate-900 border border-emerald-500/40'
            }`}
          >
            <Navigation className="h-3.5 w-3.5 animate-pulse" />
            <span>Live Driving Mode</span>
          </button>

          <button
            onClick={() => onSelectTab('scenario')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'scenario'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Crisis Simulator</span>
          </button>

          <button
            onClick={() => onSelectTab('api')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'api'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>Developer API</span>
          </button>

          <button
            onClick={() => onSelectTab('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'analytics'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-extrabold'
                : isMunicipalOfficial
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                : 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-950/30 border border-amber-500/20'
            }`}
            title={isMunicipalOfficial ? 'Municipal Hydrodynamic Telemetry' : 'Telemetry Access Restricted (Municipal Official Only)'}
          >
            {isMunicipalOfficial ? (
              <Activity className="h-3.5 w-3.5" />
            ) : (
              <Lock className="h-3.5 w-3.5 text-amber-400" />
            )}
            <span>Telemetry</span>
          </button>
        </nav>



      </div>
    </header>
  );
};

