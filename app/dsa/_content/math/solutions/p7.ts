// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def sample(stream, k, rand):
    kept = []
    for i, item in enumerate(stream):
        if i < k:
            kept.append(item)          # the first k items fill the slots
        else:
            j = rand(i + 1)            # 0 to i, each equally likely
            if j < k:
                kept[j] = item         # replace slot j
    return kept
`;

export const notes = [
  "The stream is read once, with O(1) work per item and only k items stored, so it works for streams that do not fit in memory and for generators with no length.",
  "Item i (counting from 0) is kept with chance k / (i + 1): j is one of i + 1 equally likely values, and k of them are below k. Lesson 7 proves by induction that, after the whole stream of n items, every item is in the sample with chance k / n.",
  "The tests check the exact sample for fixed answers from `rand`, which works only if rand is called exactly once per item after the first k, always with i + 1. Two tests try every possible run of answers and count the samples: each set of k items comes out equally often.",
  "Python's `random.sample(population, k)` does the same job for a list whose length is known. For a stream, this method is the standard one (Vitter's Algorithm R).",
];
