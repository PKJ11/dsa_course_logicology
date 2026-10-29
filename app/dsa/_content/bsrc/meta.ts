// BSRC lesson and problem metadata. Minutes are the author's reading-and-stepping estimates.

import type { LessonMeta, ProblemMeta } from "../types";

export type { LessonMeta };

export const BSRC_LESSONS: LessonMeta[] = [
  {
    n: 1,
    title: "Halving the search space",
    minutes: 14,
    figures: ["BSRC-1.1"],
    practice: 1,
    sections: [
      { id: "question", title: "The problem" },
      { id: "halving", title: "Rule out half with each read" },
      { id: "cost", title: "How many reads it takes" },
      { id: "lower-bound", title: "Why you cannot do better" },
      { id: "python", title: "In Python" },
    ],
  },
  {
    n: 2,
    title: "The invariant",
    minutes: 16,
    figures: ["BSRC-2.1"],
    practice: 1,
    sections: [
      { id: "claim", title: "The statement we keep true" },
      { id: "proof", title: "Proving the loop is correct" },
      { id: "termination", title: "Why the loop stops" },
      { id: "broken", title: "Breaking it on purpose" },
    ],
  },
  {
    n: 3,
    title: "First and last occurrence",
    minutes: 15,
    figures: ["BSRC-3.1"],
    practice: 2,
    sections: [
      { id: "duplicates", title: "When the target appears more than once" },
      { id: "predicate", title: "Search for a boundary, not a value" },
      { id: "half-open", title: "The half-open window" },
      { id: "bisect", title: "bisect_left and bisect_right" },
    ],
  },
  {
    n: 4,
    title: "Searching on the answer",
    minutes: 18,
    figures: ["BSRC-4.1"],
    practice: 3,
    sections: [
      { id: "no-array", title: "Binary search without a list" },
      { id: "monotone", title: "The monotone test" },
      { id: "parcels", title: "The parcel van" },
      { id: "cost", title: "How long it takes" },
      { id: "pattern", title: "Recognising this kind of problem" },
    ],
  },
  {
    n: 5,
    title: "Real-valued binary search",
    minutes: 13,
    figures: ["BSRC-5.1"],
    practice: 4,
    sections: [
      { id: "continuous", title: "When the answer is a real number" },
      { id: "stopping", title: "When to stop" },
      { id: "floats", title: "Computer numbers are not exact" },
      { id: "integers", title: "Whole-number answers, exactly" },
    ],
  },
  {
    n: 6,
    title: "Off-by-one traps",
    minutes: 15,
    figures: ["BSRC-6.1"],
    practice: 5,
    sections: [
      { id: "conventions", title: "Pick one convention" },
      { id: "trap", title: "The lo = mid trap" },
      { id: "rounding", title: "Rounding mid up" },
      { id: "checklist", title: "A checklist for every search" },
      { id: "overflow", title: "A note on overflow" },
    ],
  },
];

export const BSRC_PROBLEMS: ProblemMeta[] = [
  { n: 1, title: "Find the platform", from: [1, 2] },
  { n: 2, title: "First and last train", from: [3] },
  { n: 3, title: "Parcel van capacity", from: [4] },
  { n: 4, title: "Integer square root", from: [5] },
  { n: 5, title: "The rotated timetable", from: [2, 6] },
];
