from tb import build

S = "staq"

# P1 balanced brackets
build(S, 1, "balanced", [
    {"name": "Nested", "args": "('{[()()]}',)", "show": "balanced('{[()()]}')", "why": "Every bracket closes the most recent one still open."},
    {"name": "Crossed", "args": "('([)]',)", "show": "balanced('([)]')",
     "why": "One of each kind, but the ) arrives while [ is the most recent open bracket. Counting each kind is not enough; check the top of a stack."},
    {"name": "Empty text", "args": "('',)", "show": "balanced('')", "why": "Nothing is open, so the empty text is balanced: True."},
    {"name": "Never closed", "args": "('((',)", "show": "balanced('((')", "why": "At the end the stack still holds two open brackets. Return True only if the stack is empty."},
    {"name": "Close first", "args": "('))((',)", "show": "balanced('))((')",
     "why": "The first ) arrives with nothing open. Popping an empty list raises IndexError; check that the stack is not empty first."},
    {"name": "Wrong closer", "args": "('(]',)", "show": "balanced('(]')", "why": "] does not close (. Check which kind of bracket is on top, not just that something is."},
    {"name": "Other characters", "args": "('print(a[i] + f(x, {1: 2}))',)", "show": "balanced('print(a[i] + f(x, {1: 2}))')",
     "why": "Letters, spaces and other symbols are ignored. Only ( ) [ ] { } count."},
    {"name": "Only closers", "args": "('}',)", "show": "balanced('}')", "why": "A closing bracket with nothing open: False."},
    {"name": "100,000 deep", "args": "('(' * 100_000 + ')' * 100_000,)", "timeout": 3000, "show": "balanced('((( … )))'), 100,000 deep",
     "why": "One pass with a stack is O(n). Removing '()' pairs again and again with replace takes about n/2 passes over the text: O(n²), time that grows with n multiplied by n. A recursive solution fails with RecursionError at this depth."},
    {"name": "Long and almost right", "args": "('[]{}()' * 50_000 + '(',)", "timeout": 3000, "show": "balanced('[]{}()[]{}() … (') with one ( left open at the end",
     "why": "Everything matches except the last (, which is never closed. Only the final empty-stack check catches it."},
], trusted="""
def balanced(s):
    pair = {')': '(', ']': '[', '}': '{'}
    stack = []
    for c in s:
        if c in '([{':
            stack.append(c)
        elif c in pair:
            if not stack or stack.pop() != pair[c]:
                return False
    return not stack
""")

# P2 postfix calculator; / is floor division (//)
build(S, 2, "eval_postfix", [
    {"name": "Small", "args": "(['2', '1', '+', '3', '*'],)", "show": "eval_postfix(['2', '1', '+', '3', '*'])", "why": "(2 + 1) × 3 = 9. Push each number. For an operator, pop two numbers and push the result. So + is done first, giving 3, and then × gives 3 × 3. The answer is the one number left at the end."},
    {"name": "Order of a minus", "args": "(['10', '3', '-'],)", "show": "eval_postfix(['10', '3', '-'])",
     "why": "10 − 3 = 7. The first number popped is the right-hand one. If you got −7, the two pops are the wrong way round."},
    {"name": "Order of a divide", "args": "(['4', '13', '5', '/', '+'],)", "show": "eval_postfix(['4', '13', '5', '/', '+'])",
     "why": "13 // 5 = 2, then 4 + 2 = 6. If you got 4, the code computed 5 // 13."},
    {"name": "A single number", "args": "(['42'],)", "show": "eval_postfix(['42'])", "why": "No operators: the answer is the number itself, as an int (not the string '42')."},
    {"name": "Negative numbers", "args": "(['-3', '4', '*', '-5', '-'],)", "show": "eval_postfix(['-3', '4', '*', '-5', '-'])",
     "why": "−3 × 4 = −12, then −12 − (−5) = −7. '-3' is a number, not an operator: a token is an operator only if it is exactly '+', '-', '*' or '/'."},
    {"name": "Divide rounds down", "args": "(['7', '-2', '/'],)", "show": "eval_postfix(['7', '-2', '/'])",
     "why": "7 // −2 is −4: Python's // rounds down, towards minus infinity. int(7 / -2) would give −3."},
    {"name": "The lesson's example", "args": "(['5', '1', '2', '+', '4', '*', '+', '3', '-'],)", "show": "eval_postfix('5 1 2 + 4 * + 3 -'.split())", "why": "5 + (1 + 2) × 4 − 3 = 14, the sum the figure in lesson 2 works through. Step through the figure and compare the stack after each token with yours."},
    {"name": "Big numbers", "args": "(['99999999999', '99999999999', '*'],)", "show": "eval_postfix(['99999999999', '99999999999', '*'])",
     "why": "Python's whole numbers have no size limit. Converting to float would lose digits; use int()."},
    {"name": "200,000 tokens", "args": "(['1'] + ['3', '+', '2', '-'] * 50_000,)", "timeout": 3000, "show": "eval_postfix(['1', '3', '+', '2', '-', '3', '+', '2', '-', …]), 200,001 tokens",
     "why": "Each token is pushed or popped a fixed number of times: O(n). If this timed out, the code may rebuild the list or call pop(0) for every token."},
], trusted="""
def eval_postfix(tokens):
    stack = []
    for t in tokens:
        if t in ('+', '-', '*', '/'):
            b = stack.pop()
            a = stack.pop()
            if t == '+': stack.append(a + b)
            elif t == '-': stack.append(a - b)
            elif t == '*': stack.append(a * b)
            else: stack.append(a // b)
        else:
            stack.append(int(t))
    return stack[0]
""")

# P3 recent pings
PINGS = "(lambda r: [r.ping(t) for t in args[1]])(RecentPings(args[0]))"
build(S, 3, "RecentPings", [
    {"name": "Small", "args": "(3000, [1, 100, 3001, 3002])", "expr": PINGS, "show": "window 3000; pings at 1, 100, 3001, 3002",
     "why": "At 3001 the window is 1 … 3001, which holds all three pings so far. At 3002 it is 2 … 3002, so the ping at 1 has dropped out: 3."},
    {"name": "Edge of the window", "args": "(10, [0, 10, 11])", "expr": PINGS, "show": "window 10; pings at 0, 10, 11",
     "why": "The window [t − window, t] includes both ends. At 10 it is 0 … 10, so 0 still counts: 2. At 11 it is 1 … 11: 2. Check < against <=."},
    {"name": "Long gap", "args": "(5, [1, 2, 3, 100])", "expr": PINGS, "show": "window 5; pings at 1, 2, 3, 100",
     "why": "At 100 the three old pings have all expired, so drop them all: use a while loop, not a single if."},
    {"name": "Window 0", "args": "(0, [5, 6, 7])", "expr": PINGS, "show": "window 0; pings at 5, 6, 7", "why": "Only the ping at t itself counts: 1 each time."},
    {"name": "Two objects", "args": "()", "expr": "(lambda a, b: [a.ping(1), b.ping(1), a.ping(2), b.ping(50)])(RecentPings(10), RecentPings(10))", "show": "two separate RecentPings(10) objects",
     "why": "Each object keeps its own pings. Store them on self (in __init__), not in a name shared by the whole class."},
    {"name": "300,000 pings", "args": "()", "expr": "(lambda r: sum(r.ping(t) for t in range(300_000)))(RecentPings(150_000))", "timeout": 4000,
     "show": "window 150,000; pings at 0, 1, …, 299,999: the sum of all answers",
     "why": "Keep the pings in a deque and drop old ones from the front: O(1) each on average. list.pop(0) moves every other ping, about 150,000 moves per call here. Counting all pings at every call is O(n) per call too."},
], trusted="""
from collections import deque

class RecentPings:
    def __init__(self, window):
        self.window = window
        self.q = deque()

    def ping(self, t):
        self.q.append(t)
        while self.q[0] < t - self.window:
            self.q.popleft()
        return len(self.q)
""")

# P4 a ring buffer queue (deque blocked)
OPS = "(lambda R: [getattr(R, op[0])(*op[1:]) for op in args[1]])(RingQueue(args[0]))"
BIG = ("(lambda R: [[R.push(k) for k in range(200_000)], R.is_full(), R.push(-1), "
       "sum(R.pop() + 0 * R.push(k) for k in range(200_000)), len(R), R.peek()][1:])(RingQueue(200_000))")
build(S, 4, "RingQueue", [
    {"name": "First in, first out", "args": "(3, [['push', 1], ['push', 2], ['pop'], ['push', 3], ['pop'], ['pop']])", "expr": OPS,
     "show": "capacity 3: push 1, push 2, pop, push 3, pop, pop",
     "why": "push returns True when there is room. pop gives back the oldest item: 1, then 2, then 3."},
    {"name": "Full", "args": "(2, [['push', 'a'], ['push', 'b'], ['is_full'], ['push', 'c'], ['__len__'], ['pop']])", "expr": OPS,
     "show": "capacity 2: push 'a', push 'b', is_full(), push 'c', len(), pop",
     "why": "With 2 items in 2 slots the queue is full: push('c') returns False and changes nothing, so 'a' still comes out first."},
    {"name": "Empty", "args": "(3, [['pop'], ['peek'], ['__len__'], ['is_full']])", "expr": OPS, "show": "capacity 3, nothing pushed: pop, peek, len(), is_full()",
     "why": "pop and peek return None on an empty queue."},
    {"name": "Wrapping round", "args": "(3, [['push', 1], ['push', 2], ['push', 3], ['pop'], ['pop'], ['push', 4], ['push', 5], ['pop'], ['pop'], ['pop'], ['__len__']])", "expr": OPS,
     "show": "capacity 3: fill, pop two, push 4 and 5 (they wrap round), then pop three",
     "why": "4 and 5 go into slots 0 and 1, after slot 2. They must still come out after 3. Compute the free slot as (head + count) % capacity."},
    {"name": "Peek does not remove", "args": "(2, [['push', 7], ['peek'], ['peek'], ['__len__'], ['pop'], ['peek']])", "expr": OPS,
     "show": "capacity 2: push 7, peek, peek, len(), pop, peek",
     "why": "peek reads the front item and leaves it there."},
    {"name": "Capacity 1", "args": "(1, [['push', 'x'], ['push', 'y'], ['pop'], ['push', 'z'], ['peek'], ['is_full']])", "expr": OPS,
     "show": "capacity 1: push 'x', push 'y', pop, push 'z', peek, is_full()",
     "why": "One slot: after one push it is full. After the pop it has room again, and 'z' goes into the same slot."},
    {"name": "Many rounds", "args": "(4, [['push', k] if k % 3 else ['pop'] for k in range(1, 40)] + [['__len__']])", "expr": OPS,
     "show": "capacity 4: pushes and pops for 39 steps, going round the ring many times",
     "why": "Two pushes for every pop, so the queue fills and pushes start to be refused. The pops must still give the oldest item each time."},
    {"name": "200,000 slots", "args": "()", "expr": BIG, "timeout": 4000,
     "show": "capacity 200,000: fill it, check full, then pop one and push one 200,000 times",
     "why": "Each operation must be O(1). A list with pop(0) moves every item on every pop: 200,000 × 200,000 moves. Use a fixed list and move head instead."},
], trusted="""
class RingQueue:
    def __init__(self, capacity):
        self.slots = [None] * capacity
        self.head = 0
        self.count = 0
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
        self.slots[self.head] = None
        self.head = (self.head + 1) % len(self.slots)
        self.count -= 1
        return x
    def peek(self):
        return None if self.count == 0 else self.slots[self.head]
    def __len__(self):
        return self.count
    def is_full(self):
        return self.count == len(self.slots)
""")

# P5 next taller signal
NG_BIG = "(lambda r: [len(r), sum(r), r[:3], r[-3:]])(next_greater(args[0]))"
build(S, 5, "next_greater", [
    {"name": "The lesson's list", "args": "([2, 7, 3, 5, 4, 6, 1],)", "show": "next_greater([2, 7, 3, 5, 4, 6, 1])",
     "why": "For 3 the next bigger value is 5, not 7: look to the right only. Places with nothing bigger to their right get −1."},
    {"name": "Equal heights", "args": "([3, 3, 3],)", "show": "next_greater([3, 3, 3])",
     "why": "Bigger means strictly bigger, so equal values are not answers: [−1, −1, −1]. Pop while the top is < x, not <= x."},
    {"name": "Going up", "args": "([1, 2, 3, 4],)", "show": "next_greater([1, 2, 3, 4])", "why": "Each value's answer is the next one: [2, 3, 4, −1]."},
    {"name": "Going down", "args": "([4, 3, 2, 1],)", "show": "next_greater([4, 3, 2, 1])", "why": "Nothing to the right is ever bigger: all −1."},
    {"name": "Empty", "args": "([],)", "show": "next_greater([])", "why": "No values, so no answers: return an empty list. An IndexError means the code read a[0] without checking that a has a value."},
    {"name": "One", "args": "([5],)", "show": "next_greater([5])", "why": "One value has nothing to its right, so its answer is −1: [−1]. If you got [], the code only writes an answer when it pops, and never fills in the places left on the stack."},
    {"name": "Answer far away", "args": "([5, 1, 1, 1, 1, 9],)", "show": "next_greater([5, 1, 1, 1, 1, 9])",
     "why": "5's answer is 9, five places on; each 1 also gets 9. The 1s wait on the stack together until 9 arrives."},
    {"name": "Input not changed", "args": "([3, 1, 2],)", "expr": "(lambda a: [next_greater(a), a])(args[0])", "show": "a = [3, 1, 2]; returns [next_greater(a), a]",
     "why": "Build a new answer list; leave a as it was."},
    {"name": "200,000 going down", "args": "(list(range(200_000, 0, -1)),)", "expr": NG_BIG, "timeout": 3000,
     "show": "next_greater([200000, 199999, …, 1]): [length, sum, first three, last three]",
     "why": "Looking right from every place until something bigger is found takes about n²/2 steps (n multiplied by n, then halved) when the list goes down: 20 billion here. The stack does it in O(n)."},
    {"name": "200,000 mixed", "args": "([(k * 7919) % 100_003 for k in range(200_000)],)", "expr": NG_BIG, "timeout": 3000,
     "show": "200,000 scattered values: [length, sum, first three, last three]",
     "why": "Each place is pushed once and popped at most once: O(n) in total, however the values are arranged."},
], trusted="""
def next_greater(a):
    answer = [-1] * len(a)
    stack = []
    for i, x in enumerate(a):
        while stack and a[stack[-1]] < x:
            answer[stack.pop()] = x
        stack.append(i)
    return answer
""")

# P6 window maximum
WM_BIG = "(lambda r: [len(r), sum(r), r[:3], r[-3:]])(window_max(args[0], args[1]))"
build(S, 6, "window_max", [
    {"name": "The lesson's list", "args": "([4, 2, 12, 3, 8, 5, 1, 7], 3)", "show": "window_max([4, 2, 12, 3, 8, 5, 1, 7], 3)",
     "why": "6 windows of 3: [12, 12, 12, 8, 8, 7]. If 12 stays too long, the front of the deque is not removed when it leaves the window."},
    {"name": "k = 1", "args": "([5, 3, 8], 1)", "show": "window_max([5, 3, 8], 1)", "why": "Each window is one value, so the answer is the list itself."},
    {"name": "k = n", "args": "([5, 3, 8, 1], 4)", "show": "window_max([5, 3, 8, 1], 4)", "why": "One window, the whole list: [8]."},
    {"name": "Going down", "args": "([9, 7, 5, 3, 1], 2)", "show": "window_max([9, 7, 5, 3, 1], 2)",
     "why": "Each window's biggest is its first value: [9, 7, 5, 3]. The old front must leave the deque as the window moves past it."},
    {"name": "Going up", "args": "([1, 3, 5, 7, 9], 3)", "show": "window_max([1, 3, 5, 7, 9], 3)", "why": "Each new value empties the deque: [5, 7, 9]."},
    {"name": "Repeats", "args": "([2, 2, 2, 1, 2], 2)", "show": "window_max([2, 2, 2, 1, 2], 2)",
     "why": "[2, 2, 2, 2]. Equal values are fine either way, as long as the front place is still inside the window."},
    {"name": "Negative values", "args": "([-4, -2, -7, -1], 2)", "show": "window_max([-4, -2, -7, -1], 2)", "why": "[−2, −2, −1]. Do not start a maximum at 0."},
    {"name": "200,000 values, k = 50,000", "args": "([(k * 7919) % 100_003 for k in range(200_000)], 50_000)", "expr": WM_BIG, "timeout": 3000,
     "show": "200,000 scattered values, k = 50,000: [length, sum, first three, last three]",
     "why": "max() of every window is 150,001 windows × 50,000 values: 7.5 billion steps. The deque is O(n)."},
    {"name": "200,000 going down, k = 1,000", "args": "(list(range(200_000, 0, -1)), 1_000)", "expr": WM_BIG, "timeout": 3000,
     "show": "[200000, 199999, …, 1], k = 1,000: [length, sum, first three, last three]",
     "why": "Here the deque grows to k places and the front leaves at every step. If the answers are too big, the front is not being removed."},
], trusted="""
from collections import deque

def window_max(a, k):
    dq = deque()
    out = []
    for i, x in enumerate(a):
        while dq and a[dq[-1]] <= x:
            dq.pop()
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()
        if i >= k - 1:
            out.append(a[dq[0]])
    return out
""")
