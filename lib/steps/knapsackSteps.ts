import generateKnapsackStepsOrig from '@/lib/algorithms/knapsackSteps';

// Adapter to map existing generator output to the requested step shape
export function generateKnapsackSteps(weights: number[], values: number[], capacity: number) {
  const raw = generateKnapsackStepsOrig(weights, values, capacity) || [];
  // Map each raw step to { table, currentCell, affectingCells, included, pseudocodeLine }
  const mapped = raw.map((s: any) => {
    const table = s.dpTable || s.table || (s.snapshot && s.snapshot.dp) || [[]];
    const dpHighlight = s.dpHighlight || s.highlight || null;
    const currentCell = dpHighlight ? [dpHighlight.i ?? dpHighlight.i, dpHighlight.j ?? dpHighlight.j] : null;
    const included = dpHighlight && dpHighlight.type === 'include';
    const affectingCells: [number, number][] = [];
    if (dpHighlight && (dpHighlight.type === 'compare' || dpHighlight.type === 'include' || dpHighlight.type === 'exclude')) {
      // try to glean dependencies from step.selectedItems or row/col labels (best-effort)
      // fallback: empty
    }

    return {
      table,
      currentCell,
      affectingCells,
      included: !!included,
      pseudocodeLine: s.pseudocodeLine ?? (s.snapshot && s.snapshot.pseudocodeLine) ?? -1,
      // keep original for visualizer compatibility
      raw: s,
    };
  });

  return mapped;
}

export default generateKnapsackSteps;
