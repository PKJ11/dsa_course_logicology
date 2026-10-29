# Naive and buggy STAQ solutions and the tests (0-based) that must catch them.
NAIVE = {
    1: ('''
def balanced(s):
    t = ''.join(c for c in s if c in '()[]{}')
    while True:
        u = t.replace('()', '').replace('[]', '').replace('{}', '')
        if u == t:
            return t == ''
        t = u
''', [8]),
    2: ('''
def eval_postfix(tokens):
    stack = []
    for t in tokens:
        if t in ('+', '-', '*', '/'):
            a = stack.pop()
            b = stack.pop()
            if t == '+': stack.append(a + b)
            elif t == '-': stack.append(a - b)
            elif t == '*': stack.append(a * b)
            else: stack.append(a // b)
        else:
            stack.append(int(t))
    return stack[0]
''', [1, 2]),
    3: ('''
class RecentPings:
    def __init__(self, window):
        self.window = window
        self.q = []
    def ping(self, t):
        self.q.append(t)
        while self.q[0] < t - self.window:
            self.q.pop(0)
        return len(self.q)
''', [5]),
    4: ('''
class RingQueue:
    def __init__(self, capacity):
        self.cap = capacity
        self.a = []
    def push(self, x):
        if len(self.a) == self.cap:
            return False
        self.a.append(x)
        return True
    def pop(self):
        return self.a.pop(0) if self.a else None
    def peek(self):
        return self.a[0] if self.a else None
    def __len__(self):
        return len(self.a)
    def is_full(self):
        return len(self.a) == self.cap
''', [7]),
    5: ('''
def next_greater(a):
    out = []
    for i in range(len(a)):
        ans = -1
        for j in range(i + 1, len(a)):
            if a[j] > a[i]:
                ans = a[j]
                break
        out.append(ans)
    return out
''', [8]),
    6: ('''
def window_max(a, k):
    return [max(a[i:i + k]) for i in range(len(a) - k + 1)]
''', [7]),
}
