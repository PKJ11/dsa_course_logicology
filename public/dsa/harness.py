# The DSA practice harness. The browser runs it inside Pyodide (see runner.mjs); the same file runs
# under ordinary Python to check the course's reference solutions (scripts/check-problems.py).

import builtins
import contextlib
import importlib
import io
import json
import linecache
import sys
import traceback

_ns = {}
_MAX_OUT = 4000
_patched = {}  # (module, name) -> original, so the next load can put it back
_no_sort = False

# What each blocked tool is called in the message the learner sees.
_BLOCK_NAMES = {
    "math.isqrt": "math.isqrt",
    "sorted": "sorted() and .sort()",
    "pow": "pow()",
    "heapq": "heapq",
    "itertools.permutations": "itertools.permutations",
    "itertools.combinations": "itertools.combinations",
    "itertools.product": "itertools.product",
    "collections.deque": "collections.deque",
    "collections.OrderedDict": "collections.OrderedDict",
    "bisect": "bisect",
}
# Python 3.14 added the _max versions; only the names this Python has are switched off.
_HEAPQ = ["heappush", "heappop", "heapify", "heapreplace", "heappushpop", "nlargest", "nsmallest", "merge",
          "heappush_max", "heappop_max", "heapify_max", "heapreplace_max", "heappushpop_max"]
_BISECT = ["bisect", "bisect_left", "bisect_right", "insort", "insort_left", "insort_right"]


class Track:
    """A read-only list that counts how many items are read from it."""

    def __init__(self, data):
        self._d = list(data)
        self.reads = 0

    def __len__(self):
        return len(self._d)

    def __getitem__(self, i):
        if isinstance(i, slice):
            self.reads += len(range(*i.indices(len(self._d))))
        else:
            self.reads += 1
        return self._d[i]

    def __iter__(self):
        for x in self._d:
            self.reads += 1
            yield x

    def __contains__(self, x):
        return any(y == x for y in self)

    def index(self, x):
        for k, y in enumerate(self):
            if y == x:
                return k
        raise ValueError(f"{x!r} is not in list")

    def count(self, x):
        return sum(1 for y in self if y == x)

    def __eq__(self, other):
        return list(self) == list(other)

    def __repr__(self):
        return repr(self._d)


def _blocker(label):
    def blocked(*_args, **_kwargs):
        raise RuntimeError(f"{label} {'are' if ' and ' in label else 'is'} switched off for this problem: build it yourself.")

    return blocked


class NoSortList(list):
    """A list whose .sort() is switched off, used for inputs when sorted() is blocked."""

    def sort(self, *_args, **_kwargs):
        raise RuntimeError("sorted() and .sort() are switched off for this problem: build it yourself.")


def walk(node, limit=2_000_000):
    """Test helper for linked nodes: the values from node along .next, stopping at None."""
    out = []
    while node is not None:
        if len(out) >= limit:
            raise RuntimeError("The chain of nodes never reaches None: some node's next points back into the chain.")
        out.append(node.value)
        node = node.next
    return out


class Node:
    """The node the tests build lists from. It has the same shape as the starter code's Node."""

    def __init__(self, value, next=None):
        self.value = value
        self.next = next

    def __repr__(self):
        return f"Node({self.value!r})"


class _PlainNode(Node):
    """A node that cannot go in a set or be a dict key: for problems that ask for O(1) extra space."""

    __hash__ = None


_PlainNode.__name__ = _PlainNode.__qualname__ = "Node"


def chain(values, loop=None, hashable=True):
    """Test helper: link one node per value and return the head. loop=k points the last node back at node k."""
    cls = Node if hashable else _PlainNode
    nodes = [cls(v) for v in values]
    for a, b in zip(nodes, nodes[1:]):
        a.next = b
    if loop is not None and nodes:
        nodes[-1].next = nodes[loop]
    _built.append(nodes)
    return nodes[0] if nodes else None


# Nodes built by chain(). When the head of a long chain is dropped, CPython frees the whole chain in one
# nested cascade, and in Pyodide that overflows the browser's stack at about 20,000 nodes. So each test
# ends by cutting every next link of these nodes; then each node is freed on its own.
_built = []


def _cut_chains():
    for ns in _built:
        for node in ns:
            node.next = None
    _built.clear()
    for ns in _built_trees:
        for node in ns:
            node.left = node.right = None
    _built_trees.clear()
    for x in _to_free:
        _scrub(x)
    _to_free.clear()


# Structures the learner builds (a skip list, a tree) that a test hands to free(). After the test every
# object reachable from them is emptied, so they are freed one at a time, not in one deep cascade.
_to_free = []
_ATOMS = (int, float, str, bytes, bool, complex, type(None), type, type(len), type(lambda: 0), type(sys))


def free(x):
    """Test helper: return x unchanged, and empty everything reachable from it once the test ends."""
    _to_free.append(x)
    return x


def _scrub(x, limit=3_000_000):
    seen, todo, objs = set(), [x], []
    while todo and len(objs) < limit:
        o = todo.pop()
        if isinstance(o, _ATOMS) or id(o) in seen:
            continue
        seen.add(id(o))
        objs.append(o)
        if isinstance(o, (list, tuple, set, frozenset)):
            todo.extend(o)
        elif isinstance(o, dict):
            todo.extend(o.keys())
            todo.extend(o.values())
        else:
            d = getattr(o, "__dict__", None)
            if isinstance(d, dict):
                todo.extend(d.values())
            for cls in type(o).__mro__:
                for slot in getattr(cls, "__slots__", ()):
                    if isinstance(slot, str) and hasattr(o, slot):
                        todo.append(getattr(o, slot))
    for o in objs:
        try:
            if isinstance(o, (list, dict, set)):
                o.clear()
            else:
                d = getattr(o, "__dict__", None)
                if isinstance(d, dict):
                    d.clear()
                for cls in type(o).__mro__:
                    for slot in getattr(cls, "__slots__", ()):
                        if isinstance(slot, str) and hasattr(o, slot):
                            setattr(o, slot, None)
        except Exception:  # noqa: BLE001 - best effort; whatever cannot be emptied is freed normally
            pass


class TreeNode:
    """The node the tests build trees from. It has the same shape as the starter code's TreeNode."""

    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

    def __repr__(self):
        return f"TreeNode({self.value!r})"


# Tree nodes built by tree() and bst(). Like chain(), each test ends by cutting their links, so a deep
# tree is freed one node at a time instead of in one nested cascade.
_built_trees = []


def tree(values):
    """Test helper: build a binary tree from a level-order list with None for a missing child, and return the root."""
    if not values or values[0] is None:
        return None
    ns = [TreeNode(values[0])]
    queue, k = [ns[0]], 1
    head = 0
    while head < len(queue) and k < len(values):
        node = queue[head]
        head += 1
        for side in ("left", "right"):
            if k < len(values):
                if values[k] is not None:
                    child = TreeNode(values[k])
                    setattr(node, side, child)
                    queue.append(child)
                    ns.append(child)
                k += 1
    _built_trees.append(ns)
    return ns[0]


def bst(keys):
    """Test helper: insert keys in order into an empty binary search tree (no recursion), and return the root."""
    root, ns = None, []
    for key in keys:
        node = TreeNode(key)
        ns.append(node)
        if root is None:
            root = node
            continue
        cur = root
        while True:
            side = "left" if key < cur.value else "right"
            nxt = getattr(cur, side)
            if nxt is None:
                setattr(cur, side, node)
                break
            cur = nxt
    _built_trees.append(ns)
    return root


def levels(root, limit=2_000_000):
    """Test helper: the tree as a level-order list with None for missing children, trailing Nones removed."""
    out, queue, head = [], [root], 0
    while head < len(queue):
        node = queue[head]
        head += 1
        if node is None:
            out.append(None)
            continue
        if len(out) >= limit:
            raise RuntimeError("The tree never ends: some node's left or right points back up the tree.")
        out.append(node.value)
        queue.append(node.left)
        queue.append(node.right)
    while out and out[-1] is None:
        out.pop()
    return out


def inorder(root, limit=2_000_000):
    """Test helper: the values in in-order (left, node, right), without recursion."""
    out, stack, cur = [], [], root
    while stack or cur is not None:
        while cur is not None:
            stack.append(cur)
            cur = cur.left
        cur = stack.pop()
        out.append(cur.value)
        if len(out) > limit:
            raise RuntimeError("The tree never ends: some node's left or right points back up the tree.")
        cur = cur.right
    return out


def preorder(root):
    """Test helper: the values in pre-order (node, left, right), without recursion."""
    out, stack = [], [root] if root is not None else []
    while stack:
        node = stack.pop()
        out.append(node.value)
        if node.right is not None:
            stack.append(node.right)
        if node.left is not None:
            stack.append(node.left)
    return out


def tnodes(root):
    """Test helper: the node objects in in-order, so a test can change a value deep in the tree."""
    out, stack, cur = [], [], root
    while stack or cur is not None:
        while cur is not None:
            stack.append(cur)
            cur = cur.left
        cur = stack.pop()
        out.append(cur)
        cur = cur.right
    return out


def height(root):
    """Test helper: the number of edges on the longest path down from the root (-1 for an empty tree)."""
    h, level = -1, [root] if root is not None else []
    while level:
        h += 1
        level = [c for n in level for c in (n.left, n.right) if c is not None]
    return h


def _post(root, limit=2_000_000):
    """Nodes in an order where children come before their parent (no recursion)."""
    order, stack = [], [root] if root is not None else []
    while stack:
        n = stack.pop()
        order.append(n)
        if len(order) > limit:
            raise RuntimeError("The tree never ends: some node's left or right points back up the tree.")
        if n.left is not None:
            stack.append(n.left)
        if n.right is not None:
            stack.append(n.right)
    order.reverse()
    return order


def unbalanced(root):
    """Test helper: values of nodes whose two subtrees differ in height by more than 1 (first five), [] if none."""
    h, bad = {}, []
    for n in _post(root):
        hl = h[id(n.left)] if n.left is not None else -1
        hr = h[id(n.right)] if n.right is not None else -1
        if abs(hl - hr) > 1 and len(bad) < 5:
            bad.append(n.value)
        h[id(n)] = 1 + max(hl, hr)
    return bad


def rb_check(root):
    """Test helper: 'ok' if the tree obeys the red-black rules (nodes have .red True or False), else the first broken rule."""
    if root is None:
        return "ok"
    bh = {}
    for n in _post(root):
        if type(getattr(n, "red", None)) is not bool:
            return f"node {n.value!r} has no .red set to True or False"
        for c in (n.left, n.right):
            if c is not None and n.red and getattr(c, "red", False) is True:
                return f"red node {n.value!r} has a red child {c.value!r}"
        bl = bh[id(n.left)] if n.left is not None else 0
        br = bh[id(n.right)] if n.right is not None else 0
        if bl != br:
            return f"under node {n.value!r} the black counts differ: {bl} on the left, {br} on the right"
        bh[id(n)] = bl + (0 if n.red else 1)
    if root.red:
        return "the root is red"
    return "ok"


class _Key:
    """A stand-in leaf holding one key, so bkeys can put a node's key between its children."""

    def __init__(self, key):
        self.keys = [key]
        self.kids = []


def bkeys(root, limit=2_000_000):
    """Test helper: the keys of a B-tree (nodes with .keys and .kids lists) in order, without recursion."""
    out = []
    if root is None:
        return out
    stack = [(root, 0)]
    while stack:
        node, i = stack.pop()
        if len(out) > limit:
            raise RuntimeError("The B-tree never ends: some node's kids point back up the tree.")
        if not node.kids:
            out.extend(node.keys)
            continue
        if i < len(node.keys):
            stack.append((node, i + 1))
            stack.append((_Key(node.keys[i]), 0))
        if i < len(node.kids):
            stack.append((node.kids[i], 0))
    return out


def bcheck(root, most=3):
    """Test helper: 'ok' if the B-tree obeys the rules, else the first broken rule. At most `most` keys per node,
    at least most // 2 outside the root, keys in order, one more child than keys, all leaves at one depth."""
    if root is None:
        return "ok"
    least = most // 2
    leaf_depth = None
    stack = [(root, 0, None, None)]
    seen = 0
    while stack:
        node, d, lo, hi = stack.pop()
        seen += 1
        if seen > 2_000_000:
            raise RuntimeError("The B-tree never ends: some node's kids point back up the tree.")
        ks = node.keys
        if node is root and not ks:
            return "the root has no keys; return None for an empty tree"
        if len(ks) > most:
            return f"node {ks} has {len(ks)} keys; at most {most} are allowed"
        if node is not root and len(ks) < least:
            return f"node {ks} has {len(ks)} keys; every node except the root needs at least {least}"
        if any(ks[i] >= ks[i + 1] for i in range(len(ks) - 1)):
            return f"the keys of node {ks} are not in increasing order"
        if (lo is not None and ks[0] <= lo) or (hi is not None and ks[-1] >= hi):
            return f"node {ks} sits in the wrong place: its keys must lie between {lo} and {hi}"
        if node.kids:
            if len(node.kids) != len(ks) + 1:
                return f"node {ks} has {len(ks)} keys and {len(node.kids)} children; it needs {len(ks) + 1}"
            bounds = [lo, *ks, hi]
            for i, kid in enumerate(node.kids):
                stack.append((kid, d + 1, bounds[i], bounds[i + 1]))
        elif leaf_depth is None:
            leaf_depth = d
        elif d != leaf_depth:
            return f"leaves sit at different depths ({leaf_depth} and {d}); all leaves must be at the same depth"
    return "ok"


def bheight(root):
    """Test helper: the height of a B-tree (edges from the root to a leaf, -1 if empty)."""
    h, node = -1, root
    while node is not None:
        h += 1
        node = node.kids[0] if node.kids else None
    return h


class Num:
    """A number that counts the comparisons made with it (<, <=, >, >=), so a test can check an O(n) build."""

    __slots__ = ("v",)
    count = 0

    def __init__(self, v):
        self.v = v

    def _o(self, other):
        Num.count += 1
        return other.v if isinstance(other, Num) else other

    def __lt__(self, other):
        return self.v < self._o(other)

    def __le__(self, other):
        return self.v <= self._o(other)

    def __gt__(self, other):
        return self.v > self._o(other)

    def __ge__(self, other):
        return self.v >= self._o(other)

    def __eq__(self, other):
        return self.v == (other.v if isinstance(other, Num) else other)

    def __hash__(self):
        return hash(self.v)

    def __repr__(self):
        return repr(self.v)

    # Arithmetic gives plain numbers, except negation, which keeps counting (a max-heap of -x).
    def __neg__(self):
        return Num(-self.v)

    def __add__(self, other):
        return self.v + (other.v if isinstance(other, Num) else other)

    __radd__ = __add__

    def __sub__(self, other):
        return self.v - (other.v if isinstance(other, Num) else other)

    def __rsub__(self, other):
        return (other.v if isinstance(other, Num) else other) - self.v

    def __truediv__(self, other):
        return self.v / (other.v if isinstance(other, Num) else other)

    def __floordiv__(self, other):
        return self.v // (other.v if isinstance(other, Num) else other)

    def __float__(self):
        return float(self.v)

    def __int__(self):
        return int(self.v)

    def __index__(self):
        return int(self.v)


def counted(values):
    """Test helper: the values as Num objects, with the comparison count set back to 0."""
    Num.count = 0
    return [Num(v) for v in values]


def comparisons():
    """Test helper: how many comparisons were made between Num objects since counted() was called."""
    return Num.count


def plain(values):
    """Test helper: Num objects back to plain numbers."""
    return [x.v if isinstance(x, Num) else x for x in values]


def skip_counts(sl, levels=3, limit=2_000_000):
    """Test helper: how many nodes a skip list has on each of its lowest levels, walking sl.head.next[level].
    Raises if a level is out of order or never ends."""
    out = []
    for lv in range(levels):
        k, node, last = 0, sl.head.next[lv] if len(sl.head.next) > lv else None, None
        while node is not None:
            if last is not None and not last < node.key:
                raise RuntimeError(f"Level {lv} is not in increasing order: {last!r} comes before {node.key!r}.")
            last = node.key
            k += 1
            if k > limit:
                raise RuntimeError(f"Level {lv} never ends: some node's next points back.")
            node = node.next[lv] if len(node.next) > lv else None
        out.append(k)
    return out


def place(head, node, limit=2_000_000):
    """Test helper: the position of node in the chain from head (0 is the head), or None if it is not there."""
    if node is None:
        return None
    k = 0
    while head is not None and k < limit:
        if head is node:
            return k
        head = head.next
        k += 1
    return None


def nodes(head, limit=2_000_000):
    """Test helper: the node objects from head along .next, so tests can check that nodes were reused."""
    out = []
    while head is not None:
        if len(out) >= limit:
            raise RuntimeError("The chain of nodes never reaches None: some node's next points back into the chain.")
        out.append(head)
        head = head.next
    return out


def _patch(mod, name, value):
    m = importlib.import_module(mod)
    _patched.setdefault((mod, name), getattr(m, name))
    setattr(m, name, value)


def _apply_blocks(blocked):
    """Put back anything an earlier problem switched off, then switch off this problem's list."""
    global _no_sort
    for (mod, name), orig in _patched.items():
        setattr(importlib.import_module(mod), name, orig)
    _patched.clear()
    _no_sort = False
    names = dict(builtins.__dict__)
    for b in blocked:
        label = _BLOCK_NAMES.get(b, b)
        if b in ("heapq", "bisect"):
            mod = importlib.import_module(b)
            for f in _HEAPQ if b == "heapq" else _BISECT:
                if hasattr(mod, f):
                    _patch(b, f, _blocker(label))
        elif "." in b:
            mod, name = b.rsplit(".", 1)
            _patch(mod, name, _blocker(label))
        elif b in names:
            names[b] = _blocker(label)
            if b == "sorted":
                _no_sort = True
    return names


def _user_tb(exc):
    """Keep only the frames from the learner's file."""
    frames = [f for f in traceback.extract_tb(exc.__traceback__) if f.filename == "solution.py"]
    lines = [f'  line {f.lineno}, in {f.name}\n    {(f.line or "").strip()}' for f in frames]
    head = "Traceback (your code):\n" + "\n".join(lines) + "\n" if lines else ""
    return head + f"{type(exc).__name__}: {exc}"


def dsa_load(code, blocked_json="[]"):
    global _ns
    names = _apply_blocks(json.loads(blocked_json))
    _ns = {"__name__": "solution", "__builtins__": names}
    out = io.StringIO()
    try:
        # Register the source so tracebacks can quote the learner's lines.
        linecache.cache["solution.py"] = (len(code), None, code.splitlines(True), "solution.py")
        compiled = compile(code, "solution.py", "exec")
        with contextlib.redirect_stdout(out):
            exec(compiled, _ns)
    except SyntaxError as e:
        return json.dumps({"ok": False, "error": f"SyntaxError on line {e.lineno}: {e.msg}", "line": e.lineno, "stdout": out.getvalue()[:_MAX_OUT]})
    except BaseException as e:  # noqa: BLE001 - report anything the learner's top level raises
        return json.dumps({"ok": False, "error": _user_tb(e), "stdout": out.getvalue()[:_MAX_OUT]})
    return json.dumps({"ok": True, "stdout": out.getvalue()[:_MAX_OUT]})


def _same(got, exp):
    if isinstance(exp, bool) or isinstance(got, bool):
        return type(got) is type(exp) and got == exp
    if isinstance(exp, float) or isinstance(got, float):
        return isinstance(got, (int, float)) and not isinstance(got, bool) and abs(got - exp) <= 1e-9 * max(1.0, abs(exp))
    if isinstance(exp, dict):
        return isinstance(got, dict) and got.keys() == exp.keys() and all(_same(got[k], exp[k]) for k in exp)
    if isinstance(exp, tuple):
        return _same(list(got) if isinstance(got, tuple) else got, list(exp))
    if isinstance(exp, list):
        if not isinstance(got, (list, tuple)) or len(got) != len(exp):
            return False
        return all(_same(g, e) for g, e in zip(got, exp))
    if isinstance(exp, int):
        return isinstance(got, int) and got == exp
    return got == exp


def _short(v, limit=300):
    r = repr(v)
    return r if len(r) <= limit else r[: limit - 1] + "…"


# ---------- Graphs (GRPH): check answers that can take many right forms ----------

def _edge_set(edges, directed):
    s = set()
    for u, v in edges:
        s.add((u, v))
        if not directed:
            s.add((v, u))
    return s


def is_route(n, edges, p, s, t):
    """True if p lists vertices from s to t, each step along an edge (edges are two-way)."""
    if not isinstance(p, (list, tuple)) or not p or p[0] != s or p[-1] != t:
        return False
    es = _edge_set(edges, False)
    try:
        return all((p[i], p[i + 1]) in es for i in range(len(p) - 1))
    except TypeError:
        return False


def is_cycle(n, edges, c, directed=True):
    """True if c lists different vertices, each joined to the next by an edge, and the last to the first."""
    if not isinstance(c, (list, tuple)) or not c:
        return False
    try:
        if len(set(c)) != len(c):
            return False
        es = _edge_set(edges, directed)
        return all((c[i], c[(i + 1) % len(c)]) in es for i in range(len(c)))
    except TypeError:
        return False


def teams_check(n, edges, ans):
    """'two teams' or 'odd cycle' when the answer is right; otherwise a short note on what is wrong."""
    if not isinstance(ans, (tuple, list)) or len(ans) != 2 or not isinstance(ans[0], bool):
        return "the answer must be (True, side) or (False, cycle)"
    ok, x = ans
    if not isinstance(x, (list, tuple)):
        return "the second item must be a list"
    if ok:
        if len(x) != n:
            return f"side has {len(x)} entries, not {n}"
        if any(v not in (0, 1) for v in x):
            return "side must hold only 0 and 1"
        for u, v in edges:
            if x[u] == x[v]:
                return f"the edge {u}-{v} joins two members of team {x[u]}"
        return "two teams"
    c = list(x)
    if len(c) < 3:
        return "a cycle needs at least 3 vertices"
    if len(c) % 2 == 0:
        return f"the cycle has {len(c)} vertices, an even number"
    try:
        if len(set(c)) != len(c):
            return "the cycle repeats a vertex"
    except TypeError:
        return "the cycle must list vertex numbers"
    es = _edge_set(edges, False)
    for i in range(len(c)):
        a, b = c[i], c[(i + 1) % len(c)]
        if (a, b) not in es:
            return f"{a} and {b} are not joined by an edge"
    return "odd cycle"


# ---------- Weighted graphs (PATH, SPAN) ----------

def route_cost(n, edges, p, s, t, directed=True):
    """The total weight of route p from s to t along edges (u, v, w), using the lightest edge between each pair;
    None if p is not such a route."""
    if not isinstance(p, (list, tuple)) or not p or p[0] != s or p[-1] != t:
        return None
    best = {}
    for u, v, w in edges:
        for a, b in ((u, v), (v, u)) if not directed else ((u, v),):
            if (a, b) not in best or w < best[(a, b)]:
                best[(a, b)] = w
    total = 0
    try:
        for i in range(len(p) - 1):
            w = best.get((p[i], p[i + 1]))
            if w is None:
                return None
            total += w
    except TypeError:
        return None
    return total


def tree_cost(n, edges, chosen):
    """The total weight of chosen when it is a spanning tree made of the given edges (u, v, w), each used at
    most as often as it is listed (either direction); otherwise a short note on what is wrong."""
    if not isinstance(chosen, (list, tuple)):
        return "the answer must be a list of edges"
    if len(chosen) != n - 1:
        return f"a spanning tree of {n} vertices has {n - 1} edges, not {len(chosen)}"
    left = {}
    for u, v, w in edges:
        k = (min(u, v), max(u, v), w)
        left[k] = left.get(k, 0) + 1
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    total = 0
    for e in chosen:
        try:
            u, v, w = e
            k = (min(u, v), max(u, v), w)
        except (TypeError, ValueError):
            return "each edge must be (u, v, w)"
        if left.get(k, 0) == 0:
            return f"{tuple(e)} is not one of the edges (or is used too often)"
        left[k] -= 1
        a, b = find(u), find(v)
        if a == b:
            return f"{tuple(e)} closes a loop"
        parent[a] = b
        total += w
    return total


# ---------- Connectivity (CONN) ----------

def scc_check(n, edges, labels):
    """'ok' when labels number the strongly connected groups 0 .. k-1 so that every directed edge goes from a
    group to the same or a later one; otherwise a short note on what is wrong. O(V + E), no recursion."""
    if not isinstance(labels, (list, tuple)):
        return "the answer must be a list with one number per vertex"
    if len(labels) != n:
        return f"the list has {len(labels)} numbers, not {n}"
    if any(type(x) is not int for x in labels):
        return "every group number must be a whole number"
    if n == 0:
        return "ok"
    k = max(labels) + 1
    size = [0] * max(k, 1)
    for x in labels:
        if x < 0:
            return "group numbers start at 0"
        size[x] += 1
    if any(c == 0 for c in size):
        return f"group numbers must be 0 to {k - 1} with none missing"
    out = [[] for _ in range(n)]
    back = [[] for _ in range(n)]
    for u, v in edges:
        if labels[u] > labels[v]:
            return f"the edge {u}->{v} goes from group {labels[u]} back to group {labels[v]}"
        if labels[u] == labels[v]:
            out[u].append(v)
            back[v].append(u)
    first = [-1] * k
    for v in range(n):
        if first[labels[v]] < 0:
            first[labels[v]] = v
    for adj in (out, back):
        seen = [False] * n
        for g in range(k):
            s = first[g]
            seen[s] = True
            stack = [s]
            got = 1
            while stack:
                u = stack.pop()
                for v in adj[u]:
                    if not seen[v]:
                        seen[v] = True
                        got += 1
                        stack.append(v)
            if got != size[g]:
                bad = next(v for v in range(n) if labels[v] == g and not seen[v])
                where = "reach" if adj is out else "be reached from"
                return f"{s} and {bad} are both in group {g}, but {s} cannot {where} {bad}"
    return "ok"


def sat_check(n, clauses, ans):
    """'satisfied' when ans (n booleans) makes every clause (a, b) true, 'no assignment' when ans is None;
    otherwise a short note. A literal k means x_k is True, -k means x_k is False."""
    if ans is None:
        return "no assignment"
    if not isinstance(ans, (list, tuple)) or len(ans) != n:
        return f"the answer must be None or a list of {n} values True or False"
    if any(type(x) is not bool for x in ans):
        return "every value must be True or False"
    for a, b in clauses:
        va = ans[a - 1] if a > 0 else not ans[-a - 1]
        vb = ans[b - 1] if b > 0 else not ans[-b - 1]
        if not (va or vb):
            return f"the rule ({a}, {b}) is broken"
    return "satisfied"


# ---------- Network flow (FLOW) ----------

def flow_check(n, edges, flow, s, t):
    """The value of flow (one number per edge (u, v, c)) when it keeps the capacity rule and conservation;
    otherwise a short note on the first broken rule."""
    if not isinstance(flow, (list, tuple)):
        return "the flow must be a list with one number per edge"
    if len(flow) != len(edges):
        return f"the flow has {len(flow)} numbers for {len(edges)} edges"
    net = [0] * n
    for k, ((u, v, c), f) in enumerate(zip(edges, flow)):
        if type(f) is not int:
            return f"the flow on edge {k} must be a whole number"
        if f < 0 or f > c:
            return f"edge {k} ({u}->{v}) carries {f}, outside 0 to {c}"
        net[u] += f
        net[v] -= f
    for v in range(n):
        if v != s and v != t and net[v] != 0:
            return f"vertex {v}: flow in and flow out differ by {abs(net[v])}"
    return net[s]


def cut_check(n, edges, side, s, t):
    """The capacity of the cut whose source side is `side` (a list of vertices with s and without t), or a note."""
    if not isinstance(side, (list, tuple, set, frozenset)):
        return "the answer must be a list of vertices"
    S = set(side)
    if any(type(v) is not int or not 0 <= v < n for v in S):
        return "the side must hold vertex numbers 0 to n - 1"
    if s not in S:
        return "the side must contain the source"
    if t in S:
        return "the side must not contain the sink"
    return sum(c for u, v, c in edges if u in S and v not in S)


def match_check(nl, nr, edges, pairs):
    """The number of pairs when pairs is a matching made of the given edges (u on the left, v on the right);
    otherwise a short note."""
    if not isinstance(pairs, (list, tuple)):
        return "the answer must be a list of pairs"
    es = set(map(tuple, edges))
    used_l, used_r = set(), set()
    for p in pairs:
        try:
            u, v = p
        except (TypeError, ValueError):
            return "each pair must be (left, right)"
        if (u, v) not in es:
            return f"({u}, {v}) is not one of the edges"
        if u in used_l:
            return f"left vertex {u} is used twice"
        if v in used_r:
            return f"right vertex {v} is used twice"
        used_l.add(u)
        used_r.add(v)
    return len(pairs)



def crossing_check(segs, ans):
    """'none' when ans is None; 'meet' when ans is a pair (i, j) of different positions whose pieces share a
    point (checked exactly with whole numbers); otherwise a short note."""
    if ans is None:
        return "none"
    try:
        i, j = ans
    except (TypeError, ValueError):
        return "the answer must be a pair (i, j) or None"
    if not (isinstance(i, int) and isinstance(j, int)) or not (0 <= i < len(segs) and 0 <= j < len(segs)):
        return "positions must be whole numbers from 0 to len(segs) - 1"
    if i == j:
        return "the two positions must be different"
    (a, b), (c, d) = segs[i], segs[j]

    def cross(o, p, q):
        return (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0])

    def within(p, q, r):
        return min(p[0], q[0]) <= r[0] <= max(p[0], q[0]) and min(p[1], q[1]) <= r[1] <= max(p[1], q[1])

    d1, d2, d3, d4 = cross(a, b, c), cross(a, b, d), cross(c, d, a), cross(c, d, b)
    if ((d1 > 0 > d2) or (d1 < 0 < d2)) and ((d3 > 0 > d4) or (d3 < 0 < d4)):
        return "meet"
    if (d1 == 0 and within(a, b, c)) or (d2 == 0 and within(a, b, d)) or (d3 == 0 and within(c, d, a)) or (d4 == 0 and within(c, d, b)):
        return "meet"
    return f"pieces {i} and {j} do not share a point"


# ---------- Hard problems (HARD) ----------

def _cnf_part(clauses, assign):
    """DPLL with unit propagation on one part of a formula: a dict of values, or None."""
    while True:
        rest_all = []
        unit = None
        for c in clauses:
            if any(assign.get(abs(l)) == (l > 0) for l in c):
                continue
            rest = [l for l in c if abs(l) not in assign]
            if not rest:
                return None
            if len(rest) == 1 and unit is None:
                unit = rest[0]
            rest_all.append(rest)
        clauses = rest_all
        if unit is None:
            break
        assign[abs(unit)] = unit > 0
    if not clauses:
        return assign
    lit = min(clauses, key=len)[0]
    for val in (lit > 0, lit < 0):
        got = _cnf_part(clauses, {**assign, abs(lit): val})
        if got is not None:
            return got
    return None


def _cnf_solve(clauses):
    """Values {variable: bool} that make every clause true, or None. Splits the formula into parts that share no
    variable and solves each with DPLL, so formulas made of many small parts are fast."""
    clauses = [tuple(set(c)) for c in clauses]
    if any(not c for c in clauses):
        return None
    up = {}

    def find(x):
        up.setdefault(x, x)
        while up[x] != x:
            up[x] = up[up[x]]
            x = up[x]
        return x
    for c in clauses:
        a = find(abs(c[0]))
        for l in c[1:]:
            b = find(abs(l))
            if a != b:
                up[b] = a
    parts = {}
    for c in clauses:
        parts.setdefault(find(abs(c[0])), []).append(c)
    out = {}
    for part in parts.values():
        got = _cnf_part(part, {})
        if got is None:
            return None
        out.update(got)
    return out


def cnf_check(n, clauses, ans):
    """'satisfied' when ans (n booleans, ans[k - 1] for variable k) makes every clause true, 'no assignment' when
    ans is None; otherwise a short note. A literal k means variable k is True, -k means it is False."""
    if ans is None:
        return "no assignment"
    if not isinstance(ans, (list, tuple)) or len(ans) != n:
        return f"the answer must be None or a list of {n} values True or False"
    if any(type(x) is not bool for x in ans):
        return "every value must be True or False"
    for k, c in enumerate(clauses):
        if not any(ans[l - 1] if l > 0 else not ans[-l - 1] for l in c):
            return f"clause {k} {list(c)} is broken"
    return "satisfied"


def oracle_check(find, n, clauses):
    """Run find(n, clauses, sat) with a yes/no helper sat(formula) that counts its calls.
    Returns [cnf_check of the answer, at most n + 1 calls?]."""
    calls = 0
    limit = 4 * (n + 1) + 20

    def sat(formula):
        nonlocal calls
        calls += 1
        if calls > limit:
            raise RuntimeError(f"sat() was called more than {limit} times")
        if not isinstance(formula, (list, tuple)):
            raise TypeError("sat() takes a list of clauses")
        cs = []
        for c in formula:
            if not isinstance(c, (list, tuple)):
                raise TypeError("each clause must be a list of literals")
            for l in c:
                if type(l) is not int or l == 0 or abs(l) > n:
                    raise ValueError(f"a literal must be a whole number from 1 to {n}, or minus one, not {l!r}")
            cs.append(c)
        return _cnf_solve(cs) is not None
    ans = find(n, [list(c) for c in clauses], sat)
    return [cnf_check(n, clauses, ans), calls <= n + 1]


def colour_cnf_report(n, edges, f, planted=None):
    """Facts about a formula meant to say 'the graph has a colouring with colours 0, 1, 2', where variable
    3v + c + 1 means 'vertex v has colour c'. Small graphs: solve it and decode ('colouring' or 'no colouring').
    With a planted colouring: does it satisfy the formula, is every clash and every missing colour caught,
    and is the formula at most 4n + 3E clauses long."""
    nv = 3 * n
    if not isinstance(f, (list, tuple)):
        return "the answer must be a list of clauses"
    cs = []
    for c in f:
        if not isinstance(c, (list, tuple)) or not c:
            return "each clause must be a non-empty list of literals"
        for l in c:
            if type(l) is not int or l == 0 or abs(l) > nv:
                return f"literal {l!r} is not a whole number from 1 to {nv} or its minus"
        cs.append(tuple(c))
    x = lambda v, c: 3 * v + c + 1
    if planted is None:
        sol = _cnf_solve(cs)
        if sol is None:
            return ["no colouring"]
        cols = [[c for c in range(3) if sol.get(x(v, c), False)] for v in range(n)]
        for v in range(n):
            if not cols[v]:
                return [f"a solution of the formula gives vertex {v} no colour"]
        for u, v in edges:
            if set(cols[u]) & set(cols[v]):
                return [f"a solution of the formula gives {u} and {v} the same colour"]
        return ["colouring"]
    by_var = {}
    for k, c in enumerate(cs):
        for l in c:
            by_var.setdefault(abs(l), []).append(k)
    true = {x(v, c) for v, c in enumerate(planted)}

    def holds(k, t):
        return any((l in t) if l > 0 else (-l not in t) for l in cs[k])
    facts = []
    bad = next((k for k in range(len(cs)) if not holds(k, true)), None)
    facts.append("planted colouring passes" if bad is None else f"a proper colouring breaks clause {bad}")
    for u, v in edges[:300]:
        t = (true - {x(v, planted[v])}) | {x(v, planted[u])}
        if all(holds(k, t) for k in by_var.get(x(v, planted[u]), [])):
            facts.append(f"{u} and {v} with the same colour break no clause")
            break
    else:
        facts.append("clashes caught")
    for v in range(min(n, 300)):
        t = true - {x(v, planted[v])}
        if all(holds(k, t) for k in by_var.get(x(v, planted[v]), [])):
            facts.append(f"vertex {v} with no colour breaks no clause")
            break
    else:
        facts.append("missing colours caught")
    facts.append(len(cs) <= 4 * n + 3 * len(edges))
    return facts


def makespan(jobs, m, a):
    """The largest total on one machine when job j runs on machine a[j], or a short note."""
    if not isinstance(a, (list, tuple)) or len(a) != len(jobs):
        return f"the answer must be a list of {len(jobs)} machine numbers"
    load = [0] * m
    for j, k in enumerate(a):
        if type(k) is not int or not 0 <= k < m:
            return f"job {j} has machine {k!r}, not a whole number from 0 to {m - 1}"
        load[k] += jobs[j]
    return max(load)


_HELPERS = {"walk": walk, "chain": chain, "place": place, "nodes": nodes, "NoSortList": NoSortList,
            "tree": tree, "bst": bst, "levels": levels, "inorder": inorder, "preorder": preorder, "tnodes": tnodes, "height": height,
            "free": free, "unbalanced": unbalanced, "rb_check": rb_check, "bkeys": bkeys, "bcheck": bcheck, "bheight": bheight,
            "counted": counted, "comparisons": comparisons, "plain": plain, "Num": Num, "skip_counts": skip_counts,
            "is_route": is_route, "is_cycle": is_cycle, "teams_check": teams_check,
            "route_cost": route_cost, "tree_cost": tree_cost, "scc_check": scc_check, "sat_check": sat_check,
            "flow_check": flow_check, "cut_check": cut_check, "match_check": match_check,
            "crossing_check": crossing_check, "cnf_check": cnf_check, "oracle_check": oracle_check,
            "colour_cnf_report": colour_cnf_report, "makespan": makespan}


def dsa_test(fn, args_src, expect_src, probe=0, expr=""):
    f = _ns.get(fn)
    if not callable(f):
        return json.dumps({"status": "error", "error": f"No function named {fn}() was defined. Keep the name from the starter code."})
    args = list(eval(args_src, {}))
    expected = eval(expect_src, {})
    tracked = None
    if probe:
        tracked = Track(args[0])
        args[0] = tracked
    if _no_sort:
        args = [NoSortList(a) if type(a) is list else a for a in args]
    out = io.StringIO()
    try:
        with contextlib.redirect_stdout(out):
            if expr:
                # The expression runs beside the learner's code, with the test's arguments as `args`.
                try:
                    got = eval(expr, {**_ns, "args": args, **_HELPERS})
                finally:
                    _cut_chains()
            else:
                got = f(*args)
    except RecursionError as e:
        return json.dumps({"status": "error", "error": _user_tb(e), "stdout": out.getvalue()[:_MAX_OUT]})
    except BaseException as e:  # noqa: BLE001
        return json.dumps({"status": "error", "error": _user_tb(e), "stdout": out.getvalue()[:_MAX_OUT]})
    result = {"got": _short(got), "stdout": out.getvalue()[:_MAX_OUT]}
    if tracked is not None:
        result["reads"] = tracked.reads
    if not _same(got, expected):
        result["status"] = "fail"
        result["expected"] = _short(expected)
    elif tracked is not None and tracked.reads > probe:
        result["status"] = "fail"
        result["expected"] = _short(expected) + f" in at most {probe} reads"
        result["slow"] = True
    else:
        result["status"] = "pass"
    return json.dumps(result)


if __name__ == "__main__":
    print("harness ok", sys.version.split()[0])
