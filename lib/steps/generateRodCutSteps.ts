// Rod cutting DP step generator with reconstruction
export function generateRodCutSteps(pricesInput: number[], length: number) {
  const prices = pricesInput.slice();
  const n = length;
  const dp = Array(n + 1).fill(0);
  const cut = Array(n + 1).fill(0);
  const steps: any[] = [];

  const push = (obj: any) => steps.push({ table: dp.slice(), cut: cut.slice(), ...obj });

  push({ currentCell: null, evaluatingCut: null, dependencyCells: [], decision: null, pseudocodeLine: 0 });

  for (let L = 1; L <= n; L++) {
    push({ currentCell: L, evaluatingCut: null, dependencyCells: [], decision: null, pseudocodeLine: 1 });
    let best = -Infinity;
    let bestK = 0;
    for (let k = 1; k <= L; k++) {
      const left = prices[k - 1] + dp[L - k];
      push({ currentCell: L, evaluatingCut: k, dependencyCells: [k, L - k], compute: left, decision: 'evaluate', pseudocodeLine: 2 });
      if (left > best) {
        best = left;
        bestK = k;
        dp[L] = best;
        cut[L] = k;
        push({ table: dp.slice(), cut: cut.slice(), currentCell: L, evaluatingCut: k, dependencyCells: [k, L - k], decision: 'take', pseudocodeLine: 3 });
      } else {
        push({ currentCell: L, evaluatingCut: k, dependencyCells: [k, L - k], decision: 'skip', pseudocodeLine: 4 });
      }
    }
  }

  // reconstruction
  const cuts: number[] = [];
  let rem = n;
  while (rem > 0) {
    const k = cut[rem] || 1;
    cuts.push(k);
    rem -= k;
  }

  push({ table: dp.slice(), cut: cut.slice(), currentCell: null, evaluatingCut: null, dependencyCells: [], decision: 'done', pseudocodeLine: -1, result: { bestRevenue: dp[n], cuts } });
  return steps;
}

export default generateRodCutSteps;
