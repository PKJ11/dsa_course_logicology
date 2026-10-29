// ARRS lesson and problem metadata. Minutes are the author's reading-and-stepping estimates.

import type { LessonMeta, ProblemMeta } from "../types";

export const ARRS_LESSONS: LessonMeta[] = [
  {
    n: 1,
    title: "Memory and dynamic arrays",
    minutes: 13,
    figures: ["ARRS-1.1"],
    sections: [
      { id: "slots", title: "Slots side by side" },
      { id: "python", title: "What a Python list holds" },
      { id: "insert", title: "Inserting and deleting in the middle" },
      { id: "dynamic", title: "Dynamic arrays" },
    ],
  },
  {
    n: 2,
    title: "Two pointers",
    minutes: 15,
    figures: ["ARRS-2.1"],
    practice: 1,
    sections: [
      { id: "pair", title: "Finding a pair in a sorted list" },
      { id: "why", title: "Why it never skips the answer" },
      { id: "same", title: "Pointers in the same direction" },
      { id: "when", title: "When to reach for two pointers" },
    ],
  },
  {
    n: 3,
    title: "Sliding window",
    minutes: 15,
    figures: ["ARRS-3.1"],
    practice: 2,
    sections: [
      { id: "fixed", title: "A window of fixed size" },
      { id: "variable", title: "A window that grows and shrinks" },
      { id: "cost", title: "Why it is O(n)" },
      { id: "state", title: "What the window remembers" },
    ],
  },
  {
    n: 4,
    title: "Prefix sums and difference arrays",
    minutes: 15,
    figures: ["ARRS-4.1"],
    practice: 3,
    sections: [
      { id: "prefix", title: "Prefix sums" },
      { id: "counting", title: "Counting with prefix sums" },
      { id: "diff", title: "Difference arrays" },
    ],
  },
  {
    n: 5,
    title: "Matrices and 2-D traversal",
    minutes: 13,
    figures: ["ARRS-5.1"],
    practice: 4,
    sections: [
      { id: "layout", title: "A list of rows" },
      { id: "orders", title: "Orders of traversal" },
      { id: "neighbours", title: "Neighbours and the edges" },
      { id: "transform", title: "Turning and flipping" },
    ],
  },
  {
    n: 6,
    title: "Strings as arrays",
    minutes: 14,
    figures: ["ARRS-6.1"],
    practice: 5,
    sections: [
      { id: "immutable", title: "Strings cannot change" },
      { id: "chars", title: "Characters are numbers" },
      { id: "palindromes", title: "Palindromes" },
      { id: "searching", title: "Searching inside a string" },
    ],
  },
];

export const ARRS_PROBLEMS: ProblemMeta[] = [
  { n: 1, title: "Two timings that match", from: [2] },
  { n: 2, title: "The longest run of different codes", from: [3, 6] },
  { n: 3, title: "Passengers on each section", from: [4] },
  { n: 4, title: "The spiral timetable", from: [5] },
  { n: 5, title: "Nearly a palindrome", from: [2, 6] },
];
