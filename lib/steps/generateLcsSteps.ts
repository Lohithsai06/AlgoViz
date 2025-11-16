// LCS step generator
export function generateLcsSteps(text1: string, text2: string) {
  const n = text1.length;
  const m = text2.length;

  // dp dimensions (n+1) x (m+1)
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  const steps: any[] = [];

  const pushStep = (opts: any) => {
    // deep copy dp
    const table = dp.map((row) => row.slice());
    steps.push({ table, ...opts });
  };

  // initial table step
  pushStep({ currentCell: null, affectingCells: [], matching: false, pseudocodeLine: 0 });

  for (let i = 0; i <= n; i++) {
    for (let j = 0; j <= m; j++) {
      // highlight entering inner loop
      pushStep({ currentCell: [i, j], affectingCells: [[i - 1, j], [i, j - 1], [i - 1, j - 1]], matching: false, pseudocodeLine: 2 });

      if (i === 0 || j === 0) {
        dp[i][j] = 0;
        pushStep({ table: dp.map(r => r.slice()), currentCell: [i, j], affectingCells: [], matching: false, pseudocodeLine: 3 });
        continue;
      }

      // show dependency check (else if)
      pushStep({ currentCell: [i, j], affectingCells: [[i - 1, j], [i, j - 1], [i - 1, j - 1]], matching: text1[i - 1] === text2[j - 1], pseudocodeLine: 4 });

      if (text1[i - 1] === text2[j - 1]) {
        // match
        dp[i][j] = 1 + dp[i - 1][j - 1];
        pushStep({ table: dp.map(r => r.slice()), currentCell: [i, j], affectingCells: [[i - 1, j - 1]], matching: true, pseudocodeLine: 5 });
      } else {
        // mismatch: choose max
        const top = dp[i - 1][j];
        const left = dp[i][j - 1];
        dp[i][j] = Math.max(top, left);
        pushStep({ currentCell: [i, j], affectingCells: [[i - 1, j], [i, j - 1]], matching: false, pseudocodeLine: 7 });
        pushStep({ table: dp.map(r => r.slice()), currentCell: [i, j], affectingCells: [[i - 1, j], [i, j - 1]], matching: false, pseudocodeLine: 7 });
      }
    }
  }

  // final snapshot
  pushStep({ table: dp.map(r => r.slice()), currentCell: null, affectingCells: [], matching: false, pseudocodeLine: -1 });

  return steps;
}

export default generateLcsSteps;
