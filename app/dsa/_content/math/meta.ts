// MATH lesson and problem metadata. Minutes are the author's reading-and-stepping estimates.

import type { LessonMeta, ProblemMeta } from "../types";

export const MATH_LESSONS: LessonMeta[] = [
  {
    n: 1,
    title: "Divisibility and GCD",
    minutes: 13,
    figures: ["MATH-1.1"],
    practice: 1,
    sections: [
      { id: "divides", title: "Divisors and remainders" },
      { id: "euclid", title: "Euclid’s algorithm" },
      { id: "fast", title: "Why it is fast" },
      { id: "lcm", title: "The least common multiple" },
      { id: "bezout", title: "The extended algorithm" },
    ],
  },
  {
    n: 2,
    title: "Modular arithmetic",
    minutes: 12,
    figures: ["MATH-2.1"],
    practice: 2,
    sections: [
      { id: "clock", title: "Arithmetic on a clock" },
      { id: "rules", title: "Take the remainder at every step" },
      { id: "why", title: "Why reduce in Python" },
      { id: "classes", title: "Counting by remainder" },
      { id: "uses", title: "Where remainders are used" },
    ],
  },
  {
    n: 3,
    title: "Fast exponentiation",
    minutes: 13,
    figures: ["MATH-3.1"],
    practice: 3,
    sections: [
      { id: "bits", title: "Powers from the bits of n" },
      { id: "mod", title: "With a modulus" },
      { id: "matrices", title: "Powers of a matrix" },
      { id: "recurrences", title: "Any linear rule" },
      { id: "uses", title: "Where fast powers are used" },
    ],
  },
  {
    n: 4,
    title: "The sieve of Eratosthenes",
    minutes: 13,
    figures: ["MATH-4.1"],
    practice: 4,
    sections: [
      { id: "trial", title: "Testing one number" },
      { id: "sieve", title: "Crossing out multiples" },
      { id: "cost", title: "What the sieve costs" },
      { id: "factor", title: "Smallest factors" },
      { id: "segment", title: "Primes in a far window" },
    ],
  },
  {
    n: 5,
    title: "Modular inverse",
    minutes: 13,
    figures: ["MATH-5.1"],
    practice: 5,
    sections: [
      { id: "divide", title: "Dividing on a clock" },
      { id: "euclid", title: "Inverses from Euclid" },
      { id: "fermat", title: "Fermat’s little theorem" },
      { id: "many", title: "Many inverses at once" },
      { id: "crt", title: "The Chinese remainder theorem" },
    ],
  },
  {
    n: 6,
    title: "Combinations and Pascal’s triangle",
    minutes: 13,
    figures: ["MATH-6.1"],
    practice: 6,
    sections: [
      { id: "count", title: "Choosing k of n" },
      { id: "pascal", title: "Pascal’s rule" },
      { id: "mod", title: "Counts modulo a prime" },
      { id: "lucas", title: "Huge n, small p" },
      { id: "patterns", title: "Counting patterns" },
    ],
  },
  {
    n: 7,
    title: "Probability for algorithms",
    minutes: 14,
    figures: ["MATH-7.1"],
    practice: 7,
    sections: [
      { id: "chance", title: "Chances as fractions" },
      { id: "expect", title: "Expected value" },
      { id: "repeats", title: "Repeats and waiting" },
      { id: "shuffle", title: "A fair shuffle" },
      { id: "sample", title: "Sampling a stream" },
      { id: "random", title: "Randomness in code" },
    ],
  },
];

export const MATH_PROBLEMS: ProblemMeta[] = [
  { n: 1, title: "Paying with two coins", from: [1] },
  { n: 2, title: "Pairs that add to a multiple", from: [2] },
  { n: 3, title: "The footbridge, 10¹⁸ steps", from: [3] },
  { n: 4, title: "Primes in a window", from: [4] },
  { n: 5, title: "The Chinese remainder theorem", from: [5] },
  { n: 6, title: "Combinations modulo a prime", from: [6] },
  { n: 7, title: "A fair sample from a stream", from: [7] },
];
