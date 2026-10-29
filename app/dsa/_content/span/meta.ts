// SPAN lesson and problem metadata. Minutes are the author's reading-and-stepping estimates.

import type { LessonMeta, ProblemMeta } from "../types";

export const SPAN_LESSONS: LessonMeta[] = [
  {
    n: 1,
    title: "Spanning trees",
    minutes: 12,
    figures: ["SPAN-1.1"],
    practice: 1,
    sections: [
      { id: "trees", title: "Joining everything with no loops" },
      { id: "facts", title: "Three facts about trees" },
      { id: "cheapest", title: "The cheapest spanning tree" },
      { id: "cycle", title: "The cycle property" },
      { id: "uses", title: "Where spanning trees appear" },
    ],
  },
  {
    n: 2,
    title: "Kruskal",
    minutes: 11,
    figures: ["SPAN-2.1"],
    practice: 2,
    sections: [
      { id: "method", title: "Cheapest first, skip loops" },
      { id: "dsu", title: "Union-find does the checking" },
      { id: "cost", title: "What it costs" },
      { id: "more", title: "Forests, ties, and clusters" },
    ],
  },
  {
    n: 3,
    title: "Prim",
    minutes: 11,
    figures: ["SPAN-3.1"],
    practice: 3,
    sections: [
      { id: "grow", title: "Grow one tree" },
      { id: "heap", title: "With heapq" },
      { id: "dense", title: "Dense graphs: no heap" },
      { id: "compare", title: "Prim, Kruskal, and Dijkstra" },
    ],
  },
  {
    n: 4,
    title: "The cut property",
    minutes: 12,
    figures: ["SPAN-4.1"],
    practice: 4,
    sections: [
      { id: "cuts", title: "Cuts and crossing edges" },
      { id: "proof", title: "The exchange proof" },
      { id: "both", title: "Why Kruskal and Prim are right" },
      { id: "ties", title: "Ties, and which edges can appear" },
    ],
  },
];

export const SPAN_PROBLEMS: ProblemMeta[] = [
  { n: 1, title: "A cheaper line", from: [1] },
  { n: 2, title: "The cheapest network", from: [2] },
  { n: 3, title: "Connect the points", from: [3] },
  { n: 4, title: "Lines in some cheapest tree", from: [4] },
];
