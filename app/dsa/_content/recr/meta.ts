// RECR lesson and problem metadata. Minutes are the author's reading-and-stepping estimates.

import type { LessonMeta, ProblemMeta } from "../types";

export const RECR_LESSONS: LessonMeta[] = [
  {
    n: 1,
    title: "Base case and recursive case",
    minutes: 14,
    figures: ["RECR-1.1"],
    practice: 1,
    sections: [
      { id: "two-parts", title: "Two parts" },
      { id: "trust", title: "Trust the smaller call" },
      { id: "smaller", title: "Make sure it gets smaller" },
      { id: "halving", title: "Shrinking by half" },
    ],
  },
  {
    n: 2,
    title: "The call stack",
    minutes: 12,
    figures: ["RECR-2.1"],
    practice: 1,
    sections: [
      { id: "frames", title: "Frames" },
      { id: "two-halves", title: "Work on the way down, work on the way up" },
      { id: "depth", title: "Depth is space" },
      { id: "tail", title: "Why Python does not remove the last call" },
    ],
  },
  {
    n: 3,
    title: "Recursion trees",
    minutes: 14,
    figures: ["RECR-3.1"],
    practice: 2,
    sections: [
      { id: "tree", title: "Drawing the calls" },
      { id: "cost", title: "Counting the calls" },
      { id: "memo", title: "Remember answers: memoisation" },
      { id: "shapes", title: "Common tree shapes" },
    ],
  },
  {
    n: 4,
    title: "Subsets and permutations",
    minutes: 16,
    figures: ["RECR-4.1"],
    practice: 3,
    sections: [
      { id: "subsets", title: "Subsets: take it or skip it" },
      { id: "pattern", title: "Choose, explore, undo" },
      { id: "perms", title: "Orders: pick an unused item" },
      { id: "counting", title: "How many answers" },
    ],
  },
  {
    n: 5,
    title: "Pruning",
    minutes: 14,
    figures: ["RECR-5.1"],
    practice: 5,
    sections: [
      { id: "idea", title: "Stop as soon as a branch cannot work" },
      { id: "queens", title: "Example: placing queens" },
      { id: "gain", title: "How much pruning saves" },
      { id: "kinds", title: "Kinds of pruning" },
    ],
  },
  {
    n: 6,
    title: "Recursion to iteration",
    minutes: 13,
    figures: ["RECR-6.1"],
    practice: 6,
    sections: [
      { id: "simple", title: "When a loop is enough" },
      { id: "bottom-up", title: "Memoised recursion as a table" },
      { id: "stack", title: "Your own stack" },
      { id: "when", title: "When to switch" },
    ],
  },
];

export const RECR_PROBLEMS: ProblemMeta[] = [
  { n: 1, title: "Power on a clock", from: [1, 2] },
  { n: 2, title: "Steps on the footbridge", from: [3, 6] },
  { n: 3, title: "Every group of coaches", from: [4] },
  { n: 4, title: "Every running order", from: [4] },
  { n: 5, title: "Queens on the yard", from: [5] },
  { n: 6, title: "Parcels inside parcels", from: [6] },
];
