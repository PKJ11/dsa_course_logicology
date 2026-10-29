// STRG lesson and problem metadata. Minutes are the author's reading-and-stepping estimates.

import type { LessonMeta, ProblemMeta } from "../types";

export const STRG_LESSONS: LessonMeta[] = [
  {
    n: 1,
    title: "Naive matching",
    minutes: 11,
    figures: ["STRG-1.1"],
    practice: 1,
    sections: [
      { id: "words", title: "Text, pattern and places" },
      { id: "naive", title: "Try every place" },
      { id: "cost", title: "What it costs" },
      { id: "waste", title: "What the naive method forgets" },
      { id: "python", title: "Python's own tools" },
    ],
  },
  {
    n: 2,
    title: "KMP",
    minutes: 15,
    figures: ["STRG-2.1"],
    practice: 2,
    sections: [
      { id: "borders", title: "Borders" },
      { id: "table", title: "The border table π" },
      { id: "build", title: "Building π in O(m)" },
      { id: "search", title: "Searching without stepping back" },
      { id: "uses", title: "More from the table" },
    ],
  },
  {
    n: 3,
    title: "Z-algorithm",
    minutes: 12,
    figures: ["STRG-3.1"],
    practice: 3,
    sections: [
      { id: "z", title: "The Z-array" },
      { id: "box", title: "The box" },
      { id: "linear", title: "Why it is O(n)" },
      { id: "match", title: "Matching with a separator" },
      { id: "compare", title: "Z or π?" },
    ],
  },
  {
    n: 4,
    title: "Rolling hash and Rabin-Karp",
    minutes: 14,
    figures: ["STRG-4.1"],
    practice: 4,
    sections: [
      { id: "idea", title: "Compare numbers, not letters" },
      { id: "roll", title: "Rolling the hash" },
      { id: "collide", title: "How often hashes collide" },
      { id: "prefix", title: "Hashes of every piece" },
      { id: "choices", title: "Choosing the base and the modulus" },
    ],
  },
  {
    n: 5,
    title: "Suffix arrays",
    minutes: 16,
    figures: ["STRG-5.1"],
    practice: 5,
    sections: [
      { id: "sa", title: "Sorted endings" },
      { id: "double", title: "Prefix doubling" },
      { id: "find", title: "Finding a pattern" },
      { id: "lcp", title: "The lcp array and Kasai's method" },
      { id: "uses", title: "What the two arrays answer" },
    ],
  },
  {
    n: 6,
    title: "Manacher’s palindromes",
    boardTitle: "Manacher’s palin­dromes",
    minutes: 13,
    figures: ["STRG-6.1"],
    practice: 6,
    sections: [
      { id: "centres", title: "Palindromes around a centre" },
      { id: "mirror", title: "The mirror rule" },
      { id: "linear", title: "Why it is O(n)" },
      { id: "even", title: "Even lengths, and one array for both" },
      { id: "uses", title: "What the radii give you" },
    ],
  },
];

export const STRG_PROBLEMS: ProblemMeta[] = [
  { n: 1, title: "Patterns with blanks", from: [1] },
  { n: 2, title: "Every place, fast", from: [2] },
  { n: 3, title: "How much of the pattern fits", from: [3] },
  { n: 4, title: "The longest repeated piece", from: [4] },
  { n: 5, title: "Sorted endings", from: [5] },
  { n: 6, title: "Palindromes in a string", from: [6] },
];
