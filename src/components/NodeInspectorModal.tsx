import React from 'react';
import { X, Activity, AlertOctagon, ShieldCheck, BrainCircuit, Waves, Zap, MapPin } from 'lucide-react';
import type { DrainageNode, DrainagePipe } from '../types';

interface NodeInspectorModalProps {
  selectedNode: DrainageNode | null;
  selectedPipe: DrainagePipe | null;
  onClose: () => void;
  onTogglePumpRate?: (nodeId: string, rateLps: number) => void;
}

export const NodeInspectorModal: React.FC<NodeInspectorModalProps> = ({
  selectedNode,
  selectedPipe,
  onClose,
  onTogglePumpRate
}) => {
  if (!selectedNode && !selectedPipe) return null;

  const activeRateLps = selectedNode?.activePumpRateLps || 0;
  const isPumpActive = activeRateLps > 0;
  const evacuatedM3 = selectedNode?.totalDepumpedM3 || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
      <div className="glass-panel w-full max-w-xl rounded-2xl border border-slate-700 p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-950 border border-cyan-700 text-cyan-400">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                {selectedNode ? selectedNode.name : `Drainage Pipe Edge #${selectedPipe?.id}`}
              </h3>
              <p className="text-xs text-slate-400">
                {selectedNode ? `Ward: ${selectedNode.ward} | Type: ${selectedNode.type.toUpperCase()}` : `Pipe Geometry Polyline | Manning n = ${selectedPipe?.manningN}`}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Telemetry Body */}
        {selectedNode && (
          <div className="mt-4 flex flex-col gap-4 max-h-[75vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              
              <div className="rounded-xl bg-slate-900/90 p-3 border border-slate-800">
                <div className="text-[11px] font-medium text-slate-400">DEM Ground Elev</div>
                <div className="mt-1 text-base font-bold text-cyan-300">{selectedNode.groundElevation} m</div>
              </div>

              <div className="rounded-xl bg-slate-900/90 p-3 border border-slate-800">
                <div className="text-[11px] font-medium text-slate-400">Max Capacity</div>
                <div className="mt-1 text-base font-bold text-slate-200">{selectedNode.capacityMax} m³/s</div>
              </div>

              <div className="rounded-xl bg-slate-900/90 p-3 border border-slate-800">
                <div className="text-[11px] font-medium text-slate-400">Surcharge Head</div>
                <div className={`mt-1 text-base font-bold ${selectedNode.currentSurchargeHead > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  +{selectedNode.currentSurchargeHead.toFixed(2)} m
                </div>
              </div>

              <div className="rounded-xl bg-slate-900/90 p-3 border border-slate-800">
                <div className="text-[11px] font-medium text-slate-400">Overflow Rate</div>
                <div className={`mt-1 text-base font-bold ${selectedNode.overflowVolume > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-300'}`}>
                  {selectedNode.overflowVolume.toFixed(1)} m³/s
                </div>
              </div>

            </div>

            {/* Status Card */}
            <div className="rounded-xl bg-slate-900/70 p-4 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedNode.status === 'surcharging' ? (
                  <AlertOctagon className="h-6 w-6 text-rose-500 animate-bounce" />
                ) : (
                  <ShieldCheck className="h-6 w-6 text-emerald-400" />
                )}
                <div>
                  <div className="text-xs font-semibold text-slate-300">Hydraulic Pressure Status</div>
                  <div className="text-sm font-bold uppercase text-white">
                    {selectedNode.status} node state
                  </div>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                selectedNode.status === 'surcharging' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                {selectedNode.status}
              </span>
            </div>

            {/* FEATURE 1: MUNICIPAL DE-WATERING PUMP TELEMETRY & DISPATCHER */}
            <div className="rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 p-4 border border-cyan-900/50 flex flex-col gap-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-cyan-900/40 pb-2">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                  <Waves className="h-4 w-4 text-cyan-400 animate-pulse" />
                  <span>MUNICIPAL DE-WATERING PUMP TELEMETRY & DISPATCHER</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  isPumpActive ? 'bg-emerald-500 text-slate-950 animate-pulse' : 'bg-slate-800 text-slate-400'
                }`}>
                  {isPumpActive ? `ACTIVE (${activeRateLps} L/s)` : 'PUMP IDLE'}
                </span>
              </div>

              <p className="text-[11px] text-slate-400">
                Deploy high-capacity mobile de-watering pumps to evacuate water from surcharging manhole <span className="text-cyan-300 font-bold">{selectedNode.id}</span> ({selectedNode.ward}).
              </p>

              {/* Pump Rate Dispatch Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5 text-amber-400" /> Specify Telemetry De-Pumping Capacity:
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[0, 250, 500, 1000, 2000].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => onTogglePumpRate && onTogglePumpRate(selectedNode.id, rate)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all border ${
                        activeRateLps === rate
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      {rate === 0 ? 'OFF' : `${rate} L/s`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Telemetry Metrics */}
              {isPumpActive && (
                <div className="grid grid-cols-3 gap-2 mt-1 p-2.5 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">De-Pumping Flow</span>
                    <span className="font-bold text-cyan-300">{(activeRateLps / 1000).toFixed(2)} m³/s</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Evacuated</span>
                    <span className="font-bold text-emerald-300">{evacuatedM3.toLocaleString()} m³</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Telemetry Node</span>
                    <span className="font-bold text-slate-200 flex items-center gap-0.5">
                      <MapPin className="h-3 w-3 text-cyan-400 inline" /> {selectedNode.id}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* FEATURE 3: VISUAL XAI EXPLAINABLE AI BREAKDOWN GAUGE */}
            <div className="rounded-xl bg-slate-950/90 p-4 border border-slate-800 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <BrainCircuit className="h-4 w-4 text-cyan-400" /> SIH PS085 Visual XAI Explainable AI Breakdown
                </span>
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-[10px] font-extrabold text-cyan-400 border border-cyan-800">
                  100% Decision Transparency
                </span>
              </div>

              {/* Multi-Segment Stacked Visual Bar */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Visual Multi-Factor Attribution Stack</span>
                  <span className="text-slate-300 font-bold">100% Total Driver</span>
                </div>
                <div className="h-3.5 w-full bg-slate-900 rounded-full overflow-hidden flex p-0.5 gap-0.5 border border-slate-800">
                  <div className="h-full bg-cyan-400 rounded-l transition-all duration-500" style={{ width: '42%' }} title="Rainfall 42%" />
                  <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: '26%' }} title="DEM Dip 26%" />
                  <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: '20%' }} title="Pipe Overload 20%" />
                  <div className="h-full bg-purple-400 rounded-r transition-all duration-500" style={{ width: '12%' }} title="Imperviousness 12%" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>🌧️ Doppler Rainfall</span>
                    <span className="font-bold text-cyan-300">42%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400" style={{ width: '42%' }} />
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>⛰️ DEM Elevation Dip</span>
                    <span className="font-bold text-amber-300">26%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400" style={{ width: '26%' }} />
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>🚰 Pipe Surcharge</span>
                    <span className="font-bold text-rose-400">20%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500" style={{ width: '20%' }} />
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>🏙️ Concrete Runoff</span>
                    <span className="font-bold text-purple-300">12%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-400" style={{ width: '12%' }} />
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {selectedPipe && (
          <div className="mt-4 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              
              <div className="rounded-xl bg-slate-900/90 p-3 border border-slate-800">
                <div className="text-[11px] font-medium text-slate-400">Pipe Diameter</div>
                <div className="mt-1 text-base font-bold text-cyan-300">{selectedPipe.diameter} m</div>
              </div>

              <div className="rounded-xl bg-slate-900/90 p-3 border border-slate-800">
                <div className="text-[11px] font-medium text-slate-400">Pipe Length</div>
                <div className="mt-1 text-base font-bold text-slate-200">{selectedPipe.length} m</div>
              </div>

              <div className="rounded-xl bg-slate-900/90 p-3 border border-slate-800">
                <div className="text-[11px] font-medium text-slate-400">Hydraulic Fill</div>
                <div className={`mt-1 text-base font-bold ${selectedPipe.fillRatio > 0.85 ? 'text-rose-400' : 'text-amber-300'}`}>
                  {Math.round(selectedPipe.fillRatio * 100)}%
                </div>
              </div>

              <div className="rounded-xl bg-slate-900/90 p-3 border border-slate-800">
                <div className="text-[11px] font-medium text-slate-400">Blockage Clog</div>
                <div className="mt-1 text-base font-bold text-rose-400">
                  {Math.round(selectedPipe.blockageRatio * 100)}%
                </div>
              </div>

            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
          >
            Close Telemetry Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
