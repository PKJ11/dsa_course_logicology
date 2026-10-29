// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `class MinHeap:
    def __init__(self):
        self.a = []                      # the heap, stored level by level

    def __len__(self):
        return len(self.a)

    def peek(self):
        return self.a[0]                 # the root is the smallest

    def push(self, x):
        a = self.a
        a.append(x)                      # the next free place on the bottom level
        i = len(a) - 1
        while i > 0:                     # sift up
            p = (i - 1) // 2
            if a[i] < a[p]:
                a[i], a[p] = a[p], a[i]
                i = p
            else:
                break

    def pop(self):
        a = self.a
        last = a.pop()                   # take the last value off the end
        if not a:
            return last                  # it was the only one
        top = a[0]
        a[0] = last                      # put it in the root's place
        i, n = 0, len(a)
        while True:                      # sift down
            l = 2 * i + 1
            if l >= n:
                break
            c = l                        # the smaller child
            if l + 1 < n and a[l + 1] < a[l]:
                c = l + 1
            if a[c] < a[i]:
                a[i], a[c] = a[c], a[i]
                i = c
            else:
                break
        return top
`;

export const notes = [
  "The heap lives in a plain list: the children of position i are at 2i + 1 and 2i + 2, and its parent is at (i − 1) // 2. No node objects or links are needed.",
  "`push` adds the value at the end, which keeps the tree complete, then swaps it upwards while it is smaller than its parent. Only the path from the new leaf to the root can be out of order.",
  "`pop` takes the root, moves the last value into its place, then swaps it downwards with its smaller child until neither child is smaller. Swapping with the smaller child is what keeps both children's subtrees in order.",
  "The tree has about log₂ n levels, so push and pop cost O(log n) comparisons and swaps; `peek` and `len` are O(1).",
];
