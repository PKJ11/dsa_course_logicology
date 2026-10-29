// HARD lesson and problem metadata. Minutes are the author's reading-and-stepping estimates.

import type { LessonMeta, ProblemMeta } from "../types";

export const HARD_LESSONS: LessonMeta[] = [
  {
    n: 1,
    title: "P, NP and NP-complete",
    minutes: 18,
    figures: ["HARD-1.1"],
    practice: 1,
    sections: [
      { id: "kinds", title: "Three kinds of question" },
      { id: "p", title: "P: answered in polynomial time" },
      { id: "np", title: "NP: checked in polynomial time" },
      { id: "complete", title: "NP-hard and NP-complete" },
      { id: "pnp", title: "P against NP" },
      { id: "search", title: "Finding an answer with a yes/no helper" },
    ],
  },
  {
    n: 2,
    title: "Reductions",
    minutes: 16,
    figures: ["HARD-2.1"],
    practice: 2,
    sections: [
      { id: "what", title: "What a reduction is" },
      { id: "is", title: "3-SAT to independent set" },
      { id: "family", title: "Independent set, vertex cover and clique" },
      { id: "more", title: "More reductions, in outline" },
      { id: "into", title: "Reducing to SAT" },
      { id: "slips", title: "Common slips" },
    ],
  },
  {
    n: 3,
    title: "Branch and bound",
    minutes: 14,
    figures: ["HARD-3.1"],
    practice: 3,
    sections: [
      { id: "search", title: "Search with a bound" },
      { id: "safe", title: "Why the bound is safe" },
      { id: "order", title: "Which node next" },
      { id: "cost", title: "How fast it is" },
      { id: "beyond", title: "Beyond the knapsack" },
    ],
  },
  {
    n: 4,
    title: "Approximation algorithms",
    minutes: 17,
    figures: ["HARD-4.1"],
    practice: 4,
    sections: [
      { id: "ratio", title: "A guarantee instead of the best" },
      { id: "cover", title: "Vertex cover within 2" },
      { id: "tour", title: "A round trip within 2" },
      { id: "load", title: "Balancing machines" },
      { id: "knap", title: "The knapsack within any percentage" },
      { id: "limits", title: "Set cover, and the limits" },
    ],
  },
  {
    n: 5,
    title: "Randomised algorithms",
    minutes: 17,
    figures: ["HARD-5.1"],
    practice: 5,
    sections: [
      { id: "kinds", title: "Two kinds of random algorithm" },
      { id: "pivots", title: "Random pivots" },
      { id: "freivalds", title: "Checking a product" },
      { id: "prime", title: "Prime or not: Miller–Rabin" },
      { id: "cut", title: "Karger's minimum cut" },
      { id: "luck", title: "Testing without luck" },
    ],
  },
];

export const HARD_PROBLEMS: ProblemMeta[] = [
  { n: 1, title: "An answer from a yes/no helper", from: [1] },
  { n: 2, title: "Three groups as a formula", from: [2] },
  { n: 3, title: "The most valuable load", from: [3] },
  { n: 4, title: "Balancing the machines", from: [4] },
  { n: 5, title: "Prime or not", from: [5] },
];
