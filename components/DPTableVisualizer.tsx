import React from 'react';
import Inner from '@/components/visualizers/DPTableVisualizer';

type Props = {
  steps: any[];
  currentStepIndex: number;
  onRequestStepChange?: (i: number) => void;
  animationSpeed?: number;
  maxHeight?: number;
};

export default function DPTableVisualizerWrapper({ steps, currentStepIndex, onRequestStepChange, animationSpeed = 1 }: Props) {
  const step = steps && steps.length > 0 ? steps[Math.min(currentStepIndex, steps.length - 1)] : null;

  if (!step) {
    return <div className="p-6 text-sm text-gray-400">Apply inputs to generate DP steps and visualize here.</div>;
  }

  // Prefer the new `snapshot.table` shape, else fall back to older shapes
  let tableAny: any = step?.snapshot?.table ?? step?.table ?? step?.dpTable ?? step?.snapshot?.dp ?? [[]];
  // If the table is a flat 1D array (common for 1D DP), wrap it for the renderer
  const table = Array.isArray(tableAny) && tableAny.length > 0 && !Array.isArray(tableAny[0]) ? [tableAny] : tableAny;

  // Build highlight: snapshot may provide currentCell and dependencyCells
  let highlight = null;
  const cur = step?.snapshot?.currentCell ?? step?.currentCell ?? null;
  const deps = step?.snapshot?.dependencyCells ?? step?.dependencyCells ?? null;
  if (cur != null) {
    if (Array.isArray(cur)) {
      const [i, j] = cur as [number, number];
      highlight = { i, j, type: 'current' };
    } else {
      // 1D index -> row 0, column = index
      const j = cur as number;
      highlight = { i: 0, j, type: 'current' };
    }
  }

  const rowLabels = step?.rowLabels || [];
  const colLabels = step?.colLabels || [];
  const selectedItems = step?.selectedItems || (step?.snapshot && (step.snapshot as any).selectedItems) || null;
  const splitTable = step?.dpSplitTable || null;
  const selectedParenthesization = step?.selectedParenthesization || null;
  const pseudocodeLine = step?.snapshot?.pseudocodeLine ?? step?.pseudocodeLine ?? -1;
  const includedCells = (deps && Array.isArray(deps) ? (Array.isArray(deps[0]) ? deps : deps.map((d: number) => [0, d])) : []);

  return (
    <div>
      <Inner
        table={table}
        highlight={highlight as any}
        rowLabels={rowLabels}
        colLabels={colLabels}
        includedCells={includedCells}
        excludedCells={[]}
        selectedItems={selectedItems}
        pseudocodeLine={pseudocodeLine}
        splitTable={splitTable}
        selectedParenthesization={selectedParenthesization}
      />
    </div>
  );
}
