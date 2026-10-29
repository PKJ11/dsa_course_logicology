// FLOW lesson and problem metadata. Minutes are the author's reading-and-stepping estimates.

import type { LessonMeta, ProblemMeta } from "../types";

export const FLOW_LESSONS: LessonMeta[] = [
  {
    n: 1,
    title: "Flow networks",
    minutes: 11,
    figures: ["FLOW-1.1"],
    practice: 1,
    sections: [
      { id: "network", title: "Capacities, a source and a sink" },
      { id: "rules", title: "The two rules of a flow" },
      { id: "value", title: "The value of a flow" },
      { id: "shapes", title: "Fitting other problems to the shape" },
    ],
  },
  {
    n: 2,
    title: "Ford-Fulkerson",
    minutes: 13,
    figures: ["FLOW-2.1"],
    practice: 2,
    sections: [
      { id: "greedy", title: "Sending along paths gets stuck" },
      { id: "residual", title: "The residual graph" },
      { id: "method", title: "The method" },
      { id: "code", title: "Arcs in pairs" },
      { id: "cost", title: "How long it can take" },
    ],
  },
  {
    n: 3,
    title: "Edmonds-Karp and Dinic",
    minutes: 15,
    figures: ["FLOW-3.1"],
    practice: 3,
    sections: [
      { id: "ek", title: "Edmonds-Karp: shortest paths first" },
      { id: "proof", title: "Why O(V · E²)" },
      { id: "dinic", title: "Dinic: levels and blocking flows" },
      { id: "dcost", title: "What Dinic costs" },
      { id: "choose", title: "Which method when" },
    ],
  },
  {
    n: 4,
    title: "Max-flow min-cut",
    minutes: 13,
    figures: ["FLOW-4.1"],
    practice: 4,
    sections: [
      { id: "cuts", title: "Cuts in a network" },
      { id: "bound", title: "Every flow fits under every cut" },
      { id: "theorem", title: "The theorem" },
      { id: "find", title: "Finding a smallest cut" },
      { id: "uses", title: "What cuts answer" },
    ],
  },
  {
    n: 5,
    title: "Bipartite matching",
    minutes: 14,
    figures: ["FLOW-5.1"],
    practice: 5,
    sections: [
      { id: "match", title: "Pairs with no repeats" },
      { id: "flow", title: "Matching as a flow" },
      { id: "augment", title: "Augmenting paths" },
      { id: "hk", title: "Hopcroft-Karp" },
      { id: "konig", title: "König's theorem" },
    ],
  },
];

export const FLOW_PROBLEMS: ProblemMeta[] = [
  { n: 1, title: "Is this a flow?", from: [1] },
  { n: 2, title: "The most trains", from: [2] },
  { n: 3, title: "A full plan, fast", from: [3] },
  { n: 4, title: "The weakest set of lines", from: [4] },
  { n: 5, title: "Workers and jobs", from: [5] },
];
