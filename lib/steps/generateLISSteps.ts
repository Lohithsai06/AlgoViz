// LIS O(n^2) step generator
export function generateLISSteps(arrInput: number[]) {
  const arr = arrInput.slice();
  const n = arr.length;
  const dp = Array(n).fill(1);
  const parent = Array(n).fill(-1);
  const steps: any[] = [];

  const push = (obj: any) => {
    steps.push({ table: dp.slice(), parent: parent.slice(), ...obj });
  };

  push({ currentCell: null, comparingCell: null, dependencyCells: [], decision: null, pseudocodeLine: 0 });

  for (let i = 0; i < n; i++) {
    push({ currentCell: i, comparingCell: null, dependencyCells: [], decision: null, pseudocodeLine: 1 });
    for (let j = 0; j < i; j++) {
      push({ currentCell: i, comparingCell: j, dependencyCells: [j], decision: 'compare', pseudocodeLine: 2 });
      if (arr[j] < arr[i] && dp[j] + 1 > dp[i]) {
        parent[i] = j;
        dp[i] = dp[j] + 1;
        push({ currentCell: i, comparingCell: j, dependencyCells: [j], decision: 'extend', pseudocodeLine: 3 });
      } else {
        push({ currentCell: i, comparingCell: j, dependencyCells: [j], decision: 'skip', pseudocodeLine: 4 });
      }
    }
  }

  // final snapshot + reconstruction info
  const maxIdx = dp.reduce((acc, v, idx) => (v > dp[acc] ? idx : acc), 0);
  const lis: number[] = [];
  let cur = maxIdx;
  while (cur !== -1 && cur !== undefined) {
    lis.push(arr[cur]);
    cur = parent[cur];
  }
  lis.reverse();
  push({ currentCell: null, comparingCell: null, dependencyCells: [], decision: 'done', pseudocodeLine: -1, result: { length: dp[maxIdx], sequence: lis } });

  return steps;
}

export default generateLISSteps;
