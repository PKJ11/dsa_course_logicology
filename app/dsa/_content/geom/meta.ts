// GEOM lesson and problem metadata. Minutes are the author's reading-and-stepping estimates.

import type { LessonMeta, ProblemMeta } from "../types";

export const GEOM_LESSONS: LessonMeta[] = [
  {
    n: 1,
    title: "Points, vectors and the cross product",
    minutes: 15,
    figures: ["GEOM-1.1"],
    practice: 1,
    sections: [
      { id: "vectors", title: "Points and vectors" },
      { id: "dot", title: "The dot product" },
      { id: "cross", title: "The cross product" },
      { id: "exact", title: "Whole numbers, not floats" },
      { id: "area", title: "The area of a polygon" },
      { id: "pick", title: "Points inside: Pick's theorem" },
    ],
  },
  {
    n: 2,
    title: "Orientation and intersection",
    minutes: 14,
    figures: ["GEOM-2.1"],
    practice: 2,
    sections: [
      { id: "orient", title: "Orientation" },
      { id: "meet", title: "Do two pieces meet?" },
      { id: "zero", title: "When an orientation is 0" },
      { id: "where", title: "Where they cross" },
      { id: "inside", title: "Is a point inside a polygon?" },
    ],
  },
  {
    n: 3,
    title: "Convex hull",
    minutes: 14,
    figures: ["GEOM-3.1"],
    practice: 3,
    sections: [
      { id: "what", title: "What a hull is" },
      { id: "wrap", title: "Gift wrapping" },
      { id: "chain", title: "Andrew's monotone chain" },
      { id: "why", title: "Why it works" },
      { id: "bound", title: "Why n log n is needed" },
      { id: "uses", title: "What hulls are for" },
    ],
  },
  {
    n: 4,
    title: "Sweep line",
    minutes: 15,
    figures: ["GEOM-4.1"],
    practice: 4,
    sections: [
      { id: "idea", title: "Sweeping" },
      { id: "met", title: "Sweeps you have met" },
      { id: "any", title: "Do any two pieces meet?" },
      { id: "proof", title: "Why neighbours are enough" },
      { id: "python", title: "The ordered list in Python" },
      { id: "more", title: "Every crossing, and other sweeps" },
    ],
  },
];

export const GEOM_PROBLEMS: ProblemMeta[] = [
  { n: 1, title: "Points inside a field", from: [1] },
  { n: 2, title: "Do two tracks meet?", from: [2] },
  { n: 3, title: "The fence around the stations", from: [3] },
  { n: 4, title: "Any two tracks crossing?", from: [4] },
];
