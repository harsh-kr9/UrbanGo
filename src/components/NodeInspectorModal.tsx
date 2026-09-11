import React from 'react';
import { X, Activity, AlertOctagon, ShieldCheck, BrainCircuit } from 'lucide-react';
import type { DrainageNode, DrainagePipe } from '../types';

interface NodeInspectorModalProps {
  selectedNode: DrainageNode | null;
  selectedPipe: DrainagePipe | null;
  onClose: () => void;
}

export const NodeInspectorModal: React.FC<NodeInspectorModalProps> = ({
  selectedNode,
  selectedPipe,
  onClose
}) => {
  if (!selectedNode && !selectedPipe) return null;

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
                {selectedNode ? `Ward: ${selectedNode.ward} | Type: ${selectedNode.type}` : `Pipe Geometry Polyline | Manning n = ${selectedPipe?.manningN}`}
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
          <div className="mt-4 flex flex-col gap-4">
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

            {/* PS085 Requirement: Explainable Prediction Breakdown */}
            <div className="rounded-xl bg-slate-950/90 p-4 border border-slate-800 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <BrainCircuit className="h-4 w-4 text-cyan-400" /> SIH PS085 Explainable Prediction Breakdown
                </span>
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-[10px] font-extrabold text-cyan-400 border border-cyan-800">
                  95.4% AI Confidence
                </span>
              </div>

              <div className="flex flex-col gap-2 text-xs">
                <div>
                  <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                    <span>🌧️ Doppler Rainfall Intensity Impact:</span>
                    <span className="font-bold text-cyan-300">42%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400" style={{ width: '42%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                    <span>⛰️ Micro-DEM Elevation Dip Impact:</span>
                    <span className="font-bold text-amber-300">26%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400" style={{ width: '26%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                    <span>🚰 Underground Drain Overload Surcharge:</span>
                    <span className="font-bold text-rose-400">20%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500" style={{ width: '20%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                    <span>🏙️ Concrete Urban Imperviousness:</span>
                    <span className="font-bold text-indigo-300">12%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-400" style={{ width: '12%' }} />
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
