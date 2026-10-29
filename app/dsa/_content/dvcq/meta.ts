// DVCQ lesson and problem metadata. Minutes are the author's reading-and-stepping estimates.

import type { LessonMeta, ProblemMeta } from "../types";

export const DVCQ_LESSONS: LessonMeta[] = [
  {
    n: 1,
    title: "The pattern",
    minutes: 13,
    figures: ["DVCQ-1.1"],
    practice: 1,
    sections: [
      { id: "steps", title: "Divide, conquer, combine" },
      { id: "stretch", title: "The largest sum of a stretch" },
      { id: "cost", title: "Cost from the recursion tree" },
      { id: "pairs", title: "Fewer comparisons: largest and smallest" },
      { id: "when", title: "When it helps" },
    ],
  },
  {
    n: 2,
    title: "The master theorem in practice",
    minutes: 14,
    figures: ["DVCQ-2.1"],
    practice: 2,
    sections: [
      { id: "code", title: "From code to recurrence" },
      { id: "log", title: "Work with a log factor" },
      { id: "unequal", title: "Parts of different sizes" },
      { id: "examples", title: "Worked examples" },
      { id: "measure", title: "Checking by measuring" },
    ],
  },
  {
    n: 3,
    title: "Counting inversions",
    minutes: 13,
    figures: ["DVCQ-3.1"],
    practice: 3,
    sections: [
      { id: "recap", title: "Counting while merging, again" },
      { id: "each", title: "A count for every value" },
      { id: "double", title: "A different rule for pairs" },
      { id: "rank", title: "Comparing two rankings" },
      { id: "fenwick", title: "Another way: a Fenwick tree" },
    ],
  },
  {
    n: 4,
    title: "Closest pair of points",
    minutes: 16,
    figures: ["DVCQ-4.1"],
    practice: 4,
    sections: [
      { id: "problem", title: "The problem" },
      { id: "split", title: "Split by a vertical line" },
      { id: "strip", title: "The strip" },
      { id: "seven", title: "Why seven checks are enough" },
      { id: "code", title: "The code and its cost" },
    ],
  },
  {
    n: 5,
    title: "Karatsuba multiplication",
    minutes: 14,
    figures: ["DVCQ-5.1"],
    practice: 5,
    sections: [
      { id: "school", title: "Multiplying digit by digit" },
      { id: "split", title: "Splitting does not help by itself" },
      { id: "three", title: "Three products instead of four" },
      { id: "code", title: "The code" },
      { id: "python", title: "Python's own integers" },
    ],
  },
  {
    n: 6,
    title: "Median of medians",
    minutes: 15,
    figures: ["DVCQ-6.1"],
    practice: 6,
    sections: [
      { id: "select", title: "Selection, again" },
      { id: "pivot", title: "A pivot with a guarantee" },
      { id: "proof", title: "Why it is linear" },
      { id: "five", title: "Why groups of five" },
      { id: "practice", title: "In practice" },
    ],
  },
];

export const DVCQ_PROBLEMS: ProblemMeta[] = [
  { n: 1, title: "Largest and smallest together", from: [1] },
  { n: 2, title: "The skyline", from: [1, 2] },
  { n: 3, title: "Smaller values to the right", from: [3] },
  { n: 4, title: "The closest pair", from: [4] },
  { n: 5, title: "Multiplying digit lists", from: [5] },
  { n: 6, title: "Select in linear time", from: [6] },
];
