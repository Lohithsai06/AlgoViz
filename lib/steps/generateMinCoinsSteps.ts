// Min coins (unbounded) step generator
export function generateMinCoinsSteps(coinsInput: number[], target: number) {
  const coins = coinsInput.slice();
  const T = target;
  const dp = Array(T + 1).fill(Infinity);
  dp[0] = 0;
  const steps: any[] = [];

  const push = (obj: any) => steps.push({ table: dp.slice(), ...obj });

  push({ currentCell: null, dependencyCells: [], coin: null, decision: null, pseudocodeLine: 0 });

  for (let x = 1; x <= T; x++) {
    push({ currentCell: x, dependencyCells: [], coin: null, decision: null, pseudocodeLine: 1 });
    for (const coin of coins) {
      const prev = x - coin;
      push({ currentCell: x, dependencyCells: prev >= 0 ? [prev] : [], coin, decision: 'compare', pseudocodeLine: 2 });
      if (prev >= 0 && dp[prev] + 1 < dp[x]) {
        dp[x] = dp[prev] + 1;
        push({ table: dp.slice(), currentCell: x, dependencyCells: [prev], coin, decision: 'take', pseudocodeLine: 3 });
      } else {
        push({ currentCell: x, dependencyCells: prev >= 0 ? [prev] : [], coin, decision: 'skip', pseudocodeLine: 4 });
      }
    }
  }

  push({ table: dp.slice(), currentCell: null, dependencyCells: [], coin: null, decision: 'done', pseudocodeLine: -1 });
  return steps;
}

export default generateMinCoinsSteps;
