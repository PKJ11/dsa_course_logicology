// SORT lesson and problem metadata. Minutes are the author's reading-and-stepping estimates.

import type { LessonMeta, ProblemMeta } from "../types";

export const SORT_LESSONS: LessonMeta[] = [
  {
    n: 1,
    title: "Selection, insertion and bubble sort",
    minutes: 16,
    figures: ["SORT-1.1"],
    practice: 1,
    sections: [
      { id: "why", title: "Why sorting matters" },
      { id: "three", title: "Three simple sorts" },
      { id: "insertion", title: "Insertion sort" },
      { id: "selection", title: "Selection sort and bubble sort" },
      { id: "compare", title: "Which to use" },
    ],
  },
  {
    n: 2,
    title: "Merge sort",
    minutes: 15,
    figures: ["SORT-2.1"],
    practice: 2,
    sections: [
      { id: "merge", title: "Merging two sorted lists" },
      { id: "sort", title: "The whole sort" },
      { id: "cost", title: "Why it is n log n" },
      { id: "inversions", title: "Counting inversions while merging" },
    ],
  },
  {
    n: 3,
    title: "Quick sort and partitioning",
    minutes: 16,
    figures: ["SORT-3.1"],
    practice: 4,
    sections: [
      { id: "partition", title: "Partitioning" },
      { id: "sort", title: "The whole sort" },
      { id: "cost", title: "Good and bad pivots" },
      { id: "repeats", title: "Many equal values" },
    ],
  },
  {
    n: 4,
    title: "Heap sort",
    minutes: 15,
    figures: ["SORT-4.1"],
    sections: [
      { id: "heap", title: "A tree inside a list" },
      { id: "sift", title: "Sifting down" },
      { id: "sort", title: "The sort" },
      { id: "compare", title: "Heap sort against the others" },
    ],
  },
  {
    n: 5,
    title: "The n log n lower bound",
    minutes: 12,
    figures: ["SORT-5.1"],
    sections: [
      { id: "model", title: "Sorting by comparing" },
      { id: "tree", title: "The decision tree" },
      { id: "proof", title: "The proof" },
      { id: "beyond", title: "Sorting faster than the bound" },
    ],
  },
  {
    n: 6,
    title: "Counting and radix sort",
    minutes: 14,
    figures: ["SORT-6.1"],
    practice: 5,
    sections: [
      { id: "counting", title: "Counting sort" },
      { id: "stable", title: "A stable version, for records" },
      { id: "radix", title: "Radix sort" },
    ],
  },
  {
    n: 7,
    title: "Stability and sorted()",
    minutes: 12,
    figures: ["SORT-7.1"],
    practice: 6,
    sections: [
      { id: "stable", title: "What stable means" },
      { id: "python", title: "sorted() and list.sort()" },
      { id: "multi", title: "Sorting by several fields" },
      { id: "patterns", title: "Useful patterns" },
    ],
  },
  {
    n: 8,
    title: "Quickselect",
    minutes: 13,
    figures: ["SORT-8.1"],
    practice: 4,
    sections: [
      { id: "problem", title: "The k-th smallest" },
      { id: "idea", title: "Partition, then keep one side" },
      { id: "cost", title: "Why it is O(n) on average" },
      { id: "equal", title: "Many equal values" },
      { id: "others", title: "Other ways" },
    ],
  },
];

export const SORT_PROBLEMS: ProblemMeta[] = [
  { n: 1, title: "Nearly in order", from: [1] },
  { n: 2, title: "Merge sort", from: [2] },
  { n: 3, title: "How far out of order", from: [2] },
  { n: 4, title: "The k-th fastest", from: [3, 8] },
  { n: 5, title: "Passenger ages", from: [6] },
  { n: 6, title: "The departure board", from: [7] },
];
