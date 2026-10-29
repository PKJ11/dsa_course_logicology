from solgen import write_station

write_station("staq", 6, {
    1: ('''def balanced(s):
    pair = {')': '(', ']': '[', '}': '{'}
    stack = []
    for c in s:
        if c in '([{':
            stack.append(c)
        elif c in pair:
            if not stack or stack.pop() != pair[c]:
                return False          # nothing open, or the wrong kind
    return not stack                  # anything left was never closed
''', [
        "A closing bracket must match the most recent bracket that is still open, and that is always the top of the stack.",
        "Three ways to fail: a closing bracket with nothing open, a closing bracket of the wrong kind, or open brackets left at the end.",
        "`not stack or stack.pop() != pair[c]` checks for empty first, so `pop()` is never called on an empty list.",
        "Each character is pushed and popped at most once: O(n) time. The stack can hold up to n items. No recursion, so 100,000 levels of nesting are fine.",
    ]),
    2: ('''def eval_postfix(tokens):
    stack = []
    for t in tokens:
        if t in ('+', '-', '*', '/'):
            b = stack.pop()           # the right-hand number comes off first
            a = stack.pop()
            if t == '+':
                stack.append(a + b)
            elif t == '-':
                stack.append(a - b)
            elif t == '*':
                stack.append(a * b)
            else:
                stack.append(a // b)
        else:
            stack.append(int(t))      # '-3' is a number, not an operator
    return stack[0]
''', [
        "Numbers are pushed. An operator pops its two numbers, the right-hand one first, and pushes the result. A valid expression leaves exactly one number.",
        "The operator test is an exact match against the four symbols, so a negative number such as '-3' is read as a number.",
        "`//` rounds down, so 7 // -2 is -4. `int(7 / -2)` would round towards zero and give -3, and dividing with `/` uses floats, which lose digits on big numbers.",
        "Each token does a fixed amount of work: O(n) time and at most O(n) stack space.",
    ]),
    3: ('''from collections import deque


class RecentPings:
    def __init__(self, window):
        self.window = window
        self.q = deque()              # ping times, oldest at the front

    def ping(self, t):
        self.q.append(t)
        while self.q[0] < t - self.window:
            self.q.popleft()          # too old now, so too old for ever
        return len(self.q)
''', [
        "Times only increase, so a ping that is too old now stays too old. It can be thrown away for good.",
        "The deque holds the pings in time order. Old ones are at the front, which `popleft` removes in O(1).",
        "The loop never empties the deque, because the newest ping, t itself, is never older than t - window.",
        "Each ping is added once and removed at most once, so the calls take O(1) time on average. A list with `pop(0)` gives the same answers, but each removal moves every other ping.",
    ]),
    4: ('''class RingQueue:
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
''', [
        "The items stay where they were written. Only `head` and `count` change.",
        "The items, front to back, are at places head, head + 1, …, head + count - 1, each taken % capacity. So the next free place is `(head + count) % capacity`, which wraps round to 0.",
        "`count` tells full from empty. Without it, both cases have the next free place equal to `head`.",
        "Every method does a few sums and at most one list access: O(1). The list is made once and never grows.",
    ]),
    5: ('''def next_greater(a):
    answer = [-1] * len(a)
    stack = []                        # places still waiting for an answer
    for i, x in enumerate(a):
        while stack and a[stack[-1]] < x:
            answer[stack.pop()] = x   # x is the first taller value for it
        stack.append(i)
    return answer
''', [
        "The stack holds the places still waiting. Their values go down from bottom to top, so every place smaller than the new value x is at the top, together.",
        "Popping stops at the first value that is not smaller than x. Everything below it is bigger still, so it must keep waiting.",
        "`<` (not `<=`) makes the answer strictly taller: equal values stay on the stack.",
        "Each place is pushed once and popped at most once, so the total work is O(n), even though there is a loop inside the loop.",
        "Places left on the stack at the end never found a taller value. They keep the -1 the answer list started with.",
    ]),
    6: ('''from collections import deque


def window_max(a, k):
    dq = deque()                      # places; values go down front to back
    out = []
    for i, x in enumerate(a):
        while dq and a[dq[-1]] <= x:
            dq.pop()                  # can never be the biggest again
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()              # the front has left the window
        if i >= k - 1:
            out.append(a[dq[0]])
    return out
''', [
        "A value that is at most a newer value can never again be the biggest in a window: the newer value is at least as big and stays longer. So it is removed from the back.",
        "After that, the values in the deque go down from front to back, so the front is the biggest value still in the window.",
        "The window moves one place per step, so at most one place leaves the front per step. A single `if` is enough there.",
        "Each place enters the deque once and leaves at most once: O(n) time in total, whatever k is. The deque holds at most k places.",
    ]),
})
