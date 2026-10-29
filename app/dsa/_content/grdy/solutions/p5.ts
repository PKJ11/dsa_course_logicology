// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `import heapq

def huffman(counts):
    # entries are (weight, n, tree); n is unique, so trees are never compared
    heap = [(w, n, letter) for n, (letter, w) in enumerate(counts.items())]
    heapq.heapify(heap)
    if len(heap) == 1:
        return {heap[0][2]: "0"}      # one letter still needs one bit
    n = len(heap)
    while len(heap) > 1:
        wa, _, a = heapq.heappop(heap)    # the two lightest trees
        wb, _, b = heapq.heappop(heap)
        heapq.heappush(heap, (wa + wb, n, (a, b)))
        n += 1
    codes = {}
    stack = [(heap[0][2], "")]
    while stack:
        tree, code = stack.pop()
        if isinstance(tree, tuple):       # a join: (left, right)
            stack.append((tree[0], code + "0"))
            stack.append((tree[1], code + "1"))
        else:
            codes[tree] = code            # a leaf: a letter
    return codes
`;

export const notes = [
  "A leaf is the letter itself and a joined tree is a pair `(left, right)`. The letters are strings, never tuples, so `isinstance(tree, tuple)` tells the two apart.",
  "The counter `n` in each heap entry is unique, so when two weights are equal Python compares the counters and never reaches the trees (comparing a string with a tuple would raise an error).",
  "Each join takes the two lightest trees, which lesson 4 proves is safe: some best tree has the two rarest letters side by side at the bottom.",
  "The codes are read off the leaves of one tree, so none is the start of another. The walk uses a stack instead of recursion. k − 1 joins at O(log k) each: O(k log k).",
];
