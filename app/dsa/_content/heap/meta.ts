// HEAP lesson and problem metadata. Minutes are the author's reading-and-stepping estimates.

import type { LessonMeta, ProblemMeta } from "../types";

export const HEAP_LESSONS: LessonMeta[] = [
  {
    n: 1,
    title: "The heap property",
    minutes: 12,
    figures: ["HEAP-1.1"],
    practice: 1,
    sections: [
      { id: "job", title: "A structure for the smallest value" },
      { id: "rule", title: "The heap rule" },
      { id: "list", title: "A tree stored in a list" },
      { id: "not", title: "What a heap does not tell you" },
    ],
  },
  {
    n: 2,
    title: "Sift up and sift down",
    minutes: 14,
    figures: ["HEAP-2.1"],
    practice: 1,
    sections: [
      { id: "push", title: "Push: sift up" },
      { id: "pop", title: "Pop: sift down" },
      { id: "code", title: "The code" },
      { id: "cost", title: "Cost, and two shortcuts" },
    ],
  },
  {
    n: 3,
    title: "Building a heap in O(n)",
    minutes: 13,
    figures: ["HEAP-3.1"],
    practice: 2,
    sections: [
      { id: "two", title: "Two ways to build" },
      { id: "why", title: "Why bottom-up works" },
      { id: "sum", title: "Adding up the work" },
      { id: "uses", title: "Where it is used" },
    ],
  },
  {
    n: 4,
    title: "heapq and priority queues",
    minutes: 15,
    figures: ["HEAP-4.1"],
    practice: 3,
    sections: [
      { id: "heapq", title: "The heapq module" },
      { id: "max", title: "Max-heaps" },
      { id: "pq", title: "Priority queues and ties" },
      { id: "remove", title: "Changing and removing" },
      { id: "other", title: "Other tools" },
    ],
  },
  {
    n: 5,
    title: "Top-k and k-way merge",
    minutes: 13,
    figures: ["HEAP-5.1"],
    practice: 4,
    sections: [
      { id: "topk", title: "The k largest" },
      { id: "choose", title: "Choosing a method" },
      { id: "merge", title: "Merging k sorted lists" },
      { id: "python", title: "In Python" },
    ],
  },
  {
    n: 6,
    title: "Median of a stream",
    minutes: 13,
    figures: ["HEAP-6.1"],
    practice: 6,
    sections: [
      { id: "problem", title: "The problem" },
      { id: "two", title: "Two heaps" },
      { id: "code", title: "The code and its cost" },
      { id: "more", title: "Other orders and windows" },
    ],
  },
];

export const HEAP_PROBLEMS: ProblemMeta[] = [
  { n: 1, title: "A min-heap", from: [1, 2] },
  { n: 2, title: "Build a heap in O(n)", from: [3] },
  { n: 3, title: "A task queue", from: [4] },
  { n: 4, title: "The k largest", from: [5] },
  { n: 5, title: "Merge k sorted lists", from: [5] },
  { n: 6, title: "Median of a stream", from: [6] },
];
