import React, { useState } from 'react';
import { Code2, Copy, Download, Check, Terminal, Globe, Key } from 'lucide-react';
import type { CityInfo, StreetSegment } from '../types';

interface ApiUtilityPanelProps {
  city: CityInfo;
  streets: StreetSegment[];
}

export const ApiUtilityPanel: React.FC<ApiUtilityPanelProps> = ({ city, streets }) => {
  const [activeEndpoint, setActiveEndpoint] = useState<'routing' | 'nowcast' | 'drainage'>('routing');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const apiKey = 'ug_live_984f2910a7c4819e0b2';

  // Sample API Payloads & Exporters
  const curlCode = `curl -X POST "https://api.urbango.io/v1/routing/flood-safe" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "cityId": "${city.id}",
    "origin": [${city.center[0]}, ${city.center[1]}],
    "destination": [${(city.center[0] + 0.02).toFixed(4)}, ${(city.center[1] + 0.02).toFixed(4)}],
    "vehicleType": "ambulance",
    "allowBypass": true
  }'`;

  const jsCode = `const response = await fetch("https://api.urbango.io/v1/routing/flood-safe", {
  method: "POST",
  headers: {
    "Authorization": "Bearer ${apiKey}",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    cityId: "${city.id}",
    origin: [${city.center[0]}, ${city.center[1]}],
    destination: [${(city.center[0] + 0.02).toFixed(4)}, ${(city.center[1] + 0.02).toFixed(4)}],
    vehicleType: "ambulance",
    allowBypass: true
  })
});
const data = await response.json();
console.log(data);`;

  const sampleJsonResponse = {
    status: 'success',
    timestamp: new Date().toISOString(),
    city: city.name,
    endpoint: activeEndpoint,
    leadTimeMinutes: 45,
    routing: {
      routeId: 'UG-ROUTING-78192',
      vehicleType: 'Emergency Ambulance',
      vehicleClearanceCm: 25,
      isSafePathFound: true,
      totalDistanceKm: 4.85,
      estimatedTimeMin: 11,
      maxWaterDepthEncounteredCm: 8,
      bypassedSubmergedStreets: [
        { streetName: `${city.name} Central Low Dip`, floodedDepthCm: 32 }
      ],
      pathGeoJson: {
        type: 'LineString',
        coordinates: streets.flatMap(s => s.coordinates.map(c => [c[1], c[0]]))
      }
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const downloadGeoJson = () => {
    const geojson = {
      type: 'FeatureCollection',
      features: streets.map(s => ({
        type: 'Feature',
        properties: {
          id: s.id,
          name: s.name,
          waterDepthCm: s.currentWaterDepthCm,
          riskLevel: s.riskLevel,
          elevationMeters: s.elevationMeters
        },
        geometry: {
          type: 'LineString',
          coordinates: s.coordinates.map(c => [c[1], c[0]])
        }
      }))
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `urbango_${city.id}_flood_inundation.geojson`;
    a.click();
  };

  return (
    <div className="glass-panel h-full rounded-2xl p-5 border border-slate-800 flex flex-col gap-5 overflow-y-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20">
            <Code2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Navigation Integration REST API Portal</h2>
            <p className="text-xs text-slate-400">Interface UrbanGo flood nowcasts with Google Maps, Apple Maps & Emergency Dispatch Systems</p>
          </div>
        </div>

        <button
          onClick={downloadGeoJson}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950 border border-cyan-700 text-xs font-bold text-cyan-300 hover:bg-cyan-900"
        >
          <Download className="h-4 w-4" />
          <span>Export GeoJSON Layer</span>
        </button>
      </div>

      {/* API Key Banner */}
      <div className="flex items-center justify-between rounded-xl bg-slate-900/90 p-3 border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-cyan-400" />
          <span className="text-slate-400">API Access Token:</span>
          <code className="bg-slate-950 px-2 py-0.5 rounded text-cyan-300 font-mono text-[11px] border border-slate-800">
            {apiKey}
          </code>
        </div>

        <button
          onClick={() => copyToClipboard(apiKey, 'key')}
          className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1"
        >
          {copiedCode === 'key' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copiedCode === 'key' ? 'Copied' : 'Copy Key'}</span>
        </button>
      </div>

      {/* Endpoint Selector */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveEndpoint('routing')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeEndpoint === 'routing' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          POST /v1/routing/flood-safe
        </button>
        <button
          onClick={() => setActiveEndpoint('nowcast')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeEndpoint === 'nowcast' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          GET /v1/nowcast/inundation
        </button>
        <button
          onClick={() => setActiveEndpoint('drainage')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeEndpoint === 'drainage' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          GET /v1/drainage/graph-status
        </button>
      </div>

      {/* Code Snippets & Response Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Left: Code Snippets */}
        <div className="flex flex-col gap-3 rounded-xl bg-slate-950/80 p-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Terminal className="h-4 w-4 text-cyan-400" /> cURL Request Example
            </span>
            <button
              onClick={() => copyToClipboard(curlCode, 'curl')}
              className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1"
            >
              {copiedCode === 'curl' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedCode === 'curl' ? 'Copied' : 'Copy cURL'}</span>
            </button>
          </div>

          <pre className="bg-slate-900 p-3 rounded-lg text-[11px] text-cyan-200 font-mono overflow-x-auto border border-slate-800">
            {curlCode}
          </pre>

          <div className="mt-2 text-[11px] font-bold text-slate-400">JavaScript Integration:</div>
          <pre className="bg-slate-900 p-3 rounded-lg text-[11px] text-emerald-300 font-mono overflow-x-auto border border-slate-800">
            {jsCode}
          </pre>
        </div>

        {/* Right: Live JSON Response Viewer */}
        <div className="flex flex-col gap-3 rounded-xl bg-slate-950/80 p-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-emerald-400" /> Live JSON API Response (200 OK)
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-[10px] font-bold text-emerald-400">
              200 OK
            </span>
          </div>

          <pre className="bg-slate-900 p-3 rounded-lg text-[11px] text-slate-200 font-mono overflow-x-auto h-72 border border-slate-800">
            {JSON.stringify(sampleJsonResponse, null, 2)}
          </pre>
        </div>

      </div>

    </div>
  );
};
