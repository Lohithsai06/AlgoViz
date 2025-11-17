'use client';

import React, { useState, useEffect } from 'react';
import { algorithmsList } from '@/lib/algorithms-data';
import DPTableVisualizer from '@/components/DPTableVisualizer';
import DPPageLayout from '@/components/DPPageLayout';
import CodeViewer from '@/components/CodeViewer';
import { generateKnapsackSteps } from '@/lib/steps/knapsackSteps';
import PseudocodeHighlighter from '@/components/PseudocodeHighlighter';
import PlayerControls from '@/components/PlayerControls';

export default function KnapsackPage() {
  const algorithm = algorithmsList.find((a) => a.id === 'knapsack');

  const [weightInput, setWeightInput] = useState('2,3,4,5');
  const [valueInput, setValueInput] = useState('3,4,5,6');
  const [capacity, setCapacity] = useState(5);

  const [steps, setSteps] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    // reset when inputs change
  }, [weightInput, valueInput, capacity]);

  const handleApply = () => {
    const wArr = weightInput.split(',').map((s) => Number(s.trim()));
    const vArr = valueInput.split(',').map((s) => Number(s.trim()));
    const cap = Number(capacity);

    const generated = generateKnapsackSteps(wArr, vArr, cap);

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

  const pseudocode = algorithm?.pseudocode || [];
  const activePseudocodeLine = steps[currentStep]?.pseudocodeLine ?? null;

  const visualization = (
    <DPTableVisualizer steps={steps} currentStepIndex={currentStep} onRequestStepChange={(i) => setCurrentStep(i)} />
  );

  const codeContent = (
    <CodeViewer>{algorithm?.code || ''}</CodeViewer>
  );

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
          <label className="text-sm text-gray-200">Weights (comma-separated)</label>
          <input value={weightInput} onChange={(e) => setWeightInput(e.target.value)} className="w-full px-3 py-2 bg-[#0b0b10] rounded border border-gray-800 text-white" />
        </div>
        <div>
          <label className="text-sm text-gray-200">Values (comma-separated)</label>
          <input value={valueInput} onChange={(e) => setValueInput(e.target.value)} className="w-full px-3 py-2 bg-[#0b0b10] rounded border border-gray-800 text-white" />
        </div>
        <div className="flex items-center gap-4">
          <div>
            <label className="text-sm text-gray-200">Capacity</label>
            <input type="number" value={capacity} onChange={(e) => setCapacity(Math.max(0, Number(e.target.value)))} className="w-28 px-3 py-1 bg-[#0b0b10] rounded border border-gray-800 text-white" />
          </div>
          <div className="flex items-end">
            <button onClick={handleApply} className="px-4 py-1 bg-[#39FF14] text-black rounded">Apply</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <DPPageLayout
      title={algorithm?.title || 'Knapsack'}
      description={algorithm?.description}
      visualization={visualization}
      codeContent={codeContent}
      infoContent={infoContent}
      customInput={customInput}
      playerControls={<PlayerControls isPlaying={isPlaying} onPlayPause={handlePlayPause} onReset={handleReset} onStepBack={handleStepBack} onStepForward={handleStepForward} speed={speed} onSpeedChange={setSpeed} />}
    />
  );
}
