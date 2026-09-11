import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { CityInfo, DrainageNode, DrainagePipe, RadarNowcast, RouteResult, StreetSegment } from '../types';
import { Layers, MapPin, Mountain, Globe, Moon, ShieldAlert, CheckCircle, Navigation } from 'lucide-react';
import { getRadarColorHex } from '../engine/radarEngine';
import { reverseGeocodeLocation, fetchTerrainElevation } from '../services/weatherApi';

export interface MapViewProps {
  city: CityInfo;
  nodes: DrainageNode[];
  pipes: DrainagePipe[];
  streets: StreetSegment[];
  radar: RadarNowcast;
  routeResult?: RouteResult | null;
  userLocationCoords?: [number, number] | null;
  userAreaName?: string;
  onSelectNode: (node: DrainageNode) => void;
  onSelectPipe: (pipe: DrainagePipe) => void;
  onMapClickSetPoint?: (coords: [number, number], mode: 'origin' | 'destination', locationName?: string) => void;
  sourceName?: string;
  isLiveMode?: boolean;
  isDriverMode?: boolean;
}

export type MapStyleMode = 'dark' | 'terrain' | 'satellite';

export const MapView: React.FC<MapViewProps> = ({
  city,
  nodes,
  pipes,
  streets,
  radar,
  routeResult,
  userLocationCoords,
  userAreaName,
  onSelectNode,
  onSelectPipe,
  onMapClickSetPoint,
  sourceName,
  isLiveMode = true,
  isDriverMode = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Basemap Terrain / Map Style Mode (Forced to 'dark' in Driver Mode)
  const [mapStyle, setMapStyle] = useState<MapStyleMode>(isDriverMode ? 'dark' : 'terrain');

  // Layer Toggles & Radar Opacity (Radar & 1D Graph turned OFF in Driver Mode for clean navigation)
  const [showRadarLayer, setShowRadarLayer] = useState<boolean>(!isDriverMode);
  const [radarOpacity, setRadarOpacity] = useState<number>(0.35);
  const [showPipeLayer, setShowPipeLayer] = useState<boolean>(!isDriverMode);
  const [showNodeLayer, setShowNodeLayer] = useState<boolean>(!isDriverMode);
  const [showStreetDepthLayer, setShowStreetDepthLayer] = useState<boolean>(!isDriverMode);
  const [showOverfloodMarkers, setShowOverfloodMarkers] = useState<boolean>(true);
  const [showRouteLayer, setShowRouteLayer] = useState<boolean>(true);

  // Map Click Pin Setting Mode
  const [clickPinMode, setClickPinMode] = useState<'origin' | 'destination'>('origin');

  // Register global window helper for Leaflet popup action buttons
  useEffect(() => {
    (window as any).__urbanGoSetPoint = (lat: number, lng: number, mode: 'origin' | 'destination', name: string) => {
      if (onMapClickSetPoint) {
        onMapClickSetPoint([lat, lng], mode, name);
      }
    };
  }, [onMapClickSetPoint]);

  // 1. Initialize Map & Basemap Tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const targetCenter = (isLiveMode && userLocationCoords) ? userLocationCoords : city.center;
    const targetZoom = isLiveMode ? city.zoom : Math.max(11, city.zoom - 2);

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: targetCenter,
        zoom: targetZoom,
        zoomControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Default Basemap Tile (Topographic Terrain with Contour Relief)
      const initialTile = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenTopoMap &mdash; SRTM Topographic Relief | UrbanGo GIS Engine',
        maxZoom: 17
      }).addTo(map);

      tileLayerRef.current = initialTile;
      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView(targetCenter, targetZoom);
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 100);
    }
  }, [city, userLocationCoords, isLiveMode]);

  // 2. Dynamic Basemap Swapping (Topographic Terrain vs Satellite vs Dark Mode)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const activeMode = isDriverMode ? 'dark' : mapStyle;

    let tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
    let attr = '&copy; OpenTopoMap &mdash; SRTM Topographic Relief | UrbanGo GIS Engine';
    let maxZoom = 17;

    if (activeMode === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attr = '&copy; Esri &mdash; World Imagery | UrbanGo GIS Engine';
      maxZoom = 19;
    } else if (activeMode === 'dark') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
      attr = '&copy; Esri &mdash; Dark Canvas | UrbanGo GIS Engine';
      maxZoom = 19;
    }

    const newTile = L.tileLayer(tileUrl, { attribution: attr, maxZoom }).addTo(map);
    tileLayerRef.current = newTile;
  }, [mapStyle, isDriverMode]);

  // 3. Bind Map Click Listener for Rich Location Inspection & Pin Action Popup (Disabled in Driver Mode)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || isDriverMode) return;

    const handleMapClick = async (e: L.LeafletMouseEvent) => {
      const clickedLat = parseFloat(e.latlng.lat.toFixed(4));
      const clickedLng = parseFloat(e.latlng.lng.toFixed(4));

      // Reverse geocode address and fetch SRTM elevation
      const locationNamePromise = reverseGeocodeLocation(clickedLat, clickedLng);
      const elevationPromise = fetchTerrainElevation(clickedLat, clickedLng);

      // Check nearest street flood depth
      let closestDepthCm = 0;
      let closestStreetName = 'Local Commute Corridor';

      streets.forEach(street => {
        if (street.coordinates) {
          street.coordinates.forEach(pt => {
            const dLat = Math.abs(pt[0] - clickedLat);
            const dLng = Math.abs(pt[1] - clickedLng);
            if (dLat < 0.006 && dLng < 0.006) {
              if (street.currentWaterDepthCm > closestDepthCm) {
                closestDepthCm = street.currentWaterDepthCm;
                closestStreetName = street.name;
              }
            }
          });
        }
      });

      const isSubmerged = closestDepthCm >= 10;
      const statusBadge = isSubmerged
        ? `<span class="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-extrabold text-[11px] border border-rose-800">⚠️ SUBMERGED (${closestDepthCm} cm depth)</span>`
        : `<span class="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-extrabold text-[11px] border border-emerald-800">🟢 SAFE (0 cm depth)</span>`;

      // Open initial popup immediately
      const popup = L.popup()
        .setLatLng(e.latlng)
        .setContent(`
          <div class="text-xs font-sans p-2 min-w-56">
            <strong class="text-cyan-400 text-sm">📍 ${closestStreetName}</strong><br/>
            <span class="text-[10px] text-slate-400 font-mono">GPS: ${clickedLat}, ${clickedLng}</span>
            <div class="mt-2 mb-2">${statusBadge}</div>
            <div class="flex gap-1.5 mt-3 pt-2 border-t border-slate-700">
              <button
                onclick="window.__urbanGoSetPoint(${clickedLat}, ${clickedLng}, 'origin', '${closestStreetName}')"
                class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1 px-2 rounded text-[11px] shadow transition-all"
              >
                📍 Set as Start
              </button>
              <button
                onclick="window.__urbanGoSetPoint(${clickedLat}, ${clickedLng}, 'destination', '${closestStreetName}')"
                class="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-1 px-2 rounded text-[11px] shadow transition-all"
              >
                🎯 Set as End
              </button>
            </div>
          </div>
        `)
        .openOn(map);

      // Resolve address & elevation asynchronously to enrich popup
      const [address, elev] = await Promise.all([locationNamePromise, elevationPromise]);
      const displayAddress = address || closestStreetName;
      const elevText = elev !== null ? `${elev} m ASL` : 'Local Terrain Elevation';

      popup.setContent(`
        <div class="text-xs font-sans p-2 min-w-60">
          <strong class="text-cyan-300 text-sm">📍 ${displayAddress}</strong><br/>
          <span class="text-[10px] text-slate-400 font-mono">GPS: ${clickedLat}, ${clickedLng} | ⛰️ Elevation: <strong class="text-amber-300">${elevText}</strong></span>
          <div class="mt-2 mb-2">${statusBadge}</div>
          <p class="text-[10px] text-slate-300 mb-2">
            ${isSubmerged ? 'Deep water detected on street segment. Flood relief path active.' : 'Dry street segment. Safe for vehicle & pedestrian commute.'}
          </p>
          <div class="flex gap-1.5 pt-2 border-t border-slate-700">
            <button
              onclick="window.__urbanGoSetPoint(${clickedLat}, ${clickedLng}, 'origin', '${displayAddress}')"
              class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1 px-2 rounded text-[11px] shadow transition-all"
            >
              📍 Set as Start
            </button>
            <button
              onclick="window.__urbanGoSetPoint(${clickedLat}, ${clickedLng}, 'destination', '${displayAddress}')"
              class="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-1 px-2 rounded text-[11px] shadow transition-all"
            >
              🎯 Set as End
            </button>
          </div>
        </div>
      `);
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [onMapClickSetPoint, streets]);

  // 4. Render Map Layers Dynamically
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // Layer 0: User Location Pulsing Marker (Only rendered when in Live Mode)
    if (isLiveMode && userLocationCoords) {
      const userMarker = L.circleMarker(userLocationCoords, {
        radius: 10,
        fillColor: '#38bdf8',
        color: '#ffffff',
        weight: 3,
        fillOpacity: 0.95,
        interactive: !isDriverMode
      });
      if (!isDriverMode) {
        userMarker.bindTooltip(
          `<div class="text-xs font-bold text-cyan-300">
            📍 You Are Here: ${userAreaName || 'Detected GPS Coordinates'}<br/>
            <span class="text-[10px] text-slate-300 font-mono">${userLocationCoords[0].toFixed(4)}, ${userLocationCoords[1].toFixed(4)}</span>
          </div>`,
          { permanent: true, direction: 'top' }
        );
      }
      layerGroup.addLayer(userMarker);
    }

    // Layer 1: Radar Reflectivity Overlay
    if (showRadarLayer && radar.isConnected && radar.reflectivityDbz > 0) {
      const radarColor = getRadarColorHex(radar.reflectivityDbz);
      const radarCenter = (isLiveMode && userLocationCoords) ? userLocationCoords : city.center;
      const radarCircle = L.circle(radarCenter, {
        radius: 3800 + radar.leadTimeMinutes * 12,
        color: 'transparent',
        fillColor: radarColor,
        fillOpacity: radarOpacity,
        interactive: !isDriverMode
      });
      if (!isDriverMode) {
        radarCircle.bindTooltip(
          `<div class="text-xs font-sans">
            <strong class="text-cyan-300">📡 Doppler Weather Radar Feed</strong><br/>
            Reflectivity: <span class="font-bold text-amber-300">${radar.reflectivityDbz} dBZ</span> | Rate: <span class="font-bold text-cyan-300">${radar.rainfallRateMmHr} mm/h</span><br/>
            Source: ${sourceName || 'WMO Open-Meteo Weather Model'}
          </div>`
        );
      }
      layerGroup.addLayer(radarCircle);
    }

    // Layer 2: Street Surface Inundation Depth Vectors
    if (showStreetDepthLayer) {
      streets.forEach((street) => {
        let strokeColor = '#38bdf8'; // <5cm Clear (cyan)
        let weight = 4;
        
        if (street.currentWaterDepthCm >= 50) {
          strokeColor = '#ef4444'; // >50cm Critical (red)
          weight = 9;
        } else if (street.currentWaterDepthCm >= 30) {
          strokeColor = '#f97316'; // 30-50cm Severe (orange)
          weight = 7;
        } else if (street.currentWaterDepthCm >= 15) {
          strokeColor = '#f59e0b'; // 15-30cm Moderate (yellow)
          weight = 6;
        } else if (street.currentWaterDepthCm >= 5) {
          strokeColor = '#eab308'; // 5-15cm Low
          weight = 5;
        }

        const polyline = L.polyline(street.coordinates, {
          color: strokeColor,
          weight,
          opacity: 0.85,
          interactive: !isDriverMode
        });

        if (!isDriverMode) {
          polyline.bindTooltip(
            `<div class="text-xs font-sans">
              <strong class="text-slate-100">${street.name}</strong><br/>
              💧 Modelled Flood Depth: <span class="font-bold text-cyan-300">${street.currentWaterDepthCm} cm</span><br/>
              ⛰️ Terrain Elevation: ${street.elevationMeters}m ASL
            </div>`,
            { sticky: true }
          );
        }

        layerGroup.addLayer(polyline);
      });
    }

    // Layer 2.5: Pinpoint Circle Markers for Overflooded Streets (Live Mode & Crisis Simulator)
    if (showOverfloodMarkers) {
      streets.forEach((street) => {
        if (street.currentWaterDepthCm > 0) {
          const midIndex = Math.floor(street.coordinates.length / 2);
          const centerCoords = street.coordinates[midIndex] || street.coordinates[0];
          if (!centerCoords) return;

          let markerColor = '#eab308'; // <15cm Low (yellow)
          let radius = 7.5;
          let severityLabel = 'Low Depth';

          if (street.currentWaterDepthCm >= 50) {
            markerColor = '#ef4444'; // >=50cm Critical (red)
            radius = 13;
            severityLabel = 'Critical Submerged';
          } else if (street.currentWaterDepthCm >= 30) {
            markerColor = '#f97316'; // 30-50cm Severe (orange)
            radius = 11;
            severityLabel = 'Severe Flood';
          } else if (street.currentWaterDepthCm >= 15) {
            markerColor = '#f59e0b'; // 15-30cm Moderate (amber)
            radius = 9.5;
            severityLabel = 'Moderate Flood';
          }

          const circleMarker = L.circleMarker(centerCoords, {
            radius,
            fillColor: markerColor,
            color: '#ffffff',
            weight: 2.5,
            fillOpacity: 0.95,
            interactive: !isDriverMode
          });

          if (!isDriverMode) {
            circleMarker.bindTooltip(
              `<div class="text-xs font-sans p-1">
                <strong class="text-rose-400 font-bold flex items-center gap-1">
                  ⚠️ OVERFLOODED STREET PINPOINT
                </strong>
                📍 <strong class="text-slate-100">${street.name}</strong><br/>
                🌊 Flood Water Depth: <span class="font-extrabold text-cyan-300">${street.currentWaterDepthCm} cm</span><br/>
                ⛰️ Ground Elevation: ${street.elevationMeters}m ASL
              </div>`,
              { sticky: true }
            );

            circleMarker.bindPopup(`
              <div class="text-xs font-sans p-2 min-w-56">
                <div class="flex items-center justify-between gap-2 mb-1.5">
                  <strong class="text-rose-400 font-extrabold text-xs flex items-center gap-1">
                    ⚠️ OVERFLOODED STREET SEGMENT
                  </strong>
                  <span class="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-mono font-extrabold text-[10px] border border-rose-800 uppercase">
                    ${street.riskLevel} (${severityLabel})
                  </span>
                </div>
                <div class="text-slate-100 text-sm font-bold mb-2">📍 ${street.name}</div>
                <div class="p-2 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between text-xs mb-2">
                  <span class="text-slate-400 font-semibold">Street Water Depth:</span>
                  <span class="font-black text-rose-400 font-mono text-sm">${street.currentWaterDepthCm} cm</span>
                </div>
                <div class="text-[11px] text-slate-300 mb-2">
                  ⛰️ Ground Elevation: <strong class="text-amber-300">${street.elevationMeters}m ASL</strong><br/>
                  🏃 Walkability: <span class="font-bold ${street.currentWaterDepthCm > 10 ? 'text-rose-400' : 'text-emerald-300'}">${street.currentWaterDepthCm > 10 ? 'Impassable for Foot Commute' : 'Wading Caution Needed'}</span><br/>
                  🚘 Vehicle Driving: <span class="font-bold ${street.currentWaterDepthCm > 20 ? 'text-rose-400' : 'text-amber-300'}">${street.currentWaterDepthCm > 20 ? 'High Engine Stall Risk' : 'Low Clearance Caution'}</span>
                </div>
                ${onMapClickSetPoint ? `
                <div class="flex gap-1.5 pt-2 border-t border-slate-800">
                  <button
                    onclick="window.__urbanGoSetPoint(${centerCoords[0]}, ${centerCoords[1]}, 'origin', '${street.name}')"
                    class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1 px-2 rounded text-[11px] transition-all"
                  >
                    📍 Avoid Start
                  </button>
                  <button
                    onclick="window.__urbanGoSetPoint(${centerCoords[0]}, ${centerCoords[1]}, 'destination', '${street.name}')"
                    class="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-1 px-2 rounded text-[11px] transition-all"
                  >
                    🎯 Target End
                  </button>
                </div>` : ''}
              </div>
            `);
          }

          layerGroup.addLayer(circleMarker);
        }
      });
    }

    // Layer 3: Underground Graph Drainage Pipes
    if (showPipeLayer) {
      pipes.forEach((pipe) => {
        let pipeColor = '#10b981'; // Green normal (<60%)
        if (pipe.fillRatio > 0.9) {
          pipeColor = '#ef4444'; // Surcharging red
        } else if (pipe.fillRatio > 0.6) {
          pipeColor = '#f59e0b'; // Stressed yellow
        }

        const polyline = L.polyline(pipe.geometry, {
          color: pipeColor,
          weight: 5,
          dashArray: '8, 8',
          opacity: 0.8,
          interactive: !isDriverMode
        });

        if (!isDriverMode) {
          polyline.on('click', () => onSelectPipe(pipe));
          polyline.bindTooltip(
            `<div class="text-xs font-sans">
              <strong class="text-cyan-300">Underground Storm Pipe #${pipe.id}</strong><br/>
              ⚙️ Hydraulic Load: <span class="font-bold text-amber-300">${Math.round(pipe.fillRatio * 100)}%</span><br/>
              🚫 Blockage Ratio: ${(pipe.blockageRatio * 100).toFixed(0)}%
            </div>`
          );
        }

        layerGroup.addLayer(polyline);
      });
    }

    // Layer 4: Drainage Manhole & Inlet Nodes
    if (showNodeLayer) {
      nodes.forEach((node) => {
        const isSurcharging = node.status === 'surcharging';
        const nodeColor = isSurcharging ? '#ef4444' : node.status === 'stressed' ? '#f59e0b' : '#38bdf8';

        const circleMarker = L.circleMarker(node.coordinates, {
          radius: isSurcharging ? 10 : 7,
          fillColor: nodeColor,
          color: '#ffffff',
          weight: 2,
          fillOpacity: 0.95,
          interactive: !isDriverMode
        });

        if (!isDriverMode) {
          circleMarker.on('click', () => onSelectNode(node));
          circleMarker.bindTooltip(
            `<div class="text-xs font-sans">
              <strong class="text-slate-100">${node.name}</strong><br/>
              📍 Ward: ${node.ward}<br/>
              ⚠️ Status: <span class="font-bold uppercase ${isSurcharging ? 'text-rose-400' : 'text-cyan-300'}">${node.status}</span><br/>
              🌊 Overflow: ${node.overflowVolume.toFixed(1)} m³/s
            </div>`
          );
        }

        layerGroup.addLayer(circleMarker);
      });
    }

    // Layer 5: Emergency Route Polylines (Differentiate Pedestrian Walk Path vs Vehicle Path)
    if (showRouteLayer && routeResult && routeResult.path.length > 0) {
      const isPedestrian = routeResult.transitMode === 'walk';
      
      // Render Flooded Shortest Path in RED if alternative safe route exists
      if (routeResult.alternativeShortestSubmergedPath) {
        const floodedShortestPolyline = L.polyline(routeResult.alternativeShortestSubmergedPath.path, {
          color: '#ef4444',
          weight: isPedestrian ? 6 : 7,
          dashArray: isPedestrian ? '3, 7' : '6, 6',
          opacity: 0.9,
          interactive: !isDriverMode
        });

        if (!isDriverMode) {
          const submergedTitle = isPedestrian 
            ? '🔴 Direct Pedestrian Walkway (SUBMERGED - DANGEROUS WADING)' 
            : '🔴 Direct Shortest Vehicle Roadway (SUBMERGED - ENGINE STALL RISK)';

          floodedShortestPolyline.bindPopup(`
            <div class="text-xs font-sans p-1">
              <strong class="text-rose-400 font-bold">${submergedTitle}</strong><br/>
              ⏱️ ETA: ${routeResult.alternativeShortestSubmergedPath.estimatedTimeMin} min | 📏 Distance: ${routeResult.alternativeShortestSubmergedPath.totalDistanceKm} km<br/>
              🌊 Max Flood Depth: <span class="text-rose-400 font-bold">${routeResult.alternativeShortestSubmergedPath.maxWaterDepthCm} cm</span>
            </div>
          `);
        }

        layerGroup.addLayer(floodedShortestPolyline);
      }

      // Render Recommended Flood Relief Safe Route
      // Dotted Cyan/Violet line for Pedestrian Walk Path; Solid Emerald line for Vehicle Driving Path
      const routePolyline = L.polyline(routeResult.path, {
        color: isPedestrian ? '#06b6d4' : (routeResult.alternativeShortestSubmergedPath ? '#10b981' : '#38bdf8'),
        weight: isPedestrian ? 7 : 8,
        dashArray: isPedestrian ? '4, 10' : undefined,
        opacity: 0.95,
        interactive: !isDriverMode
      });
      
      if (!isDriverMode) {
        const routeTitle = isPedestrian 
          ? '🚶 Recommended Pedestrian Safe Walk Path (Footpaths & Walkways, 4.5 km/h)' 
          : `🚘 Recommended Vehicle Flood Relief Safe Route (${routeResult.transitMode.toUpperCase()} Roadway)`;

        routePolyline.bindPopup(`
          <div class="text-xs font-sans p-1">
            <strong class="${isPedestrian ? 'text-cyan-300' : 'text-emerald-400'} font-bold">${routeTitle}</strong><br/>
            ⏱️ ETA: ${routeResult.estimatedTimeMin} min | 📏 Distance: ${routeResult.totalDistanceKm} km<br/>
            🟢 Status: <span class="text-emerald-300 font-bold">100% CLEAR & SAFE</span>
          </div>
        `);
      }

      layerGroup.addLayer(routePolyline);

      // Render Origin Green Pin Marker
      if (routeResult.path[0]) {
        const startMarker = L.circleMarker(routeResult.path[0], {
          radius: 9,
          fillColor: '#10b981',
          color: '#ffffff',
          weight: 3,
          fillOpacity: 1,
          interactive: !isDriverMode
        });
        if (!isDriverMode) {
          startMarker.bindTooltip(`<strong class="text-emerald-400">📍 Origin: ${routeResult.originName}</strong>`, { permanent: true, direction: 'top' });
        }
        layerGroup.addLayer(startMarker);
      }

      // Render Destination Blue Pin Marker
      if (routeResult.path[routeResult.path.length - 1]) {
        const endMarker = L.circleMarker(routeResult.path[routeResult.path.length - 1], {
          radius: 9,
          fillColor: '#38bdf8',
          color: '#ffffff',
          weight: 3,
          fillOpacity: 1,
          interactive: !isDriverMode
        });
        if (!isDriverMode) {
          endMarker.bindTooltip(`<strong class="text-cyan-300">🎯 Destination: ${routeResult.destinationName}</strong>`, { permanent: true, direction: 'top' });
        }
        layerGroup.addLayer(endMarker);
      }

      try {
        map.fitBounds(routePolyline.getBounds(), { padding: [50, 50], maxZoom: 16 });
      } catch (err) {
        console.warn('Could not fit bounds on route:', err);
      }
    } else if (!isLiveMode && streets.length > 0) {
      // In Historical Replay mode, fit map bounds to cover 80%+ of the metropolitan city disaster area
      try {
        const allCoords: [number, number][] = [];
        streets.forEach(s => s.coordinates.forEach(c => allCoords.push(c)));
        nodes.forEach(n => allCoords.push(n.coordinates));
        if (allCoords.length > 0) {
          const bounds = L.latLngBounds(allCoords);
          map.fitBounds(bounds, { padding: [35, 35], maxZoom: 13 });
        }
      } catch (err) {
        console.warn('Could not fit bounds for historical city:', err);
      }
    }

  }, [
    city,
    nodes,
    pipes,
    streets,
    radar,
    routeResult,
    userLocationCoords,
    userAreaName,
    showRadarLayer,
    radarOpacity,
    showPipeLayer,
    showNodeLayer,
    showStreetDepthLayer,
    showRouteLayer,
    onSelectNode,
    onSelectPipe,
    sourceName,
    isLiveMode,
    isDriverMode
  ]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-slate-800 shadow-2xl">
      
      {/* Map Container Element */}
      <div ref={mapContainerRef} className="h-full w-full z-0 cursor-crosshair" />

      {/* Top-Left: Map Style Mode Switcher & Pin Placement Indicator (Hidden in Driver Mode) */}
      {!isDriverMode && (
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          
          {/* Terrain & Basemap Switcher Controls */}
          <div className="glass-panel rounded-xl p-1.5 border border-slate-800 shadow-xl flex items-center gap-1 text-xs bg-slate-950/90">
            <button
              onClick={() => setMapStyle('terrain')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition-all ${
                mapStyle === 'terrain'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-300 hover:text-white'
              }`}
              title="Topographic Relief Basemap (Contours, Hillshading & Terrain Elevation)"
            >
              <Mountain className="h-3.5 w-3.5" />
              <span>🏔️ Topo Terrain</span>
            </button>
            
            <button
              onClick={() => setMapStyle('satellite')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition-all ${
                mapStyle === 'satellite'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-300 hover:text-white'
              }`}
              title="Esri World Imagery Satellite View"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>🛰️ Satellite</span>
            </button>

            <button
              onClick={() => setMapStyle('dark')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition-all ${
                mapStyle === 'dark'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-300 hover:text-white'
              }`}
              title="Esri Dark Vector Canvas"
            >
              <Moon className="h-3.5 w-3.5" />
              <span>🌃 Dark GIS</span>
            </button>
          </div>

          {/* Pin Placement Indicator Banner */}
          {onMapClickSetPoint && (
            <div className="glass-panel rounded-xl px-3 py-1.5 border border-slate-800 text-xs shadow-xl flex items-center gap-2 bg-slate-950/90">
              <MapPin className="h-4 w-4 text-cyan-400" />
              <span className="text-slate-300">Click Map to set:</span>
              <button
                onClick={() => setClickPinMode('origin')}
                className={`px-2 py-0.5 rounded font-bold transition-all ${
                  clickPinMode === 'origin' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400'
                }`}
              >
                📍 Start (Origin)
              </button>
              <button
                onClick={() => setClickPinMode('destination')}
                className={`px-2 py-0.5 rounded font-bold transition-all ${
                  clickPinMode === 'destination' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400'
                }`}
              >
                🎯 End (Destination)
              </button>
            </div>
          )}

          {/* Localized Drainage Coverage Banner */}
          {isLiveMode && userLocationCoords && (
            <div className="glass-panel rounded-xl px-3 py-1.5 border border-emerald-800/80 bg-emerald-950/80 text-xs text-emerald-200 shadow-xl flex items-center gap-2 max-w-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span>Live Hydrodynamic Drainage Network active for <strong>{userAreaName || 'Your Location'}</strong>.</span>
            </div>
          )}
          {!isLiveMode && (
            <div className="glass-panel rounded-xl px-3 py-1.5 border border-blue-800/80 bg-blue-950/80 text-xs text-blue-200 shadow-xl flex items-center gap-2 max-w-md">
              <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse shrink-0"></span>
              <span>📜 Historical Disaster Event Replay: <strong>{city.name} Topography ({city.elevationRange})</strong></span>
            </div>
          )}
        </div>
      )}

      {/* Top-Right: GIS Layer Controls & Radar Opacity Floating Menu (Hidden in Driver Mode) */}
      {!isDriverMode && (
        <div className="absolute top-4 right-4 z-10 glass-panel rounded-xl p-3 border border-slate-800 text-xs shadow-xl min-w-64 bg-slate-950/90">
          <div className="flex items-center justify-between gap-2 mb-2 pb-1 border-b border-slate-800 font-bold text-slate-200">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              <span>GIS Layers & Radar Overlay</span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col gap-1 bg-slate-950/80 p-2 rounded-lg border border-slate-800">
              <label className="flex items-center justify-between gap-3 text-slate-300 hover:text-white cursor-pointer">
                <span className="flex items-center gap-1.5 font-semibold">
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-400"></span>
                  Radar Reflectivity Layer
                </span>
                <input
                  type="checkbox"
                  checked={showRadarLayer}
                  onChange={(e) => setShowRadarLayer(e.target.checked)}
                  className="accent-cyan-400"
                />
              </label>

              {showRadarLayer && (
                <div className="flex flex-col gap-1.5 mt-1 pt-1 border-t border-slate-800/80 text-[11px]">
                  <div className="flex items-center justify-between text-slate-300 font-medium">
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      {radar.reflectivityDbz > 0 ? `${radar.reflectivityDbz} dBZ Radar Feed` : 'Radar Monitoring Active'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400">Opacity: {Math.round(radarOpacity * 100)}%</span>
                    <input
                      type="range"
                      min="0.1"
                      max="0.8"
                      step="0.05"
                      value={radarOpacity}
                      onChange={(e) => setRadarOpacity(parseFloat(e.target.value))}
                      className="h-1.5 w-24 accent-cyan-400 bg-slate-800 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            <label className="flex items-center justify-between gap-3 text-slate-300 hover:text-white cursor-pointer">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                Street Inundation Depth (cm)
              </span>
              <input
                type="checkbox"
                checked={showStreetDepthLayer}
                onChange={(e) => setShowStreetDepthLayer(e.target.checked)}
                className="accent-cyan-400"
              />
            </label>

            <label className="flex items-center justify-between gap-3 text-slate-300 hover:text-white cursor-pointer">
              <span className="flex items-center gap-1.5 text-rose-300 font-bold">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400"></span>
                ⚠️ Pinpoint Overflooded Streets (Circle Markers)
              </span>
              <input
                type="checkbox"
                checked={showOverfloodMarkers}
                onChange={(e) => setShowOverfloodMarkers(e.target.checked)}
                className="accent-rose-500"
              />
            </label>

            <label className="flex items-center justify-between gap-3 text-slate-300 hover:text-white cursor-pointer">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400"></span>
                Storm Drainage Pipes (1D Graph)
              </span>
              <input
                type="checkbox"
                checked={showPipeLayer}
                onChange={(e) => setShowPipeLayer(e.target.checked)}
                className="accent-cyan-400"
              />
            </label>

            <label className="flex items-center justify-between gap-3 text-slate-300 hover:text-white cursor-pointer">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-400"></span>
                Manholes & Outfalls
              </span>
              <input
                type="checkbox"
                checked={showNodeLayer}
                onChange={(e) => setShowNodeLayer(e.target.checked)}
                className="accent-cyan-400"
              />
            </label>

            {routeResult && (
              <label className="flex items-center justify-between gap-3 text-slate-300 hover:text-white cursor-pointer pt-1 border-t border-slate-800">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                  Emergency Bypass Route
                </span>
                <input
                  type="checkbox"
                  checked={showRouteLayer}
                  onChange={(e) => setShowRouteLayer(e.target.checked)}
                  className="accent-emerald-400"
                />
              </label>
            )}
          </div>
        </div>
      )}

      {/* Floating Route Comparison Card (Side-by-Side Google Maps Style) (Hidden in Driver Mode) */}
      {routeResult && !isDriverMode && (
        <div className="absolute bottom-16 left-4 z-10 glass-panel rounded-xl p-3 border border-slate-800 shadow-2xl max-w-md bg-slate-950/95 text-xs flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 font-bold text-slate-200">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <Navigation className="h-4 w-4" />
              <span>Exact Route Timing & Distance Comparison</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">OSRM Driving API</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            
            {/* Route 1: Shortest Direct Path */}
            <div className={`p-2.5 rounded-lg border flex flex-col gap-1 ${
              routeResult.alternativeShortestSubmergedPath
                ? 'bg-rose-950/50 border-rose-800/80 text-rose-200'
                : 'bg-emerald-950/50 border-emerald-800/80 text-emerald-200'
            }`}>
              <div className="flex items-center justify-between font-bold text-[11px]">
                <span className="flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>Shortest Direct Path</span>
                </span>
              </div>
              <div className="text-lg font-black tracking-tight">
                {routeResult.alternativeShortestSubmergedPath ? `${routeResult.alternativeShortestSubmergedPath.estimatedTimeMin} min` : `${routeResult.estimatedTimeMin} min`}
                <span className="text-xs font-semibold text-slate-300 ml-1">
                  ({routeResult.alternativeShortestSubmergedPath ? routeResult.alternativeShortestSubmergedPath.totalDistanceKm : routeResult.totalDistanceKm} km)
                </span>
              </div>
              <div className="text-[10px]">
                {routeResult.alternativeShortestSubmergedPath ? (
                  <span className="text-rose-400 font-bold">⚠️ Submerged ({routeResult.alternativeShortestSubmergedPath.maxWaterDepthCm} cm depth)</span>
                ) : (
                  <span className="text-emerald-400 font-bold">🟢 100% Clear & Safe</span>
                )}
              </div>
            </div>

            {/* Route 2: Flood Relief Safe Bypass Path */}
            <div className="p-2.5 rounded-lg border bg-emerald-950/60 border-emerald-700 text-emerald-100 flex flex-col gap-1 shadow-md">
              <div className="flex items-center justify-between font-bold text-[11px]">
                <span className="flex items-center gap-1 text-emerald-300">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Flood Relief Bypass</span>
                </span>
              </div>
              <div className="text-lg font-black tracking-tight text-emerald-300">
                {routeResult.estimatedTimeMin} min
                <span className="text-xs font-semibold text-slate-300 ml-1">({routeResult.totalDistanceKm} km)</span>
              </div>
              <div className="text-[10px] text-emerald-300 font-bold">
                🛡️ Safe Evacuation Route (0 cm)
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Map Legend Overlay (Hidden in Driver Mode) */}
      {!isDriverMode && (
        <div className="absolute bottom-4 left-4 z-10 glass-panel rounded-xl p-2.5 border border-slate-800 text-[11px] shadow-xl bg-slate-950/90">
          <div className="font-bold text-slate-200 mb-1 flex items-center justify-between gap-4">
            <span>Water Depth Severity Scale (cm)</span>
            <span className="text-[10px] text-slate-400 font-mono">1D-2D Coupled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-cyan-400"></span> &lt;5cm</div>
            <div className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-yellow-400"></span> 5-15cm</div>
            <div className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-amber-500"></span> 15-30cm</div>
            <div className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-orange-600"></span> 30-50cm</div>
            <div className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-rose-600 animate-pulse"></span> &gt;50cm</div>
          </div>
        </div>
      )}

    </div>
  );
};
