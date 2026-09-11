import React, { useEffect, useState } from 'react';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react';
import type { DataMode } from '../types';

interface TimelineControlsProps {
  leadTimeMinutes: number;
  onChangeLeadTime: (minutes: number) => void;
  rainfallRateMmHr: number | null;
  dataMode: DataMode;
  sourceName?: string;
}

export const TimelineControls: React.FC<TimelineControlsProps> = ({
  leadTimeMinutes,
  onChangeLeadTime,
  rainfallRateMmHr,
  dataMode,
  sourceName
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Playback timer tick
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        onChangeLeadTime(Math.min(180, (leadTimeMinutes + 5 * playbackSpeed) % 185));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, leadTimeMinutes, playbackSpeed, onChangeLeadTime]);

  const timelineTicks = [
    { mins: 0, label: 'NOW' },
    { mins: 30, label: '+30m' },
    { mins: 60, label: '+60m' },
    { mins: 90, label: '+90m' },
    { mins: 120, label: '+120m' },
    { mins: 150, label: '+150m' },
    { mins: 180, label: '+180m' }
  ];

  const isLive = dataMode === 'live';

  return (
    <div className="glass-panel rounded-2xl p-3 border border-slate-800 shadow-xl flex flex-col gap-2">
      
      {/* Top Header Label & Data Mode Status */}
      <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-cyan-400" />
          <span className="font-bold tracking-wide uppercase text-slate-200">
            {isLive ? '0–3 HOUR RAINFALL & DRAINAGE NOWCAST TIMELINE' : '0–3 HOUR HISTORICAL DISASTER EVENT REPLAY'}
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
            isLive ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-blue-950 text-blue-300 border border-blue-800'
          }`}>
            {isLive ? 'LIVE OBSERVATION' : 'HISTORICAL EVENT REPLAY'}
          </span>
        </div>

        <div className="text-[11px] text-slate-400">
          Source: <span className="font-mono text-cyan-300">{sourceName || (isLive ? 'Open-Meteo API' : 'IMD Archive')}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        
        {/* Timeline Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/30"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              onChangeLeadTime(0);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800"
            title="Reset to 0 min"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-1">
            <button
              onClick={() => setPlaybackSpeed(1)}
              className={`px-2 py-0.5 text-xs font-semibold rounded-lg ${
                playbackSpeed === 1 ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1x
            </button>
            <button
              onClick={() => setPlaybackSpeed(2)}
              className={`px-2 py-0.5 text-xs font-semibold rounded-lg ${
                playbackSpeed === 2 ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2x
            </button>
            <button
              onClick={() => setPlaybackSpeed(5)}
              className={`px-2 py-0.5 text-xs font-semibold rounded-lg ${
                playbackSpeed === 5 ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              5x
            </button>
          </div>

          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-xs text-slate-400">Lead Window:</span>
            <span className="text-sm font-bold text-cyan-300">+{leadTimeMinutes} min</span>
          </div>
        </div>

        {/* 0-180 min Interactive Scrubber Slider */}
        <div className="flex-1 max-w-xl mx-2">
          <div className="relative flex flex-col justify-center">
            <input
              type="range"
              min="0"
              max="180"
              step="5"
              value={leadTimeMinutes}
              onChange={(e) => onChangeLeadTime(parseInt(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-cyan-400 focus:outline-none"
            />
            <div className="mt-1 flex justify-between text-[11px] font-medium text-slate-400">
              {timelineTicks.map((pt) => (
                <button
                  key={pt.mins}
                  onClick={() => onChangeLeadTime(pt.mins)}
                  className={`hover:text-cyan-300 transition-colors ${
                    leadTimeMinutes === pt.mins ? 'text-cyan-400 font-bold underline' : ''
                  }`}
                >
                  {pt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Rainfall Intensity Trend Indicator */}
        <div className="flex items-center gap-3 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Precipitation Rate</div>
            <div className="font-bold text-cyan-300">
              {rainfallRateMmHr !== null ? `${rainfallRateMmHr} mm/h` : 'Data unavailable'}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

