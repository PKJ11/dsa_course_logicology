// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `class ProbeTable:
    def __init__(self, m):
        self.s = [None] * m

    def _find(self, key):
        m = len(self.s)
        i = key % m
        for _ in range(m):
            v = self.s[i]
            if v is None:
                return -1                # an empty slot ends the search
            if v != 'DEL' and v == key:
                return i
            i = (i + 1) % m              # markers are skipped
        return -1

    def insert(self, key):
        m = len(self.s)
        i = key % m
        free = -1                        # first marker or empty slot seen
        for _ in range(m):
            v = self.s[i]
            if v is None:
                if free < 0:
                    free = i
                break                    # key is surely not in the table
            if v == 'DEL':
                if free < 0:
                    free = i
            elif v == key:
                return i                 # already there
            i = (i + 1) % m
        if free >= 0:
            self.s[free] = key
        return free

    def contains(self, key):
        return self._find(key) >= 0

    def remove(self, key):
        i = self._find(key)
        if i < 0:
            return False
        self.s[i] = 'DEL'
        return True

    def slots(self):
        return list(self.s)
`;

export const notes = [
  "All three methods follow the same probe path: `key % m`, then one slot on, wrapping with `% m`. A key is always somewhere on its own path, before the first empty slot.",
  "That is why `remove` writes a marker instead of None. An empty slot would cut the path, and keys further along it could no longer be found.",
  "`insert` remembers the first marker but keeps going until an empty slot: only then is it sure the key is not already stored further on. Then it reuses the marker, so markers do not pile up.",
  "Every loop runs at most m times, so a full table cannot make it loop for ever. In Python `key % m` is never negative, even for negative keys.",
  "With load factor α (the fraction of slots in use, markers included), linear probing takes about (1 + 1/(1 − α)²) / 2 probes for a miss. At α = 0.76 that is about 9: still O(1), but it grows quickly as the table fills.",
];
