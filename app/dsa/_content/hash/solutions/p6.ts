// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `import math

def h1(word):
    total = 0
    for ch in word:
        total = (total * 31 + ord(ch)) % 2**32
    return total


def h2(word):
    total = 0
    for ch in word:
        total = (total * 37 + ord(ch)) % 2**32
    return total | 1


class Bloom:
    def __init__(self, m, k):
        self.m = m
        self.k = k
        self.b = bytearray(m)            # m bits, stored one per byte

    def _positions(self, word):
        a, b = h1(word), h2(word)
        return [(a + i * b) % self.m for i in range(self.k)]

    def add(self, word):
        for p in self._positions(word):
            self.b[p] = 1

    def might_contain(self, word):
        return all(self.b[p] for p in self._positions(word))

    def bits(self):
        return [i for i in range(self.m) if self.b[i]]

    def false_rate(self, n):
        return (1 - math.exp(-self.k * n / self.m)) ** self.k
`;

export const notes = [
  "`h1` and `h2` are computed once per word. Double hashing turns them into k positions: a, a + b, a + 2b, … taken `% m`. `h2` is odd, which keeps the positions apart when m is a power of 2.",
  "A word that was added always gets True: its own bits were set and bits never go back to 0. False comes only when some bit is 0, so a False is always right.",
  "True can be wrong: other words may have set all k bits. That is the cost of storing m bits instead of the words.",
  "After n adds, one bit is still 0 with chance about `math.exp(-k * n / m)`: the number e (about 2.718) raised to the power −k·n/m. A missing word gets True when all k of its bits are 1, which happens with chance about `(1 - math.exp(-k * n / m)) ** k`.",
  "`add` and `might_contain` are O(k), whatever the number of words. A bytearray uses one byte per bit; a real filter packs 8 bits per byte with bit operations (BITS station).",
];
