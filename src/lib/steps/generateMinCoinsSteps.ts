// TypeScript generator for Min Coins that returns an array of step objects
// Each step has a `snapshot` object with at least: table, currentCell, dependencyCells, pseudocodeLine

export type MinCoinsStep = {
  snapshot: {
    table: number[];
    currentCell: number | null;
    dependencyCells: number[];
    pseudocodeLine: number;
    note?: string;
    parents?: number[];
  };
};

export function generateMinCoinsSteps(coins: number[], target: number): MinCoinsStep[] {
  const T = Math.max(0, Math.floor(target));
  const dp: number[] = Array(T + 1).fill(Infinity);
  const parent: number[] = Array(T + 1).fill(-1);
  dp[0] = 0;

  const steps: MinCoinsStep[] = [];

  // initial snapshot
  steps.push({ snapshot: { table: dp.slice(), currentCell: null, dependencyCells: [], pseudocodeLine: 0, note: 'init' } });

  for (let x = 1; x <= T; x++) {
    // entering cell x
    steps.push({ snapshot: { table: dp.slice(), currentCell: x, dependencyCells: [], pseudocodeLine: 1 } });

    for (const coin of coins) {
      const prev = x - coin;
      const deps = prev >= 0 ? [prev] : [];
      // compare candidate
      steps.push({ snapshot: { table: dp.slice(), currentCell: x, dependencyCells: deps, pseudocodeLine: 2, note: `consider coin ${coin}`, parents: parent.slice() } });

      if (prev >= 0 && dp[prev] + 1 < dp[x]) {
        dp[x] = dp[prev] + 1;
        parent[x] = coin;
        // write update
        steps.push({ snapshot: { table: dp.slice(), currentCell: x, dependencyCells: deps, pseudocodeLine: 3, note: `take coin ${coin}`, parents: parent.slice() } });
      } else {
        // no update
        steps.push({ snapshot: { table: dp.slice(), currentCell: x, dependencyCells: deps, pseudocodeLine: 4, note: `skip coin ${coin}`, parents: parent.slice() } });
      }
    }
  }

  // final snapshot with reconstruction info
  const finalNote = dp[T] === Infinity ? 'no solution' : `min coins = ${dp[T]}`;
  steps.push({ snapshot: { table: dp.slice(), currentCell: null, dependencyCells: [], pseudocodeLine: -1, note: finalNote, parents: parent.slice() } });

  return steps;
}

export default generateMinCoinsSteps;
