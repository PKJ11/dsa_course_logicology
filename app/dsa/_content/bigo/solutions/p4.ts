// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `class DynArray:
    def __init__(self):
        self.capacity = 1
        self.size = 0
        self.copies = 0
        self.slots = [None] * self.capacity

    def append(self, x):
        if self.size == self.capacity:          # full: grow first
            new = [None] * (2 * self.capacity)
            for i in range(self.size):
                new[i] = self.slots[i]
            self.copies += self.size
            self.slots = new
            self.capacity *= 2
        self.slots[self.size] = x               # the next free slot
        self.size += 1

    def get(self, i):
        return self.slots[i]
`;

export const notes = [
  "The values always sit in `slots[0]` to `slots[size - 1]`. So the next free slot is `slots[size]`, and the list is full exactly when `size == capacity`.",
  "A grow copies `size` values. They happen when size is 1, 2, 4, 8, …, so after n appends the copies total less than 2n. Each append is amortised O(1), as lesson 7 proves.",
  "Growing by a fixed amount, such as `capacity + 10`, still gives correct values. But the copies then add up to about n² / 20 (n times n, divided by 20), and the large test times out.",
  "CPython's real list works the same way, in C. It grows by about an eighth rather than doubling, which wastes less memory and is still amortised O(1).",
];
