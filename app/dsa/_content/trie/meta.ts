// TRIE lesson and problem metadata. Minutes are the author's reading-and-stepping estimates.

import type { LessonMeta, ProblemMeta } from "../types";

export const TRIE_LESSONS: LessonMeta[] = [
  {
    n: 1,
    title: "Prefix trees",
    minutes: 12,
    figures: ["TRIE-1.1"],
    practice: 1,
    sections: [
      { id: "job", title: "Words that share a start" },
      { id: "shape", title: "The shape of a trie" },
      { id: "node", title: "A node in Python" },
      { id: "cost", title: "Cost and memory" },
    ],
  },
  {
    n: 2,
    title: "Insert, search and delete",
    minutes: 14,
    figures: ["TRIE-2.1"],
    practice: 2,
    sections: [
      { id: "search", title: "Search and prefix search" },
      { id: "delete", title: "Delete without leaving waste" },
      { id: "code", title: "The code" },
      { id: "counts", title: "Counting words that pass through" },
    ],
  },
  {
    n: 3,
    title: "Autocomplete",
    minutes: 13,
    figures: ["TRIE-3.1"],
    practice: 3,
    sections: [
      { id: "walk", title: "Walk, then collect" },
      { id: "order", title: "Why the order is alphabetical" },
      { id: "best", title: "The best few, not all" },
      { id: "other", title: "A sorted list does this too" },
    ],
  },
  {
    n: 4,
    title: "Compressed tries",
    minutes: 13,
    figures: ["TRIE-4.1"],
    practice: 4,
    sections: [
      { id: "waste", title: "Nodes that do no work" },
      { id: "bound", title: "At most 2n nodes" },
      { id: "insert", title: "Insert splits an edge" },
      { id: "uses", title: "Where they are used" },
    ],
  },
  {
    n: 5,
    title: "Bitwise tries for XOR",
    minutes: 14,
    figures: ["TRIE-5.1"],
    practice: 5,
    sections: [
      { id: "bits", title: "Numbers as words of bits" },
      { id: "greedy", title: "The best partner, bit by bit" },
      { id: "code", title: "The code and its cost" },
      { id: "more", title: "Other questions it answers" },
    ],
  },
];

export const TRIE_PROBLEMS: ProblemMeta[] = [
  { n: 1, title: "A trie", from: [1, 2] },
  { n: 2, title: "Counting words and prefixes", from: [2] },
  { n: 3, title: "Search box suggestions", from: [3] },
  { n: 4, title: "A compressed trie", from: [4] },
  { n: 5, title: "The largest XOR of two numbers", from: [5] },
];
