// RNGQ lesson and problem metadata. Minutes are the author's reading-and-stepping estimates.

import type { LessonMeta, ProblemMeta } from "../types";

export const RNGQ_LESSONS: LessonMeta[] = [
  {
    n: 1,
    title: "Prefix sums revisited",
    minutes: 12,
    figures: ["RNGQ-1.1"],
    practice: 1,
    sections: [
      { id: "idea", title: "Range questions" },
      { id: "prefix", title: "Prefix sums" },
      { id: "diff", title: "Adding to ranges" },
      { id: "grid", title: "Two dimensions" },
      { id: "python", title: "In Python" },
    ],
  },
  {
    n: 2,
    title: "Sparse table",
    minutes: 13,
    figures: ["RNGQ-2.1"],
    practice: 2,
    sections: [
      { id: "min", title: "The smallest value in a range" },
      { id: "table", title: "The table" },
      { id: "ask", title: "Answering with two blocks" },
      { id: "which", title: "Which operations work" },
    ],
  },
  {
    n: 3,
    title: "Fenwick tree",
    minutes: 15,
    figures: ["RNGQ-3.1"],
    practice: 3,
    sections: [
      { id: "change", title: "Sums that change" },
      { id: "lowbit", title: "The lowest 1 bit" },
      { id: "ops", title: "Prefix sum and update" },
      { id: "code", title: "The code" },
      { id: "why", title: "Why it works" },
    ],
  },
  {
    n: 4,
    title: "Segment tree",
    minutes: 15,
    figures: ["RNGQ-4.1"],
    practice: 4,
    sections: [
      { id: "tree", title: "A tree of ranges" },
      { id: "ask", title: "Asking" },
      { id: "update", title: "Changing a value" },
      { id: "code", title: "Stored in a list" },
      { id: "combine", title: "Any operation that combines" },
    ],
  },
  {
    n: 5,
    title: "Lazy propagation",
    minutes: 15,
    figures: ["RNGQ-5.1"],
    practice: 5,
    sections: [
      { id: "range", title: "Changing a whole range" },
      { id: "tags", title: "Tags" },
      { id: "push", title: "Pushing a tag down" },
      { id: "code", title: "The code" },
    ],
  },
  {
    n: 6,
    title: "Square-root decomposition",
    minutes: 13,
    figures: ["RNGQ-6.1"],
    practice: 6,
    sections: [
      { id: "blocks", title: "Blocks" },
      { id: "size", title: "Choosing the block size" },
      { id: "lazy", title: "Range changes on blocks" },
      { id: "when", title: "When to use it" },
    ],
  },
];

export const RNGQ_PROBLEMS: ProblemMeta[] = [
  { n: 1, title: "Adds, then sums", from: [1] },
  { n: 2, title: "The smallest in a range", from: [2] },
  { n: 3, title: "A Fenwick tree", from: [3] },
  { n: 4, title: "The smallest, with changes", from: [4] },
  { n: 5, title: "Add to a range, sum a range", from: [5] },
  { n: 6, title: "Blocks: add and largest", from: [6] },
];
