import { useEffect, useMemo, useState } from 'react';
import type { CityId, DataMode, DrainageNode, DrainagePipe, RouteResult, ScenarioParams, UserLocationState } from './types';
import { CITIES } from './data/metroDatasets';
import { HISTORICAL_EVENTS } from './data/historicalEvents';
import { runHydrodynamicSimulation } from './engine/hydroEngine';
import { generateRadarNowcastFeed } from './engine/radarEngine';
import { calculateFloodSafeRouteAsync } from './engine/routingEngine';
import { fetchLiveWeatherData, reverseGeocodeLocation } from './services/weatherApi';
import type { RealTimeWeatherData } from './services/weatherApi';
import { fetchRealOsmDrainageData } from './services/overpassApi';
import { LandingPage, WaterFluidInteractiveCanvas } from './components/LandingPage';
import { Header } from './components/Header';
import { TimelineControls } from './components/TimelineControls';
import { MapView } from './components/MapView';
import { NodeInspectorModal } from './components/NodeInspectorModal';
import { EmergencyRoutingPanel } from './components/EmergencyRoutingPanel';
import { LiveDrivingPanel } from './components/LiveDrivingPanel';
import { ScenarioPanel } from './components/ScenarioPanel';
import { ApiUtilityPanel } from './components/ApiUtilityPanel';
import { AnalyticsPanel } from './components/AnalyticsPanel';

export function App() {
  // Page View Mode: 'landing' vs 'dashboard'
  const [viewMode, setViewMode] = useState<'landing' | 'dashboard'>('landing');

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<{ email: string; name?: string; department?: string; isMunicipalOfficial?: boolean } | null>(() => {
    const saved = localStorage.getItem('urbango_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLoginSuccess = (user: { email: string; name?: string; department?: string; isMunicipalOfficial?: boolean }) => {
    setCurrentUser(user);
    localStorage.setItem('urbango_user', JSON.stringify(user));
    setViewMode('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('urbango_user');
  };

  const [autoOpenMunicipalLogin, setAutoOpenMunicipalLogin] = useState<boolean>(false);

  const handleRequireMunicipalLogin = () => {
    setAutoOpenMunicipalLogin(true);
    setViewMode('landing');
  };

  // Dark / Light Theme System State (Auto-detect from prefers-color-scheme, persist in localStorage)
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('urbango_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('urbango_theme', themeMode);
    if (themeMode === 'light') {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark-theme');
    } else {
      document.documentElement.classList.add('dark-theme');
      document.documentElement.classList.remove('light-theme');
    }
  }, [themeMode]);

  const handleToggleTheme = () => {
    setThemeMode(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Real OSM Overpass Drainage Data State
  const [realOsmGeo, setRealOsmGeo] = useState<{ nodes: DrainageNode[]; pipes: DrainagePipe[] } | null>(null);

  // SIH PS26085 Data Mode: 'live' (Primary Default) vs 'historical'
  const [dataMode, setDataMode] = useState<DataMode>('live');
  const [selectedHistoricalEventId, setSelectedHistoricalEventId] = useState<string>('HIST_KOL_2024');

  // Primary App State
  const [activeCityId, setActiveCityId] = useState<CityId>('kolkata');
  const [activeTab, setActiveTab] = useState<'map' | 'routing' | 'driving' | 'scenario' | 'api' | 'analytics'>('map');
  const [leadTimeMinutes, setLeadTimeMinutes] = useState<number>(0); // 0 to 180 min nowcast scrubber

  // User Geolocation State
  const [userLocationState, setUserLocationState] = useState<UserLocationState>({
    coords: null,
    status: 'requesting'
  });

  // Real-Time Live Weather API State
  const [liveWeatherData, setLiveWeatherData] = useState<RealTimeWeatherData | null>(null);

  // Simulation Parameters
  const [scenarioParams, setScenarioParams] = useState<ScenarioParams>({
    cityId: 'kolkata',
    cloudburstIntensityMmHr: 0,
    rainfallDurationHours: 2.0,
    drainageBlockageGlobalPercent: 15,
    selectedBlockedPipes: [],
    tidalLevelMeters: 1.5,
    urbanImperviousnessFactor: 0.85,
    leadTimeMinutes: 0,
    deployedPumps: {}
  });

  // Selected Node / Pipe Inspector State
  const [selectedNode, setSelectedNode] = useState<DrainageNode | null>(null);
  const [selectedPipe, setSelectedPipe] = useState<DrainagePipe | null>(null);

  // Feature 1: De-Watering Pump Telemetry Dispatcher Handler
  const handleTogglePumpRate = (nodeId: string, rateLps: number) => {
    setScenarioParams(prev => {
      const currentPumps = { ...(prev.deployedPumps || {}) };
      if (rateLps === 0) {
        delete currentPumps[nodeId];
      } else {
        currentPumps[nodeId] = rateLps;
      }
      return {
        ...prev,
        deployedPumps: currentPumps
      };
    });
  };

  // Emergency Routing State
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [selectedOrigin, setSelectedOrigin] = useState<{ name: string; coords: [number, number] } | null>(null);
  const [selectedDest, setSelectedDest] = useState<{ name: string; coords: [number, number] } | null>(null);

  // Handle map click picking for Origin & Destination
  const handleMapClickSetPoint = async (coords: [number, number], mode: 'origin' | 'destination', locationName?: string) => {
    const activeCityInfo = CITIES.find(c => c.id === activeCityId) || CITIES[0];
    const defaultName = locationName || `Selected ${mode === 'origin' ? 'Origin' : 'Destination'} (${coords[0]}, ${coords[1]})`;
    
    let newOrigin = selectedOrigin;
    let newDest = selectedDest;

    if (mode === 'origin') {
      newOrigin = { name: defaultName, coords };
      setSelectedOrigin(newOrigin);
    } else {
      newDest = { name: defaultName, coords };
      setSelectedDest(newDest);
    }

    const oCoords = newOrigin?.coords || userLocationState.coords || activeCityInfo.center;
    const dCoords = newDest?.coords || [activeCityInfo.center[0] + 0.015, activeCityInfo.center[1] + 0.015];
    const oName = newOrigin?.name || (userLocationState.coords ? `📍 ${userLocationState.areaName || 'My Location'}` : 'Default Origin');
    const dName = newDest?.name || 'Default Destination';

    const req = {
      cityId: activeCityId,
      origin: oCoords,
      originName: oName,
      destination: dCoords,
      destinationName: dName,
      vehicleType: 'ambulance' as const,
      allowRiskBypass: true
    };

    const res = await calculateFloodSafeRouteAsync(req, hydroResult.updatedStreets);
    setRouteResult(res);
  };

  // 1. User Location Request on App Mount
  const handleRequestUserLocation = () => {
    if (!navigator.geolocation) {
      setUserLocationState({ coords: null, status: 'unsupported', errorMessage: 'Browser geolocation unsupported' });
      return;
    }

    setUserLocationState(prev => ({ ...prev, status: 'requesting' }));

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(4));
        const lng = parseFloat(pos.coords.longitude.toFixed(4));
        
        const areaName = await reverseGeocodeLocation(lat, lng);
        setUserLocationState({
          coords: [lat, lng],
          areaName: areaName || 'User Location',
          status: 'granted'
        });

        // Fetch live weather for user's actual location
        const weather = await fetchLiveWeatherData(lat, lng);
        setLiveWeatherData(weather);
      },
      (err) => {
        console.warn('Geolocation permission denied or error:', err.message);
        setUserLocationState({
          coords: null,
          status: 'denied',
          errorMessage: 'Location permission denied'
        });
      },
      { timeout: 8000 }
    );
  };

  useEffect(() => {
    handleRequestUserLocation();
  }, []);

  // 2. Fetch Live Weather Data & Real OSM Overpass Drainage Infrastructure
  useEffect(() => {
    if (dataMode !== 'live') return;

    const activeCityInfo = CITIES.find(c => c.id === activeCityId) || CITIES[0];
    const targetCoords = userLocationState.coords || activeCityInfo.center;

    fetchLiveWeatherData(targetCoords[0], targetCoords[1]).then((data) => {
      setLiveWeatherData(data);
    });

    fetchRealOsmDrainageData(targetCoords[0], targetCoords[1]).then((osmGeo) => {
      if (osmGeo && osmGeo.nodes.length > 0) {
        setRealOsmGeo(osmGeo);
      }
    });
  }, [activeCityId, dataMode, userLocationState.coords]);

  // 3. Switch between LIVE MODE and HISTORICAL REPLAY MODE
  const handleToggleDataMode = (mode: DataMode) => {
    setDataMode(mode);
    if (mode === 'historical') {
      const evt = HISTORICAL_EVENTS.find(e => e.id === selectedHistoricalEventId) || HISTORICAL_EVENTS[0];
      setActiveCityId(evt.cityId);
      setScenarioParams(prev => ({
        ...prev,
        cityId: evt.cityId,
        cloudburstIntensityMmHr: evt.cloudburstIntensityMmHr,
        rainfallDurationHours: evt.durationHours,
        tidalLevelMeters: evt.tidalLevelMeters,
        drainageBlockageGlobalPercent: evt.blockagePercent
      }));
    } else {
      // Return to LIVE mode
      const livePrecip = liveWeatherData?.currentPrecipitationMmHr ?? 0;
      setScenarioParams(prev => ({
        ...prev,
        cloudburstIntensityMmHr: livePrecip
      }));
    }
  };

  // 4. Handle Historical Event Selection
  const handleSelectHistoricalEvent = (eventId: string) => {
    setSelectedHistoricalEventId(eventId);
    const evt = HISTORICAL_EVENTS.find(e => e.id === eventId);
    if (evt) {
      setActiveCityId(evt.cityId);
      setScenarioParams(prev => ({
        ...prev,
        cityId: evt.cityId,
        cloudburstIntensityMmHr: evt.cloudburstIntensityMmHr,
        rainfallDurationHours: evt.durationHours,
        tidalLevelMeters: evt.tidalLevelMeters,
        drainageBlockageGlobalPercent: evt.blockagePercent
      }));
    }
  };

  // 5. Handle City Switch
  const handleSelectCity = (cityId: CityId) => {
    setActiveCityId(cityId);
    if (dataMode === 'live') {
      const cityInfo = CITIES.find(c => c.id === cityId) || CITIES[0];
      fetchLiveWeatherData(cityInfo.center[0], cityInfo.center[1]).then((data) => {
        setLiveWeatherData(data);
      });
    } else {
      const matchingEvt = HISTORICAL_EVENTS.find(e => e.cityId === cityId);
      if (matchingEvt) {
        handleSelectHistoricalEvent(matchingEvt.id);
      }
    }
    setSelectedNode(null);
    setSelectedPipe(null);
    setRouteResult(null);
  };

  // Determine Effective Rainfall Rate based on Scenario Parameters
  const activeHistoricalEvent = HISTORICAL_EVENTS.find(e => e.id === selectedHistoricalEventId) || HISTORICAL_EVENTS[0];

  const effectiveRainfallRate = useMemo(() => {
    if (dataMode === 'historical') {
      return scenarioParams.cloudburstIntensityMmHr > 0 ? scenarioParams.cloudburstIntensityMmHr : activeHistoricalEvent.cloudburstIntensityMmHr;
    }
    return scenarioParams.cloudburstIntensityMmHr;
  }, [dataMode, activeHistoricalEvent, scenarioParams.cloudburstIntensityMmHr]);

  // Run Hydrodynamic Engine
  const currentScenario = useMemo(() => ({
    ...scenarioParams,
    cloudburstIntensityMmHr: effectiveRainfallRate,
    leadTimeMinutes
  }), [scenarioParams, effectiveRainfallRate, leadTimeMinutes]);

  const hydroResult = useMemo(() => {
    const activeUserCoords = dataMode === 'live' ? userLocationState.coords : null;
    const activeUserArea = dataMode === 'live' ? userLocationState.areaName : undefined;
    const activeOsmGeo = dataMode === 'live' ? realOsmGeo : null;
    return runHydrodynamicSimulation(currentScenario, activeUserCoords, activeUserArea, activeOsmGeo);
  }, [currentScenario, userLocationState.coords, userLocationState.areaName, realOsmGeo, dataMode]);

  // Radar Feed Calculation
  const radarFeed = useMemo(() => {
    return generateRadarNowcastFeed(leadTimeMinutes, effectiveRainfallRate ?? 0);
  }, [leadTimeMinutes, effectiveRainfallRate]);

  const activeCity = CITIES.find(c => c.id === activeCityId) || CITIES[0];

  // Re-evaluate active route timing & flood bypass whenever crisis scenario or hydroResult updates
  useEffect(() => {
    if (!routeResult) return;
    const oCoords = selectedOrigin?.coords || userLocationState.coords || activeCity.center;
    const dCoords = selectedDest?.coords || [activeCity.center[0] + 0.015, activeCity.center[1] + 0.015];

    const req = {
      cityId: activeCityId,
      origin: oCoords,
      originName: routeResult.originName,
      destination: dCoords,
      destinationName: routeResult.destinationName,
      vehicleType: routeResult.transitMode,
      allowRiskBypass: true
    };

    calculateFloodSafeRouteAsync(req, hydroResult.updatedStreets).then(newRes => {
      setRouteResult(newRes);
    });
  }, [hydroResult.maxWaterDepthCm, hydroResult.surchargedNodeCount]);

  // Preset Scenario Handler
  const handleApplyPresetScenario = (scenarioType: string) => {
    if (scenarioType === 'cloudburst') {
      setScenarioParams(prev => ({
        ...prev,
        cloudburstIntensityMmHr: 135,
        drainageBlockageGlobalPercent: 45
      }));
    } else if (scenarioType === 'tide_lock') {
      setScenarioParams(prev => ({
        ...prev,
        tidalLevelMeters: 4.2,
        cloudburstIntensityMmHr: 95
      }));
    }
  };

  // Render Landing Page if in landing view
  if (viewMode === 'landing') {
    return (
      <LandingPage
        onLaunchDashboard={() => {
          setAutoOpenMunicipalLogin(false);
          setViewMode('dashboard');
        }}
        themeMode={themeMode}
        onToggleTheme={handleToggleTheme}
        currentUser={currentUser}
        onLoginSuccess={(user) => {
          setAutoOpenMunicipalLogin(false);
          handleLoginSuccess(user);
        }}
        onLogout={handleLogout}
        autoOpenMunicipalLogin={autoOpenMunicipalLogin}
      />
    );
  }

  return (
    <div className={`flex h-screen w-screen flex-col overflow-hidden font-sans relative transition-colors duration-300 ${
      themeMode === 'dark' ? 'bg-[#090d16] text-slate-100' : 'bg-[#F4F7F6] text-slate-900'
    }`}>
      {/* Interactive Water & Flood Background Canvas */}
      <WaterFluidInteractiveCanvas isDarkMode={themeMode === 'dark'} />

      {/* Top Header Navigation & Data Controls */}
      <Header
        activeCityId={activeCityId}
        onSelectCity={handleSelectCity}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        totalFloodedKm={hydroResult.totalFloodedKm}
        maxWaterDepthCm={hydroResult.maxWaterDepthCm}
        surchargedNodeCount={hydroResult.surchargedNodeCount}
        rainfallRateMmHr={effectiveRainfallRate}
        onApplyPresetScenario={handleApplyPresetScenario}
        onReturnToHome={() => setViewMode('landing')}
        dataMode={dataMode}
        onToggleDataMode={handleToggleDataMode}
        historicalEvents={HISTORICAL_EVENTS}
        isMunicipalOfficial={currentUser?.isMunicipalOfficial ?? false}
        selectedHistoricalEventId={selectedHistoricalEventId}
        onSelectHistoricalEvent={handleSelectHistoricalEvent}
        userLocationState={userLocationState}
        onRequestUserLocation={handleRequestUserLocation}
        liveWeather={liveWeatherData}
        themeMode={themeMode}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 p-3 overflow-hidden flex flex-col gap-3">
        
        {/* Tab 1: GIS Map & Doppler Radar */}
        {activeTab === 'map' && (
          <div className="flex-1 flex flex-col gap-3 overflow-hidden">
            <TimelineControls
              leadTimeMinutes={leadTimeMinutes}
              onChangeLeadTime={setLeadTimeMinutes}
              rainfallRateMmHr={effectiveRainfallRate}
              dataMode={dataMode}
              sourceName={dataMode === 'live' ? liveWeatherData?.sourceName : activeHistoricalEvent.source}
            />

            <div className="flex-1 relative overflow-hidden">
              <MapView
                city={activeCity}
                nodes={hydroResult.updatedNodes}
                pipes={hydroResult.updatedPipes}
                streets={hydroResult.updatedStreets}
                radar={radarFeed}
                routeResult={routeResult}
                userLocationCoords={userLocationState.coords}
                userAreaName={userLocationState.areaName}
                onSelectNode={setSelectedNode}
                onSelectPipe={setSelectedPipe}
                onMapClickSetPoint={handleMapClickSetPoint}
                sourceName={dataMode === 'live' ? liveWeatherData?.sourceName : activeHistoricalEvent.source}
                isLiveMode={dataMode === 'live'}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Emergency Dispatch Routing */}
        {activeTab === 'routing' && (
          <EmergencyRoutingPanel
            city={activeCity}
            streets={hydroResult.updatedStreets}
            liveWeather={liveWeatherData}
            userLocationState={userLocationState}
            onRouteCalculated={(res) => {
              setRouteResult(res);
              if (res) setActiveTab('driving');
            }}
            onClearRoute={() => {
              setRouteResult(null);
            }}
          />
        )}

        {/* Tab 2.5: Real-Time Live Driving Navigation System */}
        {activeTab === 'driving' && (
          <LiveDrivingPanel
            city={activeCity}
            streets={hydroResult.updatedStreets}
            liveWeather={liveWeatherData}
            userLocationState={userLocationState}
            activeRoute={routeResult}
            onRouteCalculated={(res) => setRouteResult(res)}
            onSwitchToMap={() => setActiveTab('map')}
          />
        )}

        {/* Tab 3: Crisis Scenario Laboratory */}
        {activeTab === 'scenario' && (
          <ScenarioPanel
            scenario={scenarioParams}
            onChangeScenario={setScenarioParams}
            onResetScenario={() =>
              setScenarioParams({
                cityId: activeCityId,
                cloudburstIntensityMmHr: 75,
                rainfallDurationHours: 2.0,
                drainageBlockageGlobalPercent: 20,
                selectedBlockedPipes: [],
                tidalLevelMeters: 2.1,
                urbanImperviousnessFactor: 0.88,
                leadTimeMinutes
              })
            }
          />
        )}

        {/* Tab 4: Developer Navigation API Utility */}
        {activeTab === 'api' && (
          <ApiUtilityPanel
            city={activeCity}
            streets={hydroResult.updatedStreets}
          />
        )}

        {/* Tab 5: Municipal Analytics Situation Room */}
        {activeTab === 'analytics' && (
          <AnalyticsPanel
            city={activeCity}
            nodes={hydroResult.updatedNodes}
            pipes={hydroResult.updatedPipes}
            streets={hydroResult.updatedStreets}
            totalFloodedKm={hydroResult.totalFloodedKm}
            maxWaterDepthCm={hydroResult.maxWaterDepthCm}
            surchargedNodeCount={hydroResult.surchargedNodeCount}
            systemCapacityStressPercent={hydroResult.systemCapacityStressPercent}
            isMunicipalOfficial={currentUser?.isMunicipalOfficial ?? false}
            onRequireMunicipalLogin={handleRequireMunicipalLogin}
            onReturnToMap={() => setActiveTab('map')}
          />
        )}

      </main>

      {/* Node / Pipe Telemetry Inspector Modal */}
      <NodeInspectorModal
        selectedNode={selectedNode ? hydroResult.updatedNodes.find(n => n.id === selectedNode.id) || selectedNode : null}
        selectedPipe={selectedPipe}
        onClose={() => {
          setSelectedNode(null);
          setSelectedPipe(null);
        }}
        onTogglePumpRate={handleTogglePumpRate}
      />

    </div>
  );
}

export default App;
