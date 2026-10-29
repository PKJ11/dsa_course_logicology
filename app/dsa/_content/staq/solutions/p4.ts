// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `class RingQueue:
    def __init__(self, capacity):
        self.slots = [None] * capacity
        self.head = 0                 # place of the front item
        self.count = 0                # number of items

    def push(self, x):
        if self.count == len(self.slots):
            return False
        self.slots[(self.head + self.count) % len(self.slots)] = x
        self.count += 1
        return True

    def pop(self):
        if self.count == 0:
            return None
        x = self.slots[self.head]
        self.slots[self.head] = None  # let Python free the item
        self.head = (self.head + 1) % len(self.slots)
        self.count -= 1
        return x

    def peek(self):
        return None if self.count == 0 else self.slots[self.head]

    def __len__(self):
        return self.count

    def is_full(self):
        return self.count == len(self.slots)
`;

export const notes = [
  "The items stay where they were written. Only `head` and `count` change.",
  "The items, front to back, are at places head, head + 1, …, head + count - 1, each taken % capacity. So the next free place is `(head + count) % capacity`, which wraps round to 0.",
  "`count` tells full from empty. Without it, both cases have the next free place equal to `head`.",
  "Every method does a few sums and at most one list access: O(1). The list is made once and never grows.",
];
