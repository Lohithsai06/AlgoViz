'use client';

import React, { useState, useEffect } from 'react';
import DPTableVisualizer from '@/components/DPTableVisualizer';
import { generateMinCoinsSteps } from '@/src/lib/steps/generateMinCoinsSteps';
import PlayerControls from '@/components/PlayerControls';
import PseudocodeHighlighter from '@/components/PseudocodeHighlighter';

export default function MinCoinsPage() {
  const [coinsInput, setCoinsInput] = useState('1,3,4');
  const [target, setTarget] = useState(10);
  const [steps, setSteps] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  

  const [error, setError] = useState<string | null>(null);
  const [jumpToFinal, setJumpToFinal] = useState(false);

  const handleApply = () => {
    setError(null);
    const coins = coinsInput.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
    const tgt = Math.floor(Number(target));

    if (!coins.length) {
      setError('Provide at least one coin denomination.');
      return;
    }
    if (!Number.isFinite(tgt) || tgt <= 0) {
      setError('Target must be a positive integer.');
      return;
    }
    if (tgt > 10000) {
      setError('Target too large (max 10000). Use smaller target or increase Jump to Final.');
      return;
    }

    // If user requested jump-to-final or target is large, compute compact final-only snapshots
    if (jumpToFinal || tgt > 2000) {
      // fast final DP computation
      const dp = Array(tgt + 1).fill(Infinity);
      dp[0] = 0;
      const parent: number[] = Array(tgt + 1).fill(-1);
      for (let x = 1; x <= tgt; x++) {
        for (const coin of coins) {
          const prev = x - coin;
          if (prev >= 0 && dp[prev] + 1 < dp[x]) {
            dp[x] = dp[prev] + 1;
            parent[x] = coin;
          }
        }
      }
      const compact = [
        { snapshot: { table: Array(tgt + 1).fill(Infinity), currentCell: null, dependencyCells: [], pseudocodeLine: 0, note: 'jump-to-final: start' } },
        { snapshot: { table: dp.slice(), currentCell: null, dependencyCells: [], pseudocodeLine: -1, note: dp[tgt] === Infinity ? 'no solution' : `min coins = ${dp[tgt]}`, parents: parent.slice() } }
      ];
      setSteps(compact as any[]);
      setCurrentStep(0);
      return;
    }

    const generated = generateMinCoinsSteps(coins, tgt);
    setSteps(generated as any[]);
    setCurrentStep(0);
  };

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return;
    const id = setInterval(() => setCurrentStep(c => Math.min(steps.length - 1, c + 1)), 1000 / speed);
    return () => clearInterval(id);
  }, [isPlaying, speed, steps.length]);

  const pseudocode = [
    'dp[0] = 0; dp[x] = ∞ for x > 0',
    'for x = 1 to target',
    '  for each coin in coins',
    '    if coin <= x',
    '      dp[x] = min(dp[x], dp[x-coin] + 1)'
  ];

  const final = steps.length ? steps[steps.length - 1].table : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold neon-text-green mb-2">Minimum Coins</h1>
        <p className="text-gray-400">Compute minimum number of coins to form a target amount.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-lg border border-[#39FF14]/20 overflow-hidden">
            <div className="p-6">
              <DPTableVisualizer steps={steps} currentStepIndex={currentStep} onRequestStepChange={(i) => setCurrentStep(i)} />
            </div>
          </div>

          <div className="glass-card rounded-lg p-6 border border-[#39FF14]/20">
            <h3 className="text-lg font-semibold neon-text-blue mb-4">Custom Input</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-200">Coins (comma-separated)</label>
                <input value={coinsInput} onChange={(e) => setCoinsInput(e.target.value)} className="w-full px-3 py-2 bg-[#0b0b10] rounded border border-gray-800 text-white" />
              </div>
              <div>
                <label className="text-sm text-gray-200">Target</label>
                <input type="number" value={target} onChange={(e) => setTarget(Number(e.target.value))} className="w-28 px-3 py-1 bg-[#0b0b10] rounded border border-gray-800 text-white" />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input id="jump" type="checkbox" checked={jumpToFinal} onChange={(e) => setJumpToFinal(e.target.checked)} />
                  <label htmlFor="jump" className="text-xs text-gray-300">Jump to final (skip full step generation)</label>
                </div>
                <div className="flex items-end">
                  <button onClick={handleApply} className="px-4 py-1 bg-[#39FF14] text-black rounded">Apply</button>
                </div>
              </div>
              {error && <div className="mt-2 text-sm text-red-400">{error}</div>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <PlayerControls isPlaying={isPlaying} onPlayPause={() => setIsPlaying(p => !p)} onReset={() => { setIsPlaying(false); setCurrentStep(0); }} onStepBack={() => setCurrentStep(c => Math.max(0, c - 1))} onStepForward={() => setCurrentStep(c => Math.min(steps.length - 1, c + 1))} speed={speed} onSpeedChange={setSpeed} />

          <div className="glass-card rounded-lg p-6 border border-[#39FF14]/20">
            <h3 className="text-lg font-semibold neon-text-green mb-4">Pseudocode</h3>
            <PseudocodeHighlighter code={pseudocode} highlightLine={steps[currentStep]?.pseudocodeLine ?? -1} />
            {final && (
              <div className="mt-4 text-sm text-neon-green">Min Coins Needed: {final[Number(target)] === Infinity ? 'No solution' : final[Number(target)]}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
