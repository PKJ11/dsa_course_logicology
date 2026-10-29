// DSUF lesson and problem metadata. Minutes are the author's reading-and-stepping estimates.

import type { LessonMeta, ProblemMeta } from "../types";

export const DSUF_LESSONS: LessonMeta[] = [
  {
    n: 1,
    title: "Disjoint sets",
    minutes: 12,
    figures: ["DSUF-1.1"],
    practice: 1,
    sections: [
      { id: "job", title: "Groups that only merge" },
      { id: "labels", title: "A label per element" },
      { id: "forest", title: "A forest of parent pointers" },
      { id: "code", title: "The code" },
    ],
  },
  {
    n: 2,
    title: "Union by rank",
    minutes: 12,
    figures: ["DSUF-2.1"],
    practice: 2,
    sections: [
      { id: "tall", title: "How trees grow tall" },
      { id: "rank", title: "The smaller tree goes below" },
      { id: "proof", title: "Why the height is at most log₂ n" },
      { id: "size", title: "Union by size" },
    ],
  },
  {
    n: 3,
    title: "Path compression",
    minutes: 12,
    figures: ["DSUF-3.1"],
    practice: 1,
    sections: [
      { id: "idea", title: "Shorten the path while you use it" },
      { id: "code", title: "Two passes, or one" },
      { id: "together", title: "Using both" },
      { id: "recursion", title: "A warning about recursion" },
    ],
  },
  {
    n: 4,
    title: "Why it is nearly O(1)",
    minutes: 13,
    figures: ["DSUF-4.1"],
    practice: 1,
    sections: [
      { id: "amortised", title: "Cost over many operations" },
      { id: "measured", title: "What the numbers show" },
      { id: "logstar", title: "The iterated logarithm" },
      { id: "alpha", title: "The exact bound" },
    ],
  },
  {
    n: 5,
    title: "Applications",
    minutes: 14,
    figures: ["DSUF-5.1"],
    practice: 3,
    sections: [
      { id: "groups", title: "Counting groups" },
      { id: "cycles", title: "Finding cycles" },
      { id: "grid", title: "Grids and islands" },
      { id: "names", title: "Elements that are not numbers" },
      { id: "limits", title: "What union-find cannot do" },
    ],
  },
];

export const DSUF_PROBLEMS: ProblemMeta[] = [
  { n: 1, title: "Union-find", from: [1, 2, 3] },
  { n: 2, title: "The largest group so far", from: [2] },
  { n: 3, title: "The road that closes a loop", from: [5] },
  { n: 4, title: "Islands rising", from: [5] },
  { n: 5, title: "Equal and not equal", from: [5] },
];
