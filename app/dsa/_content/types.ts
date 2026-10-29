import type { ReactNode } from "react";

// Shapes shared by every station's content folder.

export type LessonMeta = {
  n: number;
  title: string;
  // The title as set on the lesson's board, with a soft hyphen (­) inside any word too wide for a phone.
  boardTitle?: string;
  minutes: number;
  figures: string[];
  sections: { id: string; title: string }[];
  practice?: number;
};

export type ProblemMeta = { n: number; title: string; from: number[] };

export type TestCase = {
  name: string;
  args: string;
  expect: string;
  show: string;
  why: string;
  /** Count reads from the first argument; fail above this many. */
  probe?: number;
  timeout?: number;
  trace?: (number | string)[];
  /** A Python expression run in the learner's file instead of fn(*args), for classes and in-place work. */
  expr?: string;
};

export type Hint = { kind: "Nudge" | "Approach" | "Pseudocode"; body: ReactNode };

export type Problem = {
  n: number;
  title: string;
  fn: string;
  lessons: number[];
  /** Tools switched off for this problem: "sorted" (also .sort() on the inputs), "pow", "heapq", "math.isqrt", "itertools.permutations", … */
  blocked?: string[];
  starter: string;
  statement: ReactNode;
  hints: Hint[];
  tests: TestCase[];
};

export type Solution = { code: string; notes: string[] };
