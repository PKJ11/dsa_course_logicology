// PATH lesson and problem metadata. Minutes are the author's reading-and-stepping estimates.

import type { LessonMeta, ProblemMeta } from "../types";

export const PATH_LESSONS: LessonMeta[] = [
  {
    n: 1,
    title: "The problem",
    minutes: 13,
    figures: ["PATH-1.1"],
    practice: 1,
    sections: [
      { id: "weights", title: "Edges with lengths" },
      { id: "relax", title: "Distances and relaxing" },
      { id: "facts", title: "Two facts about shortest routes" },
      { id: "negative", title: "Negative edges and negative cycles" },
      { id: "map", title: "Which method when" },
    ],
  },
  {
    n: 2,
    title: "0-1 BFS",
    minutes: 11,
    figures: ["PATH-2.1"],
    practice: 2,
    sections: [
      { id: "costs", title: "Costs of 0 and 1" },
      { id: "deque", title: "The front and the back" },
      { id: "proof", title: "Why the order is right" },
      { id: "uses", title: "Where 0 and 1 appear" },
    ],
  },
  {
    n: 3,
    title: "Dijkstra",
    minutes: 15,
    figures: ["PATH-3.1"],
    practice: 3,
    sections: [
      { id: "nearest", title: "Settle the nearest" },
      { id: "proof", title: "Why a settled time is final" },
      { id: "heap", title: "With heapq" },
      { id: "cost", title: "What it costs" },
      { id: "negative", title: "Why negative edges break it" },
    ],
  },
  {
    n: 4,
    title: "Bellman-Ford",
    boardTitle: "Bellman-­Ford",
    minutes: 13,
    figures: ["PATH-4.1"],
    practice: 4,
    sections: [
      { id: "rounds", title: "Rounds over every edge" },
      { id: "proof", title: "Why V − 1 rounds are enough" },
      { id: "cycles", title: "Finding negative cycles" },
      { id: "dp", title: "A DP, and faster versions" },
    ],
  },
  {
    n: 5,
    title: "Floyd-Warshall",
    boardTitle: "Floyd-­Warshall",
    minutes: 13,
    figures: ["PATH-5.1"],
    practice: 5,
    sections: [
      { id: "all", title: "Every pair at once" },
      { id: "middle", title: "Allowing one more station" },
      { id: "order", title: "Why k is the outer loop" },
      { id: "more", title: "Negative cycles, routes, and other uses" },
    ],
  },
  {
    n: 6,
    title: "Shortest paths in DAGs",
    minutes: 11,
    figures: ["PATH-6.1"],
    practice: 6,
    sections: [
      { id: "order", title: "Relax in topological order" },
      { id: "proof", title: "Why one pass is enough" },
      { id: "longest", title: "Longest paths" },
      { id: "uses", title: "Where DAGs appear" },
    ],
  },
  {
    n: 7,
    title: "A* search",
    minutes: 14,
    figures: ["PATH-7.1"],
    practice: 7,
    sections: [
      { id: "goal", title: "Searching towards a goal" },
      { id: "guess", title: "A guess that is never too high" },
      { id: "proof", title: "Why A* is right" },
      { id: "grids", title: "Guesses for grids, and ties" },
      { id: "limits", title: "Where A* is used" },
    ],
  },
];

export const PATH_PROBLEMS: ProblemMeta[] = [
  { n: 1, title: "Are these the shortest times?", from: [1] },
  { n: 2, title: "Fewest lines to reverse", from: [2] },
  { n: 3, title: "The fastest journey", from: [3] },
  { n: 4, title: "Fares with refunds", from: [4] },
  { n: 5, title: "Routes between asked pairs", from: [5] },
  { n: 6, title: "Cheapest routes in a DAG", from: [6] },
  { n: 7, title: "Across an endless grid", from: [7] },
];
