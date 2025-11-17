'use client';

import React, { useState, useEffect } from 'react';
import DPTableVisualizer from '@/components/DPTableVisualizer';
import DPPageLayout from '@/components/DPPageLayout';
import CodeViewer from '@/components/CodeViewer';
import { generateCoinWaysSteps } from '@/lib/steps/generateCoinWaysSteps';
import PlayerControls from '@/components/PlayerControls';
import PseudocodeHighlighter from '@/components/PseudocodeHighlighter';

export default function CoinWaysPage() {
  const [coinsInput, setCoinsInput] = useState('1,2,5');
  const [target, setTarget] = useState(10);
  const [steps, setSteps] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const handleApply = () => {
    const coins = coinsInput.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
    const generated = generateCoinWaysSteps(coins, Number(target));
    setSteps(generated);
    setCurrentStep(0);
  };

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return;
    const id = setInterval(() => setCurrentStep(c => Math.min(steps.length - 1, c + 1)), 1000 / speed);
    return () => clearInterval(id);
  }, [isPlaying, speed, steps.length]);

  const pseudocode = [
    'dp[0][0] = 1; others 0',
    'for i = 1 to n',
    '  for t = 0 to target',
    '    dp[i][t] = dp[i-1][t] + (t-coin[i] >=0 ? dp[i][t-coin[i]] : 0)'
  ];

  const final = steps.length ? steps[steps.length - 1].table : null;

  const visualization = <DPTableVisualizer steps={steps} currentStepIndex={currentStep} onRequestStepChange={(i) => setCurrentStep(i)} />;

  const codeContent = <CodeViewer>{''}</CodeViewer>;

  const infoContent = (
    <>
      <PseudocodeHighlighter code={pseudocode} highlightLine={steps[currentStep]?.pseudocodeLine ?? -1} />
      {final && (
        <div className="mt-4 text-sm text-neon-green">Total Ways: {final?.[final.length - 1]?.[Number(target)] ?? final?.[coinsInput.split(',').length]?.[Number(target)]}</div>
      )}
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
          <input type="number" value={target} onChange={(e) => setTarget(Number(e.target.value))} className="w-28 px-3 py-1 bg-[#0b0b10] rounded border border-gray-800 text-white" />
        </div>
        <div className="flex items-end">
          <button onClick={handleApply} className="px-4 py-1 bg-[#39FF14] text-black rounded">Apply</button>
        </div>
      </div>
    </div>
  );

  return (
    <DPPageLayout
      title="Total Ways (Coin Change)"
      description="Number of ways to make target sum using given coins."
      visualization={visualization}
      codeContent={codeContent}
      infoContent={infoContent}
      customInput={customInput}
      playerControls={<PlayerControls isPlaying={isPlaying} onPlayPause={() => setIsPlaying(p => !p)} onReset={() => { setIsPlaying(false); setCurrentStep(0); }} onStepBack={() => setCurrentStep(c => Math.max(0, c - 1))} onStepForward={() => setCurrentStep(c => Math.min(steps.length - 1, c + 1))} speed={speed} onSpeedChange={setSpeed} />}
    />
  );
}
