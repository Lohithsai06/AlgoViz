'use client';

import { useState, useEffect } from 'react';

interface SortingVisualizerProps {
  array: number[];
  highlightIndices?: number[];
  sortedIndices?: number[];
  counters?: {
    iterations?: number;
    comparisons?: number;
    swaps?: number;
    mergeOps?: number;
    bucketOps?: number;
  };
}

export default function SortingVisualizer({
  array,
  highlightIndices = [],
  sortedIndices = [],
  counters,
}: SortingVisualizerProps) {
  const maxValue = Math.max(...array);

  return (
    <div className="relative w-full h-96 flex items-end justify-center gap-1 p-4 cyberpunk-grid rounded-lg border border-[#39FF14]/20">
      {/* counters panel (floating) */}
      {counters && (
        <div className="absolute top-3 right-3 bg-[#000000cc] text-xs text-gray-200 p-2 rounded-md border border-[#00F0FF]/20 w-40">
          <div className="text-[11px] text-gray-300 mb-1">Stats</div>
          <div className="flex justify-between"><span className="text-[#00F0FF]">Iterations</span><span className="font-mono text-gray-100">{counters.iterations ?? 0}</span></div>
          <div className="flex justify-between"><span className="text-[#39FF14]">Comparisons</span><span className="font-mono text-gray-100">{counters.comparisons ?? 0}</span></div>
          {counters.swaps !== undefined && (
            <div className="flex justify-between"><span className="text-[#FF10F0]">Swaps</span><span className="font-mono text-gray-100">{counters.swaps}</span></div>
          )}
          {counters.mergeOps !== undefined && counters.mergeOps > 0 && (
            <div className="flex justify-between"><span className="text-[#00F0FF]">Merge Ops</span><span className="font-mono text-gray-100">{counters.mergeOps}</span></div>
          )}
          {counters.bucketOps !== undefined && counters.bucketOps > 0 && (
            <div className="flex justify-between"><span className="text-[#00F0FF]">Bucket Ops</span><span className="font-mono text-gray-100">{counters.bucketOps}</span></div>
          )}
        </div>
      )}
      {array.map((value, index) => {
        const isHighlighted = highlightIndices.includes(index);
        const isSorted = sortedIndices.includes(index);

        return (
          <div
            key={index}
            className="flex-1 max-w-16 flex flex-col items-center justify-end transition-all duration-300"
            style={{
              height: `${(value / maxValue) * 100}%`,
            }}
          >
            <div
              className={`w-full rounded-t-lg transition-all duration-300 ${
                isSorted
                  ? 'bg-[#39FF14] neon-glow-green'
                  : isHighlighted
                  ? 'bg-[#FF10F0] neon-glow-pink'
                  : 'bg-[#00F0FF]/70'
              }`}
              style={{
                height: '100%',
              }}
            />
            <span className="text-xs text-gray-400 mt-1">{value}</span>
          </div>
        );
      })}
    </div>
  );
}
