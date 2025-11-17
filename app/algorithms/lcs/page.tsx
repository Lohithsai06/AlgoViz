'use client';

import React, { useState, useEffect } from 'react';
import DPTableVisualizer from '@/components/DPTableVisualizer';
import DPPageLayout from '@/components/DPPageLayout';
import CodeViewer from '@/components/CodeViewer';
import { generateLcsSteps } from '@/lib/steps/generateLcsSteps';
import PlayerControls from '@/components/PlayerControls';
import PseudocodeHighlighter from '@/components/PseudocodeHighlighter';

export default function LcsPage() {
  const [text1, setText1] = useState('ABCBDAB');
  const [text2, setText2] = useState('BDCAB');
  const [steps, setSteps] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const handleApply = () => {
    const generated = generateLcsSteps(text1, text2);
    setSteps(generated);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
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
    'create table dp[n+1][m+1]',
    'for i = 0 to n',
    '  for j = 0 to m',
    '    if i == 0 or j == 0: dp[i][j] = 0',
    '    else if text1[i-1] == text2[j-1]',
    '        dp[i][j] = 1 + dp[i-1][j-1]',
    '    else',
    '        dp[i][j] = max(dp[i-1][j], dp[i][j-1])'
  ];

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
          <input value={text1} onChange={(e) => setText1(e.target.value)} className="w-full px-3 py-2 bg-[#0b0b10] rounded border border-gray-800 text-white" />
        </div>
        <div>
          <label className="text-sm text-gray-200">String 2</label>
          <input value={text2} onChange={(e) => setText2(e.target.value)} className="w-full px-3 py-2 bg-[#0b0b10] rounded border border-gray-800 text-white" />
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
      title="Longest Common Subsequence"
      description="Finds the longest subsequence common to two strings."
      visualization={visualization}
      codeContent={codeContent}
      infoContent={infoContent}
      customInput={customInput}
      playerControls={<PlayerControls isPlaying={isPlaying} onPlayPause={handlePlayPause} onReset={handleReset} onStepBack={handleStepBack} onStepForward={handleStepForward} speed={speed} onSpeedChange={setSpeed} />}
    />
  );
}
