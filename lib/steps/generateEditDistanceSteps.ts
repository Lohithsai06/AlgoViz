// Edit Distance (Levenshtein) step generator
export function generateEditDistanceSteps(str1: string, str2: string) {
  const n = str1.length;
  const m = str2.length;

  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  const steps: any[] = [];

  const pushStep = (opts: any) => {
    const table = dp.map((r) => r.slice());
    steps.push({ table, ...opts });
  };

  // initial creation
  pushStep({ currentCell: null, affectingCells: [], match: false, operation: 'init', pseudocodeLine: 0 });

  // initialize first column
  for (let i = 0; i <= n; i++) {
    dp[i][0] = i;
    pushStep({ table: dp.map(r => r.slice()), currentCell: [i, 0], affectingCells: [[i - 1, 0]], match: false, operation: i === 0 ? 'init' : 'delete', pseudocodeLine: 1 });
  }

  // initialize first row
  for (let j = 0; j <= m; j++) {
    dp[0][j] = j;
    pushStep({ table: dp.map(r => r.slice()), currentCell: [0, j], affectingCells: [[0, j - 1]], match: false, operation: j === 0 ? 'init' : 'insert', pseudocodeLine: 2 });
  }

  // main loops
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      // highlight current cell and dependencies
      pushStep({ currentCell: [i, j], affectingCells: [[i - 1, j], [i, j - 1], [i - 1, j - 1]], match: str1[i - 1] === str2[j - 1], operation: 'check', pseudocodeLine: 3 });

      if (str1[i - 1] === str2[j - 1]) {
        // match: copy diagonal
        dp[i][j] = dp[i - 1][j - 1];
        pushStep({ table: dp.map(r => r.slice()), currentCell: [i, j], affectingCells: [[i - 1, j - 1]], match: true, operation: 'match', pseudocodeLine: 6 });
      } else {
        const del = dp[i - 1][j] + 1; // delete
        const ins = dp[i][j - 1] + 1; // insert
        const rep = dp[i - 1][j - 1] + 1; // replace

        // show the three candidates
        pushStep({ currentCell: [i, j], affectingCells: [[i - 1, j], [i, j - 1], [i - 1, j - 1]], match: false, operation: 'compare', pseudocodeLine: 7 });

        // choose min
        let op: 'delete' | 'insert' | 'replace' = 'replace';
        let best = rep;
        if (del < best) { best = del; op = 'delete'; }
        if (ins < best) { best = ins; op = 'insert'; }

        dp[i][j] = best;

        // flash/operation step
        pushStep({ table: dp.map(r => r.slice()), currentCell: [i, j], affectingCells: [[i - 1, j], [i, j - 1], [i - 1, j - 1]], match: false, operation: op, pseudocodeLine: 8 });
      }
    }
  }

  // final snapshot
  pushStep({ table: dp.map(r => r.slice()), currentCell: null, affectingCells: [], match: false, operation: 'done', pseudocodeLine: -1 });

  return steps;
}

export default generateEditDistanceSteps;
