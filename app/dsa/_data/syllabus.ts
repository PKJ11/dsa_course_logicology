// The line: 30 stations in four legs, as confirmed by the owner on 2026-10-04 (SYLLABUS-DRAFT.md).
// `open` marks a station whose lessons are written. A leg is `live` once any of its stations is open.

export type LegId = "A" | "B" | "C" | "D";

export type Station = {
  no: number;
  code: string;
  name: string;
  leg: LegId;
  lessons: string[];
  optional?: boolean;
  terminus?: boolean;
  open?: boolean;
};

export type Leg = { id: LegId; name: string; live: boolean };

const LEG_NAMES: Omit<Leg, "live">[] = [
  { id: "A", name: "Foundations" },
  { id: "B", name: "Data structures" },
  { id: "C", name: "Design techniques" },
  { id: "D", name: "Graphs and beyond" },
];

export const STATIONS: Station[] = [
  { no: 0, code: "PYTH", name: "Python for DSA", leg: "A", optional: true, open: true, lessons: ["Lists, indexing and slicing", "Loops and comprehensions", "Functions", "Dicts, sets and tuples", "Classes for nodes", "How practice and tests work"] },
  { no: 1, code: "CORR", name: "Correctness", leg: "A", open: true, lessons: ["What “correct” means", "Loop invariants", "Proof by induction", "Contradiction and counterexamples", "Testing versus proving"] },
  { no: 2, code: "BIGO", name: "Cost: Big-O and friends", leg: "A", open: true, lessons: ["Counting steps", "Big-O, Ω and Θ", "Growth rates", "Space cost", "Recurrences", "The master theorem", "Amortised analysis", "Python’s hidden costs"] },
  { no: 3, code: "ARRS", name: "Arrays and strings", leg: "A", open: true, lessons: ["Memory and dynamic arrays", "Two pointers", "Sliding window", "Prefix sums and difference arrays", "Matrices and 2-D traversal", "Strings as arrays"] },
  { no: 4, code: "BSRC", name: "Binary search", leg: "A", open: true, lessons: ["Halving the search space", "The invariant", "First and last occurrence", "Searching on the answer", "Real-valued binary search", "Off-by-one traps"] },
  { no: 5, code: "RECR", name: "Recursion and backtracking", leg: "A", open: true, lessons: ["Base case and recursive case", "The call stack", "Recursion trees", "Subsets and permutations", "Pruning", "Recursion to iteration"] },
  { no: 6, code: "SORT", name: "Sorting", leg: "A", open: true, lessons: ["Selection, insertion and bubble sort", "Merge sort", "Quick sort and partitioning", "Heap sort", "The n log n lower bound", "Counting and radix sort", "Stability and sorted()", "Quickselect"] },

  { no: 7, code: "LINK", name: "Linked lists", leg: "B", open: true, lessons: ["Nodes and references", "Insert and delete", "Doubly and circular lists", "Reversing", "Fast and slow pointers", "Merging lists"] },
  { no: 8, code: "STAQ", name: "Stacks and queues", leg: "B", open: true, lessons: ["Last in, first out", "Brackets and expressions", "Queues and deque", "Circular buffers", "Monotonic stack", "Monotonic queue"] },
  { no: 9, code: "HASH", name: "Hashing", leg: "B", open: true, lessons: ["Hash functions", "Chaining", "Open addressing and load factor", "Universal hashing and attacks", "Inside dict and set", "Counting and grouping", "LRU cache", "Bloom filters"] },
  { no: 10, code: "TREE", name: "Trees and BSTs", leg: "B", open: true, lessons: ["Vocabulary", "Traversals", "Rebuilding a tree from traversals", "BST search and insert", "Successor and deletion", "Lowest common ancestor", "Serialisation"] },
  { no: 11, code: "BALT", name: "Balanced trees", leg: "B", open: true, lessons: ["Why balance matters", "Rotations", "AVL trees", "Red-black trees", "B-trees and disks", "Skip lists"] },
  { no: 12, code: "HEAP", name: "Heaps", leg: "B", open: true, lessons: ["The heap property", "Sift up and sift down", "Building a heap in O(n)", "heapq and priority queues", "Top-k and k-way merge", "Median of a stream"] },
  { no: 13, code: "TRIE", name: "Tries", leg: "B", open: true, lessons: ["Prefix trees", "Insert, search and delete", "Autocomplete", "Compressed tries", "Bitwise tries for XOR"] },
  { no: 14, code: "DSUF", name: "Union-find", leg: "B", open: true, lessons: ["Disjoint sets", "Union by rank", "Path compression", "Why it is nearly O(1)", "Applications"] },
  { no: 15, code: "RNGQ", name: "Range queries", leg: "B", open: true, lessons: ["Prefix sums revisited", "Sparse table", "Fenwick tree", "Segment tree", "Lazy propagation", "Square-root decomposition"] },

  { no: 16, code: "GRDY", name: "Greedy algorithms", leg: "C", open: true, lessons: ["The greedy choice", "Exchange arguments", "Interval scheduling", "Huffman coding", "When greedy fails"] },
  { no: 17, code: "DVCQ", name: "Divide and conquer", leg: "C", open: true, lessons: ["The pattern", "The master theorem in practice", "Counting inversions", "Closest pair of points", "Karatsuba multiplication", "Median of medians"] },
  { no: 18, code: "DYNP", name: "Dynamic programming", leg: "C", open: true, lessons: ["Overlapping subproblems", "Memoisation", "Tabulation", "One-dimensional DP", "Grids and 2-D DP", "Longest increasing subsequence", "LCS and edit distance", "The knapsack family", "Rebuilding the answer"] },
  { no: 19, code: "BITS", name: "Bit manipulation", leg: "C", open: true, lessons: ["Binary and two’s complement", "Bitwise operators", "Masks and tricks", "Counting bits", "Subsets as bitmasks"] },
  { no: 20, code: "MATH", name: "Number theory and counting", leg: "C", open: true, lessons: ["Divisibility and GCD", "Modular arithmetic", "Fast exponentiation", "The sieve of Eratosthenes", "Modular inverse", "Combinations and Pascal’s triangle", "Probability for algorithms"] },

  { no: 21, code: "GRPH", name: "Graphs", leg: "D", open: true, lessons: ["Representing graphs", "Breadth-first search", "Depth-first search", "Cycle detection", "Topological sort", "Bipartite graphs", "Grids as graphs"] },
  { no: 22, code: "PATH", name: "Shortest paths", leg: "D", open: true, lessons: ["The problem", "0-1 BFS", "Dijkstra", "Bellman-Ford", "Floyd-Warshall", "Shortest paths in DAGs", "A* search"] },
  { no: 23, code: "SPAN", name: "Minimum spanning trees", leg: "D", open: true, lessons: ["Spanning trees", "Kruskal", "Prim", "The cut property"] },
  { no: 24, code: "CONN", name: "Connectivity", leg: "D", open: true, lessons: ["Strongly connected components", "Kosaraju and Tarjan", "Bridges and articulation points", "2-SAT"] },
  { no: 25, code: "FLOW", name: "Network flow", leg: "D", open: true, lessons: ["Flow networks", "Ford-Fulkerson", "Edmonds-Karp and Dinic", "Max-flow min-cut", "Bipartite matching"] },
  { no: 26, code: "STRG", name: "String algorithms", leg: "D", open: true, lessons: ["Naive matching", "KMP", "Z-algorithm", "Rolling hash and Rabin-Karp", "Suffix arrays", "Manacher’s palindromes"] },
  { no: 27, code: "GEOM", name: "Computational geometry", leg: "D", open: true, lessons: ["Points, vectors and the cross product", "Orientation and intersection", "Convex hull", "Sweep line"] },
  { no: 28, code: "ADDP", name: "Advanced DP", leg: "D", open: true, lessons: ["DP on trees", "DP on DAGs", "Interval DP", "Bitmask DP", "Digit DP", "DP optimisations"] },
  { no: 29, code: "HARD", name: "Hard problems", leg: "D", open: true, terminus: true, lessons: ["P, NP and NP-complete", "Reductions", "Branch and bound", "Approximation algorithms", "Randomised algorithms"] },
];

export const TOTAL_LESSONS = STATIONS.reduce((n, s) => n + s.lessons.length, 0);

export function stationByCode(code: string): Station | undefined {
  const c = code.toUpperCase();
  return STATIONS.find((s) => s.code === c);
}

export function neighbours(code: string): { prev?: Station; next?: Station } {
  const i = STATIONS.findIndex((s) => s.code === code.toUpperCase());
  return { prev: STATIONS[i - 1], next: STATIONS[i + 1] };
}

export function stationHref(s: Station) {
  return `/dsa/#${s.code}`;
}

export function lessonHref(code: string, n: number) {
  return `/dsa/${code.toLowerCase()}/${n}/`;
}

export function practiceHref(code: string, n: number) {
  return `/dsa/${code.toLowerCase()}/practice/${n}/`;
}

// Worked out from the stations, so a leg opens on the map as soon as one of its stations is written.
export const LEGS: Leg[] = LEG_NAMES.map((l) => ({ ...l, live: STATIONS.some((st) => st.leg === l.id && st.open) }));
