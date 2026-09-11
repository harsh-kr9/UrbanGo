import React from 'react';
import { CloudRain, Filter, Sliders, Waves, Zap, RefreshCw } from 'lucide-react';
import type { ScenarioParams } from '../types';

interface ScenarioPanelProps {
  scenario: ScenarioParams;
  onChangeScenario: (updated: ScenarioParams) => void;
  onResetScenario: () => void;
}

export const ScenarioPanel: React.FC<ScenarioPanelProps> = ({
  scenario,
  onChangeScenario,
  onResetScenario
}) => {
  return (
    <div className="glass-panel h-full rounded-2xl p-5 border border-slate-800 flex flex-col gap-5 overflow-y-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 to-rose-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20">
            <Sliders className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Crisis Scenario Stress Testing Lab</h2>
            <p className="text-xs text-slate-400">Simulate extreme weather, outfall tidal locks & plastic drain blockages</p>
          </div>
        </div>

        <button
          onClick={onResetScenario}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-800"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* 1. Cloudburst Rainfall Intensity */}
        <div className="rounded-xl bg-slate-900/80 p-4 border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <CloudRain className="h-4 w-4 text-cyan-400" /> Cloudburst Precipitation Rate:
            </label>
            <span className="text-sm font-extrabold text-cyan-300">
              {scenario.cloudburstIntensityMmHr} mm/hr
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="400"
            step="5"
            value={scenario.cloudburstIntensityMmHr}
            onChange={(e) =>
              onChangeScenario({ ...scenario, cloudburstIntensityMmHr: parseInt(e.target.value) })
            }
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-cyan-400"
          />

          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>Light (10 mm/h)</span>
            <span>Cloudburst (100 mm/h)</span>
            <span className="text-rose-400 font-bold">Catastrophic Peak (400 mm/h)</span>
          </div>
        </div>

        {/* 2. Underground Drain Blockage Ratio */}
        <div className="rounded-xl bg-slate-900/80 p-4 border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <Filter className="h-4 w-4 text-amber-400" /> Underground Drain Blockage Clog:
            </label>
            <span className="text-sm font-extrabold text-amber-400">
              {scenario.drainageBlockageGlobalPercent}% Blocked
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={scenario.drainageBlockageGlobalPercent}
            onChange={(e) =>
              onChangeScenario({ ...scenario, drainageBlockageGlobalPercent: parseInt(e.target.value) })
            }
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-amber-400"
          />

          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>Clear (0%)</span>
            <span>Severe Clog (50%)</span>
            <span className="text-rose-400 font-bold">Total Collapse (100%)</span>
          </div>
        </div>

        {/* 3. Tidal Water Level Outfall Backpressure */}
        <div className="rounded-xl bg-slate-900/80 p-4 border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <Waves className="h-4 w-4 text-blue-400" /> Sea / River High Tide Level:
            </label>
            <span className="text-sm font-extrabold text-blue-300">
              {scenario.tidalLevelMeters.toFixed(1)} m ASL
            </span>
          </div>

          <input
            type="range"
            min="0.5"
            max="8.0"
            step="0.1"
            value={scenario.tidalLevelMeters}
            onChange={(e) =>
              onChangeScenario({ ...scenario, tidalLevelMeters: parseFloat(e.target.value) })
            }
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-blue-400"
          />

          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>Neap Tide (1.0m)</span>
            <span>Monsoon High (3.5m)</span>
            <span className="text-rose-400 font-bold">Storm Surge Lock (8.0m)</span>
          </div>
        </div>

        {/* 4. Concrete Imperviousness Factor */}
        <div className="rounded-xl bg-slate-900/80 p-4 border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <Zap className="h-4 w-4 text-rose-400" /> Urban Impervious Concrete Density:
            </label>
            <span className="text-sm font-extrabold text-rose-300">
              {Math.round(scenario.urbanImperviousnessFactor * 100)}% Impervious
            </span>
          </div>

          <input
            type="range"
            min="0.5"
            max="1.0"
            step="0.05"
            value={scenario.urbanImperviousnessFactor}
            onChange={(e) =>
              onChangeScenario({ ...scenario, urbanImperviousnessFactor: parseFloat(e.target.value) })
            }
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-rose-400"
          />

          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>Suburban Greens (50%)</span>
            <span>Dense Urban (85%)</span>
            <span className="text-rose-400 font-bold">100% Concrete Surface</span>
          </div>
        </div>

      </div>

      {/* Preset Crisis Buttons */}
      <div className="rounded-xl bg-slate-900/90 p-4 border border-slate-800">
        <h3 className="text-xs font-bold text-slate-200 mb-3">Load Preset Disaster Scenarios:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          <button
            onClick={() =>
              onChangeScenario({
                ...scenario,
                cloudburstIntensityMmHr: 125,
                drainageBlockageGlobalPercent: 50,
                tidalLevelMeters: 3.8
              })
            }
            className="flex flex-col gap-1 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-left hover:bg-rose-900/60 transition-colors"
          >
            <span className="text-xs font-bold text-rose-200">🌩️ Mumbai Dadar Cloudburst + High Tide</span>
            <span className="text-[10px] text-rose-300">125 mm/h rain, 3.8m tidal lock, 50% outfall block</span>
          </button>

          <button
            onClick={() =>
              onChangeScenario({
                ...scenario,
                cloudburstIntensityMmHr: 110,
                drainageBlockageGlobalPercent: 40,
                tidalLevelMeters: 2.2
              })
            }
            className="flex flex-col gap-1 p-3 rounded-xl bg-cyan-950/60 border border-cyan-800/80 text-left hover:bg-cyan-900/60 transition-colors"
          >
            <span className="text-xs font-bold text-cyan-200">🌧️ Kolkata Thanthania Flash Flood</span>
            <span className="text-[10px] text-cyan-300">110 mm/h rain, Palmer Bridge outfall backflow</span>
          </button>

          <button
            onClick={() =>
              onChangeScenario({
                ...scenario,
                cloudburstIntensityMmHr: 95,
                drainageBlockageGlobalPercent: 65,
                tidalLevelMeters: 1.5
              })
            }
            className="flex flex-col gap-1 p-3 rounded-xl bg-amber-950/60 border border-amber-800/80 text-left hover:bg-amber-900/60 transition-colors"
          >
            <span className="text-xs font-bold text-amber-200">⚠️ Delhi Minto Bridge Underpass Surge</span>
            <span className="text-[10px] text-amber-300">95 mm/h rain, 65% silted drainage channel</span>
          </button>

        </div>
      </div>

    </div>
  );
};
