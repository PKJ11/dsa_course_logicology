// TREE lesson and problem metadata. Minutes are the author's reading-and-stepping estimates.

import type { LessonMeta, ProblemMeta } from "../types";

export const TREE_LESSONS: LessonMeta[] = [
  {
    n: 1,
    title: "Vocabulary",
    minutes: 13,
    figures: ["TREE-1.1"],
    practice: 1,
    sections: [
      { id: "words", title: "Root, children, leaves" },
      { id: "binary", title: "Binary trees in Python" },
      { id: "shapes", title: "Height and the number of nodes" },
      { id: "recursion", title: "Thinking recursively" },
    ],
  },
  {
    n: 2,
    title: "Traversals",
    minutes: 15,
    figures: ["TREE-2.1"],
    practice: 1,
    sections: [
      { id: "depth", title: "Pre-order, in-order, post-order" },
      { id: "level", title: "Level order with a queue" },
      { id: "stack", title: "Without recursion" },
      { id: "cost", title: "Cost and when to use which" },
    ],
  },
  {
    n: 3,
    title: "Rebuilding a tree from traversals",
    minutes: 13,
    figures: ["TREE-3.1"],
    practice: 2,
    sections: [
      { id: "idea", title: "Two lists fix the tree" },
      { id: "steps", title: "Step by step" },
      { id: "code", title: "The code and its cost" },
      { id: "limits", title: "Which pairs work" },
    ],
  },
  {
    n: 4,
    title: "BST search and insert",
    minutes: 14,
    figures: ["TREE-4.1"],
    practice: 3,
    sections: [
      { id: "rule", title: "The search tree rule" },
      { id: "search", title: "Search" },
      { id: "insert", title: "Insert" },
      { id: "height", title: "Everything depends on the height" },
    ],
  },
  {
    n: 5,
    title: "Successor and deletion",
    minutes: 15,
    figures: ["TREE-5.1"],
    practice: 4,
    sections: [
      { id: "minmax", title: "Smallest, largest, next" },
      { id: "successor", title: "Finding the successor" },
      { id: "delete", title: "Deleting: three cases" },
      { id: "python", title: "Sorted containers in Python" },
    ],
  },
  {
    n: 6,
    title: "Lowest common ancestor",
    minutes: 13,
    figures: ["TREE-6.1"],
    practice: 5,
    sections: [
      { id: "what", title: "What it is" },
      { id: "bst", title: "In a search tree" },
      { id: "any", title: "In any binary tree" },
      { id: "parents", title: "With parent links" },
    ],
  },
  {
    n: 7,
    title: "Serialisation",
    minutes: 12,
    figures: ["TREE-7.1"],
    practice: 6,
    sections: [
      { id: "why", title: "Why write a tree as text" },
      { id: "markers", title: "Pre-order with markers" },
      { id: "read", title: "Reading it back" },
      { id: "formats", title: "Other formats" },
    ],
  },
];

export const TREE_PROBLEMS: ProblemMeta[] = [
  { n: 1, title: "Level by level", from: [1, 2] },
  { n: 2, title: "Rebuild the tree", from: [3] },
  { n: 3, title: "Is it a search tree?", from: [4] },
  { n: 4, title: "Delete a key", from: [4, 5] },
  { n: 5, title: "Lowest common ancestor", from: [6] },
  { n: 6, title: "Write it down, read it back", from: [7] },
];
