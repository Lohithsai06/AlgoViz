'use client';

import React, { useState, useEffect } from 'react';
import DPTableVisualizer from '@/components/DPTableVisualizer';
import DPPageLayout from '@/components/DPPageLayout';
import CodeViewer from '@/components/CodeViewer';
import { generateEditDistanceSteps } from '@/lib/steps/generateEditDistanceSteps';
import PlayerControls from '@/components/PlayerControls';
import PseudocodeHighlighter from '@/components/PseudocodeHighlighter';

export default function EditDistancePage() {
  const [str1, setStr1] = useState('INTENTION');
  const [str2, setStr2] = useState('EXECUTION');
  const [steps, setSteps] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const handleApply = () => {
    const generated = generateEditDistanceSteps(str1, str2);
    setSteps(generated);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return;
    const id = setInterval(() => setCurrentStep((c) => Math.min(steps.length - 1, c + 1)), 1000 / speed);
    return () => clearInterval(id);
  }, [isPlaying, speed, steps.length]);

  const handlePlayPause = () => setIsPlaying((p) => !p);
  const handleReset = () => { setIsPlaying(false); setCurrentStep(0); };
  const handleStepBack = () => { setIsPlaying(false); setCurrentStep((c) => Math.max(0, c - 1)); };
  const handleStepForward = () => { setIsPlaying(false); setCurrentStep((c) => Math.min(steps.length - 1, c + 1)); };

  const pseudocode = [
    'initialize dp table for lengths',
    'for i = 0..n',
    ' for j = 0..m',
    '  if s1[i] == s2[j] -> dp[i][j] = dp[i-1][j-1]',
    '  else dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])'
  ];

  const finalResult = steps.length ? steps[steps.length - 1].result : null;

  const visualization = <DPTableVisualizer steps={steps} currentStepIndex={currentStep} onRequestStepChange={(i) => setCurrentStep(i)} />;

  const codeContent = <CodeViewer>{''}</CodeViewer>;

  const infoContent = (
    <>
      <PseudocodeHighlighter code={pseudocode} highlightLine={steps[currentStep]?.pseudocodeLine ?? -1} />
    </>
  );

  const customInput = (
    <div className="glass-card rounded-lg p-6 border border-[#39FF14]/20">
      <h3 className="text-lg font-semibold neon-text-blue mb-4">Custom Input</h3>
      <div className="space-y-3">
        <div>
          <label className="text-sm text-gray-200">String 1</label>
          <input value={str1} onChange={(e) => setStr1(e.target.value)} className="w-full px-3 py-2 bg-[#0b0b10] rounded border border-gray-800 text-white" />
        </div>
        <div>
          <label className="text-sm text-gray-200">String 2</label>
          <input value={str2} onChange={(e) => setStr2(e.target.value)} className="w-full px-3 py-2 bg-[#0b0b10] rounded border border-gray-800 text-white" />
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
      title="Edit Distance"
      description="Computes the minimum edits to convert one string to another."
      visualization={visualization}
      codeContent={codeContent}
      infoContent={infoContent}
      customInput={customInput}
      playerControls={<PlayerControls isPlaying={isPlaying} onPlayPause={handlePlayPause} onReset={handleReset} onStepBack={handleStepBack} onStepForward={handleStepForward} speed={speed} onSpeedChange={setSpeed} />}
    />
  );
}
