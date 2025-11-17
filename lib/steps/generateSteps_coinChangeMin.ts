// Generator for Coin Change (Minimum Coins)
// Returns { table: number[][], steps: Array<...> } as requested.
export type CoinStep = {
  i: number; // index in coins (if relevant)
  amount: number; // the dp index being processed
  compare: boolean; // true when comparing dependency
  write: boolean; // true when writing/updating dp[amount]
  newValue?: number; // new dp value when write === true
  dependency: { row: number; col: number }[]; // dependency cells (for 1D, row=0, col=index)
  pseudocodeLine: number;
};

export function generateSteps_coinChangeMin(coins: number[], target: number) {
  const T = Math.max(0, Math.floor(target));
  const dp: number[] = Array(T + 1).fill(Infinity);
  dp[0] = 0;

  const steps: CoinStep[] = [];

  // initial
  steps.push({ i: -1, amount: 0, compare: false, write: false, dependency: [], pseudocodeLine: 0 });

  for (let a = 1; a <= T; a++) {
    // entering amount a
    steps.push({ i: -1, amount: a, compare: false, write: false, dependency: [], pseudocodeLine: 1 });
    for (let idx = 0; idx < coins.length; idx++) {
      const c = coins[idx];
      const prev = a - c;
      const deps = prev >= 0 ? [{ row: 0, col: prev }] : [];
      // comparison step
      steps.push({ i: idx, amount: a, compare: true, write: false, dependency: deps, pseudocodeLine: 2 });
      if (prev >= 0 && dp[prev] + 1 < dp[a]) {
        const newVal = dp[prev] + 1;
        dp[a] = newVal;
        // write step
        steps.push({ i: idx, amount: a, compare: false, write: true, newValue: newVal, dependency: deps, pseudocodeLine: 3 });
      } else {
        // no-write snapshot to show skipping
        steps.push({ i: idx, amount: a, compare: false, write: false, dependency: deps, pseudocodeLine: 4 });
      }
    }
  }

  // final snapshot (reconstruction not necessary here)
  steps.push({ i: -1, amount: T, compare: false, write: false, dependency: [], pseudocodeLine: -1 });

  return { table: [dp.slice()], steps };
}

export default generateSteps_coinChangeMin;
