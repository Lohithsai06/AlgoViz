// Matrix Chain Multiplication step generator
export function generateMatrixChainSteps(dims: number[]) {
  const n = dims.length - 1; // number of matrices
  const INF = Number.MAX_SAFE_INTEGER;

  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(n + 1).fill(INF));
  const split: (number | null)[][] = Array.from({ length: n + 1 }, () => Array(n + 1).fill(null));

  const steps: any[] = [];

  const push = (obj: any) => {
    // deep copy of dp and split
    const table = dp.map((r) => r.map((v) => (v === INF ? Infinity : v)));
    const splitCopy = split.map((r) => r.slice());
    steps.push({ table, split: splitCopy, ...obj });
  };

  // init diagonal 0
  for (let i = 1; i <= n; i++) dp[i][i] = 0;
  push({ currentCell: null, evaluatingK: null, dependencyCells: [], computeCost: null, chosen: false, pseudocodeLine: 2 });

  // L = chain length
  for (let L = 2; L <= n; L++) {
    for (let i = 1; i <= n - L + 1; i++) {
      const j = i + L - 1;
      dp[i][j] = INF;
      push({ currentCell: [i, j], evaluatingK: null, dependencyCells: [], computeCost: null, chosen: false, pseudocodeLine: 5 });

      for (let k = i; k <= j - 1; k++) {
        const dep = [[i, k], [k + 1, j]];
        const cost = (dp[i][k] === INF ? Infinity : dp[i][k]) + (dp[k + 1][j] === INF ? Infinity : dp[k + 1][j]) + dims[i - 1] * dims[k] * dims[j];

        // show evaluation of k
        push({ currentCell: [i, j], evaluatingK: k, dependencyCells: dep, computeCost: cost, chosen: false, pseudocodeLine: 8 });

        if (cost < dp[i][j]) {
          const old = dp[i][j] === INF ? Infinity : dp[i][j];
          dp[i][j] = cost;
          split[i][j] = k;
          push({ table: dp.map(r=>r.map(v=> v===INF?Infinity:v)), split: split.map(r=>r.slice()), currentCell: [i, j], evaluatingK: k, dependencyCells: dep, computeCost: cost, chosen: true, pseudocodeLine: 11 });
        } else {
          push({ currentCell: [i, j], evaluatingK: k, dependencyCells: dep, computeCost: cost, chosen: false, pseudocodeLine: 11 });
        }
      }
    }
  }

  // final snapshot
  push({ table: dp.map(r=>r.map(v=> v===INF?Infinity:v)), split: split.map(r=>r.slice()), currentCell: null, evaluatingK: null, dependencyCells: [], computeCost: null, chosen: false, pseudocodeLine: -1 });

  return steps;
}

export default generateMatrixChainSteps;
