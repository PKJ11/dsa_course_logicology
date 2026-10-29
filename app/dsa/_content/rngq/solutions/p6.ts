// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `class Blocks:
    def __init__(self, a):
        self.a = list(a)                       # stored values
        n = len(a)
        self.b = b = max(1, int(n ** 0.5))     # block size, about sqrt(n)
        self.tag = [0] * ((n + b - 1) // b)    # an add owed to a whole block
        self.top = [max(self.a[i:i + b]) for i in range(0, n, b)]

    def _fix(self, k):                         # recompute block k's top
        if 0 <= k < len(self.top):
            b = self.b
            self.top[k] = max(self.a[k * b:(k + 1) * b])

    def add(self, l, r, v):
        b, a = self.b, self.a
        if l >= r:
            return
        k0 = l // b
        while l < r and l % b:                 # the start, cell by cell
            a[l] += v
            l += 1
        self._fix(k0)
        while l + b <= r:                      # whole blocks: the tag
            self.tag[l // b] += v
            l += b
        k1 = l // b
        while l < r:                           # the end, cell by cell
            a[l] += v
            l += 1
        self._fix(k1)

    def largest(self, l, r):
        b, a, tag = self.b, self.a, self.tag
        best = None
        while l < r and l % b:
            x = a[l] + tag[l // b]
            if best is None or x > best:
                best = x
            l += 1
        while l + b <= r:
            x = self.top[l // b] + tag[l // b]
            if best is None or x > best:
                best = x
            l += b
        while l < r:
            x = a[l] + tag[l // b]
            if best is None or x > best:
                best = x
            l += 1
        return best
`;

export const notes = [
  "The list is cut into blocks of b ≈ √n values. Each block keeps `top`, the largest of its stored values, and `tag`, an add that applies to all of it. A value's true size is its stored value plus its block's tag.",
  "`add` changes the partial pieces at the ends cell by cell and recomputes those two blocks' tops (a value may have gone down). Whole blocks in the middle only get a larger tag, which raises their true largest by v without touching their cells.",
  "`largest` reads the partial cells and the whole blocks' `top + tag` in the same three parts.",
  "Each operation does at most about 2b cell steps, n / b block steps and two recomputes of b values: O(√n). A lazy segment tree gives O(log n), but blocks are simpler and bend to many other questions.",
];
