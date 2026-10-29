// LINK lesson and problem metadata. Minutes are the author's reading-and-stepping estimates.

import type { LessonMeta, ProblemMeta } from "../types";

export const LINK_LESSONS: LessonMeta[] = [
  {
    n: 1,
    title: "Nodes and references",
    minutes: 12,
    figures: ["LINK-1.1"],
    practice: 1,
    sections: [
      { id: "node", title: "A node and its next" },
      { id: "memory", title: "A block against a chain" },
      { id: "costs", title: "What is fast and what is slow" },
      { id: "python", title: "Linked lists in Python" },
    ],
  },
  {
    n: 2,
    title: "Insert and delete",
    minutes: 14,
    figures: ["LINK-2.1"],
    practice: 1,
    sections: [
      { id: "insert", title: "Insert after a node" },
      { id: "delete", title: "Delete after a node" },
      { id: "head", title: "The head is a special case" },
      { id: "dummy", title: "A dummy node removes it" },
    ],
  },
  {
    n: 3,
    title: "Doubly and circular lists",
    minutes: 14,
    figures: ["LINK-3.1"],
    practice: 2,
    sections: [
      { id: "prev", title: "A second reference: prev" },
      { id: "sentinels", title: "Sentinel nodes at both ends" },
      { id: "circular", title: "Circular lists" },
      { id: "deque", title: "How Python's deque is built" },
    ],
  },
  {
    n: 4,
    title: "Reversing",
    minutes: 13,
    figures: ["LINK-4.1"],
    practice: 3,
    sections: [
      { id: "three", title: "Three names: prev, cur, nxt" },
      { id: "proof", title: "Why it is correct" },
      { id: "recursive", title: "The recursive version" },
      { id: "part", title: "Reversing part of a list" },
    ],
  },
  {
    n: 5,
    title: "Fast and slow pointers",
    minutes: 15,
    figures: ["LINK-5.1"],
    practice: 5,
    sections: [
      { id: "middle", title: "The middle node" },
      { id: "loop", title: "Does the list have a loop?" },
      { id: "start", title: "Where the loop starts" },
      { id: "gap", title: "A fixed gap: k-th from the end" },
    ],
  },
  {
    n: 6,
    title: "Merging lists",
    minutes: 14,
    figures: ["LINK-6.1"],
    practice: 6,
    sections: [
      { id: "merge", title: "Merging two sorted lists" },
      { id: "stable", title: "Ties and stability" },
      { id: "sort", title: "Merge sort on a linked list" },
      { id: "when", title: "When to use a linked list" },
    ],
  },
];

export const LINK_PROBLEMS: ProblemMeta[] = [
  { n: 1, title: "Remove a station", from: [1, 2] },
  { n: 2, title: "A two-way line", from: [3] },
  { n: 3, title: "Reverse a section", from: [4] },
  { n: 4, title: "Turn each group round", from: [4] },
  { n: 5, title: "Where the loop starts", from: [5] },
  { n: 6, title: "Sort the train", from: [5, 6] },
];
