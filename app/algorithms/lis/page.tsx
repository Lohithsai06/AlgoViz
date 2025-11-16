'use client';

import React, { useState, useEffect } from 'react';
import DPTableVisualizer from '@/components/DPTableVisualizer';
import { generateLISSteps } from '@/lib/steps/generateLISSteps';
import PlayerControls from '@/components/PlayerControls';
import PseudocodeHighlighter from '@/components/PseudocodeHighlighter';

export default function LisPage() {
  const [input, setInput] = useState('10,22,9,33,21,50,41,60');
  const [steps, setSteps] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const handleApply = () => {
    const arr = input.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
    const generated = generateLISSteps(arr);
    setSteps(generated);
    setCurrentStep(0);
  };

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return;
    const id = setInterval(() => setCurrentStep((c) => Math.min(steps.length - 1, c + 1)), 1000 / speed);
    return () => clearInterval(id);
  }, [isPlaying, speed, steps.length]);

  const pseudocode = [
    'for i = 0 to n-1',
    '  dp[i] = 1; parent[i] = -1',
    '  for j = 0 to i-1',
    '    if arr[j] < arr[i] and dp[j] + 1 > dp[i]',
    '      dp[i] = dp[j] + 1; parent[i] = j',
    'reconstruct LIS from max dp'
  ];

  const finalResult = steps.length ? steps[steps.length - 1].result : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold neon-text-green mb-2">Longest Increasing Subsequence</h1>
        <p className="text-gray-400">Computes LIS length and sequence using O(n²) DP.</p>
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
              <label className="text-sm text-gray-200">Array (comma-separated)</label>
              <input value={input} onChange={(e) => setInput(e.target.value)} className="w-full px-3 py-2 bg-[#0b0b10] rounded border border-gray-800 text-white" />
              <div className="flex items-end">
                <button onClick={handleApply} className="px-4 py-1 bg-[#39FF14] text-black rounded">Apply</button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <PlayerControls isPlaying={isPlaying} onPlayPause={() => setIsPlaying(p => !p)} onReset={() => { setIsPlaying(false); setCurrentStep(0); }} onStepBack={() => setCurrentStep(c => Math.max(0, c - 1))} onStepForward={() => setCurrentStep(c => Math.min(steps.length - 1, c + 1))} speed={speed} onSpeedChange={setSpeed} />

          <div className="glass-card rounded-lg p-6 border border-[#39FF14]/20">
            <h3 className="text-lg font-semibold neon-text-green mb-4">Pseudocode</h3>
            <PseudocodeHighlighter code={pseudocode} highlightLine={steps[currentStep]?.pseudocodeLine ?? -1} />
            {finalResult && (
              <div className="mt-4 text-sm">
                <div className="text-neon-green">LIS Length: {finalResult.length}</div>
                <div className="text-neon-green">LIS Sequence: [{finalResult.sequence.join(', ')}]</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
