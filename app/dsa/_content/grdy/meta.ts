// GRDY lesson and problem metadata. Minutes are the author's reading-and-stepping estimates.

import type { LessonMeta, ProblemMeta } from "../types";

export const GRDY_LESSONS: LessonMeta[] = [
  {
    n: 1,
    title: "The greedy choice",
    minutes: 12,
    figures: ["GRDY-1.1"],
    practice: 1,
    sections: [
      { id: "idea", title: "Build the answer one piece at a time" },
      { id: "bag", title: "A bag that holds 8 kg" },
      { id: "two", title: "The two things greedy needs" },
      { id: "cost", title: "Cost" },
      { id: "python", title: "In Python" },
    ],
  },
  {
    n: 2,
    title: "Exchange arguments",
    minutes: 14,
    figures: ["GRDY-2.1"],
    practice: 2,
    sections: [
      { id: "proof", title: "How to prove a greedy method" },
      { id: "wait", title: "Shortest job first" },
      { id: "late", title: "Earliest deadline first" },
      { id: "recipe", title: "The recipe" },
      { id: "bag", title: "Back to the bag" },
    ],
  },
  {
    n: 3,
    title: "Interval scheduling",
    minutes: 15,
    figures: ["GRDY-3.1"],
    practice: 3,
    sections: [
      { id: "problem", title: "The most bookings" },
      { id: "rules", title: "Three rules that look right" },
      { id: "ahead", title: "Greedy stays ahead" },
      { id: "platforms", title: "Fewest platforms" },
      { id: "family", title: "Related problems" },
    ],
  },
  {
    n: 4,
    title: "Huffman coding",
    minutes: 15,
    figures: ["GRDY-4.1"],
    practice: 5,
    sections: [
      { id: "codes", title: "Codes of different lengths" },
      { id: "prefix", title: "Prefix-free codes are trees" },
      { id: "build", title: "Building the tree" },
      { id: "why", title: "Why it is the best" },
      { id: "code", title: "The code" },
    ],
  },
  {
    n: 5,
    title: "When greedy fails",
    minutes: 13,
    figures: ["GRDY-5.1"],
    practice: 6,
    sections: [
      { id: "fails", title: "Counterexamples" },
      { id: "coins", title: "Which coin systems are safe" },
      { id: "test", title: "Testing a greedy idea" },
      { id: "matroid", title: "When greedy always works" },
      { id: "next", title: "What to do instead" },
    ],
  },
];

export const GRDY_PROBLEMS: ProblemMeta[] = [
  { n: 1, title: "How much of each item", from: [1] },
  { n: 2, title: "The least lateness", from: [2] },
  { n: 3, title: "The most bookings", from: [3] },
  { n: 4, title: "Fewest platforms", from: [3] },
  { n: 5, title: "Huffman codes", from: [4] },
  { n: 6, title: "When greedy change fails", from: [5] },
];
