// Coin ways: number of ways to make target using coins (2D DP)
export function generateCoinWaysSteps(coinsInput: number[], target: number) {
  const coins = coinsInput.slice();
  const n = coins.length;
  const T = target;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(T + 1).fill(0));
  dp[0][0] = 1; // with 0 coins, only way to make 0 is 1
  const steps: any[] = [];

  const push = (obj: any) => {
    const table = dp.map(r => r.slice());
    steps.push({ table, ...obj });
  };

  push({ currentCell: null, dependencyCells: [], decision: null, pseudocodeLine: 0 });

  for (let i = 1; i <= n; i++) {
    for (let t = 0; t <= T; t++) {
      push({ currentCell: [i, t], dependencyCells: [[i - 1, t], [i, Math.max(0, t - coins[i - 1])]], decision: 'evaluate', pseudocodeLine: 1 });
      const exclude = dp[i - 1][t];
      const include = t - coins[i - 1] >= 0 ? dp[i][t - coins[i - 1]] : 0;
      dp[i][t] = exclude + include;
      push({ table: dp.map(r => r.slice()), currentCell: [i, t], dependencyCells: [[i - 1, t], [i, Math.max(0, t - coins[i - 1])]], decision: 'include+exclude', pseudocodeLine: 2 });
    }
  }

  push({ table: dp.map(r => r.slice()), currentCell: null, dependencyCells: [], decision: 'done', pseudocodeLine: -1 });
  return steps;
}

export default generateCoinWaysSteps;
