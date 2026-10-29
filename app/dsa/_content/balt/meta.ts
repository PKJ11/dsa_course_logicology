// BALT lesson and problem metadata. Minutes are the author's reading-and-stepping estimates.

import type { LessonMeta, ProblemMeta } from "../types";

export const BALT_LESSONS: LessonMeta[] = [
  {
    n: 1,
    title: "Why balance matters",
    minutes: 12,
    figures: ["BALT-1.1"],
    practice: 1,
    sections: [
      { id: "cost", title: "The height is the cost" },
      { id: "worst", title: "The worst case is common" },
      { id: "perfect", title: "Perfect balance is too strict" },
      { id: "families", title: "Three ways to stay short" },
    ],
  },
  {
    n: 2,
    title: "Rotations",
    minutes: 13,
    figures: ["BALT-2.1"],
    practice: 2,
    sections: [
      { id: "what", title: "What a rotation does" },
      { id: "code", title: "The code" },
      { id: "order", title: "Why the order survives" },
      { id: "double", title: "Double rotations" },
    ],
  },
  {
    n: 3,
    title: "AVL trees",
    minutes: 16,
    figures: ["BALT-3.1"],
    practice: 3,
    sections: [
      { id: "rule", title: "The AVL rule" },
      { id: "insert", title: "Insert and the four cases" },
      { id: "height", title: "Why the height is O(log n)" },
      { id: "code", title: "The code" },
      { id: "delete", title: "Deleting" },
    ],
  },
  {
    n: 4,
    title: "Red-black trees",
    minutes: 16,
    figures: ["BALT-4.1"],
    practice: 4,
    sections: [
      { id: "rules", title: "The four rules" },
      { id: "height", title: "Why the height is O(log n)" },
      { id: "insert", title: "Insert: recolour or rotate" },
      { id: "llrb", title: "A shorter version" },
      { id: "compare", title: "AVL or red-black?" },
    ],
  },
  {
    n: 5,
    title: "B-trees and disks",
    minutes: 15,
    figures: ["BALT-5.1"],
    practice: 5,
    sections: [
      { id: "disks", title: "Reading from a disk" },
      { id: "rules", title: "The B-tree rules" },
      { id: "search", title: "Search" },
      { id: "insert", title: "Insert with splits" },
      { id: "bplus", title: "B+ trees in databases" },
    ],
  },
  {
    n: 6,
    title: "Skip lists",
    minutes: 13,
    figures: ["BALT-6.1"],
    practice: 6,
    sections: [
      { id: "lanes", title: "Linked lists with levels that skip ahead" },
      { id: "search", title: "Search" },
      { id: "insert", title: "Insert with coin flips" },
      { id: "cost", title: "Expected cost" },
      { id: "python", title: "In Python" },
    ],
  },
];

export const BALT_PROBLEMS: ProblemMeta[] = [
  { n: 1, title: "Is it balanced?", from: [1, 3] },
  { n: 2, title: "Rotate at a key", from: [2] },
  { n: 3, title: "AVL insert", from: [2, 3] },
  { n: 4, title: "Red-black insert", from: [4] },
  { n: 5, title: "B-tree insert", from: [5] },
  { n: 6, title: "A skip list", from: [6] },
];
