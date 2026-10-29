// HASH lesson and problem metadata. Minutes are the author's reading-and-stepping estimates.

import type { LessonMeta, ProblemMeta } from "../types";

export const HASH_LESSONS: LessonMeta[] = [
  {
    n: 1,
    title: "Hash functions",
    minutes: 13,
    figures: ["HASH-1.1"],
    practice: 1,
    sections: [
      { id: "table", title: "What a hash table does" },
      { id: "function", title: "A hash function" },
      { id: "good", title: "What makes a hash function good" },
      { id: "python", title: "hash() in Python" },
    ],
  },
  {
    n: 2,
    title: "Chaining",
    minutes: 15,
    figures: ["HASH-2.1"],
    practice: 1,
    sections: [
      { id: "chains", title: "A chain in every bucket" },
      { id: "cost", title: "The load factor and the cost" },
      { id: "grow", title: "Growing the table" },
      { id: "worst", title: "The worst case" },
    ],
  },
  {
    n: 3,
    title: "Open addressing and load factor",
    minutes: 15,
    figures: ["HASH-3.1"],
    practice: 2,
    sections: [
      { id: "probing", title: "One key per slot" },
      { id: "remove", title: "Removing needs a marker" },
      { id: "load", title: "How full is too full" },
      { id: "choices", title: "Other probe orders" },
    ],
  },
  {
    n: 4,
    title: "Universal hashing and attacks",
    minutes: 15,
    figures: ["HASH-4.1"],
    practice: 1,
    sections: [
      { id: "attack", title: "Keys chosen against you" },
      { id: "universal", title: "Choosing the function at random" },
      { id: "proof", title: "Why collisions stay rare" },
      { id: "python", title: "What Python does" },
    ],
  },
  {
    n: 5,
    title: "Inside dict and set",
    minutes: 14,
    figures: ["HASH-5.1"],
    practice: 3,
    sections: [
      { id: "two", title: "Two arrays" },
      { id: "probe", title: "How Python probes" },
      { id: "grow", title: "When a dict grows" },
      { id: "set", title: "Sets" },
    ],
  },
  {
    n: 6,
    title: "Counting and grouping",
    minutes: 14,
    figures: ["HASH-6.1"],
    practice: 4,
    sections: [
      { id: "count", title: "Counting" },
      { id: "group", title: "Grouping by a key" },
      { id: "partner", title: "Looking for a partner" },
      { id: "prefix", title: "Prefix sums in a dict" },
    ],
  },
  {
    n: 7,
    title: "LRU cache",
    minutes: 14,
    figures: ["HASH-7.1"],
    practice: 5,
    sections: [
      { id: "cache", title: "What a cache is" },
      { id: "design", title: "A dict and a two-way list" },
      { id: "ops", title: "get and put" },
      { id: "python", title: "Python's own tools" },
    ],
  },
  {
    n: 8,
    title: "Bloom filters",
    minutes: 14,
    figures: ["HASH-8.1"],
    practice: 6,
    sections: [
      { id: "bits", title: "Bits instead of keys" },
      { id: "answers", title: "No is sure, yes is maybe" },
      { id: "maths", title: "How often it is wrong" },
      { id: "uses", title: "Where they are used" },
    ],
  },
];

export const HASH_PROBLEMS: ProblemMeta[] = [
  { n: 1, title: "A table of buckets", from: [1, 2] },
  { n: 2, title: "Probing with markers", from: [3] },
  { n: 3, title: "Longest run", from: [5, 6] },
  { n: 4, title: "Stretches that add up to k", from: [6] },
  { n: 5, title: "An LRU cache", from: [7] },
  { n: 6, title: "A Bloom filter", from: [8] },
];
