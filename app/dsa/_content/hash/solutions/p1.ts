// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `class ChainMap:
    def __init__(self):
        self.m = 8
        self.b = [[] for _ in range(self.m)]
        self.n = 0

    def put(self, key, value):
        bucket = self.b[hash(key) % self.m]
        for pair in bucket:
            if pair[0] == key:
                pair[1] = value          # key is there: replace the value
                return
        bucket.append([key, value])
        self.n += 1
        if self.n > self.m:
            self._grow()

    def _grow(self):
        old = self.b
        self.m *= 2
        self.b = [[] for _ in range(self.m)]
        for chain in old:                # old buckets in order,
            for pair in chain:           # each chain front to back
                self.b[hash(pair[0]) % self.m].append(pair)

    def get(self, key, default=None):
        for k, v in self.b[hash(key) % self.m]:
            if k == key:
                return v
        return default

    def remove(self, key):
        bucket = self.b[hash(key) % self.m]
        for i, pair in enumerate(bucket):
            if pair[0] == key:
                bucket.pop(i)
                self.n -= 1
                return True
        return False

    def __len__(self):
        return self.n

    def buckets(self):
        return [[k for k, _ in chain] for chain in self.b]
`;

export const notes = [
  "Every method starts by choosing one bucket with `hash(key) % self.m`, then walks only that chain. The hash decides where to look; `==` decides whether a key matches.",
  "Pairs are stored as two-item lists, so `put` can change a value in place without rebuilding the chain.",
  "The table doubles when n > m, so the load factor n / m stays at most 1. With a good hash the expected chain length is then at most about 2, and each job is O(1) on average.",
  "Growing moves all n keys, which is O(n). But it happens only when n doubles, so over a run of puts the moving adds O(1) per put on average (amortised, as in BIGO-7).",
  "`remove` uses `pop(i)` on a short chain. The chain is about 1 long on average, so this is O(1) on average.",
];
