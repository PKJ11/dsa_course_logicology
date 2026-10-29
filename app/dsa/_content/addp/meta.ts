// ADDP lesson and problem metadata. Minutes are the author's reading-and-stepping estimates.

import type { LessonMeta, ProblemMeta } from "../types";

export const ADDP_LESSONS: LessonMeta[] = [
  {
    n: 1,
    title: "DP on trees",
    minutes: 16,
    figures: ["ADDP-1.1"],
    practice: 1,
    sections: [
      { id: "subtrees", title: "A state for each subtree" },
      { id: "staff", title: "Take or skip" },
      { id: "order", title: "Without recursion" },
      { id: "more", title: "Other answers per subtree" },
      { id: "reroot", title: "Every station as the top" },
    ],
  },
  {
    n: 2,
    title: "DP on DAGs",
    minutes: 14,
    figures: ["ADDP-2.1"],
    practice: 2,
    sections: [
      { id: "every", title: "Every DP is a DAG" },
      { id: "pass", title: "One pass in topological order" },
      { id: "code", title: "The code" },
      { id: "disguise", title: "DAGs in disguise" },
      { id: "cycles", title: "When the graph has cycles" },
    ],
  },
  {
    n: 3,
    title: "Interval DP",
    minutes: 14,
    figures: ["ADDP-3.1"],
    practice: 3,
    sections: [
      { id: "stretch", title: "States that are stretches" },
      { id: "piles", title: "Joining piles" },
      { id: "order", title: "Why shorter stretches go first" },
      { id: "family", title: "The same shape elsewhere" },
      { id: "cost", title: "Cost, and memoised recursion" },
    ],
  },
  {
    n: 4,
    title: "Bitmask DP",
    minutes: 16,
    figures: ["ADDP-4.1"],
    practice: 4,
    sections: [
      { id: "sets", title: "A set as the state" },
      { id: "tour", title: "The shortest round trip" },
      { id: "why", title: "Subsets instead of orders" },
      { id: "assign", title: "Jobs for people" },
      { id: "groups", title: "Splitting into groups" },
      { id: "python", title: "How far Python goes" },
    ],
  },
  {
    n: 5,
    title: "Digit DP",
    minutes: 13,
    figures: ["ADDP-5.1"],
    practice: 5,
    sections: [
      { id: "count", title: "Counting up to N" },
      { id: "tight", title: "Tight or free" },
      { id: "code", title: "The state and the code" },
      { id: "started", title: "Leading zeros" },
      { id: "more", title: "Other questions" },
    ],
  },
  {
    n: 6,
    title: "DP optimisations",
    minutes: 18,
    figures: ["ADDP-6.1"],
    practice: 6,
    sections: [
      { id: "where", title: "Where the time goes" },
      { id: "window", title: "A sliding window of choices" },
      { id: "knuth", title: "Knuth's rule for interval DP" },
      { id: "split", title: "Divide and conquer over split points" },
      { id: "lines", title: "Lines on a hull" },
      { id: "which", title: "Which speed-up when" },
    ],
  },
];

export const ADDP_PROBLEMS: ProblemMeta[] = [
  { n: 1, title: "Total distance from every station", from: [1] },
  { n: 2, title: "The most parcels collected", from: [2] },
  { n: 3, title: "Cutting a rail", from: [3] },
  { n: 4, title: "The fewest wagons", from: [4] },
  { n: 5, title: "No digit twice in a row", from: [5] },
  { n: 6, title: "The cheapest trip", from: [6] },
];
