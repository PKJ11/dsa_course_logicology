// CORR lesson and problem metadata. Minutes are the author's reading-and-stepping estimates.

import type { LessonMeta, ProblemMeta } from "../types";

export const CORR_LESSONS: LessonMeta[] = [
  {
    n: 1,
    title: "What “correct” means",
    minutes: 13,
    figures: ["CORR-1.1"],
    practice: 1,
    sections: [
      { id: "spec", title: "A promise about inputs and outputs" },
      { id: "conditions", title: "Input conditions and promises" },
      { id: "edges", title: "Edge cases" },
      { id: "stops", title: "The right answer, and it stops" },
    ],
  },
  {
    n: 2,
    title: "Loop invariants",
    minutes: 17,
    figures: ["CORR-2.1"],
    practice: 2,
    sections: [
      { id: "idea", title: "A statement that stays true" },
      { id: "three", title: "Three things to prove" },
      { id: "example", title: "Example: the largest value" },
      { id: "choosing", title: "Choosing a good invariant" },
      { id: "stopping", title: "Proving the loop stops" },
    ],
  },
  {
    n: 3,
    title: "Proof by induction",
    minutes: 16,
    figures: ["CORR-3.1"],
    practice: 5,
    sections: [
      { id: "idea", title: "Proving a claim for every n" },
      { id: "odd", title: "Example: adding odd numbers" },
      { id: "strong", title: "Strong induction" },
      { id: "code", title: "Induction proves recursive code" },
      { id: "mistakes", title: "Common mistakes" },
    ],
  },
  {
    n: 4,
    title: "Contradiction and counterexamples",
    boardTitle: "Contradiction and counter­examples",
    minutes: 14,
    figures: ["CORR-4.1"],
    practice: 4,
    sections: [
      { id: "contradiction", title: "Proof by contradiction" },
      { id: "pigeonhole", title: "Example: a repeat must exist" },
      { id: "counterexample", title: "One counterexample is enough" },
      { id: "coins", title: "Example: making change with coins" },
      { id: "finding", title: "How to find a counterexample" },
    ],
  },
  {
    n: 5,
    title: "Testing versus proving",
    minutes: 14,
    figures: ["CORR-5.1"],
    practice: 4,
    sections: [
      { id: "limits", title: "What tests can and cannot show" },
      { id: "choosing", title: "Choosing tests" },
      { id: "stress", title: "Stress testing" },
      { id: "shrinking", title: "Making a failing input small" },
      { id: "both", title: "Use both" },
    ],
  },
];

export const CORR_PROBLEMS: ProblemMeta[] = [
  { n: 1, title: "Is the timetable in order?", from: [1] },
  { n: 2, title: "The second fastest train", from: [1, 2] },
  { n: 3, title: "Three classes of coach", from: [2] },
  { n: 4, title: "Break these functions", from: [4, 5] },
  { n: 5, title: "The best stretch of line", from: [2, 3] },
];
