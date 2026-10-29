// PYTH (Platform 0) lesson and problem metadata. Minutes are the author's reading-and-stepping estimates.

import type { LessonMeta, ProblemMeta } from "../types";

export const PYTH_LESSONS: LessonMeta[] = [
  {
    n: 1,
    title: "Lists, indexing and slicing",
    minutes: 12,
    figures: ["PYTH-1.1"],
    practice: 1,
    sections: [
      { id: "lists", title: "What a list is" },
      { id: "indexing", title: "Indexing from the front and the back" },
      { id: "slicing", title: "Slicing" },
      { id: "changing", title: "Changing a list" },
      { id: "aliasing", title: "Two names, one list" },
    ],
  },
  {
    n: 2,
    title: "Loops and comprehensions",
    minutes: 13,
    figures: ["PYTH-2.1"],
    practice: 2,
    sections: [
      { id: "for", title: "Looping over values" },
      { id: "range", title: "Looping over indices" },
      { id: "enumerate", title: "enumerate and zip" },
      { id: "while", title: "while loops" },
      { id: "comprehensions", title: "List comprehensions" },
      { id: "break", title: "break and continue" },
    ],
  },
  {
    n: 3,
    title: "Functions",
    minutes: 12,
    figures: ["PYTH-3.1"],
    practice: 2,
    sections: [
      { id: "def", title: "Defining a function" },
      { id: "return", title: "return is not print" },
      { id: "locals", title: "Local names and frames" },
      { id: "lists-in", title: "Passing a list in" },
      { id: "defaults", title: "A mistake with default values" },
    ],
  },
  {
    n: 4,
    title: "Dicts, sets and tuples",
    minutes: 14,
    figures: ["PYTH-4.1"],
    practice: 3,
    sections: [
      { id: "dict", title: "Dictionaries" },
      { id: "counting", title: "Counting with a dictionary" },
      { id: "sets", title: "Sets" },
      { id: "tuples", title: "Tuples" },
      { id: "costs", title: "How fast each one is" },
    ],
  },
  {
    n: 5,
    title: "Classes for nodes",
    minutes: 13,
    figures: ["PYTH-5.1"],
    practice: 5,
    sections: [
      { id: "class", title: "A class is a new kind of value" },
      { id: "node", title: "A node class" },
      { id: "references", title: "Names refer to objects" },
      { id: "walking", title: "Walking along the nodes" },
      { id: "repr", title: "Printing your objects" },
    ],
  },
  {
    n: 6,
    title: "How practice and tests work",
    minutes: 10,
    figures: ["PYTH-6.1"],
    practice: 1,
    sections: [
      { id: "screen", title: "The practice screen" },
      { id: "rows", title: "Reading a test row" },
      { id: "limits", title: "Read limits and time limits" },
      { id: "help", title: "Hints and the solution" },
      { id: "debugging", title: "Finding a bug with print" },
    ],
  },
];

export const PYTH_PROBLEMS: ProblemMeta[] = [
  { n: 1, title: "Rotate the departure board", from: [1, 6] },
  { n: 2, title: "Running totals", from: [2, 3] },
  { n: 3, title: "The first repeated code", from: [4] },
  { n: 4, title: "The codes seen once", from: [4] },
  { n: 5, title: "Build a train", from: [5] },
];
