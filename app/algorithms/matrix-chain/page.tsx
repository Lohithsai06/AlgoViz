'use client';

import React, { useState, useEffect } from 'react';
import DPTableVisualizer from '@/components/DPTableVisualizer';
import { generateMatrixChainSteps } from '@/lib/steps/generateMatrixChainSteps';
import PlayerControls from '@/components/PlayerControls';
import PseudocodeHighlighter from '@/components/PseudocodeHighlighter';

function buildParenthesization(split: (number|null)[][], i: number, j: number): string {
  if (i === j) return `A${i}`;
  const k = split[i]?.[j];
  if (k == null) return `A${i}-${j}`;
  return `(${buildParenthesization(split, i, k)} × ${buildParenthesization(split, k + 1, j)})`;
}

export default function MatrixChainPage() {
  const [dims, setDims] = useState('10,20,30,40');
  const [steps, setSteps] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const handleApply = () => {
    const arr = dims.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
    const generated = generateMatrixChainSteps(arr);
    setSteps(generated);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) { setIsPlaying(false); return prev; }
        return prev + 1;
      });
    }, 1000 / speed);
    return () => clearInterval(interval);
  }, [isPlaying, speed, steps.length]);

  const handlePlayPause = () => setIsPlaying((p) => !p);
  const handleReset = () => { setIsPlaying(false); setCurrentStep(0); };
  const handleStepBack = () => { setIsPlaying(false); setCurrentStep((c) => Math.max(0, c - 1)); };
  const handleStepForward = () => { setIsPlaying(false); setCurrentStep((c) => Math.min(steps.length - 1, c + 1)); };

  const pseudocode = [
    'n = number of matrices',
    'for i = 1 to n:',
    '   dp[i][i] = 0',
    'for L = 2 to n:',
    '   for i = 1 to n-L+1:',
    '       j = i + L - 1',
    '       dp[i][j] = ∞',
    '       for k = i to j-1:',
    '           cost = dp[i][k] + dp[k+1][j] + dims[i-1] * dims[k] * dims[j]',
    '           if cost < dp[i][j]:',
    '               dp[i][j] = cost',
    '               split[i][j] = k'
  ];

  // derive final parenthesization from final split table if available
  const finalSplit = steps.length ? steps[steps.length - 1].split : null;
  const finalParentheses = finalSplit ? buildParenthesization(finalSplit, 1, finalSplit.length - 1) : '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold neon-text-green mb-2">Matrix Chain Multiplication</h1>
        <p className="text-gray-400">Finds the most efficient way to multiply a chain of matrices.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-lg border border-[#39FF14]/20 overflow-hidden">
            <div className="p-6">
              <DPTableVisualizer
                steps={steps}
                currentStepIndex={currentStep}
                onRequestStepChange={(i) => setCurrentStep(i)}
              />
              {finalParentheses && (
                <div className="text-neon-green text-xl mt-4">Optimal Order: {finalParentheses}</div>
              )}
            </div>
          </div>

          <div className="glass-card rounded-lg p-6 border border-[#39FF14]/20">
            <h3 className="text-lg font-semibold neon-text-blue mb-4">Custom Input</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-200">Matrix dimensions (comma-separated)</label>
                <p className="text-xs text-gray-400 mb-2">Example: 10,20,30,40 (A1:10×20, A2:20×30, A3:30×40)</p>
                <input value={dims} onChange={(e) => setDims(e.target.value)} className="w-full px-3 py-2 bg-[#0b0b10] rounded border border-gray-800 text-white" />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-end">
                  <button onClick={handleApply} className="px-4 py-1 bg-[#39FF14] text-black rounded">Apply</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <PlayerControls
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onReset={handleReset}
            onStepBack={handleStepBack}
            onStepForward={handleStepForward}
            speed={speed}
            onSpeedChange={setSpeed}
          />

          <div className="glass-card rounded-lg p-6 border border-[#39FF14]/20">
            <h3 className="text-lg font-semibold neon-text-green mb-4">Pseudocode</h3>
            <PseudocodeHighlighter code={pseudocode} highlightLine={steps[currentStep]?.pseudocodeLine ?? -1} />
          </div>
        </div>
      </div>
    </div>
  );
}
