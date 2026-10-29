import { CodeBlock } from "../../_components/Code";
import { M } from "../../_components/Prose";
import type { Problem } from "../types";
import t1 from "./tests/p1.json";
import t2 from "./tests/p2.json";
import t3 from "./tests/p3.json";
import t4 from "./tests/p4.json";
import t5 from "./tests/p5.json";
import t6 from "./tests/p6.json";

export const STAQ_PROBLEM_DEFS: Problem[] = [
  {
    n: 1,
    title: "Brackets in order",
    fn: "balanced",
    lessons: [1, 2],
    starter: `def balanced(s):
    # True if every ( [ { in s is closed by the matching ) ] }
    # in the right order. Other characters are ignored.
    pass
`,
    statement: (
      <>
        <p>
          Return <code>True</code> if the brackets in <code>s</code> are balanced: every opening bracket <code>( [ {"{"}</code> is closed later by
          the matching closing bracket, and pairs do not cross. Return <code>False</code> otherwise. Every other character is ignored.
        </p>
        <CodeBlock
          code={`balanced('{[()()]}')               # True
balanced('([)]')                   # False: the pairs cross
balanced('print(a[i] + f(x))')     # True
balanced('((')                     # False: never closed`}
        />
        <h2>Limits</h2>
        <ul>
          <li>
            <code>s</code> has up to 300,000 characters, and brackets can be nested 100,000 deep.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>A closing bracket must match the most recent opening bracket that is still open. Which structure gives you &ldquo;the most recent&rdquo; one?</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Push every opening bracket. For a closing bracket, the stack must not be empty and its top must be the matching opening bracket; pop it.
              A small dictionary from each closing bracket to its opening bracket keeps this short.
            </p>
            <p>At the end, the text is balanced only if the stack is empty.</p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`pair = {')': '(', ']': '[', '}': '{'}
stack = []
for c in s:
    if c is an opening bracket: push c
    elif c in pair:
        if stack is empty or stack.pop() != pair[c]: return False
return stack is empty`}
          />
        ),
      },
    ],
    tests: t1,
  },
  {
    n: 2,
    title: "The postfix calculator",
    fn: "eval_postfix",
    lessons: [2],
    starter: `def eval_postfix(tokens):
    # tokens is a list of strings: whole numbers and '+', '-', '*', '/'.
    # Return the value of the postfix expression as an int.
    # '/' means Python's // (round down).
    pass
`,
    statement: (
      <>
        <p>
          Work out the value of a postfix expression (lesson 2). <code>tokens</code> is a list of strings. Each one is a whole number, such as{" "}
          <code>&apos;12&apos;</code> or <code>&apos;-3&apos;</code>, or one of the operators <code>&apos;+&apos;</code>,{" "}
          <code>&apos;-&apos;</code>, <code>&apos;*&apos;</code> and <code>&apos;/&apos;</code>. Return the value as an <code>int</code>.
        </p>
        <CodeBlock
          code={`eval_postfix(['2', '1', '+', '3', '*'])     # (2 + 1) * 3 = 9
eval_postfix(['10', '3', '-'])              # 10 - 3 = 7
eval_postfix(['7', '-2', '/'])              # 7 // -2 = -4`}
        />
        <p>
          <code>&apos;/&apos;</code> means Python&rsquo;s <code>//</code>, which rounds down. The expression is always valid, and no division is by
          zero.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Up to 200,001 tokens.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>An operator works on the two most recent values that have not been used yet.</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Push each number (as an <code>int</code>). For an operator, pop two values, apply it, and push the result. At the end the stack holds
              one value: the answer.
            </p>
            <p>
              The first value popped is the <em>right-hand</em> one. And <code>&apos;-3&apos;</code> is a number: test whether a token is exactly one
              of the four operators, not whether it starts with <code>-</code>.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`stack = []
for t in tokens:
    if t in ('+', '-', '*', '/'):
        b = stack.pop(); a = stack.pop()
        push a + b, a - b, a * b or a // b
    else:
        push int(t)
return stack[0]`}
          />
        ),
      },
    ],
    tests: t2,
  },
  {
    n: 3,
    title: "Recent pings",
    fn: "RecentPings",
    lessons: [3],
    starter: `class RecentPings:
    def __init__(self, window):
        # Remember the window length.
        pass

    def ping(self, t):
        # A ping arrives at time t. Return how many pings,
        # this one included, arrived in the times t - window to t.
        pass
`,
    statement: (
      <>
        <p>
          A signal box receives pings at increasing times. Write a class <code>RecentPings(window)</code>. Its method <code>ping(t)</code> records a
          ping at time <code>t</code>, then returns how many pings so far arrived between <code>t - window</code> and <code>t</code>, both ends
          included.
        </p>
        <CodeBlock
          code={`r = RecentPings(3000)
r.ping(1)      # 1
r.ping(100)    # 2
r.ping(3001)   # 3: times 1 … 3001 hold all three
r.ping(3002)   # 3: times 2 … 3002; 1 is too old`}
        />
        <h2>Limits</h2>
        <ul>
          <li>Each call&rsquo;s <code>t</code> is bigger than the one before.</li>
          <li>Up to 300,000 calls; each one should take <M>O(1)</M> time on average.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Once a ping is too old for one call, it is too old for every later call. So old pings can be thrown away for good.</p>,
      },
      {
        kind: "Approach",
        body: (
          <p>
            Keep the pings in a <code>deque</code>, oldest at the front. On each call, add <code>t</code> at the back, then remove pings from the front
            while they are older than <code>t - window</code>. The answer is the length of the deque. Each ping is added once and removed at most
            once.
          </p>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`__init__: self.window = window; self.q = deque()
ping(t):
    self.q.append(t)
    while self.q[0] < t - self.window:
        self.q.popleft()
    return len(self.q)`}
          />
        ),
      },
    ],
    tests: t3,
  },
  {
    n: 4,
    title: "A ring of platforms",
    fn: "RingQueue",
    lessons: [4],
    blocked: ["collections.deque"],
    starter: `class RingQueue:
    # A queue that holds at most capacity items, stored in a
    # list of fixed size. Every method must be O(1).

    def __init__(self, capacity):
        pass

    def push(self, x):
        # Add x at the back. Return True, or False if full.
        pass

    def pop(self):
        # Remove and return the front item, or None if empty.
        pass

    def peek(self):
        # Return the front item without removing it, or None.
        pass

    def __len__(self):
        pass

    def is_full(self):
        pass
`,
    statement: (
      <>
        <p>
          Build a queue of fixed size as a circular buffer (lesson 4). <code>RingQueue(capacity)</code> holds at most <code>capacity</code> items.
          When it is full, <code>push</code> refuses the item and returns <code>False</code>.
        </p>
        <CodeBlock
          code={`q = RingQueue(2)
q.push('a'); q.push('b')    # True, True
q.push('c')                 # False: full
q.pop()                     # 'a'
q.peek()                    # 'b'
len(q), q.is_full()         # 1, False`}
        />
        <p>
          Store the items in one list of length <code>capacity</code>, made in <code>__init__</code>. <code>collections.deque</code> is switched
          off.
        </p>
        <h2>Limits</h2>
        <ul>
          <li>Capacity up to 200,000, and up to 600,000 calls in one test.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Do not move the items when the front one leaves. Move a number that says where the front is.</p>,
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Keep <code>head</code> (where the front item is) and <code>count</code> (how many items there are). The next free slot is{" "}
              <code>(head + count) % capacity</code>, which wraps round to 0 after the last slot.
            </p>
            <p>
              <code>pop</code> reads <code>slots[head]</code>, then sets <code>head = (head + 1) % capacity</code> and takes 1 from{" "}
              <code>count</code>. Full means <code>count == capacity</code>.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`__init__: slots = [None] * capacity; head = 0; count = 0
push(x): if full: return False
         slots[(head + count) % cap] = x; count += 1; return True
pop():   if count == 0: return None
         x = slots[head]; head = (head + 1) % cap; count -= 1; return x
peek():  None if count == 0 else slots[head]`}
          />
        ),
      },
    ],
    tests: t4,
  },
  {
    n: 5,
    title: "Next taller signal",
    fn: "next_greater",
    lessons: [5],
    starter: `def next_greater(a):
    # For each place i, the first value to the right of i
    # that is bigger than a[i], or -1 if there is none.
    pass
`,
    statement: (
      <>
        <p>
          Signals stand in a row, and <code>a[i]</code> is the height of signal <code>i</code>. For each signal, find the first signal to its right
          that is strictly taller, and give its height. If there is none, give <code>-1</code>. Return the answers as a new list.
        </p>
        <CodeBlock
          code={`next_greater([2, 7, 3, 5, 4, 6, 1])   # [7, -1, 5, 6, 6, -1, -1]
next_greater([3, 3, 3])               # [-1, -1, -1]`}
        />
        <h2>Limits</h2>
        <ul>
          <li>Up to 200,000 signals. Your solution should be <M>O(n)</M>.</li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: <p>Walk from left to right. Which signals are still waiting for their answer, and in what order are their heights?</p>,
      },
      {
        kind: "Approach",
        body: (
          <p>
            Keep a stack of the places still waiting. Their heights go down from bottom to top. When a new height <code>x</code> arrives, pop every
            place whose height is less than <code>x</code>; <code>x</code> is its answer. Then push the new place. Places left at the end keep{" "}
            <code>-1</code>.
          </p>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`answer = [-1] * len(a)
stack = []
for i, x in enumerate(a):
    while stack and a[stack[-1]] < x:
        answer[stack.pop()] = x
    stack.append(i)
return answer`}
          />
        ),
      },
    ],
    tests: t5,
  },
  {
    n: 6,
    title: "Biggest in each window",
    fn: "window_max",
    lessons: [6],
    starter: `def window_max(a, k):
    # The biggest value in each run of k values next to
    # each other, from left to right.
    pass
`,
    statement: (
      <>
        <p>
          A window of <code>k</code> values slides along the list <code>a</code>, one place at a time. Return the biggest value in each window, from
          the first window to the last. There are <code>len(a) - k + 1</code> windows.
        </p>
        <CodeBlock
          code={`window_max([4, 2, 12, 3, 8, 5, 1, 7], 3)
# [12, 12, 12, 8, 8, 7]
window_max([5, 3, 8], 1)    # [5, 3, 8]`}
        />
        <h2>Limits</h2>
        <ul>
          <li>
            Up to 200,000 values. <code>k</code> is at least 1 and at most <code>len(a)</code>. <code>k</code> can be large, so{" "}
            <M>O(n × k)</M> (n times k) is too slow.
          </li>
        </ul>
      </>
    ),
    hints: [
      {
        kind: "Nudge",
        body: (
          <p>
            When a new value arrives, some older values in the window can never be the biggest again, whatever comes next. Which ones? You can
            forget them.
          </p>
        ),
      },
      {
        kind: "Approach",
        body: (
          <>
            <p>
              Keep a <code>deque</code> of places whose values go down from front to back. For each new value, pop places from the back while their
              values are <code>&lt;= x</code>, then append the new place.
            </p>
            <p>
              If the front place has left the window (<code>front &lt;= i - k</code>), pop it from the front. Once <code>i &gt;= k - 1</code>, the
              value at the front is the answer for this window.
            </p>
          </>
        ),
      },
      {
        kind: "Pseudocode",
        body: (
          <CodeBlock
            code={`dq = deque(); out = []
for i, x in enumerate(a):
    while dq and a[dq[-1]] <= x: dq.pop()
    dq.append(i)
    if dq[0] <= i - k: dq.popleft()
    if i >= k - 1: out.append(a[dq[0]])
return out`}
          />
        ),
      },
    ],
    tests: t6,
  },
];
