import React from 'react';
import { Activity, AlertTriangle, Download, ShieldAlert, Lock, ShieldCheck, Landmark, ArrowLeft } from 'lucide-react';
import type { CityInfo, DrainageNode, DrainagePipe, StreetSegment } from '../types';

interface AnalyticsPanelProps {
  city: CityInfo;
  nodes: DrainageNode[];
  pipes: DrainagePipe[];
  streets: StreetSegment[];
  totalFloodedKm: number;
  maxWaterDepthCm: number;
  surchargedNodeCount: number;
  systemCapacityStressPercent: number;
  isMunicipalOfficial?: boolean;
  onRequireMunicipalLogin?: () => void;
  onReturnToMap?: () => void;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  city,
  nodes,
  streets,
  totalFloodedKm,
  maxWaterDepthCm,
  surchargedNodeCount,
  systemCapacityStressPercent,
  isMunicipalOfficial = false,
  onRequireMunicipalLogin,
  onReturnToMap
}) => {
  if (!isMunicipalOfficial) {
    return (
      <div className="glass-panel h-full rounded-2xl p-6 border border-amber-500/30 flex flex-col items-center justify-center text-center relative overflow-hidden bg-slate-950/90 font-poppins">
        {/* Background Subtle Spotlight Glow */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-md flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-400 shadow-xl shadow-amber-500/20">
            <ShieldCheck className="h-9 w-9 text-amber-400" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold font-montserrat uppercase tracking-wider">
            <Lock className="h-3.5 w-3.5" />
            <span>Restricted Access Protocol</span>
          </div>

          <h2 className="text-2xl font-black text-slate-100 font-montserrat tracking-tight">
            Municipal Telemetry Situation Room
          </h2>

          <p className="text-xs text-slate-300 leading-relaxed font-poppins">
            Access to ward-level hydraulic stress telemetry, surcharged manhole sensors, and official flood situation report downloads is restricted exclusively to authenticated <span className="font-bold text-amber-400">Municipal Officers & Hydrodynamic Command Engineers</span>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4 w-full">
            {onRequireMunicipalLogin && (
              <button
                onClick={onRequireMunicipalLogin}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs font-montserrat transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Landmark className="h-4 w-4" />
                <span>Login as Municipal Official</span>
              </button>
            )}

            {onReturnToMap && (
              <button
                onClick={onReturnToMap}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold text-xs font-montserrat transition-all cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4 text-cyan-400" />
                <span>Return to GIS Map</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const surchargedNodes = nodes.filter(n => n.status === 'surcharging' || n.status === 'stressed');

  const downloadSituationReport = () => {
    const reportText = `===========================================================
URBANGO MUNICIPAL FLOOD NOWCASTING SITUATION REPORT
===========================================================
City Target: ${city.name} (${city.state})
Drainage Authority: ${city.drainageAuthority}
Generated Timestamp: ${new Date().toLocaleString()}

KEY HYDRAULIC METRICS:
-----------------------------------------------------------
- Total Flooded Road Length: ${totalFloodedKm} km
- Maximum Street Water Depth: ${maxWaterDepthCm} cm
- Surcharged Manhole Nodes: ${surchargedNodeCount} / ${nodes.length}
- Drainage Network Stress: ${systemCapacityStressPercent}%

SURCHARGED DRAINAGE MANHOLES:
${surchargedNodes.map(n => `- ${n.name} (Ward: ${n.ward}) | Surcharge Head: +${n.currentSurchargeHead.toFixed(2)}m | Overflow: ${n.overflowVolume.toFixed(1)} m3/s`).join('\n')}

HIGH-RISK FLOODED STREET SEGMENTS:
${streets.filter(s => s.currentWaterDepthCm >= 15).map(s => `- ${s.name} | Depth: ${s.currentWaterDepthCm} cm | Risk: ${s.riskLevel.toUpperCase()}`).join('\n')}

===========================================================
RECOMMENDED MUNICIPAL DISASTER ACTIONS:
1. Deploy high-capacity mobile dewatering pumps to surcharged outfall nodes.
2. Alert Traffic Police to divert commuters away from high-depth roads.
3. Issue automated route advisory to emergency ambulance dispatches via UrbanGo API.
===========================================================`;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `UrbanGo_Situation_Report_${city.id}_${Date.now()}.txt`;
    a.click();
  };

  return (
    <div className="glass-panel h-full rounded-2xl p-5 border border-slate-800 flex flex-col gap-5 overflow-y-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Municipal Command & Control Situation Room</h2>
            <p className="text-xs text-slate-400">Ward-level hydraulic stress analytics for {city.name} Municipal Corporation</p>
          </div>
        </div>

        <button
          onClick={downloadSituationReport}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-950 border border-rose-700 text-xs font-bold text-rose-300 hover:bg-rose-900 shadow-lg shadow-rose-950/40"
        >
          <Download className="h-4 w-4" />
          <span>Export Situation Report</span>
        </button>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        
        <div className="rounded-xl bg-slate-900/90 p-4 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400">Flooded Roads</div>
          <div className="mt-1 text-2xl font-extrabold text-amber-300">{totalFloodedKm} km</div>
          <div className="mt-1 text-[11px] text-slate-400">Total submerged length</div>
        </div>

        <div className="rounded-xl bg-slate-900/90 p-4 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400">Max Water Depth</div>
          <div className="mt-1 text-2xl font-extrabold text-rose-400">{maxWaterDepthCm} cm</div>
          <div className="mt-1 text-[11px] text-slate-400">Peak surface accumulation</div>
        </div>

        <div className="rounded-xl bg-slate-900/90 p-4 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400">Surcharged Manholes</div>
          <div className="mt-1 text-2xl font-extrabold text-rose-500">{surchargedNodeCount} Nodes</div>
          <div className="mt-1 text-[11px] text-slate-400">Overflowing drainage points</div>
        </div>

        <div className="rounded-xl bg-slate-900/90 p-4 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400">Network Stress</div>
          <div className="mt-1 text-2xl font-extrabold text-cyan-300">{systemCapacityStressPercent}%</div>
          <div className="mt-1 text-[11px] text-slate-400">Underground pipe fill ratio</div>
        </div>

      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Surcharged Drainage Nodes Table */}
        <div className="flex flex-col gap-3 rounded-xl bg-slate-950/80 p-4 border border-slate-800">
          <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-rose-400" /> Surcharged Manholes & Pumping Stations
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 text-[11px] uppercase">
                <tr>
                  <th className="p-2">Node Name</th>
                  <th className="p-2">Ward</th>
                  <th className="p-2">Surcharge Head</th>
                  <th className="p-2">Overflow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {surchargedNodes.length > 0 ? (
                  surchargedNodes.map((n) => (
                    <tr key={n.id} className="hover:bg-slate-900/50">
                      <td className="p-2 font-semibold text-slate-100">{n.name}</td>
                      <td className="p-2 text-slate-400">{n.ward}</td>
                      <td className="p-2 font-bold text-rose-400">+{n.currentSurchargeHead.toFixed(2)}m</td>
                      <td className="p-2 font-bold text-amber-300">{n.overflowVolume.toFixed(1)} m³/s</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-500">
                      All drainage nodes operating within hydraulic capacity limits.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* High-Risk Inundated Street Segments */}
        <div className="flex flex-col gap-3 rounded-xl bg-slate-950/80 p-4 border border-slate-800">
          <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4 text-amber-400" /> Inundated Street Risk Status
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 text-[11px] uppercase">
                <tr>
                  <th className="p-2">Street Corridor</th>
                  <th className="p-2">DEM Elev</th>
                  <th className="p-2">Depth (cm)</th>
                  <th className="p-2">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {streets.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-900/50">
                    <td className="p-2 font-semibold text-slate-100">{s.name}</td>
                    <td className="p-2 text-slate-400">{s.elevationMeters}m</td>
                    <td className="p-2 font-bold text-cyan-300">{s.currentWaterDepthCm} cm</td>
                    <td className="p-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        s.riskLevel === 'critical' || s.riskLevel === 'high'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : s.riskLevel === 'moderate'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {s.riskLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
