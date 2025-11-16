'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { algorithmsList } from '@/lib/algorithms-data';
import SortingVisualizer from '@/components/visualizers/SortingVisualizer';
import GraphVisualizer from '@/components/visualizers/GraphVisualizer';
import DPTableVisualizer from '@/components/DPTableVisualizer';
import PseudocodeHighlighter from '@/components/PseudocodeHighlighter';
import generateKnapsackSteps from '@/lib/algorithms/knapsackSteps';
import { generateMinCoinsSteps } from '@/lib/steps/generateMinCoinsSteps';
import PlayerControls from '@/components/PlayerControls';
import { Code2, FileText, Info } from 'lucide-react';

type AnimationStep = {
  array: number[] | any[]; // numeric arrays for sorting or snapshot arrays for buckets
  highlightIndices: number[] | string[];
  sortedIndices: number[] | string[];
  pseudocodeLine: number;
  // graph-specific
  nodes?: string[];
  edges?: { from: string; to: string }[];
  currentNode?: string | null;
  visitedNodes?: string[];
  frontier?: string[];
  // directional/interaction helpers
  currentEdge?: { from: string; to: string };
  newlyVisited?: string;
  frontierAction?: 'enqueue' | 'dequeue' | 'peek' | 'enqueue' | 'none';
  stackAction?: 'push' | 'pop' | 'none';
  // weighted-graph helpers
  distances?: Record<string, number | string>;
  pq?: { id: string; dist: number }[];
  selectedEdge?: { from: string; to: string } | null;
  rejectedEdge?: { from: string; to: string } | null;
  updatedDistance?: string | null;
  inMSTEdges?: { from: string; to: string }[];
  // Kruskal / Topo / Bellman-Ford helpers
  edgeListSorted?: { from: string; to: string; weight?: number }[];
  acceptedEdges?: { from: string; to: string }[];
  rejectedEdges?: { from: string; to: string }[];
  unionFind?: Record<string, string>;
  ufAction?: { type: 'find' | 'union' | 'setParent'; a?: string; b?: string; parent?: string } | null;
  indegrees?: Record<string, number>;
  removedEdges?: { from: string; to: string }[];
  negativeCycleEdges?: { from: string; to: string }[];
  affectedNodes?: string[];
  // predecessor / parent map for shortest path reconstruction
  parents?: Record<string, string | null> | null;
  // DP table visualization
  dpTable?: number[][];
  dpHighlight?: { i: number; j: number; type: 'init' | 'compare' | 'include' | 'exclude' | 'match' | 'mismatch' | 'select' | 'current' | 'write' } | null;
  rowLabels?: string[];
  colLabels?: string[];
  selectedItems?: (number | string)[] | null;
  dpSplitTable?: (number | null)[][] | null;
  selectedParenthesization?: string | null;
  // sorting counters (optional)
  iterations?: number;
  comparisons?: number;
  swaps?: number;
  mergeOps?: number;
  bucketOps?: number;
};

// Graph types
type GraphNode = { id: string; x?: number; y?: number };
type GraphEdge = { from: string; to: string; weight?: number };
type GraphData = { nodes: GraphNode[]; edges: GraphEdge[]; directed?: boolean };

export default function AlgorithmDetailPage() {
  const params = useParams();
  const algorithm = algorithmsList.find((algo) => algo.id === params.id);

  const [activeTab, setActiveTab] = useState<'visualization' | 'code' | 'info'>('visualization');
  const [array, setArray] = useState<number[]>([64, 34, 25, 12, 22, 11, 90, 88, 45, 50]);
  const [customInput, setCustomInput] = useState('');
  const [graphState, setGraphState] = useState<GraphData | null>(null);
  const [graphWarning, setGraphWarning] = useState<string | null>(null);
  const [editorOn, setEditorOn] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState(false);
  // Structured custom graph builder state
  const [nodeCount, setNodeCount] = useState<number>(0);
  const [generatedNodes, setGeneratedNodes] = useState<string[]>([]);
  const [edgeFrom, setEdgeFrom] = useState<string>('');
  const [edgeTo, setEdgeTo] = useState<string>('');
  const [edgeWeight, setEdgeWeight] = useState<string>('');
  const [builtEdges, setBuiltEdges] = useState<{ from: string; to: string; weight?: number }[]>([]);
  const [useForceLayout, setUseForceLayout] = useState<boolean>(false);
  // DP custom inputs
  const [dpItemCount, setDpItemCount] = useState<number>(0);
  const [dpWeights, setDpWeights] = useState<string>('');
  const [dpValues, setDpValues] = useState<string>('');
  const [dpCapacity, setDpCapacity] = useState<number>(0);
  const [knapsackJumpToFinal, setKnapsackJumpToFinal] = useState<boolean>(false);
  const [lcsA, setLcsA] = useState<string>('');
  const [lcsB, setLcsB] = useState<string>('');
  const [lisInput, setLisInput] = useState<string>('');
  const [mcmDimensions, setMcmDimensions] = useState<string>('');
  const [coins, setCoins] = useState<string>('1,2,5');
  const [target, setTarget] = useState<string>('11');
  const [speed, setSpeed] = useState(1);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<AnimationStep[]>([]);
  const [shortestPathResult, setShortestPathResult] = useState<Record<string, { distance: number | 'unreachable'; path: string[] | null }> | null>(null);

  useEffect(() => {
    if (algorithm) {
      generateSteps(array);
    }
  }, [algorithm, array, customInput, graphState]);

  const generateSteps = useCallback((arr: number[]) => {
    if (!algorithm) return;

    const newSteps: AnimationStep[] = [];
    // clear previous warnings
    setGraphWarning(null);
    // clear previous shortest-path results when regenerating steps
    setShortestPathResult(null);
    const workingArray = [...arr];

    // counters for sorting algorithms
    const counters = { iterations: 0, comparisons: 0, swaps: 0, mergeOps: 0, bucketOps: 0 };
    const pushStep = (step: AnimationStep) => {
      if (algorithm && algorithm.category === 'Sorting') {
        newSteps.push({ ...step, iterations: counters.iterations, comparisons: counters.comparisons, swaps: counters.swaps, mergeOps: counters.mergeOps, bucketOps: counters.bucketOps });
      } else {
        newSteps.push(step);
      }
    };

    // helpers to derive adjacency maps from exported custom graph if provided
    const buildAdjFromCustom = (directedOverride?: boolean) => {
      if (!graphState) return null;
      const directedFlag = typeof directedOverride === 'boolean' ? directedOverride : !!graphState.directed;
      const adj: Record<string, string[]> = {};
      // initialize nodes
      for (const n of graphState.nodes) adj[n.id] = [];
      for (const e of graphState.edges) {
        adj[e.from] = adj[e.from] || [];
        adj[e.from].push(e.to);
        if (!directedFlag) {
          adj[e.to] = adj[e.to] || [];
          // avoid duplicate push
          if (!adj[e.to].includes(e.from)) adj[e.to].push(e.from);
        } else {
          adj[e.to] = adj[e.to] || [];
        }
      }
      return adj;
    };

    const buildWeightedAdjFromCustom = (directedOverride?: boolean) => {
      if (!graphState) return null;
      const directedFlag = typeof directedOverride === 'boolean' ? directedOverride : !!graphState.directed;
      const adj: Record<string, { to: string; weight: number }[]> = {};
      for (const n of graphState.nodes) adj[n.id] = [];
      for (const e of graphState.edges) {
        adj[e.from] = adj[e.from] || [];
        adj[e.from].push({ to: e.to, weight: e.weight ?? 0 });
        if (!directedFlag) {
          adj[e.to] = adj[e.to] || [];
          // for undirected, ensure reverse
          adj[e.to].push({ to: e.from, weight: e.weight ?? 0 });
        } else {
          adj[e.to] = adj[e.to] || [];
        }
      }
      return adj;
    };

    if (algorithm.id === 'bubble-sort') {
      for (let i = 0; i < workingArray.length; i++) {
        for (let j = 0; j < workingArray.length - i - 1; j++) {
          // comparison
          counters.comparisons++;
          counters.iterations++;
          pushStep({ array: [...workingArray], highlightIndices: [j, j + 1], sortedIndices: [], pseudocodeLine: 2 });

          if (workingArray[j] > workingArray[j + 1]) {
            // swap
            [workingArray[j], workingArray[j + 1]] = [workingArray[j + 1], workingArray[j]];
            counters.swaps++;
            counters.iterations++;
            pushStep({ array: [...workingArray], highlightIndices: [j, j + 1], sortedIndices: [], pseudocodeLine: 3 });
          }
        }
        pushStep({ array: [...workingArray], highlightIndices: [], sortedIndices: Array.from({ length: i + 1 }, (_, k) => workingArray.length - 1 - k), pseudocodeLine: 0 });
      }
    }

    // 0/1 Knapsack DP table generation (delegated to generator)
    if (algorithm.id === 'knapsack') {
      // parse inputs
      let weights: number[] = [];
      let values: number[] = [];
      let capacity = dpCapacity;
      try {
        weights = dpWeights.split(',').map((s) => Number(s.trim())).filter((n) => !isNaN(n));
        values = dpValues.split(',').map((s) => Number(s.trim())).filter((n) => !isNaN(n));
      } catch (e) {
        console.warn('Failed to parse knapsack inputs', e);
      }

      const n = Math.min(weights.length, values.length);
      const W = Math.max(0, Math.floor(capacity));

      // input size guard
      const MAX_CELLS = 60 * 200; // n * (W+1) approx
      if (n * (W + 1) > MAX_CELLS && !knapsackJumpToFinal) {
        setGraphWarning('Knapsack input is large — enable "Jump to Final" to compute only final result.');
        // produce one final snapshot so UI shows something
        const finalSteps = generateKnapsackSteps(weights, values, capacity, { jumpToFinal: true });
        const mapped = finalSteps.map((s: any, idx: number) => {
          return {
            array: [...arr],
            highlightIndices: [],
            sortedIndices: [],
            pseudocodeLine: s.pseudocodeLine ?? 0,
            dpTable: s.dpTable || (s.snapshot && s.snapshot.dp) || (s as any).dpTable,
            dpHighlight: (s as any).dpHighlight || null,
            rowLabels: s.rowLabels || [],
            colLabels: s.colLabels || [],
            selectedItems: s.selectedItems || (s.snapshot && s.snapshot.selectedItems) || null,
          };
        });
        setSteps(mapped as any);
        return;
      }

      const gen = generateKnapsackSteps(weights, values, capacity, { jumpToFinal: knapsackJumpToFinal });
      // generator returns an array of step-like snapshots; map into the page's AnimationStep shape
      const mapped = gen.map((s: any, idx: number) => ({
        array: [...arr],
        highlightIndices: [],
        sortedIndices: [],
        pseudocodeLine: s.pseudocodeLine ?? 0,
        dpTable: s.dpTable || (s.snapshot && s.snapshot.dp) || [],
        dpHighlight: s.dpHighlight || null,
        rowLabels: s.rowLabels || (s.snapshot && s.snapshot.highlighted ? [] : []),
        colLabels: s.colLabels || [],
        selectedItems: s.selectedItems || (s.snapshot && s.snapshot.selectedItems) || null,
        dpSplitTable: s.dpSplitTable || null,
        selectedParenthesization: s.selectedParenthesization || null,
      }));

      setSteps(mapped as any);
      return;
    }

    // Longest Common Subsequence (LCS) DP
    if (algorithm.id === 'lcs') {
      const A = lcsA.split('');
      const B = lcsB.split('');
      const n = A.length, m = B.length;
      const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
      for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
          if (A[i - 1] === B[j - 1]) {
            dp[i][j] = dp[i - 1][j - 1] + 1;
            newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 4, dpTable: dp.map(r => [...r]), dpHighlight: { i, j, type: 'match' }, rowLabels: [''].concat(A), colLabels: [''].concat(B) });
          } else {
            const up = dp[i - 1][j];
            const left = dp[i][j - 1];
            dp[i][j] = Math.max(up, left);
            newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 6, dpTable: dp.map(r => [...r]), dpHighlight: { i, j, type: 'compare' }, rowLabels: [''].concat(A), colLabels: [''].concat(B) });
          }
        }
      }
      // reconstruct LCS by backtracking
      let i = n, j = m;
      const seq: string[] = [];
      while (i > 0 && j > 0) {
        if (A[i - 1] === B[j - 1]) {
          seq.push(A[i - 1]);
          newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 8, dpTable: dp.map(r => [...r]), dpHighlight: { i, j, type: 'select' }, selectedItems: [...seq].reverse(), rowLabels: [''].concat(A), colLabels: [''].concat(B) });
          i--; j--;
        } else if (dp[i - 1][j] >= dp[i][j - 1]) {
          newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 7, dpTable: dp.map(r => [...r]), dpHighlight: { i, j, type: 'exclude' }, rowLabels: [''].concat(A), colLabels: [''].concat(B) });
          i--;
        } else {
          newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 7, dpTable: dp.map(r => [...r]), dpHighlight: { i, j, type: 'exclude' }, rowLabels: [''].concat(A), colLabels: [''].concat(B) });
          j--;
        }
      }
      setSteps(newSteps);
      return;
    }

    // Longest Increasing Subsequence (LIS) DP O(n^2)
    if (algorithm.id === 'lis') {
      const nums = lisInput.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
      const n = nums.length;
      const dpVals = Array(n).fill(1);
      const parent = Array(n).fill(-1);
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < i; j++) {
          newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 3, dpTable: [dpVals.map(v => v)], dpHighlight: { i, j, type: 'compare' }, rowLabels: nums.map(String), colLabels: ['len'] });
          if (nums[j] < nums[i] && dpVals[j] + 1 > dpVals[i]) {
            dpVals[i] = dpVals[j] + 1;
            parent[i] = j;
            newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 4, dpTable: [dpVals.map(v => v)], dpHighlight: { i, j, type: 'include' }, rowLabels: nums.map(String), colLabels: ['len'] });
          }
        }
      }
      // reconstruct LIS
      let maxIdx = 0;
      for (let i = 1; i < n; i++) if (dpVals[i] > dpVals[maxIdx]) maxIdx = i;
      const seq: number[] = [];
      let cur = maxIdx;
      while (cur !== -1) {
        seq.push(nums[cur]);
        newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 6, dpTable: [dpVals.map(v => v)], dpHighlight: { i: cur, j: 0, type: 'select' }, selectedItems: [...seq].reverse(), rowLabels: nums.map(String), colLabels: ['len'] });
        cur = parent[cur];
      }
      setSteps(newSteps);
      return;
    }

    // Matrix Chain Multiplication (MCM)
    if (algorithm.id === 'matrix-chain') {
      const dims = mcmDimensions.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
      if (dims.length < 2) {
        setGraphWarning('Provide at least two dimensions (for one matrix, dims length must be >=2).');
        return;
      }
      const n = dims.length - 1; // number of matrices
      const m: number[][] = Array.from({ length: n }, () => Array(n).fill(Infinity));
      const s: (number | null)[][] = Array.from({ length: n }, () => Array(n).fill(null));
      // m[i][i] = 0
      for (let i = 0; i < n; i++) {
        m[i][i] = 0;
        newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 3, dpTable: m.map(r => [...r]), dpSplitTable: s.map(r => [...r]), dpHighlight: { i, j: i, type: 'init' }, rowLabels: Array.from({ length: n }, (_, k) => `A${k+1}`), colLabels: Array.from({ length: n }, (_, k) => `A${k+1}`) });
      }

      for (let L = 2; L <= n; L++) {
        for (let i = 0; i <= n - L; i++) {
          const j = i + L - 1;
          m[i][j] = Infinity;
          for (let k = i; k < j; k++) {
            const cost = m[i][k] + m[k+1][j] + dims[i] * dims[k+1] * dims[j+1];
            newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 6, dpTable: m.map(r => [...r]), dpSplitTable: s.map(r => [...r]), dpHighlight: { i, j, type: 'compare' }, rowLabels: Array.from({ length: n }, (_, k) => `A${k+1}`), colLabels: Array.from({ length: n }, (_, k) => `A${k+1}`) });
            if (cost < m[i][j]) {
              m[i][j] = cost;
              s[i][j] = k + 1; // store split index in 1-based for readability
              newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 8, dpTable: m.map(r => [...r]), dpSplitTable: s.map(r => [...r]), dpHighlight: { i, j, type: 'include' }, rowLabels: Array.from({ length: n }, (_, k) => `A${k+1}`), colLabels: Array.from({ length: n }, (_, k) => `A${k+1}`) });
            }
          }
        }
      }

      // reconstruct optimal parenthesization using s
      const buildOpt = (i: number, j: number): string => {
        if (i === j) return `A${i+1}`;
        const k = s[i][j];
        if (k === null) return `A${i+1}`;
        const left = buildOpt(i, (k - 1) - 1 + 1 /* adjust */ );
        // compute numeric k index conversion: we stored k as 1-based matrix index of split point => k-1 is zero-based matrix index where left ends
        const kIdx = k - 1;
        const right = buildOpt(kIdx + 1, j);
        const res = `(${left} × ${right})`;
        newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 9, dpTable: m.map(r => [...r]), dpSplitTable: s.map(r => [...r]), dpHighlight: { i, j, type: 'select' }, selectedParenthesization: res, rowLabels: Array.from({ length: n }, (_, k) => `A${k+1}`), colLabels: Array.from({ length: n }, (_, k) => `A${k+1}`) });
        return res;
      };

      const optimal = buildOpt(0, n - 1);
      setSteps(newSteps);
      return;
    }

    // Coin Change (Minimum Coins) is handled via the dedicated generator and custom input

    // Selection Sort steps
    if (algorithm.id === 'selection-sort') {
      const n = workingArray.length;
      for (let i = 0; i < n; i++) {
        // mark starting position and minIdx
        let minIdx = i;
        counters.iterations++;
        pushStep({ array: [...workingArray], highlightIndices: [i, minIdx], sortedIndices: Array.from({ length: i }, (_, k) => k), pseudocodeLine: 1 });

        for (let j = i + 1; j < n; j++) {
          // compare arr[j] with arr[minIdx]
          counters.comparisons++;
          counters.iterations++;
          pushStep({ array: [...workingArray], highlightIndices: [j, minIdx], sortedIndices: Array.from({ length: i }, (_, k) => k), pseudocodeLine: 3 });

          if (workingArray[j] < workingArray[minIdx]) {
            minIdx = j;
            // highlight new minIdx
            counters.iterations++;
            pushStep({ array: [...workingArray], highlightIndices: [j, minIdx], sortedIndices: Array.from({ length: i }, (_, k) => k), pseudocodeLine: 4 });
          }
        }

        // swap if needed
        if (minIdx !== i) {
          [workingArray[i], workingArray[minIdx]] = [workingArray[minIdx], workingArray[i]];
          counters.swaps++;
          counters.iterations++;
          pushStep({ array: [...workingArray], highlightIndices: [i, minIdx], sortedIndices: Array.from({ length: i }, (_, k) => k), pseudocodeLine: 5 });
        }

        // mark position i as sorted
        counters.iterations++;
        pushStep({ array: [...workingArray], highlightIndices: [], sortedIndices: Array.from({ length: i + 1 }, (_, k) => k), pseudocodeLine: 0 });
      }
    }

    // Insertion Sort steps
    if (algorithm.id === 'insertion-sort') {
      const n = workingArray.length;
      for (let i = 1; i < n; i++) {
        const key = workingArray[i];
        let j = i - 1;
        // highlight the key selection
        counters.iterations++;
        pushStep({ array: [...workingArray], highlightIndices: [i], sortedIndices: Array.from({ length: i }, (_, k) => k), pseudocodeLine: 1 });

        // show j initialization
        counters.iterations++;
        pushStep({ array: [...workingArray], highlightIndices: [j, i], sortedIndices: Array.from({ length: i }, (_, k) => k), pseudocodeLine: 2 });

        // shift elements that are greater than key
        while (j >= 0 && workingArray[j] > key) {
          // comparison step
          counters.comparisons++;
          counters.iterations++;
          pushStep({ array: [...workingArray], highlightIndices: [j, i], sortedIndices: Array.from({ length: i }, (_, k) => k), pseudocodeLine: 3 });

          // shift element to the right (not a swap)
          workingArray[j + 1] = workingArray[j];
          counters.iterations++;
          pushStep({ array: [...workingArray], highlightIndices: [j, j + 1], sortedIndices: Array.from({ length: i }, (_, k) => k), pseudocodeLine: 4 });

          // decrement j
          j--;
          counters.iterations++;
          pushStep({ array: [...workingArray], highlightIndices: [j, i >= 0 ? i : 0], sortedIndices: Array.from({ length: i }, (_, k) => k), pseudocodeLine: 5 });
        }

        // insert key at the correct position
        workingArray[j + 1] = key;
        newSteps.push({
          array: [...workingArray],
          highlightIndices: [j + 1],
          sortedIndices: Array.from({ length: i }, (_, k) => k),
          pseudocodeLine: 6, // arr[j+1] = key
        });

        // mark up to i as sorted
        newSteps.push({
          array: [...workingArray],
          highlightIndices: [],
          sortedIndices: Array.from({ length: i + 1 }, (_, k) => k),
          pseudocodeLine: 0,
        });
      }
    }

    // Merge Sort steps
    if (algorithm.id === 'merge-sort') {
      const n = workingArray.length;
      const merge = (left: number, mid: number, right: number) => {
        // pointers for left and right subarrays
        let i = left;
        let j = mid + 1;
        const temp: number[] = [];

        // record start of merge
        pushStep({ array: [...workingArray], highlightIndices: [left, mid, right], sortedIndices: [], pseudocodeLine: 4 });

        while (i <= mid && j <= right) {
          // comparison
          counters.comparisons++;
          counters.iterations++;
          pushStep({ array: [...workingArray], highlightIndices: [i, j], sortedIndices: [], pseudocodeLine: 4 });

          if (workingArray[i] <= workingArray[j]) {
            temp.push(workingArray[i]);
            // record taking from left
            counters.mergeOps++;
            counters.iterations++;
            pushStep({ array: [...workingArray], highlightIndices: [i], sortedIndices: [], pseudocodeLine: 4 });
            i++;
          } else {
            temp.push(workingArray[j]);
            // record taking from right
            counters.mergeOps++;
            counters.iterations++;
            pushStep({ array: [...workingArray], highlightIndices: [j], sortedIndices: [], pseudocodeLine: 4 });
            j++;
          }
        }

        while (i <= mid) {
          temp.push(workingArray[i]);
          counters.mergeOps++;
          counters.iterations++;
          pushStep({ array: [...workingArray], highlightIndices: [i], sortedIndices: [], pseudocodeLine: 4 });
          i++;
        }

        while (j <= right) {
          temp.push(workingArray[j]);
          counters.mergeOps++;
          counters.iterations++;
          pushStep({ array: [...workingArray], highlightIndices: [j], sortedIndices: [], pseudocodeLine: 4 });
          j++;
        }

        // copy back to workingArray and show merging animation
        for (let k = 0; k < temp.length; k++) {
          workingArray[left + k] = temp[k];
          counters.mergeOps++;
          counters.iterations++;
          pushStep({ array: [...workingArray], highlightIndices: [left + k], sortedIndices: [], pseudocodeLine: 4 });
        }

        // optionally mark merged region as "sorted" for visualization clarity
        counters.iterations++;
        pushStep({ array: [...workingArray], highlightIndices: [], sortedIndices: Array.from({ length: right - left + 1 }, (_, idx) => left + idx), pseudocodeLine: 0 });
      };

      const mergeSort = (left: number, right: number) => {
        if (left >= right) return;
        counters.iterations++;
        pushStep({ array: [...workingArray], highlightIndices: [left, right], sortedIndices: [], pseudocodeLine: 0 });

        const mid = Math.floor((left + right) / 2);
        counters.iterations++;
        pushStep({ array: [...workingArray], highlightIndices: [left, mid, right], sortedIndices: [], pseudocodeLine: 1 });

        // recurse left
        counters.iterations++;
        pushStep({ array: [...workingArray], highlightIndices: [left, mid], sortedIndices: [], pseudocodeLine: 2 });
        mergeSort(left, mid);

        // recurse right
        counters.iterations++;
        pushStep({ array: [...workingArray], highlightIndices: [mid + 1, right], sortedIndices: [], pseudocodeLine: 3 });
        mergeSort(mid + 1, right);

        // merge the two halves
        merge(left, mid, right);
      };

      mergeSort(0, n - 1);
    }

    // Quick Sort steps
    if (algorithm.id === 'quick-sort') {
      const n = workingArray.length;

      const partition = (low: number, high: number) => {
        const pivot = workingArray[high];
        let i = low - 1;
        // pivot selection
        counters.iterations++;
        pushStep({ array: [...workingArray], highlightIndices: [high], sortedIndices: [], pseudocodeLine: 1 });

        for (let j = low; j <= high - 1; j++) {
          // compare
          counters.comparisons++;
          counters.iterations++;
          pushStep({ array: [...workingArray], highlightIndices: [j, high], sortedIndices: [], pseudocodeLine: 1 });

          if (workingArray[j] < pivot) {
            i++;
            [workingArray[i], workingArray[j]] = [workingArray[j], workingArray[i]];
            counters.swaps++;
            counters.iterations++;
            pushStep({ array: [...workingArray], highlightIndices: [i, j], sortedIndices: [], pseudocodeLine: 1 });
          }
        }

        // final pivot swap
        [workingArray[i + 1], workingArray[high]] = [workingArray[high], workingArray[i + 1]];
        counters.swaps++;
        counters.iterations++;
        pushStep({ array: [...workingArray], highlightIndices: [i + 1, high], sortedIndices: [], pseudocodeLine: 1 });

        // mark pivot position as sorted for visualization clarity
        counters.iterations++;
        pushStep({ array: [...workingArray], highlightIndices: [], sortedIndices: [i + 1], pseudocodeLine: 0 });

        return i + 1;
      };

      const quickSort = (low: number, high: number) => {
        if (low < high) {
          newSteps.push({
            array: [...workingArray],
            highlightIndices: [low, high],
            sortedIndices: [],
            pseudocodeLine: 0, // if low < high
          });

          const p = partition(low, high);

          newSteps.push({
            array: [...workingArray],
            highlightIndices: [low, p - 1],
            sortedIndices: [],
            pseudocodeLine: 2, // quickSort left
          });
          quickSort(low, p - 1);

          newSteps.push({
            array: [...workingArray],
            highlightIndices: [p + 1, high],
            sortedIndices: [],
            pseudocodeLine: 3, // quickSort right
          });
          quickSort(p + 1, high);
        }
      };

      quickSort(0, n - 1);
    }

    // Heap Sort steps
    if (algorithm.id === 'heap-sort') {
      const n = workingArray.length;

      const heapify = (size: number, root: number) => {
        let largest = root;
        const left = 2 * root + 1;
        const right = 2 * root + 2;
        // compare with left
        if (left < size) {
          counters.comparisons++;
          counters.iterations++;
          pushStep({ array: [...workingArray], highlightIndices: [root, left], sortedIndices: Array.from({ length: n - size }, (_, k) => n - 1 - k), pseudocodeLine: 0 });
          if (workingArray[left] > workingArray[largest]) {
            largest = left;
            counters.iterations++;
            pushStep({ array: [...workingArray], highlightIndices: [largest], sortedIndices: Array.from({ length: n - size }, (_, k) => n - 1 - k), pseudocodeLine: 0 });
          }
        }

        // compare with right
        if (right < size) {
          counters.comparisons++;
          counters.iterations++;
          pushStep({ array: [...workingArray], highlightIndices: [root, right], sortedIndices: Array.from({ length: n - size }, (_, k) => n - 1 - k), pseudocodeLine: 0 });
          if (workingArray[right] > workingArray[largest]) {
            largest = right;
            counters.iterations++;
            pushStep({ array: [...workingArray], highlightIndices: [largest], sortedIndices: Array.from({ length: n - size }, (_, k) => n - 1 - k), pseudocodeLine: 0 });
          }
        }

        if (largest !== root) {
          [workingArray[root], workingArray[largest]] = [workingArray[largest], workingArray[root]];
          counters.swaps++;
          counters.iterations++;
          pushStep({ array: [...workingArray], highlightIndices: [root, largest], sortedIndices: Array.from({ length: n - size }, (_, k) => n - 1 - k), pseudocodeLine: 2 });
          heapify(size, largest);
        }
      };

      // build max heap
      for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        counters.iterations++;
        pushStep({ array: [...workingArray], highlightIndices: [i], sortedIndices: [], pseudocodeLine: 0 });
        heapify(n, i);
      }

      // extract elements from heap
      for (let end = n - 1; end > 0; end--) {
        // swap root (max) with end
        [workingArray[0], workingArray[end]] = [workingArray[end], workingArray[0]];
        counters.swaps++;
        counters.iterations++;
        pushStep({ array: [...workingArray], highlightIndices: [0, end], sortedIndices: Array.from({ length: n - end }, (_, k) => n - 1 - k), pseudocodeLine: 1 });

        // consider end as sorted
        counters.iterations++;
        pushStep({ array: [...workingArray], highlightIndices: [], sortedIndices: Array.from({ length: n - end }, (_, k) => n - 1 - k), pseudocodeLine: 1 });

        // heapify reduced heap
        heapify(end, 0);
        counters.iterations++;
        pushStep({ array: [...workingArray], highlightIndices: [], sortedIndices: Array.from({ length: n - end }, (_, k) => n - 1 - k), pseudocodeLine: 3 });
      }
      // all sorted
      counters.iterations++;
      pushStep({ array: [...workingArray], highlightIndices: [], sortedIndices: Array.from({ length: n }, (_, k) => k), pseudocodeLine: 0 });
    }

    // Counting Sort steps
    if (algorithm.id === 'counting-sort') {
      const n = workingArray.length;
      const maxVal = Math.max(...workingArray);

      counters.iterations++;
      pushStep({ array: [...workingArray], highlightIndices: [], sortedIndices: [], pseudocodeLine: 0 });

      const count = new Array(maxVal + 1).fill(0);
      const output = new Array(n).fill(0);

      // counting frequencies
      for (let i = 0; i < n; i++) {
        count[workingArray[i]]++;
        counters.bucketOps++;
        counters.iterations++;
        pushStep({ array: [...workingArray], highlightIndices: [i], sortedIndices: [], pseudocodeLine: 2 });

        // show current count array snapshot (visualized in main area)
        counters.iterations++;
        pushStep({ array: [...count], highlightIndices: [], sortedIndices: [], pseudocodeLine: 2 });
      }

      // prefix sums
      for (let i = 1; i < count.length; i++) {
        count[i] += count[i - 1];
        counters.iterations++;
        pushStep({ array: [...count], highlightIndices: [i], sortedIndices: [], pseudocodeLine: 3 });
      }

      // build output (stable, iterate from end)
      for (let i = n - 1; i >= 0; i--) {
        const val = workingArray[i];
        const pos = count[val] - 1;
        output[pos] = val;
        count[val]--;
        counters.bucketOps++;
        counters.iterations++;
        pushStep({ array: [...output], highlightIndices: [pos], sortedIndices: [], pseudocodeLine: 4 });

        counters.iterations++;
        pushStep({ array: [...count], highlightIndices: [], sortedIndices: [], pseudocodeLine: 4 });
      }

      // copy back to workingArray
      for (let i = 0; i < n; i++) {
        workingArray[i] = output[i];
        counters.iterations++;
        counters.mergeOps++;
        pushStep({ array: [...workingArray], highlightIndices: [i], sortedIndices: Array.from({ length: i + 1 }, (_, k) => k), pseudocodeLine: 5 });
      }
    }

    // Radix Sort (LSD) steps
    if (algorithm.id === 'radix-sort') {
      const n = workingArray.length;
      const maxVal = Math.max(...workingArray);
      let exp = 1;

      let pass = 0;
      while (Math.floor(maxVal / exp) > 0) {
        // start pass
        counters.iterations++;
        pushStep({ array: [...workingArray], highlightIndices: [], sortedIndices: [], pseudocodeLine: 0 });

        const output = new Array(n).fill(0);
        const count = new Array(10).fill(0);

        // count digits
        for (let i = 0; i < n; i++) {
          const digit = Math.floor((workingArray[i] / exp) % 10);
          count[digit]++;
          counters.bucketOps++;
          counters.iterations++;
          pushStep({ array: [...workingArray], highlightIndices: [i], sortedIndices: [], pseudocodeLine: 1 });

          // show buckets as count snapshot
          counters.iterations++;
          pushStep({ array: [...count], highlightIndices: [], sortedIndices: [], pseudocodeLine: 1 });
        }

        // prefix sums for stable order
        for (let i = 1; i < 10; i++) {
          count[i] += count[i - 1];
          counters.iterations++;
          pushStep({ array: [...count], highlightIndices: [i], sortedIndices: [], pseudocodeLine: 1 });
        }

        // build output stable from end
        for (let i = n - 1; i >= 0; i--) {
          const digit = Math.floor((workingArray[i] / exp) % 10);
          const pos = count[digit] - 1;
          output[pos] = workingArray[i];
          count[digit]--;
          counters.bucketOps++;
          counters.iterations++;
          pushStep({ array: [...output], highlightIndices: [pos], sortedIndices: [], pseudocodeLine: 1 });

          counters.iterations++;
          pushStep({ array: [...count], highlightIndices: [], sortedIndices: [], pseudocodeLine: 1 });
        }

        // copy output back to workingArray
        for (let i = 0; i < n; i++) {
          workingArray[i] = output[i];
          counters.iterations++;
          counters.mergeOps++;
          pushStep({ array: [...workingArray], highlightIndices: [i], sortedIndices: [], pseudocodeLine: 2 });
        }

        exp *= 10;
        pass++;
        // mark end of pass
        newSteps.push({
          array: [...workingArray],
          highlightIndices: [],
          sortedIndices: [],
          pseudocodeLine: 0,
        });
      }
    }

    // BFS generation
    if (algorithm.id === 'bfs') {
      const parseGraph = () => {
        // prefer the customGraph exported from editor
        const fromCustom = buildAdjFromCustom();
        if (fromCustom) return fromCustom;
        try {
          if (customInput && customInput.trim().length > 0) {
            const parsed = JSON.parse(customInput);
            // adjacency map object { A: [B,C], ... }
            if (typeof parsed === 'object' && !Array.isArray(parsed)) {
              return parsed as Record<string, string[]>;
            }
            // edge list [[from,to], ...]
            if (Array.isArray(parsed)) {
              const adj: Record<string, string[]> = {};
              parsed.forEach((e: any) => {
                if (Array.isArray(e) && e.length >= 2) {
                  const [from, to] = e;
                  adj[from] = adj[from] || [];
                  adj[from].push(to);
                  // ensure nodes exist
                  adj[to] = adj[to] || [];
                }
              });
              return adj;
            }
          }
        } catch (e) {
          // ignore parse errors
        }
        // default sample graph
        return {
          A: ['B', 'C'],
          B: ['D', 'E'],
          C: ['F'],
          D: [],
          E: ['F'],
          F: [],
        } as Record<string, string[]>;
      };

      const adj = parseGraph();
      const nodes = Array.from(new Set(Object.keys(adj).concat(...Object.values(adj).flat())));
      const edges: { from: string; to: string }[] = [];
      Object.entries(adj).forEach(([k, vs]) => vs.forEach((v) => edges.push({ from: k, to: v })));

      const visited = new Set<string>();
      const queue: string[] = [];

      const start = nodes[0];
      const parents: Record<string, string | null> = {};
      nodes.forEach((n) => (parents[n] = null));
      // mark start visited
      visited.add(start);
      parents[start] = null;
      newSteps.push({
        array: [...arr],
        highlightIndices: [],
        sortedIndices: [],
        pseudocodeLine: 1, // mark start as visited
        nodes,
        edges,
        currentNode: null,
        visitedNodes: Array.from(visited),
        frontier: [],
      });

      // enqueue start
      queue.push(start);
      newSteps.push({
        array: [...arr],
        highlightIndices: [],
        sortedIndices: [],
        pseudocodeLine: 2, // Q.enqueue(start)
        nodes,
        edges,
        currentNode: null,
        visitedNodes: Array.from(visited),
        frontier: [...queue],
        frontierAction: 'enqueue',
      });

      while (queue.length > 0) {
        newSteps.push({
          array: [...arr],
          highlightIndices: [],
          sortedIndices: [],
          pseudocodeLine: 3, // while Q not empty
          nodes,
          edges,
          currentNode: null,
          visitedNodes: Array.from(visited),
          frontier: [...queue],
          frontierAction: 'peek',
        });

        const v = queue.shift()!;
        // dequeue action
        newSteps.push({
          array: [...arr],
          highlightIndices: [],
          sortedIndices: [],
          pseudocodeLine: 4, // v = Q.dequeue()
          nodes,
          edges,
          currentNode: v,
          visitedNodes: Array.from(visited),
          frontier: [...queue],
          frontierAction: 'dequeue',
        });

        for (const w of adj[v] || []) {
          // show traversal edge
          newSteps.push({
            array: [...arr],
            highlightIndices: [],
            sortedIndices: [],
            pseudocodeLine: 5, // for each neighbor w
            nodes,
            edges,
            currentNode: v,
            visitedNodes: Array.from(visited),
            frontier: [...queue],
            currentEdge: { from: v, to: w },
          });

          if (!visited.has(w)) {
            visited.add(w);
            // record parent for shortest-path reconstruction
            parents[w] = v;
            // mark visited and enqueue
            newSteps.push({
              array: [...arr],
              highlightIndices: [],
              sortedIndices: [],
              pseudocodeLine: 6, // mark w as visited
              nodes,
              edges,
              currentNode: v,
              visitedNodes: Array.from(visited),
              frontier: [...queue],
              newlyVisited: w,
              parents: { ...parents },
            });

            queue.push(w);
            newSteps.push({
              array: [...arr],
              highlightIndices: [],
              sortedIndices: [],
              pseudocodeLine: 7, // Q.enqueue(w)
              nodes,
              edges,
              currentNode: v,
              visitedNodes: Array.from(visited),
              frontier: [...queue],
              frontierAction: 'enqueue',
            });
          }
        }
      }

      // final snapshot with parents map
      newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 8, nodes, edges, visitedNodes: Array.from(visited), parents: { ...parents } });
      // compute shortest-path result for BFS
      const bfsResult: Record<string, { distance: number | 'unreachable'; path: string[] | null }> = {};
      const startNode = nodes[0];
      for (const n of nodes) {
        if (!visited.has(n)) {
          bfsResult[n] = { distance: 'unreachable', path: null };
          continue;
        }
        const path: string[] = [];
        let cur: string | null = n;
        while (cur != null) {
          path.push(cur);
          cur = parents[cur] ?? null;
        }
        const fullPath = path.reverse();
        const dist = fullPath.length > 0 ? fullPath.length - 1 : 0;
        bfsResult[n] = { distance: dist, path: fullPath };
      }
      setSteps(newSteps);
      setShortestPathResult(bfsResult);
      return;
    }

    // Bellman-Ford Algorithm
    if (algorithm.id === 'bellman-ford') {
      const parseWeightedGraph = () => {
        // prefer customGraph if provided
        const fromCustom = buildWeightedAdjFromCustom();
        if (fromCustom) return fromCustom;
        try {
          if (customInput && customInput.trim().length > 0) {
            const parsed = JSON.parse(customInput);
            if (typeof parsed === 'object' && !Array.isArray(parsed)) {
              const adj: Record<string, { to: string; weight: number }[]> = {};
              Object.entries(parsed).forEach(([k, vs]) => {
                adj[k] = [];
                if (Array.isArray(vs)) {
                  vs.forEach((entry: any) => {
                    if (Array.isArray(entry) && entry.length >= 2) {
                      adj[k].push({ to: String(entry[0]), weight: Number(entry[1]) });
                    } else if (entry && typeof entry === 'object') {
                      const to = entry.to ?? entry[0];
                      const w = entry.weight ?? entry[1] ?? 0;
                      adj[k].push({ to: String(to), weight: Number(w) });
                    }
                  });
                }
              });
              return adj;
            }
            if (Array.isArray(parsed)) {
              const adj: Record<string, { to: string; weight: number }[]> = {};
              parsed.forEach((e: any) => {
                if (Array.isArray(e) && e.length >= 3) {
                  const [from, to, w] = e;
                  adj[from] = adj[from] || [];
                  adj[from].push({ to: String(to), weight: Number(w) });
                  adj[to] = adj[to] || [];
                }
              });
              return adj;
            }
          }
        } catch (e) {}
        return {
          A: [{ to: 'B', weight: 4 }, { to: 'C', weight: 5 }],
          B: [{ to: 'C', weight: -10 }],
          C: [],
        } as Record<string, { to: string; weight: number }[]>;
      };

      const adj = parseWeightedGraph();
      const nodes = Array.from(new Set(Object.keys(adj).concat(...Object.values(adj).flat().map((x) => x.to))));
      const edges: { from: string; to: string; weight?: number }[] = [];
      Object.entries(adj).forEach(([k, vs]) => vs.forEach((v) => edges.push({ from: k, to: v.to, weight: v.weight })));

      // warn if negative weights present (Dijkstra is unsuitable)
      if (edges.some((e) => (e.weight ?? 0) < 0)) {
        setGraphWarning('Graph contains negative edge weights — Dijkstra may produce incorrect results. Use Bellman-Ford for graphs with negative weights.');
      }

      const dist: Record<string, number> = {};
      const parents: Record<string, string | null> = {};
      nodes.forEach((n) => (dist[n] = Infinity));
      nodes.forEach((n) => (parents[n] = null));
      const start = nodes[0];
      dist[start] = 0;

      // initial
      newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 0, nodes, edges, distances: { ...dist } });

      const V = nodes.length;
      // relax edges V-1 times
      for (let iter = 1; iter <= V - 1; iter++) {
        for (const e of edges) {
          newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 1, nodes, edges, currentEdge: { from: e.from, to: e.to }, distances: { ...dist } });
          const u = e.from;
          const v = e.to;
          const w = e.weight ?? 0;
          const alt = dist[u] + w;
          if (alt < dist[v]) {
            dist[v] = alt;
            // record predecessor for path reconstruction
            parents[v] = u;
            newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 2, nodes, edges, currentEdge: { from: u, to: v }, distances: { ...dist }, updatedDistance: v, parents: { ...parents } });
          } else {
            newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 2, nodes, edges, currentEdge: { from: u, to: v }, distances: { ...dist }, parents: { ...parents } });
          }
        }
        // snapshot end of iteration
        newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 3, nodes, edges, distances: { ...dist }, parents: { ...parents } });
      }

      // check for negative cycles
      const negEdges: { from: string; to: string }[] = [];
      const affected: string[] = [];
      for (const e of edges) {
        const u = e.from;
        const v = e.to;
        const w = e.weight ?? 0;
        if (dist[u] + w < dist[v]) {
          negEdges.push({ from: u, to: v });
          affected.push(v);
          newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 4, nodes, edges, currentEdge: { from: u, to: v }, negativeCycleEdges: [...negEdges], affectedNodes: [...affected] });
        }
      }
      newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 5, nodes, edges, distances: { ...dist }, negativeCycleEdges: [...negEdges], affectedNodes: [...affected] });
      if (negEdges.length > 0) {
        setGraphWarning('Negative cycle detected — Bellman-Ford found edges involved in a negative cycle.');
      }
      // compute shortest-path result for Bellman-Ford (if any)
      const bfResult: Record<string, { distance: number | 'unreachable'; path: string[] | null }> = {};
      for (const n of nodes) {
        const d = dist[n];
        if (d === Infinity) {
          bfResult[n] = { distance: 'unreachable', path: null };
          continue;
        }
        const path: string[] = [];
        let cur: string | null = n;
        const seen = new Set<string>();
        while (cur != null && !seen.has(cur)) {
          seen.add(cur);
          path.push(cur);
          cur = parents[cur] ?? null;
        }
        bfResult[n] = { distance: d, path: path.reverse() };
      }
      setSteps(newSteps);
      setShortestPathResult(bfResult);
      return;
    }

    // Kruskal's Algorithm (MST)
    if (algorithm.id === 'kruskal') {
      const parseWeightedEdges = () => {
        // prefer centralized graphState edge list if provided
        if (graphState && graphState.edges && graphState.edges.length > 0) {
          return graphState.edges.map((e) => ({ from: e.from, to: e.to, weight: e.weight ?? 0 }));
        }
        try {
          if (customInput && customInput.trim().length > 0) {
            const parsed = JSON.parse(customInput);
            // edge list [[from,to,weight], ...]
            if (Array.isArray(parsed)) {
              const edges: { from: string; to: string; weight: number }[] = [];
              parsed.forEach((e: any) => {
                if (Array.isArray(e) && e.length >= 3) {
                  edges.push({ from: String(e[0]), to: String(e[1]), weight: Number(e[2]) });
                }
              });
              return edges;
            }
          }
        } catch (e) {}
        // default
        return [
          { from: 'A', to: 'B', weight: 4 },
          { from: 'A', to: 'C', weight: 2 },
          { from: 'C', to: 'B', weight: 5 },
          { from: 'C', to: 'E', weight: 3 },
          { from: 'E', to: 'D', weight: 4 },
          { from: 'B', to: 'D', weight: 10 },
        ];
      };

      const edgesList = parseWeightedEdges();
      const nodes = Array.from(new Set(edgesList.flatMap((e) => [e.from, e.to])));
      const edges = edgesList.map((e) => ({ from: e.from, to: e.to, weight: e.weight }));

      // DSU
      const parent: Record<string, string> = {};
      const rank: Record<string, number> = {};
      nodes.forEach((n) => { parent[n] = n; rank[n] = 0; });

      const find = (x: string) => {
        if (parent[x] !== x) {
          const p = find(parent[x]);
          parent[x] = p;
        }
        return parent[x];
      };

      const union = (a: string, b: string) => {
        const ra = find(a);
        const rb = find(b);
        if (ra === rb) return false;
        if (rank[ra] < rank[rb]) parent[ra] = rb;
        else if (rank[ra] > rank[rb]) parent[rb] = ra;
        else { parent[rb] = ra; rank[ra]++; }
        return true;
      };

      // sort edges by weight
      const sorted = [...edges].sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0));

      const accepted: { from: string; to: string }[] = [];
      const rejected: { from: string; to: string }[] = [];

      // initial snapshot with sorted list
      newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 0, nodes, edges, edgeListSorted: sorted, acceptedEdges: [], rejectedEdges: [], unionFind: { ...parent } });

      for (let i = 0; i < sorted.length; i++) {
        const e = sorted[i];
        // evaluate edge
        newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 1, nodes, edges, edgeListSorted: sorted, currentEdge: { from: e.from, to: e.to }, unionFind: { ...parent } });

        // show find operations
        newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 2, nodes, edges, edgeListSorted: sorted, currentEdge: { from: e.from, to: e.to }, ufAction: { type: 'find', a: e.from, b: e.to }, unionFind: { ...parent } });

        const ra = find(e.from);
        const rb = find(e.to);
        if (ra !== rb) {
          // union and accept
          union(e.from, e.to);
          accepted.push({ from: e.from, to: e.to });
          newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 3, nodes, edges, edgeListSorted: sorted, currentEdge: { from: e.from, to: e.to }, acceptedEdges: [...accepted], unionFind: { ...parent }, ufAction: { type: 'union', a: e.from, b: e.to } });
        } else {
          // reject cycle
          rejected.push({ from: e.from, to: e.to });
          newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 4, nodes, edges, edgeListSorted: sorted, currentEdge: { from: e.from, to: e.to }, rejectedEdges: [...rejected], unionFind: { ...parent }, ufAction: { type: 'find', a: e.from, b: e.to } });
        }
      }

      newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 5, nodes, edges, edgeListSorted: sorted, acceptedEdges: [...accepted], rejectedEdges: [...rejected], unionFind: { ...parent } });
      setSteps(newSteps);
      return;
    }

    // DFS generation (recursive)
    if (algorithm.id === 'dfs') {
      const parseGraph = () => {
        const fromCustom = buildAdjFromCustom();
        if (fromCustom) return fromCustom;
        try {
          if (customInput && customInput.trim().length > 0) {
            const parsed = JSON.parse(customInput);
            if (typeof parsed === 'object' && !Array.isArray(parsed)) {
              return parsed as Record<string, string[]>;
            }
            if (Array.isArray(parsed)) {
              const adj: Record<string, string[]> = {};
              parsed.forEach((e: any) => {
                if (Array.isArray(e) && e.length >= 2) {
                  const [from, to] = e;
                  adj[from] = adj[from] || [];
                  adj[from].push(to);
                  adj[to] = adj[to] || [];
                }
              });
              return adj;
            }
          }
        } catch (e) {}
        return {
          A: ['B', 'C'],
          B: ['D'],
          C: ['E'],
          D: [],
          E: [],
        } as Record<string, string[]>;
      };

      const adj = parseGraph();
      const nodes = Array.from(new Set(Object.keys(adj).concat(...Object.values(adj).flat())));
      const edges: { from: string; to: string }[] = [];
      Object.entries(adj).forEach(([k, vs]) => vs.forEach((v) => edges.push({ from: k, to: v })));

      const visited = new Set<string>();
      const stack: string[] = [];

      const dfs = (v: string) => {
        visited.add(v);
        stack.push(v);
        newSteps.push({
          array: [...arr],
          highlightIndices: [],
          sortedIndices: [],
          pseudocodeLine: 0, // mark v as visited
          nodes,
          edges,
          currentNode: v,
          visitedNodes: Array.from(visited),
          frontier: [...stack],
          stackAction: 'push',
          newlyVisited: v,
        });

        for (const w of adj[v] || []) {
          newSteps.push({
            array: [...arr],
            highlightIndices: [],
            sortedIndices: [],
            pseudocodeLine: 1, // for each neighbor
            nodes,
            edges,
            currentNode: v,
            visitedNodes: Array.from(visited),
            frontier: [...stack],
            currentEdge: { from: v, to: w },
          });

          if (!visited.has(w)) {
            newSteps.push({
              array: [...arr],
              highlightIndices: [],
              sortedIndices: [],
              pseudocodeLine: 2, // DFS(w)
              nodes,
              edges,
              currentNode: v,
              visitedNodes: Array.from(visited),
              frontier: [...stack],
              stackAction: 'push',
            });
            dfs(w);
          }
        }

        stack.pop();
        newSteps.push({
          array: [...arr],
          highlightIndices: [],
          sortedIndices: [],
          pseudocodeLine: 0,
          nodes,
          edges,
          currentNode: null,
          visitedNodes: Array.from(visited),
          frontier: [...stack],
          stackAction: 'pop',
        });
      };

      const start = nodes[0];
      dfs(start);
      setSteps(newSteps);
      return;
    }

    // Topological Sort (Kahn's algorithm)
    if (algorithm.id === 'topological-sort') {
      const parseGraph = () => {
        const fromCustom = buildAdjFromCustom();
        if (fromCustom) return fromCustom;
        try {
          if (customInput && customInput.trim().length > 0) {
            const parsed = JSON.parse(customInput);
            if (typeof parsed === 'object' && !Array.isArray(parsed)) {
              return parsed as Record<string, string[]>;
            }
            if (Array.isArray(parsed)) {
              const adj: Record<string, string[]> = {};
              parsed.forEach((e: any) => {
                if (Array.isArray(e) && e.length >= 2) {
                  const [from, to] = e;
                  adj[from] = adj[from] || [];
                  adj[from].push(to);
                  adj[to] = adj[to] || [];
                }
              });
              return adj;
            }
          }
        } catch (e) {}
        return { A: ['C'], B: ['C'], C: ['D'], D: [] } as Record<string, string[]>;
      };

      const adj = parseGraph();
      const nodes = Array.from(new Set(Object.keys(adj).concat(...Object.values(adj).flat())));
      const edges: { from: string; to: string }[] = [];
      Object.entries(adj).forEach(([k, vs]) => vs.forEach((v) => edges.push({ from: k, to: v })));

      const indeg: Record<string, number> = {};
      nodes.forEach((n) => (indeg[n] = 0));
      for (const [u, vs] of Object.entries(adj)) vs.forEach((v) => indeg[v] = (indeg[v] || 0) + 1);

      const q: string[] = [];
      Object.entries(indeg).forEach(([k, v]) => { if (v === 0) q.push(k); });

      newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 0, nodes, edges, indegrees: { ...indeg }, frontier: [...q] });

      const removedEdges: { from: string; to: string }[] = [];
      let popped = 0;
      while (q.length > 0) {
        const u = q.shift()!;
        popped++;
        newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 1, nodes, edges, currentNode: u, indegrees: { ...indeg }, frontier: [...q] });

        // remove u and decrease indegree
        for (const v of adj[u] || []) {
          removedEdges.push({ from: u, to: v });
          indeg[v] = indeg[v] - 1;
          newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 2, nodes, edges, currentNode: u, indegrees: { ...indeg }, removedEdges: [...removedEdges], frontier: [...q], newlyVisited: v });
          if (indeg[v] === 0) {
            q.push(v);
            newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 3, nodes, edges, indegrees: { ...indeg }, frontier: [...q], frontierAction: 'enqueue' });
          }
        }
      }

      newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 4, nodes, edges, indegrees: { ...indeg }, removedEdges: [...removedEdges] });
      // if popped < nodes.length then cycle exists
      if (popped < nodes.length) {
        setGraphWarning('Graph contains a cycle — topological sort not possible on this graph');
      }
      setSteps(newSteps);
      return;
    }

    // Dijkstra's Algorithm (weighted shortest paths)
    if (algorithm.id === 'dijkstra') {
      const parseWeightedGraph = () => {
        const fromCustom = buildWeightedAdjFromCustom();
        if (fromCustom) return fromCustom;
        try {
          if (customInput && customInput.trim().length > 0) {
            const parsed = JSON.parse(customInput);
            // object adjacency map { A: [ [B, w], {to: C, weight: 2}, ... ] }
            if (typeof parsed === 'object' && !Array.isArray(parsed)) {
              const adj: Record<string, { to: string; weight: number }[]> = {};
              Object.entries(parsed).forEach(([k, vs]) => {
                adj[k] = [];
                if (Array.isArray(vs)) {
                  vs.forEach((entry: any) => {
                    if (Array.isArray(entry) && entry.length >= 2) {
                      adj[k].push({ to: String(entry[0]), weight: Number(entry[1]) });
                    } else if (entry && typeof entry === 'object' && (entry.to || entry[0])) {
                      const to = entry.to ?? entry[0];
                      const weight = entry.weight ?? entry[1] ?? entry.w ?? 1;
                      adj[k].push({ to: String(to), weight: Number(weight) });
                    }
                  });
                }
              });
              return adj;
            }

            // edge list [[from,to,weight], ...]
            if (Array.isArray(parsed)) {
              const adj: Record<string, { to: string; weight: number }[]> = {};
              parsed.forEach((e: any) => {
                if (Array.isArray(e) && e.length >= 3) {
                  const [from, to, w] = e;
                  adj[from] = adj[from] || [];
                  adj[from].push({ to: String(to), weight: Number(w) });
                  // ensure nodes exist
                  adj[to] = adj[to] || [];
                }
              });
              return adj;
            }
          }
        } catch (e) {}

        // default weighted graph
        return {
          A: [{ to: 'B', weight: 4 }, { to: 'C', weight: 2 }],
          B: [{ to: 'C', weight: 5 }, { to: 'D', weight: 10 }],
          C: [{ to: 'E', weight: 3 }],
          D: [{ to: 'F', weight: 11 }],
          E: [{ to: 'D', weight: 4 }],
          F: [],
        } as Record<string, { to: string; weight: number }[]>;
      };

      const adj = parseWeightedGraph();
      const nodes = Array.from(new Set(Object.keys(adj).concat(...Object.values(adj).flat().map((x) => x.to))));
      const edges: { from: string; to: string; weight?: number }[] = [];
      Object.entries(adj).forEach(([k, vs]) => vs.forEach((v) => edges.push({ from: k, to: v.to, weight: v.weight })));

      const dist: Record<string, number> = {};
      const visited = new Set<string>();
      const pq: { id: string; dist: number }[] = [];

      const start = nodes[0];
      nodes.forEach((n) => (dist[n] = Infinity));
      dist[start] = 0;
      const parents: Record<string, string | null> = {};
      nodes.forEach((n) => (parents[n] = null));

      // initial step: distances
      newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 0, nodes, edges, distances: { ...dist }, pq: [], visitedNodes: Array.from(visited) });

      // push to pq
      pq.push({ id: start, dist: 0 });
      newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 1, nodes, edges, distances: { ...dist }, pq: [...pq], frontierAction: 'enqueue', visitedNodes: Array.from(visited) });

      while (pq.length > 0) {
        // extract min
        pq.sort((a, b) => a.dist - b.dist);
        const uEntry = pq.shift()!;
        const u = uEntry.id;
        newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 2, nodes, edges, currentNode: u, distances: { ...dist }, pq: [...pq], frontierAction: 'dequeue', visitedNodes: Array.from(visited) });

        if (visited.has(u)) continue;
        visited.add(u);
        // mark visited
        newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 3, nodes, edges, currentNode: u, distances: { ...dist }, pq: [...pq], visitedNodes: Array.from(visited) });

        for (const e of adj[u] || []) {
          const v = e.to;
          const w = e.weight;
          // show traversal
          newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 4, nodes, edges, currentNode: u, distances: { ...dist }, pq: [...pq], currentEdge: { from: u, to: v }, visitedNodes: Array.from(visited) });

          const alt = dist[u] + w;
          if (alt < dist[v]) {
            dist[v] = alt;
            parents[v] = u;
            // update distance visibly
            // enqueue/update pq
            const existing = pq.findIndex((p) => p.id === v);
            if (existing >= 0) pq[existing].dist = alt;
            else pq.push({ id: v, dist: alt });

            newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 5, nodes, edges, currentNode: u, distances: { ...dist }, pq: [...pq].sort((a,b)=>a.dist-b.dist), visitedNodes: Array.from(visited), currentEdge: { from: u, to: v }, selectedEdge: { from: u, to: v }, updatedDistance: v, frontierAction: 'enqueue', parents: { ...parents } });
          } else {
            // show non-improving comparison
            newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 5, nodes, edges, currentNode: u, distances: { ...dist }, pq: [...pq], visitedNodes: Array.from(visited), currentEdge: { from: u, to: v }, rejectedEdge: { from: u, to: v }, parents: { ...parents } });
          }
        }
      }

      // final distances
      newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 6, nodes, edges, distances: { ...dist }, visitedNodes: Array.from(visited), pq: [], parents: { ...parents } });
      // compute Dijkstra shortest-path results
      const djResult: Record<string, { distance: number | 'unreachable'; path: string[] | null }> = {};
      for (const n of nodes) {
        const d = dist[n];
        if (d === Infinity) {
          djResult[n] = { distance: 'unreachable', path: null };
          continue;
        }
        const path: string[] = [];
        let cur: string | null = n;
        const seen = new Set<string>();
        while (cur != null && !seen.has(cur)) {
          seen.add(cur);
          path.push(cur);
          cur = parents[cur] ?? null;
        }
        djResult[n] = { distance: d, path: path.reverse() };
      }
      setSteps(newSteps);
      setShortestPathResult(djResult);
      return;
    }

    // Prim's MST
    if (algorithm.id === 'prim') {
      const parseWeightedGraph = () => {
        const fromCustom = buildWeightedAdjFromCustom();
        if (fromCustom) return fromCustom;
        try {
          if (customInput && customInput.trim().length > 0) {
            const parsed = JSON.parse(customInput);
            if (typeof parsed === 'object' && !Array.isArray(parsed)) {
              const adj: Record<string, { to: string; weight: number }[]> = {};
              Object.entries(parsed).forEach(([k, vs]) => {
                adj[k] = [];
                if (Array.isArray(vs)) {
                  vs.forEach((entry: any) => {
                    if (Array.isArray(entry) && entry.length >= 2) {
                      adj[k].push({ to: String(entry[0]), weight: Number(entry[1]) });
                    } else if (entry && typeof entry === 'object' && (entry.to || entry[0])) {
                      const to = entry.to ?? entry[0];
                      const weight = entry.weight ?? entry[1] ?? entry.w ?? 1;
                      adj[k].push({ to: String(to), weight: Number(weight) });
                    }
                  });
                }
              });
              return adj;
            }
            if (Array.isArray(parsed)) {
              const adj: Record<string, { to: string; weight: number }[]> = {};
              parsed.forEach((e: any) => {
                if (Array.isArray(e) && e.length >= 3) {
                  const [from, to, w] = e;
                  adj[from] = adj[from] || [];
                  adj[from].push({ to: String(to), weight: Number(w) });
                  adj[to] = adj[to] || [];
                }
              });
              return adj;
            }
          }
        } catch (e) {}
        // default graph
        return {
          A: [{ to: 'B', weight: 4 }, { to: 'C', weight: 2 }],
          B: [{ to: 'A', weight: 4 }, { to: 'C', weight: 5 }, { to: 'D', weight: 10 }],
          C: [{ to: 'A', weight: 2 }, { to: 'B', weight: 5 }, { to: 'E', weight: 3 }],
          D: [{ to: 'B', weight: 10 }, { to: 'E', weight: 7 }],
          E: [{ to: 'C', weight: 3 }, { to: 'D', weight: 7 }],
        } as Record<string, { to: string; weight: number }[]>;
      };

      const adj = parseWeightedGraph();
      const nodes = Array.from(new Set(Object.keys(adj).concat(...Object.values(adj).flat().map((x) => x.to))));
      const edges: { from: string; to: string; weight?: number }[] = [];
      Object.entries(adj).forEach(([k, vs]) => vs.forEach((v) => edges.push({ from: k, to: v.to, weight: v.weight })));

      const inMST = new Set<string>();
      const key: Record<string, number> = {};
      const parent: Record<string, string | null> = {};
      const pq: { id: string; dist: number }[] = [];

      nodes.forEach((n) => { key[n] = Infinity; parent[n] = null; });
      const start = nodes[0];
      key[start] = 0;
      pq.push({ id: start, dist: 0 });

      // initial
      newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 0, nodes, edges, distances: { ...key }, pq: [...pq], inMSTEdges: [] });

      const mstEdges: { from: string; to: string }[] = [];

      while (pq.length > 0) {
        pq.sort((a, b) => a.dist - b.dist);
        const u = pq.shift()!.id;
        if (inMST.has(u)) continue;
        // extract-min
        newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 1, nodes, edges, currentNode: u, distances: { ...key }, pq: [...pq], frontierAction: 'dequeue', inMSTEdges: [...mstEdges] });

        inMST.add(u);
        newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 2, nodes, edges, currentNode: u, distances: { ...key }, pq: [...pq], visitedNodes: Array.from(inMST), inMSTEdges: [...mstEdges] });

        for (const e of adj[u] || []) {
          const v = e.to;
          const w = e.weight;
          // show comparison
          newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 3, nodes, edges, currentNode: u, currentEdge: { from: u, to: v }, distances: { ...key }, pq: [...pq], inMSTEdges: [...mstEdges] });

          if (!inMST.has(v) && w < key[v]) {
            key[v] = w;
            parent[v] = u;
            // update pq
            const existing = pq.findIndex((p) => p.id === v);
            if (existing >= 0) pq[existing].dist = w;
            else pq.push({ id: v, dist: w });

            newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 4, nodes, edges, currentNode: u, selectedEdge: { from: u, to: v }, distances: { ...key }, pq: [...pq].sort((a,b)=>a.dist-b.dist), inMSTEdges: [...mstEdges], updatedDistance: v });
          } else {
            // rejected edge for visualization
            newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 4, nodes, edges, currentNode: u, currentEdge: { from: u, to: v }, rejectedEdge: { from: u, to: v }, distances: { ...key }, pq: [...pq], inMSTEdges: [...mstEdges] });
          }
        }

        // when a vertex v's parent is fixed (we added u to MST), if parent[u] exists we add edge to MST
        if (parent[u]) {
          mstEdges.push({ from: parent[u] as string, to: u });
          newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 5, nodes, edges, inMSTEdges: [...mstEdges], distances: { ...key }, visitedNodes: Array.from(inMST) });
        }
      }

      // final MST
      newSteps.push({ array: [...arr], highlightIndices: [], sortedIndices: [], pseudocodeLine: 6, nodes, edges, inMSTEdges: [...mstEdges], distances: { ...key }, visitedNodes: Array.from(inMST) });
      setSteps(newSteps);
      return;
    }

    setSteps(newSteps);
  }, [algorithm, customInput, graphState]);


  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const handleStepBack = () => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1));
  };

  const handleCustomInput = () => {
    // For graph algorithms we accept JSON adjacency list or edge list; otherwise accept comma-separated numbers
    if (algorithm?.category === 'Graph') {
      // Just trigger regeneration by updating array state (we keep customInput string for parsing in generateSteps)
      setArray((prev) => [...prev]);
      setCurrentStep(0);
      setIsPlaying(false);
      return;
    }

    // Coin Change (Minimum Coins) custom apply path
    if (algorithm?.id === 'coin-change-min') {
      const cs = coins.split(',').map((s) => Number(s.trim())).filter((n) => !isNaN(n));
      const tg = Number(target);
      const result = generateMinCoinsSteps(cs, tg);
      // generator returns an array of step-like snapshots with .snapshot
      setSteps(result as any);
      setCurrentStep(0);
      setIsPlaying(false);
      return;
    }

    const newArray = customInput
      .split(',')
      .map((val) => parseInt(val.trim()))
      .filter((val) => !isNaN(val));
    if (newArray.length > 0) {
      setArray(newArray);
      setCurrentStep(0);
      setIsPlaying(false);
    }
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

  if (!algorithm) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold neon-text-pink mb-4">Algorithm Not Found</h1>
          <p className="text-gray-400">The requested algorithm could not be found.</p>
        </div>
      </div>
    );
  }

  const currentStepData = steps[currentStep] || {
    array,
    highlightIndices: [],
    sortedIndices: [],
    pseudocodeLine: 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold neon-text-green mb-2">{algorithm.title}</h1>
        <p className="text-gray-400">{algorithm.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-lg border border-[#39FF14]/20 overflow-hidden">
            <div className="flex border-b border-gray-800">
              <button
                onClick={() => setActiveTab('visualization')}
                className={`flex-1 px-6 py-3 font-medium transition-all ${
                  activeTab === 'visualization'
                    ? 'bg-[#39FF14]/10 text-[#39FF14] border-b-2 border-[#39FF14]'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Visualization
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`flex-1 px-6 py-3 font-medium transition-all ${
                  activeTab === 'code'
                    ? 'bg-[#00F0FF]/10 text-[#00F0FF] border-b-2 border-[#00F0FF]'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Code
              </button>
              <button
                onClick={() => setActiveTab('info')}
                className={`flex-1 px-6 py-3 font-medium transition-all ${
                  activeTab === 'info'
                    ? 'bg-[#FF10F0]/10 text-[#FF10F0] border-b-2 border-[#FF10F0]'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Info
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'visualization' && (
                algorithm.hasVisualizer === 'dp-table' ? (
                  <>
                    <DPTableVisualizer
                      steps={steps}
                      currentStepIndex={currentStep}
                      onRequestStepChange={setCurrentStep}
                    />
                    {algorithm.id === 'coin-change-min' && (
                      <div className="mt-4">
                        <PseudocodeHighlighter
                          code={[
                            "dp[0] = 0; all others = ∞",
                            "for amount = 1 to target:",
                            "   for each coin in coins:",
                            "       if coin <= amount:",
                            "           if dp[amount - coin] + 1 < dp[amount]:",
                            "               dp[amount] = dp[amount - coin] + 1"
                          ]}
                          highlightLine={(steps as any)[currentStep]?.snapshot?.pseudocodeLine ?? -1}
                        />
                      </div>
                    )}
                  </>
                ) : algorithm.category === 'Graph' ? (
                  <>
                    {graphWarning && (
                      <div className="mb-3 p-2 rounded bg-[#111] border border-[#FF6B6B]/30 neon-glow-red text-sm text-[#FF6B6B]">{graphWarning}</div>
                    )}
                    {algorithm.category === 'Graph' ? (
                      <GraphVisualizer
                        nodes={((currentStepData.nodes as string[]) && (currentStepData.nodes as string[]).length) ? (currentStepData.nodes as string[]) : (graphState ? graphState.nodes.map(n => n.id) : [])}
                        edges={((currentStepData.edges as { from: string; to: string; weight?: number }[]) && (currentStepData.edges as any).length) ? (currentStepData.edges as { from: string; to: string; weight?: number }[]) : (graphState ? graphState.edges : [])}
                        graphState={graphState}
                        setGraphState={setGraphState}
                        currentNode={(currentStepData.currentNode as string) || null}
                        visitedNodes={(currentStepData.visitedNodes as string[]) || []}
                        frontier={(currentStepData.frontier as string[]) || []}
                        currentEdge={(currentStepData.currentEdge as { from: string; to: string }) || null}
                        newlyVisited={(currentStepData.newlyVisited as string) || null}
                        frontierAction={(currentStepData.frontierAction as string) || null}
                        stackAction={(currentStepData.stackAction as string) || null}
                        distances={(currentStepData.distances as Record<string, number | string>) || null}
                        pq={(currentStepData.pq as { id: string; dist: number }[]) || null}
                        selectedEdge={(currentStepData.selectedEdge as { from: string; to: string }) || null}
                        rejectedEdge={(currentStepData.rejectedEdge as { from: string; to: string }) || null}
                        updatedDistance={(currentStepData.updatedDistance as string) || null}
                        inMSTEdges={(currentStepData.inMSTEdges as { from: string; to: string }[]) || null}
                        useForceLayout={useForceLayout}
                        directed={graphState?.directed}
                      />
                    ) : (
                      <SortingVisualizer
                        array={(currentStepData.array as number[]) || []}
                        highlightIndices={(currentStepData.highlightIndices as number[]) || []}
                        sortedIndices={(currentStepData.sortedIndices as number[]) || []}
                        counters={{
                          iterations: currentStepData.iterations,
                          comparisons: currentStepData.comparisons,
                          swaps: currentStepData.swaps,
                          mergeOps: currentStepData.mergeOps,
                          bucketOps: currentStepData.bucketOps,
                        }}
                      />
                    )}
                  </>
                ) : (
                  <SortingVisualizer
                    array={(currentStepData.array as number[]) || []}
                    highlightIndices={(currentStepData.highlightIndices as number[]) || []}
                    sortedIndices={(currentStepData.sortedIndices as number[]) || []}
                    counters={{
                      iterations: currentStepData.iterations,
                      comparisons: currentStepData.comparisons,
                      swaps: currentStepData.swaps,
                      mergeOps: currentStepData.mergeOps,
                      bucketOps: currentStepData.bucketOps,
                    }}
                  />
                )
              )}

              {activeTab === 'code' && (
                <pre className="bg-[#0a0a0f] p-4 rounded-lg text-sm text-gray-300 overflow-x-auto border border-[#00F0FF]/20">
                  <code>{algorithm.code}</code>
                </pre>
              )}

              {activeTab === 'info' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold neon-text-green mb-2">Time Complexity</h3>
                    <p className="text-gray-400">{algorithm.timeComplexity}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold neon-text-blue mb-2">Space Complexity</h3>
                    <p className="text-gray-400">{algorithm.spaceComplexity}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold neon-text-pink mb-2">Category</h3>
                    <p className="text-gray-400">{algorithm.category}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card rounded-lg p-6 border border-[#39FF14]/20">
            <h3 className="text-lg font-semibold neon-text-blue mb-4">Custom Input</h3>
            {algorithm?.category === 'Graph' ? (
              <div className="space-y-4">
                {/* Step 1 - Number of Nodes */}
                <div className="flex gap-2 items-center">
                  <label className="text-sm text-gray-300">How many nodes?</label>
                  <input type="number" min={0} value={nodeCount} onChange={(e) => setNodeCount(Math.max(0, Number(e.target.value)))} className="w-24 px-3 py-1 bg-[#0b0b10] rounded border border-gray-800 text-white" />
                  <button className="px-4 py-1 bg-[#39FF14] text-black rounded" onClick={() => {
                    const cnt = Math.max(0, Math.floor(nodeCount));
                    const nodes = Array.from({ length: cnt }, (_, i) => String.fromCharCode(65 + i));
                    setGeneratedNodes(nodes);
                    // reset edges selection
                    setBuiltEdges([]);
                    setEdgeFrom(nodes[0] || '');
                    setEdgeTo(nodes[1] || nodes[0] || '');
                    setEdgeWeight('');
                    // initialize graphState immediately with generated nodes
                    const nodesData = nodes.map((id, i) => ({ id, x: 0, y: 0 }));
                    const edgesData: { from: string; to: string; weight?: number }[] = [];
                    setGraphState({ nodes: nodesData, edges: edgesData, directed: true });
                    setShortestPathResult(null);
                    console.log('graphState updated (generate nodes):', { nodes: nodesData, edges: edgesData });
                  }}>Generate Nodes</button>
                </div>

                {generatedNodes.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-200 mb-2">Available Nodes: {generatedNodes.join(', ')}</div>

                    {/* Step 2 - Add Edges */}
                    <div className="flex gap-2 items-center mb-2">
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-300">From</label>
                        <select value={edgeFrom} onChange={(e)=>setEdgeFrom(e.target.value)} className="bg-[#0b0b10] text-white px-2 py-1 rounded border border-gray-800">
                          {generatedNodes.map((n) => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-300">To</label>
                        <select value={edgeTo} onChange={(e)=>setEdgeTo(e.target.value)} className="bg-[#0b0b10] text-white px-2 py-1 rounded border border-gray-800">
                          {generatedNodes.map((n) => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>

                      {/* show weight field only for weighted algorithms */}
                      {['dijkstra','prim','kruskal','bellman-ford'].includes(algorithm.id) && (
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-300">Weight</label>
                          <input type="number" value={edgeWeight} onChange={(e)=>setEdgeWeight(e.target.value)} className="w-20 px-2 py-1 bg-[#0b0b10] rounded border border-gray-800 text-white" />
                        </div>
                      )}

                      <button className="px-3 py-1 bg-[#00F0FF] text-black rounded" onClick={() => {
                        if (!editorOn) {
                          setGraphWarning('Editor is locked. Click "Build Graph (Lock)" or enable Editor to edit.');
                          return;
                        }
                        if (!edgeFrom || !edgeTo) return;
                        // weight required for weighted algorithms
                        if (['dijkstra','prim','kruskal','bellman-ford'].includes(algorithm.id) && edgeWeight.trim() === '') {
                          setGraphWarning('This algorithm requires edge weights.');
                          return;
                        }
                        setGraphWarning(null);
                        const w = edgeWeight.trim() === '' ? undefined : Number(edgeWeight);
                        const newEdge = { from: edgeFrom, to: edgeTo, weight: w };
                        // update builtEdges state
                        setBuiltEdges((cur) => {
                          const updated = [...cur, newEdge];
                          // update graphState edges immediately
                          setGraphState((prev) => {
                            const nodesData = prev?.nodes ?? generatedNodes.map((id, i) => ({ id, x: 0, y: 0 }));
                            const edgesData = prev?.edges ? [...prev.edges, newEdge] : [newEdge];
                            const next = { nodes: nodesData, edges: edgesData, directed: true } as any;
                            console.log('graphState updated (add edge):', next);
                            setShortestPathResult(null);
                            return next;
                          });
                          return updated;
                        });
                      }}>Add Edge</button>
                    </div>

                    {/* Edge List */}
                    <div className="space-y-1 mb-2">
                      {builtEdges.length === 0 ? <div className="text-sm text-gray-400">No edges added yet.</div> : builtEdges.map((e, idx) => (
                        <div key={`${e.from}-${e.to}-${idx}`} className="flex items-center justify-between bg-[#071017] px-3 py-1 rounded border border-[#00F0FF]/10">
                          <div className="text-sm text-gray-100">{e.from} → {e.to}{e.weight !== undefined ? ` (${e.weight})` : ''}</div>
                            <button className="text-sm text-[#FF6B6B] px-2" onClick={() => {
                            if (!editorOn) {
                              setGraphWarning('Editor is locked. Enable Editor to remove edges.');
                              return;
                            }
                            setBuiltEdges((cur) => {
                              const updated = cur.filter((_, i) => i !== idx);
                              // update graphState edges immediately
                              setGraphState((prev) => {
                                const nodesData = prev?.nodes ?? generatedNodes.map((id, i) => ({ id, x: 0, y: 0 }));
                                const edgesData = (prev?.edges ?? []).filter((_, i) => i !== idx);
                                const next = { nodes: nodesData, edges: edgesData, directed: true } as any;
                                console.log('graphState updated (remove edge):', next);
                                setShortestPathResult(null);
                                return next;
                              });
                              return updated;
                            });
                          }}>❌</button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 items-center">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={useForceLayout} onChange={(e)=>setUseForceLayout(e.target.checked)} /> Use Force-Directed Layout
                      </label>
                      <label className="flex items-center gap-2 text-sm ml-4">
                        <input type="checkbox" checked={editorOn} onChange={(e)=>setEditorOn(e.target.checked)} /> Editor On
                      </label>
                      <button className="px-3 py-1 bg-[#555555] text-white rounded ml-2" onClick={() => setEditorOn(false)}>Build Graph (Lock)</button>
                    </div>
                  </div>
                )}
              </div>
            ) : algorithm?.category === 'Dynamic Programming' ? (
              <div className="space-y-4">
                {algorithm.id === 'knapsack' && (
                  <div className="space-y-3">
                    <div className="flex gap-2 items-center">
                      <label className="text-sm text-gray-300">Number of items</label>
                      <input type="number" min={0} value={dpItemCount} onChange={(e) => setDpItemCount(Math.max(0, Number(e.target.value)))} className="w-24 px-3 py-1 bg-[#0b0b10] rounded border border-gray-800 text-white" />
                    </div>
                    <div className="text-sm text-gray-200">Enter weights (comma-separated):</div>
                    <input type="text" value={dpWeights} onChange={(e) => setDpWeights(e.target.value)} placeholder="e.g. 2,3,4" className="w-full px-3 py-2 bg-[#0b0b10] rounded border border-gray-800 text-white" />
                    <div className="text-sm text-gray-200">Enter values (comma-separated):</div>
                    <input type="text" value={dpValues} onChange={(e) => setDpValues(e.target.value)} placeholder="e.g. 3,4,5" className="w-full px-3 py-2 bg-[#0b0b10] rounded border border-gray-800 text-white" />
                    <div className="flex gap-2 items-center">
                      <label className="text-sm text-gray-300">Capacity</label>
                      <input type="number" min={0} value={dpCapacity} onChange={(e) => setDpCapacity(Math.max(0, Number(e.target.value)))} className="w-28 px-3 py-1 bg-[#0b0b10] rounded border border-gray-800 text-white" />
                      <button className="px-4 py-1 bg-[#39FF14] text-black rounded" onClick={() => { setArray((p) => [...p]); setCurrentStep(0); }}>Generate DP</button>
                      <label className="flex items-center gap-2 ml-4 text-sm">
                        <input type="checkbox" checked={knapsackJumpToFinal} onChange={(e) => setKnapsackJumpToFinal(e.target.checked)} /> Jump to Final
                      </label>
                    </div>
                  </div>
                )}

                {algorithm.id === 'lcs' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-200">String A</label>
                      <input type="text" value={lcsA} onChange={(e) => setLcsA(e.target.value)} placeholder="e.g. ABCBDAB" className="w-full px-3 py-2 bg-[#0b0b10] rounded border border-gray-800 text-white" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-200">String B</label>
                      <input type="text" value={lcsB} onChange={(e) => setLcsB(e.target.value)} placeholder="e.g. BDCABA" className="w-full px-3 py-2 bg-[#0b0b10] rounded border border-gray-800 text-white" />
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-1 bg-[#39FF14] text-black rounded" onClick={() => { setArray((p) => [...p]); setCurrentStep(0); }}>Generate DP</button>
                    </div>
                  </div>
                )}

                {algorithm.id === 'lis' && (
                  <div className="space-y-3">
                    <div className="text-sm text-gray-200">Enter array (comma-separated)</div>
                    <input type="text" value={lisInput} onChange={(e) => setLisInput(e.target.value)} placeholder="e.g. 3,1,8,2,5" className="w-full px-3 py-2 bg-[#0b0b10] rounded border border-gray-800 text-white" />
                    <div className="flex gap-2">
                      <button className="px-4 py-1 bg-[#39FF14] text-black rounded" onClick={() => { setArray((p) => [...p]); setCurrentStep(0); }}>Generate DP</button>
                    </div>
                  </div>
                )}
              </div>
            ) : algorithm.id === 'coin-change-min' ? (
              <div className="flex flex-col gap-3">
                <div className="flex gap-2 items-center">
                  <label className="text-sm text-gray-200 w-20">Coins:</label>
                  <input type="text" value={coins} onChange={(e) => setCoins(e.target.value)} placeholder="Example: 1,2,5" className="flex-1 px-3 py-2 bg-[#0b0b10] rounded border border-gray-800 text-white" />
                </div>
                <div className="flex gap-2 items-center">
                  <label className="text-sm text-gray-200 w-20">Target:</label>
                  <input type="text" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Example: 11" className="w-36 px-3 py-2 bg-[#0b0b10] rounded border border-gray-800 text-white" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleCustomInput} className="px-6 py-2 bg-[#39FF14] text-black rounded-lg font-medium">Apply</button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter comma-separated numbers (e.g., 5,3,8,1,9)"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="flex-1 px-4 py-2 bg-[#13131a] border border-gray-800 rounded-lg focus:border-[#39FF14] focus:neon-glow-green outline-none transition-all text-gray-100"
                />
                <button
                  onClick={handleCustomInput}
                  className="px-6 py-2 bg-[#39FF14] text-black rounded-lg font-medium hover:neon-glow-green transition-all"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Shortest Path Results card (populated after run) */}
          {algorithm?.category === 'Graph' && ['bfs', 'dijkstra', 'bellman-ford'].includes(algorithm.id) && shortestPathResult && (
            <div className="glass-card rounded-lg p-6 border border-[#39FF14]/20">
              <h3 className="text-lg font-semibold neon-text-blue mb-4">Shortest Path Results</h3>
              <div className="space-y-2">
                {Object.entries(shortestPathResult).map(([node, info]) => (
                  <div key={node} className="bg-[#071017] p-3 rounded border border-[#00F0FF]/8">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-200 font-medium">{node}</div>
                      <div className="text-sm text-[#00F0FF]">{info.distance === 'unreachable' ? 'unreachable' : String(info.distance)}</div>
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      Path: {info.path ? info.path.join(' → ') : 'unreachable'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
            <div className="space-y-1">
              {algorithm.pseudocode.map((line, index) => (
                <div
                  key={index}
                  className={`text-sm px-3 py-2 rounded transition-all ${
                    currentStepData.pseudocodeLine === index
                      ? 'bg-[#39FF14]/20 text-[#39FF14] neon-glow-green'
                      : 'text-gray-400'
                  }`}
                >
                  {line}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-lg p-6 border border-[#39FF14]/20">
            <h3 className="text-lg font-semibold neon-text-blue mb-4">Complexity</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Time:</span>
                <p className="text-[#39FF14] font-mono">{algorithm.timeComplexity}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Space:</span>
                <p className="text-[#00F0FF] font-mono">{algorithm.spaceComplexity}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
