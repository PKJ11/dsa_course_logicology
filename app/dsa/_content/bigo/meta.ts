// BIGO lesson and problem metadata. Minutes are the author's reading-and-stepping estimates.

import type { LessonMeta, ProblemMeta } from "../types";

export const BIGO_LESSONS: LessonMeta[] = [
  {
    n: 1,
    title: "Counting steps",
    minutes: 13,
    figures: ["BIGO-1.1"],
    practice: 2,
    sections: [
      { id: "why", title: "Why count steps, not seconds" },
      { id: "model", title: "What counts as one step" },
      { id: "loops", title: "Loops multiply" },
      { id: "cases", title: "Best, worst and average case" },
    ],
  },
  {
    n: 2,
    title: "Big-O, Ω and Θ",
    minutes: 16,
    figures: ["BIGO-2.1"],
    practice: 2,
    sections: [
      { id: "idea", title: "Keep only the part that grows fastest" },
      { id: "bigo", title: "Big-O: an upper bound" },
      { id: "omega", title: "Ω and Θ" },
      { id: "rules", title: "Rules for working it out" },
      { id: "traps", title: "Common mistakes" },
    ],
  },
  {
    n: 3,
    title: "Growth rates",
    minutes: 12,
    figures: ["BIGO-3.1"],
    practice: 1,
    sections: [
      { id: "ladder", title: "The usual classes" },
      { id: "table", title: "What n can each class handle?" },
      { id: "logs", title: "Where log n comes from" },
      { id: "exp", title: "Exponential and factorial" },
    ],
  },
  {
    n: 4,
    title: "Space cost",
    minutes: 12,
    figures: ["BIGO-4.1"],
    practice: 3,
    sections: [
      { id: "memory", title: "Counting memory" },
      { id: "extra", title: "Input space and extra space" },
      { id: "stack", title: "The call stack uses space" },
      { id: "trade", title: "Trading space for time" },
    ],
  },
  {
    n: 5,
    title: "Recurrences",
    minutes: 15,
    figures: ["BIGO-5.1"],
    practice: 5,
    sections: [
      { id: "idea", title: "Cost described by itself" },
      { id: "unroll", title: "Unrolling" },
      { id: "tree", title: "The recursion tree" },
      { id: "examples", title: "Four recurrences to know" },
    ],
  },
  {
    n: 6,
    title: "The master theorem",
    minutes: 15,
    figures: ["BIGO-6.1"],
    practice: 5,
    sections: [
      { id: "form", title: "The form a T(n/b) + n^d" },
      { id: "three", title: "Three cases" },
      { id: "using", title: "Using it" },
      { id: "limits", title: "When it does not apply" },
    ],
  },
  {
    n: 7,
    title: "Amortised analysis",
    minutes: 14,
    figures: ["BIGO-7.1"],
    practice: 4,
    sections: [
      { id: "doubling", title: "A list that grows" },
      { id: "aggregate", title: "Total cost over many appends" },
      { id: "bank", title: "The banker’s view" },
      { id: "why-double", title: "Why double, not add 10" },
    ],
  },
  {
    n: 8,
    title: "Python’s hidden costs",
    minutes: 13,
    figures: ["BIGO-8.1"],
    practice: 3,
    sections: [
      { id: "table", title: "The cost of common operations" },
      { id: "pop0", title: "Removing from the front" },
      { id: "strings", title: "Building strings" },
      { id: "slices", title: "Slices and copies" },
      { id: "in", title: "in on a list" },
    ],
  },
];

export const BIGO_PROBLEMS: ProblemMeta[] = [
  { n: 1, title: "Two loads that add up", from: [3, 4] },
  { n: 2, title: "Count the steps", from: [1, 2] },
  { n: 3, title: "Keep the first of each", from: [4, 8] },
  { n: 4, title: "A growing platform", from: [7] },
  { n: 5, title: "Solve the recurrence", from: [5, 6] },
];
