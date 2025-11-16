// Subset Sum boolean DP step generator
export function generateSubsetSumSteps(arrInput: number[], target: number) {
  const arr = arrInput.slice();
  const n = arr.length;
  const T = target;
  const dp: boolean[][] = Array.from({ length: n + 1 }, () => Array(T + 1).fill(false));
  dp[0][0] = true;
  const steps: any[] = [];

  const push = (obj: any) => {
    const table = dp.map(r => r.slice());
    steps.push({ table, ...obj });
  };

  push({ currentCell: null, dependencyCells: [], decision: null, pseudocodeLine: 0 });

  for (let i = 1; i <= n; i++) {
    for (let t = 0; t <= T; t++) {
      push({ currentCell: [i, t], dependencyCells: [[i - 1, t], [i - 1, t - arr[i - 1]]], decision: 'check', pseudocodeLine: 1 });
      const exclude = dp[i - 1][t];
      const include = t - arr[i - 1] >= 0 ? dp[i - 1][t - arr[i - 1]] : false;
      dp[i][t] = exclude || include;
      push({ table: dp.map(r => r.slice()), currentCell: [i, t], dependencyCells: [[i - 1, t], ...(t - arr[i - 1] >= 0 ? [[i - 1, t - arr[i - 1]]] : [])], decision: dp[i][t] ? 'true' : 'false', pseudocodeLine: 2 });
    }
  }

  push({ table: dp.map(r => r.slice()), currentCell: null, dependencyCells: [], decision: 'done', pseudocodeLine: -1 });
  return steps;
}

export default generateSubsetSumSteps;
