// GRPH lesson and problem metadata. Minutes are the author's reading-and-stepping estimates.

import type { LessonMeta, ProblemMeta } from "../types";

export const GRPH_LESSONS: LessonMeta[] = [
  {
    n: 1,
    title: "Representing graphs",
    minutes: 13,
    figures: ["GRPH-1.1"],
    practice: 1,
    sections: [
      { id: "words", title: "Vertices and edges" },
      { id: "matrix", title: "The adjacency matrix" },
      { id: "lists", title: "Adjacency lists" },
      { id: "edges", title: "The edge list" },
      { id: "python", title: "Graphs in Python" },
    ],
  },
  {
    n: 2,
    title: "Breadth-first search",
    minutes: 13,
    figures: ["GRPH-2.1"],
    practice: 2,
    sections: [
      { id: "layers", title: "Layer by layer" },
      { id: "proof", title: "Why the distances are right" },
      { id: "route", title: "Getting the route back" },
      { id: "cost", title: "What it costs" },
      { id: "uses", title: "Several starts, and other uses" },
    ],
  },
  {
    n: 3,
    title: "Depth-first search",
    minutes: 14,
    figures: ["GRPH-3.1"],
    practice: 3,
    sections: [
      { id: "deep", title: "Going deep first" },
      { id: "times", title: "Discovery and finish times" },
      { id: "kinds", title: "Four kinds of edges" },
      { id: "stack", title: "Without recursion" },
      { id: "parts", title: "Connected parts" },
    ],
  },
  {
    n: 4,
    title: "Cycle detection",
    minutes: 12,
    figures: ["GRPH-4.1"],
    practice: 4,
    sections: [
      { id: "undirected", title: "Two-way edges" },
      { id: "directed", title: "One-way edges: three states" },
      { id: "proof", title: "Why a back edge is a cycle" },
      { id: "find", title: "Returning the cycle" },
      { id: "uses", title: "Where cycles matter" },
    ],
  },
  {
    n: 5,
    title: "Topological sort",
    minutes: 13,
    figures: ["GRPH-5.1"],
    practice: 5,
    sections: [
      { id: "order", title: "An order that keeps every rule" },
      { id: "exists", title: "When an order exists" },
      { id: "kahn", title: "Kahn’s method" },
      { id: "dfs", title: "Finish order, reversed" },
      { id: "python", title: "graphlib, and what orders are for" },
    ],
  },
  {
    n: 6,
    title: "Bipartite graphs",
    minutes: 12,
    figures: ["GRPH-6.1"],
    practice: 6,
    sections: [
      { id: "two", title: "Two sides" },
      { id: "colour", title: "Splitting with a search" },
      { id: "odd", title: "Odd cycles" },
      { id: "proof", title: "Why an odd cycle is the only obstacle" },
      { id: "uses", title: "Where two sides appear" },
    ],
  },
  {
    n: 7,
    title: "Grids as graphs",
    minutes: 12,
    figures: ["GRPH-7.1"],
    practice: 7,
    sections: [
      { id: "cells", title: "Squares as vertices" },
      { id: "moves", title: "Fewest moves" },
      { id: "islands", title: "Flood fill and islands" },
      { id: "many", title: "Many starts" },
      { id: "states", title: "When the square is not enough" },
    ],
  },
];

export const GRPH_PROBLEMS: ProblemMeta[] = [
  { n: 1, title: "Is there a direct line?", from: [1] },
  { n: 2, title: "A shortest route", from: [2] },
  { n: 3, title: "Finish order", from: [3] },
  { n: 4, title: "Find a cycle", from: [4] },
  { n: 5, title: "The smallest order", from: [5] },
  { n: 6, title: "Two teams, or an odd cycle", from: [6] },
  { n: 7, title: "Through the walls", from: [7] },
];
