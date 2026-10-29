// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `import random

def kth_smallest(a, k):
    while True:
        p = random.choice(a)
        less = [x for x in a if x < p]
        equal = [x for x in a if x == p]
        if k < len(less):
            a = less
        elif k < len(less) + len(equal):
            return p
        else:
            k -= len(less) + len(equal)
            a = [x for x in a if x > p]
`;

export const notes = [
  "Invariant: the answer is the value at index k of sorted(a), for the current a and k. Splitting into less, equal and greater keeps it true: whichever part holds index k becomes the new a, with k shifted if needed.",
  "The random pivot means no input is bad every time. On average each round keeps at most about three quarters of the values, so the total work is O(n) expected.",
  "The equal part handles repeats. When every value is the same, the first round puts all of them in `equal` and returns at once.",
  "The input is never changed: each round builds new lists. That costs O(n) extra space; Lomuto partitioning on a copy uses one copy and then works in place.",
  "`random.choice(a)` needs a to be non-empty, which holds because k is always a valid index into a.",
];
