'use client';

import React, { useState, useEffect } from 'react';
import DPTableVisualizer from '@/components/DPTableVisualizer';
import DPPageLayout from '@/components/DPPageLayout';
import CodeViewer from '@/components/CodeViewer';
import { generateSubsetSumSteps } from '@/lib/steps/generateSubsetSumSteps';
import PlayerControls from '@/components/PlayerControls';
import PseudocodeHighlighter from '@/components/PseudocodeHighlighter';

export default function SubsetSumPage() {
  const [input, setInput] = useState('3,34,4,12,5,2');
  const [target, setTarget] = useState(9);
  const [steps, setSteps] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const handleApply = () => {
    const arr = input.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
    const generated = generateSubsetSumSteps(arr, Number(target));
    setSteps(generated);
    setCurrentStep(0);
  };

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return;
    const id = setInterval(() => setCurrentStep(c => Math.min(steps.length - 1, c + 1)), 1000 / speed);
    return () => clearInterval(id);
  }, [isPlaying, speed, steps.length]);

  const pseudocode = [
    'dp[0][0] = true; others false',
    'for i = 1 to n',
    '  for t = 0 to target',
    '    dp[i][t] = dp[i-1][t] OR (t-arr[i] >=0 ? dp[i-1][t-arr[i]] : false)'
  ];

  const final = steps.length ? steps[steps.length - 1].table : null;

  const visualization = <DPTableVisualizer steps={steps} currentStepIndex={currentStep} onRequestStepChange={(i) => setCurrentStep(i)} />;

  const codeContent = <CodeViewer>{''}</CodeViewer>;

  const infoContent = (
    <>
      <PseudocodeHighlighter code={pseudocode} highlightLine={steps[currentStep]?.pseudocodeLine ?? -1} />
      {final && (
        <div className="mt-4 text-sm text-neon-green">Subset Exists: {final?.[final.length - 1]?.[Number(target)] ? 'Yes' : 'No'}</div>
      )}
    </>
  );

  const customInput = (
    <div className="glass-card rounded-lg p-6 border border-[#39FF14]/20">
      <h3 className="text-lg font-semibold neon-text-blue mb-4">Custom Input</h3>
      <div className="space-y-3">
        <div>
          <label className="text-sm text-gray-200">Array (comma-separated)</label>
          <input value={input} onChange={(e) => setInput(e.target.value)} className="w-full px-3 py-2 bg-[#0b0b10] rounded border border-gray-800 text-white" />
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
      title="Subset Sum"
      description="Determines if any subset sums to the target value."
      visualization={visualization}
      codeContent={codeContent}
      infoContent={infoContent}
      customInput={customInput}
      playerControls={<PlayerControls isPlaying={isPlaying} onPlayPause={() => setIsPlaying(p => !p)} onReset={() => { setIsPlaying(false); setCurrentStep(0); }} onStepBack={() => setCurrentStep(c => Math.max(0, c - 1))} onStepForward={() => setCurrentStep(c => Math.min(steps.length - 1, c + 1))} speed={speed} onSpeedChange={setSpeed} />}
    />
  );
}
