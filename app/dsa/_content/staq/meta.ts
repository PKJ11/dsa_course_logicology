// STAQ lesson and problem metadata. Minutes are the author's reading-and-stepping estimates.

import type { LessonMeta, ProblemMeta } from "../types";

export const STAQ_LESSONS: LessonMeta[] = [
  {
    n: 1,
    title: "Last in, first out",
    minutes: 11,
    figures: ["STAQ-1.1"],
    practice: 1,
    sections: [
      { id: "stack", title: "What a stack is" },
      { id: "list", title: "A Python list is a stack" },
      { id: "uses", title: "Where stacks appear" },
      { id: "empty", title: "The empty stack" },
    ],
  },
  {
    n: 2,
    title: "Brackets and expressions",
    minutes: 15,
    figures: ["STAQ-2.1"],
    practice: 1,
    sections: [
      { id: "brackets", title: "Matching brackets" },
      { id: "why", title: "Why a stack fits this job" },
      { id: "postfix", title: "Postfix expressions" },
      { id: "infix", title: "From normal order to postfix" },
    ],
  },
  {
    n: 3,
    title: "Queues and deque",
    minutes: 12,
    figures: ["STAQ-3.1"],
    practice: 3,
    sections: [
      { id: "queue", title: "First in, first out" },
      { id: "pop0", title: "Why list.pop(0) is slow" },
      { id: "deque", title: "collections.deque" },
      { id: "uses", title: "Where queues appear" },
    ],
  },
  {
    n: 4,
    title: "Circular buffers",
    minutes: 12,
    figures: ["STAQ-4.1"],
    practice: 4,
    sections: [
      { id: "fixed", title: "A queue in a fixed list" },
      { id: "wrap", title: "Wrapping round with %" },
      { id: "full", title: "Full or empty?" },
      { id: "uses", title: "Where they are used" },
    ],
  },
  {
    n: 5,
    title: "Monotonic stack",
    minutes: 15,
    figures: ["STAQ-5.1"],
    practice: 5,
    sections: [
      { id: "problem", title: "The next bigger value" },
      { id: "stack", title: "Keep a stack in order" },
      { id: "cost", title: "Why it is O(n)" },
      { id: "family", title: "The same idea, other questions" },
    ],
  },
  {
    n: 6,
    title: "Monotonic queue",
    minutes: 14,
    figures: ["STAQ-6.1"],
    practice: 6,
    sections: [
      { id: "problem", title: "The biggest value in a moving window" },
      { id: "deque", title: "A deque kept in order" },
      { id: "cost", title: "Why it is O(n)" },
      { id: "compare", title: "Other ways, and their cost" },
    ],
  },
];

export const STAQ_PROBLEMS: ProblemMeta[] = [
  { n: 1, title: "Brackets in order", from: [1, 2] },
  { n: 2, title: "The postfix calculator", from: [2] },
  { n: 3, title: "Recent pings", from: [3] },
  { n: 4, title: "A ring of platforms", from: [4] },
  { n: 5, title: "Next taller signal", from: [5] },
  { n: 6, title: "Biggest in each window", from: [6] },
];
