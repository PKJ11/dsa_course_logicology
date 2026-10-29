// BITS lesson and problem metadata. Minutes are the author's reading-and-stepping estimates.

import type { LessonMeta, ProblemMeta } from "../types";

export const BITS_LESSONS: LessonMeta[] = [
  {
    n: 1,
    title: "Binary and two’s complement",
    minutes: 13,
    figures: ["BITS-1.1"],
    practice: 1,
    sections: [
      { id: "places", title: "Places worth powers of 2" },
      { id: "python", title: "Binary in Python" },
      { id: "fixed", title: "A fixed number of bits" },
      { id: "negative", title: "Negative numbers" },
      { id: "endless", title: "Python’s endless bits" },
    ],
  },
  {
    n: 2,
    title: "Bitwise operators",
    minutes: 12,
    figures: ["BITS-2.1"],
    practice: 2,
    sections: [
      { id: "and-or", title: "And, or, xor" },
      { id: "not", title: "Not" },
      { id: "shifts", title: "Shifts" },
      { id: "order", title: "Brackets and cost" },
      { id: "gray", title: "Gray codes" },
    ],
  },
  {
    n: 3,
    title: "Masks and the lowest 1 bit",
    minutes: 12,
    figures: ["BITS-3.1"],
    practice: 3,
    sections: [
      { id: "one", title: "One bit at a time" },
      { id: "fields", title: "Fields of several bits" },
      { id: "lowest", title: "The lowest 1 bit" },
      { id: "next", title: "The next number with as many 1s" },
      { id: "tricks", title: "Bit methods: when to use them" },
    ],
  },
  {
    n: 4,
    title: "Counting bits",
    minutes: 12,
    figures: ["BITS-4.1"],
    practice: 4,
    sections: [
      { id: "count", title: "Counting the 1 bits" },
      { id: "parallel", title: "Counting in parallel" },
      { id: "table", title: "Counts for every number" },
      { id: "pattern", title: "The pattern in each place" },
      { id: "uses", title: "Parity, distance and other counts" },
    ],
  },
  {
    n: 5,
    title: "Subsets as bitmasks",
    minutes: 13,
    figures: ["BITS-5.1"],
    practice: 5,
    sections: [
      { id: "sets", title: "A set in one number" },
      { id: "all", title: "Every subset" },
      { id: "sub", title: "Submasks" },
      { id: "middle", title: "Meeting in the middle" },
      { id: "limits", title: "How far subsets go" },
    ],
  },
];

export const BITS_PROBLEMS: ProblemMeta[] = [
  { n: 1, title: "Wrap to w bits", from: [1] },
  { n: 2, title: "From Gray code", from: [2] },
  { n: 3, title: "The next number with as many 1s", from: [3] },
  { n: 4, title: "All the 1 bits up to n", from: [4] },
  { n: 5, title: "The closest subset sum", from: [5] },
];
