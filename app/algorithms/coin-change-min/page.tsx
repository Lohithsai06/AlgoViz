"use client";

import React, { useState, useEffect } from 'react';
import { algorithmsList } from '@/lib/algorithms-data';
import DPTableVisualizer from '@/components/DPTableVisualizer';
import DPPageLayout from '@/components/DPPageLayout';
import CodeViewer from '@/components/CodeViewer';
import PlayerControls from '@/components/PlayerControls';
import PseudocodeHighlighter from '@/components/PseudocodeHighlighter';
import { generateSteps_coinChangeMin } from '@/lib/steps/generateSteps_coinChangeMin';

export default function CoinChangeMinPage() {
  const algorithm = algorithmsList.find((a) => a.id === 'coin-change-min');

  const [coinsInput, setCoinsInput] = useState('1,2,5');
  const [targetInput, setTargetInput] = useState('11');

  const [mappedSteps, setMappedSteps] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  // store the final table for convenience
  const [table, setTable] = useState<number[][]>([[]]);

  useEffect(() => {
    // pause play when steps change
    setIsPlaying(false);
    setCurrentStep(0);
  }, [mappedSteps.length]);

  const handleApply = () => {
    const cs = coinsInput.split(',').map((s) => Number(s.trim())).filter((n) => !isNaN(n) && n > 0);
    const tg = Number(targetInput);
    if (cs.length === 0 || !Number.isFinite(tg) || tg < 0) {
      // simple validation: do nothing if invalid
      return;
    }

    const gen = generateSteps_coinChangeMin(cs, tg);

    // build snapshots applying writes sequentially so table reflects timeline
    const dp = Array(tg + 1).fill(Infinity);
    dp[0] = 0;
    const snaps: any[] = [];

    for (const s of gen.steps) {
      if (s.write && typeof s.newValue === 'number') {
        dp[s.amount] = s.newValue;
      }

      const snapshot = {
        snapshot: {
          table: [dp.slice()],
          currentCell: s.amount,
          dependencyCells: s.dependency ? s.dependency.map((d: any) => [d.row, d.col]) : [],
          pseudocodeLine: s.pseudocodeLine,
        },
      };
      snaps.push(snapshot);
    }

    setTable(gen.table);
    setMappedSteps(snaps);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  useEffect(() => {
    if (!isPlaying || mappedSteps.length === 0) return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= mappedSteps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / speed);
    return () => clearInterval(interval);
  }, [isPlaying, speed, mappedSteps.length]);

  const handlePlayPause = () => setIsPlaying((p) => !p);
  const handleReset = () => { setIsPlaying(false); setCurrentStep(0); };
  const handleStepBack = () => { setIsPlaying(false); setCurrentStep((c) => Math.max(0, c - 1)); };
  const handleStepForward = () => { setIsPlaying(false); setCurrentStep((c) => Math.min(mappedSteps.length - 1, c + 1)); };

  const pseudocode = [
    'dp[0] = 0; all others = ∞',
    'for amount = 1 to target:',
    '   for each coin in coins:',
    '       if coin <= amount:',
    '           if dp[amount - coin] + 1 < dp[amount]:',
    '               dp[amount] = dp[amount - coin] + 1',
  ];

  const visualization = <DPTableVisualizer steps={mappedSteps} currentStepIndex={currentStep} onRequestStepChange={(i: number) => setCurrentStep(i)} />;

  const codeContent = (
    <CodeViewer>{`function coinChange(coins, amount) {
  const dp = Array(amount+1).fill(Infinity);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a) {
        dp[a] = Math.min(dp[a], dp[a-c] + 1);
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`}</CodeViewer>
  );

  const infoContent = (
    <>
      <PseudocodeHighlighter code={pseudocode} highlightLine={mappedSteps[currentStep]?.snapshot?.pseudocodeLine ?? -1} />
      <div className="mt-4">
        <div>
          <span className="text-sm text-gray-500">Time:</span>
          <p className="text-[#39FF14] font-mono">O(amount × coins)</p>
        </div>
        <div>
          <span className="text-sm text-gray-500">Space:</span>
          <p className="text-[#00F0FF] font-mono">O(amount)</p>
        </div>
      </div>
    </>
  );

  const customInput = (
    <div className="glass-card rounded-lg p-6 border border-[#39FF14]/20">
      <h3 className="text-lg font-semibold neon-text-blue mb-4">Custom Input</h3>
      <div className="space-y-3">
        <div>
          <label className="text-sm text-gray-200">Coins (comma-separated)</label>
          <input value={coinsInput} onChange={(e) => setCoinsInput(e.target.value)} className="w-full px-3 py-2 bg-[#0b0b10] rounded border border-gray-800 text-white" />
        </div>
        <div>
          <label className="text-sm text-gray-200">Target</label>
          <input value={targetInput} onChange={(e) => setTargetInput(e.target.value)} className="w-full px-3 py-2 bg-[#0b0b10] rounded border border-gray-800 text-white" />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-end">
            <button onClick={handleApply} className="px-4 py-1 bg-[#39FF14] text-black rounded">Apply</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <DPPageLayout
      title={algorithm?.title || 'Coin Change (Minimum Coins)'}
      description={algorithm?.description || 'Find minimum coins to reach target using DP.'}
      visualization={visualization}
      codeContent={codeContent}
      infoContent={infoContent}
      customInput={customInput}
      playerControls={<PlayerControls isPlaying={isPlaying} onPlayPause={handlePlayPause} onReset={handleReset} onStepBack={handleStepBack} onStepForward={handleStepForward} speed={speed} onSpeedChange={setSpeed} />}
    />
  );
}
