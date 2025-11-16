'use client';

import { Play, Pause, RotateCcw, SkipBack, SkipForward } from 'lucide-react';

interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  onStepBack: () => void;
  onStepForward: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  disabled?: boolean;
}

export default function PlayerControls({
  isPlaying,
  onPlayPause,
  onReset,
  onStepBack,
  onStepForward,
  speed,
  onSpeedChange,
  disabled = false,
}: PlayerControlsProps) {
  return (
    <div className="glass-card rounded-lg p-6 border border-[#39FF14]/20">
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={() => { if (!disabled) onStepBack(); }}
          className="p-3 rounded-lg bg-[#13131a] border border-gray-800 hover:border-[#00F0FF] hover:neon-glow-blue transition-all"
          title="Step Back"
        >
          <SkipBack className="w-5 h-5 text-[#00F0FF]" />
        </button>

        <button
          onClick={() => { if (!disabled) onPlayPause(); }}
          className="p-4 rounded-lg bg-gradient-to-r from-[#39FF14] to-[#00F0FF] neon-glow-green hover:scale-105 transition-all"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 text-black" />
          ) : (
            <Play className="w-6 h-6 text-black" />
          )}
        </button>

        <button
          onClick={() => { if (!disabled) onStepForward(); }}
          className="p-3 rounded-lg bg-[#13131a] border border-gray-800 hover:border-[#00F0FF] hover:neon-glow-blue transition-all"
          title="Step Forward"
        >
          <SkipForward className="w-5 h-5 text-[#00F0FF]" />
        </button>

        <button
          onClick={() => { if (!disabled) onReset(); }}
          className="p-3 rounded-lg bg-[#13131a] border border-gray-800 hover:border-[#FF10F0] hover:neon-glow-pink transition-all"
          title="Reset"
        >
          <RotateCcw className="w-5 h-5 text-[#FF10F0]" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">Speed</label>
          <span className="text-sm neon-text-green">{speed}x</span>
        </div>
        <input
          type="range"
          min="0.25"
          max="2"
          step="0.25"
          value={speed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#39FF14]"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>0.25x</span>
          <span>2x</span>
        </div>
      </div>
    </div>
  );
}
