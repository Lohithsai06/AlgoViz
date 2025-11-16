import { BarChart3, Network, Table2, Grid3x3, LucideIcon } from 'lucide-react';

export interface Algorithm {
  id: string;
  title: string;
  // optional alternate display name
  name?: string;
  description: string;
  category: 'Sorting' | 'Graph' | 'Dynamic Programming' | 'Backtracking';
  difficulty: 'Basic' | 'Advanced';
  icon: LucideIcon;
  timeComplexity: string;
  spaceComplexity: string;
  pseudocode: string[];
  code: string;
  // optional visualizer hints
  hasVisualizer?: string;
  hasCustomInput?: boolean;
}

export const algorithmsList: Algorithm[] = [
  {
    id: 'bubble-sort',
    title: 'Bubble Sort',
    description: 'A simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
    category: 'Sorting',
    difficulty: 'Basic',
    icon: BarChart3,
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    pseudocode: [
      'for i = 0 to n-1',
      '  for j = 0 to n-i-1',
      '    if arr[j] > arr[j+1]',
      '      swap(arr[j], arr[j+1])',
    ],
    code: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
  },
  // coin-change entry removed (replaced later with unified entry)
  {
    id: 'coin-ways',
    title: 'Total Ways (Coin Change)',
    description: 'Number of ways to reach target sum.',
    category: 'Dynamic Programming',
    difficulty: 'Basic',
    icon: Table2,
    timeComplexity: 'O(n*target)',
    spaceComplexity: 'O(n*target)',
    pseudocode: [
      'dp[0][0] = 1; others 0',
      'for i = 1 to n',
      '  for t = 0 to target',
      '    dp[i][t] = dp[i-1][t] + (t-coin[i] >=0 ? dp[i][t-coin[i]] : 0)'
    ],
    code: `function coinWays(coins, target){ const n=coins.length; const dp=Array.from({length:n+1},()=>Array(target+1).fill(0)); dp[0][0]=1; for(let i=1;i<=n;i++){ for(let t=0;t<=target;t++){ dp[i][t]=dp[i-1][t]+(t-coins[i-1]>=0?dp[i][t-coins[i-1]]:0); } } return dp[n][target]; }`,
  },
  {
    id: 'subset-sum',
    title: 'Subset Sum',
    description: 'Determines if any subset sums to target.',
    category: 'Dynamic Programming',
    difficulty: 'Basic',
    icon: Table2,
    timeComplexity: 'O(n*target)',
    spaceComplexity: 'O(n*target)',
    pseudocode: [
      'dp[0][0] = true; others false',
      'for i = 1 to n',
      '  for t = 0 to target',
      '    dp[i][t] = dp[i-1][t] OR (t-arr[i] >= 0 ? dp[i-1][t-arr[i]] : false)'
    ],
    code: `function subsetSum(arr, target){ const n=arr.length; const dp=Array.from({length:n+1},()=>Array(target+1).fill(false)); dp[0][0]=true; for(let i=1;i<=n;i++) for(let t=0;t<=target;t++) dp[i][t]=dp[i-1][t]||(t-arr[i-1]>=0?dp[i-1][t-arr[i-1]]:false); return dp[n][target]; }`,
  },
  {
    id: 'rod-cutting',
    title: 'Rod Cutting',
    description: 'Max revenue from rod cuts with reconstruction.',
    category: 'Dynamic Programming',
    difficulty: 'Advanced',
    icon: Table2,
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(n)',
    pseudocode: [
      'dp[0] = 0',
      'for L = 1 to n',
      '  for k = 1 to L',
      '    dp[L] = max(dp[L], price[k] + dp[L-k])',
      'reconstruct cuts from cut[]'
    ],
    code: `function rodCut(prices, n){ const dp=Array(n+1).fill(0); const cut=Array(n+1).fill(0); for(let L=1;L<=n;L++){ for(let k=1;k<=L;k++){ if(prices[k-1]+dp[L-k]>dp[L]){ dp[L]=prices[k-1]+dp[L-k]; cut[L]=k; } } } return {dp,cut}; }`,
  },
  {
    id: 'matrix-chain',
    title: 'Matrix Chain Multiplication',
    description: 'Find optimal parenthesization to minimize matrix multiplication cost using DP (cost and split tables).',
    category: 'Dynamic Programming',
    difficulty: 'Advanced',
    icon: Table2,
    timeComplexity: 'O(n³)',
    spaceComplexity: 'O(n²)',
    pseudocode: [
      'n = dimensions.length - 1',
      'create m[n+1][n+1] initialized to 0',
      'create s[n+1][n+1] initialized to null',
      'for L = 2 to n',
      '  for i = 1 to n-L+1',
      '    j = i+L-1',
      '    m[i][j] = ∞',
      '    for k = i to j-1',
      '      q = m[i][k] + m[k+1][j] + d[i-1]*d[k]*d[j]',
      '      if q < m[i][j] then m[i][j] = q; s[i][j] = k',
      'reconstruct optimal parenthesization using s'
    ],
    code: `function matrixChain(d) {
  const n = d.length - 1;
  const m = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0));
  const s = Array.from({ length: n + 1 }, () => Array(n + 1).fill(null));
  for (let L = 2; L <= n; L++) {
    for (let i = 1; i <= n - L + 1; i++) {
      const j = i + L - 1;
      m[i][j] = Infinity;
      for (let k = i; k <= j - 1; k++) {
        const q = m[i][k] + m[k+1][j] + d[i-1]*d[k]*d[j];
        if (q < m[i][j]) { m[i][j] = q; s[i][j] = k; }
      }
    }
  }
  return { m, s };
}`,
  },
  {
    id: "coin-change-min",
    name: "Coin Change (Minimum Coins)",
    title: "Coin Change (Minimum Coins)",
    description: "Finds the minimum number of coins required to form the target value.",
    category: 'Dynamic Programming',
    difficulty: 'Basic',
    icon: Table2,
    timeComplexity: 'O(n * amount)',
    spaceComplexity: 'O(amount)',
    pseudocode: [
      'dp[0] = 0; all others = ∞',
      'for amount = 1 to target:',
      '   for each coin in coins:',
      '       if coin <= amount:',
      '           if dp[amount - coin] + 1 < dp[amount]:',
      '               dp[amount] = dp[amount - coin] + 1'
    ],
    code: `function coinChange(coins, amount) { const dp = Array(amount + 1).fill(Infinity); dp[0]=0; const parent = Array(amount+1).fill(-1); for(let x=1;x<=amount;x++){ for(const c of coins){ if(c<=x && dp[x-c]+1<dp[x]){ dp[x]=dp[x-c]+1; parent[x]=c; } } } return {dp, parent}; }`,
    hasVisualizer: "dp-table",
    hasCustomInput: true,
  },
  {
    id: 'lcs',
    title: 'Longest Common Subsequence (LCS)',
    description: 'Finds the longest subsequence common to two sequences using dynamic programming.',
    category: 'Dynamic Programming',
    difficulty: 'Advanced',
    icon: Table2,
    timeComplexity: 'O(nm)',
    spaceComplexity: 'O(nm)',
    pseudocode: [
      'create table dp[lenA+1][lenB+1] initialized to 0',
      'for i = 1 to lenA',
      '  for j = 1 to lenB',
      '    if A[i-1] == B[j-1]',
      '      dp[i][j] = dp[i-1][j-1] + 1',
      '    else',
      '      dp[i][j] = max(dp[i-1][j], dp[i][j-1])',
      'reconstruct LCS by backtracking from dp[lenA][lenB]'
    ],
    code: `function lcs(A, B) {
  const n = A.length, m = B.length;
  const dp = Array(n+1).fill(0).map(() => Array(m+1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (A[i-1] === B[j-1]) dp[i][j] = dp[i-1][j-1] + 1;
      else dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
    }
  }
  // backtrack to construct LCS
  let i = n, j = m; const seq = [];
  while (i > 0 && j > 0) {
    if (A[i-1] === B[j-1]) { seq.push(A[i-1]); i--; j--; }
    else if (dp[i-1][j] >= dp[i][j-1]) i--; else j--;
  }
  return seq.reverse().join('');
}`,
  },
  {
    id: 'lis',
    title: 'Longest Increasing Subsequence (LIS)',
    description: 'Finds the longest strictly increasing subsequence in an array using dynamic programming.',
    category: 'Dynamic Programming',
    difficulty: 'Advanced',
    icon: Table2,
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(n)',
    pseudocode: [
      'create dp[n] initialized to 1 and parent[n] initialized to -1',
      'for i = 0 to n-1',
      '  for j = 0 to i-1',
      '    if arr[j] < arr[i] and dp[j] + 1 > dp[i]',
      '      dp[i] = dp[j] + 1; parent[i] = j',
      'reconstruct LIS from index with max dp value'
    ],
    code: `function lis(arr) {
  const n = arr.length;
  const dp = Array(n).fill(1);
  const parent = Array(n).fill(-1);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (arr[j] < arr[i] && dp[j] + 1 > dp[i]) {
        dp[i] = dp[j] + 1;
        parent[i] = j;
      }
    }
  }
  // reconstruct
  let maxIdx = 0;
  for (let i = 1; i < n; i++) if (dp[i] > dp[maxIdx]) maxIdx = i;
  const seq = [];
  let cur = maxIdx;
  while (cur !== -1) { seq.push(arr[cur]); cur = parent[cur]; }
  return seq.reverse();
}`,
  },
  {
    id: 'insertion-sort',
    title: 'Insertion Sort',
    description: 'Builds the final sorted array one item at a time by inserting each element into its correct position.',
    category: 'Sorting',
    difficulty: 'Basic',
    icon: BarChart3,
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    pseudocode: [
      'for i = 1 to n-1',
      '  key = arr[i]',
      '  j = i - 1',
      '  while j >= 0 and arr[j] > key',
      '    arr[j+1] = arr[j]',
      '    j = j - 1',
      '  arr[j+1] = key',
    ],
    code: `function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    let key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}`,
  },
  {
    id: 'selection-sort',
    title: 'Selection Sort',
    description: 'Divides the input into a sorted and unsorted region, repeatedly selecting the smallest element from unsorted region.',
    category: 'Sorting',
    difficulty: 'Basic',
    icon: BarChart3,
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    pseudocode: [
      'for i = 0 to n-1',
      '  minIdx = i',
      '  for j = i+1 to n-1',
      '    if arr[j] < arr[minIdx]',
      '      minIdx = j',
      '  swap(arr[i], arr[minIdx])',
    ],
    code: `function selectionSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    let minIdx = i;
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }
    [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
  }
  return arr;
}`,
  },
  {
    id: 'merge-sort',
    title: 'Merge Sort',
    description: 'A divide-and-conquer algorithm that divides the array into halves, sorts them, and then merges them back together.',
    category: 'Sorting',
    difficulty: 'Advanced',
    icon: BarChart3,
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    pseudocode: [
      'if left < right',
      '  mid = (left + right) / 2',
      '  mergeSort(arr, left, mid)',
      '  mergeSort(arr, mid+1, right)',
      '  merge(arr, left, mid, right)',
    ],
    code: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}`,
  },
  {
    id: 'quick-sort',
    title: 'Quick Sort',
    description: 'A divide-and-conquer algorithm that picks a pivot element and partitions the array around it.',
    category: 'Sorting',
    difficulty: 'Advanced',
    icon: BarChart3,
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(log n)',
    pseudocode: [
      'if low < high',
      '  pivot = partition(arr, low, high)',
      '  quickSort(arr, low, pivot-1)',
      '  quickSort(arr, pivot+1, high)',
    ],
    code: `function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    const pivot = partition(arr, low, high);
    quickSort(arr, low, pivot - 1);
    quickSort(arr, pivot + 1, high);
  }
  return arr;
}`,
  },
  {
    id: 'heap-sort',
    title: 'Heap Sort',
    description: 'Transforms the array into a max-heap, then repeatedly swaps the root with the last item and re-heapifies.',
    category: 'Sorting',
    difficulty: 'Advanced',
    icon: BarChart3,
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    pseudocode: [
      'buildMaxHeap(arr)',
      'for i = n-1 to 1',
      '  swap(arr[0], arr[i])',
      '  heapify(arr, 0, i)',
    ],
    code: `function heapSort(arr) {
  const n = arr.length;

  function heapify(arr, n, i) {
    let largest = i;
    const l = 2 * i + 1;
    const r = 2 * i + 2;

    if (l < n && arr[l] > arr[largest]) largest = l;
    if (r < n && arr[r] > arr[largest]) largest = r;

    if (largest !== i) {
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      heapify(arr, n, largest);
    }
  }

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(arr, n, i);
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    heapify(arr, i, 0);
  }
  return arr;
}`,
  },
  {
    id: 'counting-sort',
    title: 'Counting Sort',
    description: 'Non-comparative sorting algorithm that counts occurrences of each value and computes positions.',
    category: 'Sorting',
    difficulty: 'Basic',
    icon: BarChart3,
    timeComplexity: 'O(n + k)',
    spaceComplexity: 'O(n + k)',
    pseudocode: [
      'find max value k',
      'create count[0..k] initialized to 0',
      'for each element x in arr: count[x]++',
      'compute prefix sums in count',
      'for i = n-1 downto 0: output[count[arr[i]]-1] = arr[i]; count[arr[i]]--',
      'copy output to arr',
    ],
    code: `function countingSort(arr) {
  const n = arr.length;
  const k = Math.max(...arr);
  const count = new Array(k + 1).fill(0);
  const output = new Array(n).fill(0);

  for (let i = 0; i < n; i++) count[arr[i]]++;
  for (let i = 1; i < count.length; i++) count[i] += count[i - 1];
  for (let i = n - 1; i >= 0; i--) {
    output[count[arr[i]] - 1] = arr[i];
    count[arr[i]]--;
  }
  for (let i = 0; i < n; i++) arr[i] = output[i];
  return arr;
}`,
  },
  {
    id: 'radix-sort',
    title: 'Radix Sort (LSD)',
    description: 'Sorts numbers by processing individual digits from least significant to most significant using a stable sort (counting sort).',
    category: 'Sorting',
    difficulty: 'Advanced',
    icon: BarChart3,
    timeComplexity: 'O(d*(n + k))',
    spaceComplexity: 'O(n + k)',
    pseudocode: [
      'for d = 0 to maxDigits-1',
      '  use stable counting sort by digit d',
      '  collect elements back into arr',
    ],
    code: `function radixSort(arr) {
  const max = Math.max(...arr);
  let exp = 1;
  while (Math.floor(max / exp) > 0) {
    // counting sort by digit at exp
    const output = new Array(arr.length).fill(0);
    const count = new Array(10).fill(0);
    for (let i = 0; i < arr.length; i++) count[Math.floor((arr[i] / exp) % 10)]++;
    for (let i = 1; i < 10; i++) count[i] += count[i - 1];
    for (let i = arr.length - 1; i >= 0; i--) {
      const digit = Math.floor((arr[i] / exp) % 10);
      output[count[digit] - 1] = arr[i];
      count[digit]--;
    }
    for (let i = 0; i < arr.length; i++) arr[i] = output[i];
    exp *= 10;
  }
  return arr;
}`,
  },
  {
    id: 'bfs',
    title: 'Breadth-First Search',
    description: 'Traverses a graph level by level using a queue data structure.',
    category: 'Graph',
    difficulty: 'Advanced',
    icon: Network,
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    pseudocode: [
      'create queue Q',
      'mark start as visited',
      'Q.enqueue(start)',
      'while Q is not empty',
      '  v = Q.dequeue()',
      '  for each neighbor w of v',
      '    if w is not visited',
      '      mark w as visited',
      '      Q.enqueue(w)',
    ],
    code: `function bfs(graph, start) {
  const visited = new Set();
  const queue = [start];
  visited.add(start);

  while (queue.length > 0) {
    const vertex = queue.shift();
    for (const neighbor of graph[vertex]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
}`,
  },
  {
    id: 'dfs',
    title: 'Depth-First Search',
    description: 'Explores as far as possible along each branch before backtracking.',
    category: 'Graph',
    difficulty: 'Advanced',
    icon: Network,
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    pseudocode: [
      'mark v as visited',
      'for each neighbor w of v',
      '  if w is not visited',
      '    DFS(w)',
    ],
    code: `function dfs(graph, vertex, visited = new Set()) {
  visited.add(vertex);

  for (const neighbor of graph[vertex]) {
    if (!visited.has(neighbor)) {
      dfs(graph, neighbor, visited);
    }
  }
}`,
  },
  {
    id: 'dijkstra',
    title: "Dijkstra's Algorithm",
    description: 'Finds the shortest path between nodes in a weighted graph.',
    category: 'Graph',
    difficulty: 'Advanced',
    icon: Network,
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
    pseudocode: [
      'dist[start] = 0',
      'add all vertices to priority queue',
      'while queue is not empty',
      '  u = vertex with min distance',
      '  for each neighbor v of u',
      '    alt = dist[u] + weight(u, v)',
      '    if alt < dist[v]',
      '      dist[v] = alt',
    ],
    code: `function dijkstra(graph, start) {
  const distances = {};
  const pq = new PriorityQueue();

  distances[start] = 0;
  pq.enqueue(start, 0);

  while (!pq.isEmpty()) {
    const { vertex } = pq.dequeue();
    for (const [neighbor, weight] of graph[vertex]) {
      const alt = distances[vertex] + weight;
      if (alt < (distances[neighbor] || Infinity)) {
        distances[neighbor] = alt;
        pq.enqueue(neighbor, alt);
      }
    }
  }
  return distances;
}`,
  },
  {
    id: 'topological-sort',
    title: 'Topological Sort (Kahn)',
    description: 'Orders the vertices of a directed acyclic graph (DAG) such that for every directed edge u → v, u comes before v.',
    category: 'Graph',
    difficulty: 'Advanced',
    icon: Network,
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V + E)',
    pseudocode: [
      'compute indegree[v] for all v',
      'enqueue all v with indegree 0 into Q',
      'while Q not empty',
      '  u = Q.dequeue()',
      '  output u',
      '  for each v in adj[u]',
      '    indegree[v]--',
      '    if indegree[v] == 0: Q.enqueue(v)'
    ],
    code: `function topologicalSort(adj) {
  const indeg = {};
  Object.keys(adj).forEach(v => indeg[v] = 0);
  for (const u in adj) adj[u].forEach(v => indeg[v]++);
  const q = [];
  Object.entries(indeg).forEach(([v,d]) => { if (d === 0) q.push(v); });
  const order = [];
  while (q.length) {
    const u = q.shift();
    order.push(u);
    for (const v of adj[u] || []) {
      indeg[v]--;
      if (indeg[v] === 0) q.push(v);
    }
  }
  return order;
}`,
  },
  {
    id: 'prim',
    title: "Prim's Algorithm",
    description: 'Finds a minimum spanning tree for a weighted undirected graph.',
    category: 'Graph',
    difficulty: 'Advanced',
    icon: Network,
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
    pseudocode: [
      'initialize key[v] = ∞, parent[v] = null',
      'pick arbitrary start, key[start] = 0',
      'while queue not empty',
      '  u = extract-min(queue)',
      '  for each neighbor v of u',
      '    if v not in MST and weight(u,v) < key[v]',
      '      key[v] = weight(u,v); parent[v] = u',
    ],
    code: `function prim(graph) {
  const key = {};
  const parent = {};
  const pq = new PriorityQueue();

  // initialize
  for (const v in graph) { key[v] = Infinity; parent[v] = null; }
  const start = Object.keys(graph)[0];
  key[start] = 0; pq.enqueue(start, 0);

  while (!pq.isEmpty()) {
    const { vertex: u } = pq.dequeue();
    for (const [v, w] of graph[u]) {
      if (w < key[v]) { key[v] = w; parent[v] = u; pq.enqueue(v, w); }
    }
  }
  // reconstruct MST from parent
}`,
  },
  {
    id: 'bellman-ford',
    title: 'Bellman–Ford Algorithm',
    description: 'Computes shortest paths in a weighted directed graph and detects negative-weight cycles.',
    category: 'Graph',
    difficulty: 'Advanced',
    icon: Network,
    timeComplexity: 'O(V * E)',
    spaceComplexity: 'O(V)',
    pseudocode: [
      'initialize dist[start] = 0 and dist[v] = ∞ for v != start',
      'for i = 1 to V-1',
      '  for each edge (u, v, w)',
      '    if dist[u] + w < dist[v]',
      '      dist[v] = dist[u] + w',
      'check for negative-weight cycles by testing one more relaxation'
    ],
    code: `function bellmanFord(edges, vertices, start) {
  const dist = {};
  vertices.forEach(v => dist[v] = Infinity);
  dist[start] = 0;
  for (let i = 0; i < vertices.length - 1; i++) {
    for (const {u,v,w} of edges) {
      if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
    }
  }
  // detect negative cycles
  const neg = [];
  for (const {u,v,w} of edges) {
    if (dist[u] + w < dist[v]) neg.push({u,v});
  }
  return { dist, negativeEdges: neg };
}`,
  },
  {
    id: 'knapsack',
    title: '0/1 Knapsack',
    description: 'Solves the problem of selecting items with maximum value without exceeding weight capacity.',
    category: 'Dynamic Programming',
    difficulty: 'Advanced',
    icon: Table2,
    timeComplexity: 'O(nW)',
    spaceComplexity: 'O(nW)',
    pseudocode: [
      'create table dp[n+1][W+1]',
      'for i = 0 to n',
      '  for w = 0 to W',
      '    if i == 0 or w == 0',
      '      dp[i][w] = 0',
      '    else if weight[i-1] <= w',
      '      dp[i][w] = max(value[i-1] + dp[i-1][w-weight[i-1]], dp[i-1][w])',
      '    else',
      '      dp[i][w] = dp[i-1][w]',
    ],
    code: `function knapsack(weights, values, capacity) {
  const n = weights.length;
  const dp = Array(n + 1).fill(0).map(() => Array(capacity + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let w = 1; w <= capacity; w++) {
      if (weights[i - 1] <= w) {
        dp[i][w] = Math.max(
          values[i - 1] + dp[i - 1][w - weights[i - 1]],
          dp[i - 1][w]
        );
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }
  return dp[n][capacity];
}`,
  },
  {
    id: 'edit-distance',
    title: 'Edit Distance',
    description: 'Computes the minimum edits needed to convert one string into another.',
    category: 'Dynamic Programming',
    difficulty: 'Advanced',
    icon: Table2,
    timeComplexity: 'O(nm)',
    spaceComplexity: 'O(nm)',
    pseudocode: [
      'create table dp[n+1][m+1]',
      'for i = 0 to n: dp[i][0] = i',
      'for j = 0 to m: dp[0][j] = j',
      'for i = 1 to n',
      '  for j = 1 to m',
      '    if str1[i-1] == str2[j-1]',
      '        dp[i][j] = dp[i-1][j-1]',
      '    else',
      '        dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])'
    ],
    code: `function editDistance(A, B) {
  const n = A.length, m = B.length;
  const dp = Array.from({ length: n+1 }, () => Array(m+1).fill(0));
  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let j = 0; j <= m; j++) dp[0][j] = j;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (A[i-1] === B[j-1]) dp[i][j] = dp[i-1][j-1];
      else dp[i][j] = 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    }
  }
  return dp[n][m];
}`,
  },
  {
    id: 'n-queens',
    title: 'N-Queens',
    description: 'Places N chess queens on an N×N board so that no two queens threaten each other.',
    category: 'Backtracking',
    difficulty: 'Advanced',
    icon: Grid3x3,
    timeComplexity: 'O(N!)',
    spaceComplexity: 'O(N²)',
    pseudocode: [
      'if all queens are placed',
      '  return true',
      'for each row i',
      '  if isSafe(board, row, col)',
      '    place queen at (row, col)',
      '    if solveNQueens(board, col+1)',
      '      return true',
      '    remove queen from (row, col)',
      'return false',
    ],
    code: `function solveNQueens(n) {
  const board = Array(n).fill(0).map(() => Array(n).fill('.'));
  const solutions = [];

  function isSafe(row, col) {
    for (let i = 0; i < col; i++) {
      if (board[row][i] === 'Q') return false;
    }
    for (let i = row, j = col; i >= 0 && j >= 0; i--, j--) {
      if (board[i][j] === 'Q') return false;
    }
    for (let i = row, j = col; i < n && j >= 0; i++, j--) {
      if (board[i][j] === 'Q') return false;
    }
    return true;
  }

  function solve(col) {
    if (col >= n) {
      solutions.push(board.map(row => row.join('')));
      return;
    }
    for (let row = 0; row < n; row++) {
      if (isSafe(row, col)) {
        board[row][col] = 'Q';
        solve(col + 1);
        board[row][col] = '.';
      }
    }
  }

  solve(0);
  return solutions;
}`,
  },
];
