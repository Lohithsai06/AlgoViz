import { DPStep, DPTableSnapshot, KnapsackGeneratorOpts } from '@/lib/types';

function deepCloneTable(t: number[][]) {
  return t.map((r) => r.slice());
}

export function generateKnapsackSteps(weights: number[], values: number[], capacity: number, opts?: KnapsackGeneratorOpts) {
  const steps: any[] = [];
  const n = Math.min(weights.length, values.length);
  const W = Math.max(0, Math.floor(capacity));
  if (n === 0 || W < 0) return steps;

  // size guard when jumpToFinal requested
  const jumpToFinal = opts?.jumpToFinal ?? false;
  if (jumpToFinal && n * (W + 1) > 50000) {
    // fallback: compute only final dp
    const dp: number[][] = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0));
    const parents: (number | null)[][] = Array.from({ length: n + 1 }, () => Array(W + 1).fill(null));
    for (let i = 1; i <= n; i++) {
      for (let w = 0; w <= W; w++) {
        if (weights[i - 1] <= w) {
          const includeVal = values[i - 1] + dp[i - 1][w - weights[i - 1]];
          const excludeVal = dp[i - 1][w];
          if (includeVal > excludeVal) {
            dp[i][w] = includeVal;
            parents[i][w] = w - weights[i - 1];
          } else {
            dp[i][w] = excludeVal;
          }
        } else {
          dp[i][w] = dp[i - 1][w];
        }
      }
    }
    steps.push({ dpTable: deepCloneTable(dp), dpHighlight: null, rowLabels: ['0', ...weights.map((_, idx) => String(idx + 1))], colLabels: Array.from({ length: W + 1 }, (_, k) => String(k)), pseudocodeLine: 0, parents });
    return steps;
  }

  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0));
  const parents: (number | null)[][] = Array.from({ length: n + 1 }, () => Array(W + 1).fill(null));

  // pseudocode mapping lines:
  // 1: create table
  // 2: for i
  // 3: for w
  // 4: if weight[i-1] <= w
  // 5: include = value + dp[i-1][w-weight]
  // 6: exclude = dp[i-1][w]
  // 7: dp[i][w] = max(...)
  // 8: end

  // initial table snapshot
  steps.push({ dpTable: deepCloneTable(dp), dpHighlight: null, rowLabels: ['0', ...weights.map((_, idx) => String(idx + 1))], colLabels: Array.from({ length: W + 1 }, (_, k) => String(k)), pseudocodeLine: 1 });

  for (let i = 1; i <= n; i++) {
    steps.push({ dpTable: deepCloneTable(dp), dpHighlight: { i, j: 0, type: 'init' }, rowLabels: ['0', ...weights.map((_, idx) => String(idx + 1))], colLabels: Array.from({ length: W + 1 }, (_, k) => String(k)), pseudocodeLine: 2 });
    for (let w = 0; w <= W; w++) {
      // highlight current cell
      steps.push({ dpTable: deepCloneTable(dp), dpHighlight: { i, j: w, type: 'current' }, rowLabels: ['0', ...weights.map((_, idx) => String(idx + 1))], colLabels: Array.from({ length: W + 1 }, (_, k) => String(k)), pseudocodeLine: 3 });

      if (weights[i - 1] <= w) {
        const depIncI = i - 1;
        const depIncW = w - weights[i - 1];
        const depExcI = i - 1;
        const depExcW = w;

        // show dependency include cell
        steps.push({ dpTable: deepCloneTable(dp), dpHighlight: { i: depIncI, j: depIncW, type: 'compare' }, rowLabels: ['0', ...weights.map((_, idx) => String(idx + 1))], colLabels: Array.from({ length: W + 1 }, (_, k) => String(k)), pseudocodeLine: 4 });
        // show dependency exclude cell
        steps.push({ dpTable: deepCloneTable(dp), dpHighlight: { i: depExcI, j: depExcW, type: 'compare' }, rowLabels: ['0', ...weights.map((_, idx) => String(idx + 1))], colLabels: Array.from({ length: W + 1 }, (_, k) => String(k)), pseudocodeLine: 5 });

        const includeVal = values[i - 1] + dp[depIncI][depIncW];
        const excludeVal = dp[depExcI][depExcW];

        if (includeVal > excludeVal) {
          dp[i][w] = includeVal;
          parents[i][w] = depIncW;
          steps.push({ dpTable: deepCloneTable(dp), dpHighlight: { i, j: w, type: 'include' }, rowLabels: ['0', ...weights.map((_, idx) => String(idx + 1))], colLabels: Array.from({ length: W + 1 }, (_, k) => String(k)), pseudocodeLine: 7, note: 'include chosen' });
        } else {
          dp[i][w] = excludeVal;
          parents[i][w] = depExcW; // parent points to same w in previous row
          steps.push({ dpTable: deepCloneTable(dp), dpHighlight: { i, j: w, type: 'exclude' }, rowLabels: ['0', ...weights.map((_, idx) => String(idx + 1))], colLabels: Array.from({ length: W + 1 }, (_, k) => String(k)), pseudocodeLine: 7, note: 'exclude chosen' });
        }

        // write animation step
        steps.push({ dpTable: deepCloneTable(dp), dpHighlight: { i, j: w, type: 'write' }, rowLabels: ['0', ...weights.map((_, idx) => String(idx + 1))], colLabels: Array.from({ length: W + 1 }, (_, k) => String(k)), pseudocodeLine: 7 });
      } else {
        // cannot include - copy from above
        const depI = i - 1;
        const depW = w;
        steps.push({ dpTable: deepCloneTable(dp), dpHighlight: { i: depI, j: depW, type: 'compare' }, rowLabels: ['0', ...weights.map((_, idx) => String(idx + 1))], colLabels: Array.from({ length: W + 1 }, (_, k) => String(k)), pseudocodeLine: 8 });
        dp[i][w] = dp[depI][depW];
        parents[i][w] = depW;
        steps.push({ dpTable: deepCloneTable(dp), dpHighlight: { i, j: w, type: 'write' }, rowLabels: ['0', ...weights.map((_, idx) => String(idx + 1))], colLabels: Array.from({ length: W + 1 }, (_, k) => String(k)), pseudocodeLine: 8 });
      }
    }
  }

  // reconstruction
  const selected: number[] = [];
  let rem = W;
  for (let i = n; i > 0; i--) {
    if (dp[i][rem] !== dp[i - 1][rem]) {
      selected.push(i - 1);
      rem -= weights[i - 1];
      steps.push({ dpTable: deepCloneTable(dp), dpHighlight: { i, j: rem < 0 ? 0 : rem, type: 'select' }, selectedItems: [...selected].reverse(), rowLabels: ['0', ...weights.map((_, idx) => String(idx + 1))], colLabels: Array.from({ length: W + 1 }, (_, k) => String(k)), pseudocodeLine: 9 });
    }
  }

  // final snapshot with parents
  steps.push({ dpTable: deepCloneTable(dp), dpHighlight: null, rowLabels: ['0', ...weights.map((_, idx) => String(idx + 1))], colLabels: Array.from({ length: W + 1 }, (_, k) => String(k)), pseudocodeLine: 0, parents, selectedItems: selected.reverse() });

  return steps;
}

export default generateKnapsackSteps;
