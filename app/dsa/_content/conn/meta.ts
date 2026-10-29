// CONN lesson and problem metadata. Minutes are the author's reading-and-stepping estimates.

import type { LessonMeta, ProblemMeta } from "../types";

export const CONN_LESSONS: LessonMeta[] = [
  {
    n: 1,
    title: "Strongly connected components",
    minutes: 12,
    figures: ["CONN-1.1"],
    practice: 1,
    sections: [
      { id: "both", title: "Reaching both ways" },
      { id: "groups", title: "Groups that split the graph" },
      { id: "one", title: "The group of one vertex" },
      { id: "dag", title: "The graph of groups has no cycle" },
      { id: "uses", title: "Where groups appear" },
    ],
  },
  {
    n: 2,
    title: "Kosaraju and Tarjan",
    minutes: 15,
    figures: ["CONN-2.1"],
    practice: 2,
    sections: [
      { id: "kosaraju", title: "Kosaraju: finish order, then turn round" },
      { id: "why", title: "Why each search finds one group" },
      { id: "tarjan", title: "Tarjan: one search and a stack" },
      { id: "low", title: "The low-link rule" },
      { id: "stack", title: "Without recursion" },
      { id: "compare", title: "Which one to use" },
    ],
  },
  {
    n: 3,
    title: "Bridges and articulation points",
    minutes: 13,
    figures: ["CONN-3.1"],
    practice: 3,
    sections: [
      { id: "weak", title: "Weak points of a network" },
      { id: "low", title: "Low numbers in an undirected search" },
      { id: "rules", title: "The two rules, with proofs" },
      { id: "repeat", title: "Repeated lines" },
      { id: "more", title: "Blocks, and the cheapest-tree link" },
    ],
  },
  {
    n: 4,
    title: "2-SAT",
    minutes: 14,
    figures: ["CONN-4.1"],
    practice: 4,
    sections: [
      { id: "rules", title: "Rules with two conditions" },
      { id: "graph", title: "The implication graph" },
      { id: "test", title: "When there is no answer" },
      { id: "choose", title: "Choosing the answers" },
      { id: "three", title: "Rules of three conditions are much harder" },
    ],
  },
];

export const CONN_PROBLEMS: ProblemMeta[] = [
  { n: 1, title: "The junction's group", from: [1] },
  { n: 2, title: "Every group, in order", from: [2] },
  { n: 3, title: "Weak points of the network", from: [3] },
  { n: 4, title: "Yes-or-no rules", from: [4] },
];
