// Step generators for the LINK figures. Every figure is a pure function of its step number.
// Captions use `backticks` for code. A linked list is drawn from three records: where each node sits,
// what each node's next (and prev) refers to, and which names refer to which node.

import type { LEdge, LName, LNode, Mark } from "../../_components/Stages";
import type { CellState } from "../kit";

export type LinkStep = {
  nodes: LNode[];
  edges: LEdge[];
  names: LName[];
  caption: string;
  line?: number | null;
  count?: number;
  verdict?: { ok: boolean; text: string };
};

type Place = { x: number; row?: number };

/** A small model of nodes in memory: labels, places, next and prev references, and states. */
class Board {
  label: Record<string, string | number> = {};
  at: Record<string, Place> = {};
  next: Record<string, string | null> = {};
  prev: Record<string, string | null> = {};
  none = new Set<string>();

  node(id: string, label: string | number, x: number, row = 0) {
    this.label[id] = label;
    this.at[id] = { x, row };
    return this;
  }

  noneAt(id: string, x: number, row = 0) {
    this.none.add(id);
    this.label[id] = "None";
    this.at[id] = { x, row };
    return this;
  }

  snap(
    caption: string,
    {
      names = [],
      states = {},
      edge = {},
      extra = [],
      hide = [],
      line,
      count,
      verdict,
    }: {
      names?: LName[];
      states?: Record<string, Mark>;
      edge?: Record<string, LEdge["state"]>;
      extra?: LEdge[];
      hide?: string[];
      line?: number | null;
      count?: number;
      verdict?: { ok: boolean; text: string };
    } = {},
  ): LinkStep {
    const nodes: LNode[] = Object.keys(this.at).map((id) => ({
      id,
      label: this.label[id],
      x: this.at[id].x,
      row: this.at[id].row,
      none: this.none.has(id) || undefined,
      state: hide.includes(id) ? "hidden" : states[id],
    }));
    const edges: LEdge[] = [
      ...extra,
      ...Object.entries(this.next)
        .filter(([, to]) => to !== null)
        .map(([from, to]) => ({ from, to: to!, state: edge[from] })),
      ...Object.entries(this.prev)
        .filter(([, to]) => to !== null)
        .map(([from, to]) => ({ from, to: to!, kind: "prev" as const, state: edge[`${from}<`] })),
    ];
    return { nodes, edges, names, caption, line, count, verdict };
  }
}

/** A row of nodes p0, p1, … from x = start, linked in order and ending at a None marker pNone. */
function row(b: Board, vals: (number | string)[], { start = 0, r = 0, p = "n" }: { start?: number; r?: number; p?: string } = {}) {
  vals.forEach((v, k) => b.node(`${p}${k}`, v, start + k, r));
  b.noneAt(`${p}None`, start + vals.length, r);
  vals.forEach((_, k) => (b.next[`${p}${k}`] = k + 1 < vals.length ? `${p}${k + 1}` : `${p}None`));
  return vals.map((_, k) => `${p}${k}`);
}

/* LINK-1.1: reading item k from a Python list and from a linked list */

export const READ_VALS = [12, 7, 30, 5, 18, 9];
export const READ_K = 4;

export type ListReadStep = { at: number | null; states: CellState[]; caption: string; count: number };

export function listReadSteps(): ListReadStep[] {
  const n = READ_VALS.length;
  return [
    {
      at: null,
      states: Array(n).fill(""),
      count: 0,
      caption:
        "A Python list keeps its items side by side, in one block of memory. So the place of item k is easy to work out: the start of the block, plus k places.",
    },
    {
      at: READ_K,
      states: READ_VALS.map((_, k) => (k === READ_K ? "found" : "")),
      count: 1,
      caption: `\`a[${READ_K}]\` goes straight to place ${READ_K} and finds ${READ_VALS[READ_K]}. That is one step. \`a[400000]\` would also be one step. Reading by position is O(1).`,
    },
  ];
}

export function linkReadSteps(): LinkStep[] {
  const b = new Board();
  const ids = row(b, READ_VALS);
  const out: LinkStep[] = [];
  const names = (k: number): LName[] => [
    { name: "head", at: ids[0] },
    { name: "cur", at: ids[k], kind: "mid" },
  ];
  out.push(
    b.snap(
      "A linked list has no block. Each node holds a value and a reference to the next node, and the nodes can be anywhere in memory. The only way in is the head.",
      { names: names(0), states: { [ids[0]]: "cur" }, count: 0 },
    ),
  );
  for (let k = 1; k <= READ_K; k++) {
    out.push(
      b.snap(`\`cur = cur.next\`. That is step ${k}. Now \`cur\` refers to the node holding ${READ_VALS[k]}.`, {
        names: names(k),
        states: { [ids[k]]: k === READ_K ? "found" : "cur" },
        count: k,
      }),
    );
  }
  out[out.length - 1].caption += ` This is item ${READ_K}. It took ${READ_K} steps. Item k takes k steps, so reading by position is O(k).`;
  return out;
}

/* LINK-2.1: insert after a node, in the right and the wrong order, and delete after a node */

export const INSERT = `node = Node(7)
node.next = cur.next     # 1: new node points on
cur.next = node          # 2: then link it in`;

export const INSERT_BAD = `node = Node(7)
cur.next = node          # 1: link it in first
node.next = cur.next     # 2: too late`;

export const DELETE = `cur.next = cur.next.next`;

export function insertSteps(wrong: boolean): LinkStep[] {
  const b = new Board();
  const [a, m, c] = row(b, [4, 9, 15]);
  const names = (node: string | null): LName[] => [
    { name: "head", at: a },
    { name: "cur", at: a, kind: "mid" },
    { name: "node", at: node },
  ];
  const out: LinkStep[] = [];
  out.push(b.snap("We want to put 7 just after the node that `cur` refers to, the one holding 4.", { names: names(null), states: { [a]: "cur" }, line: null }));
  b.node("x", 7, 0.5, -1);
  b.next.x = null;
  out.push(b.snap("`node = Node(7)` makes a new node. Its `next` is None, so nothing links to it and it links to nothing.", { names: names("x"), states: { [a]: "cur" }, line: 1 }));
  if (!wrong) {
    b.next.x = m;
    out.push(
      b.snap("`node.next = cur.next`. The new node now refers to 9. Both 4 and 7 lead to 9, so nothing is lost yet.", {
        names: names("x"),
        states: { [a]: "cur" },
        edge: { x: "cur" },
        line: 2,
      }),
    );
    b.next[a] = "x";
    out.push(
      b.snap("`cur.next = node`. Now 4 leads to 7, and 7 leads to 9. The old link from 4 to 9 is gone.", {
        names: names("x"),
        states: { [a]: "cur" },
        edge: { [a]: "cur" },
        extra: [{ from: a, to: m, state: "old" }],
        line: 3,
      }),
    );
    b.at.x = { x: 1, row: 0 };
    b.at[m] = { x: 2 };
    b.at[c] = { x: 3 };
    b.at.nNone = { x: 4 };
    out.push(
      b.snap("Walk from the head: 4, 7, 9, 15. It took two assignments, however long the list is. Inserting after a node you hold is O(1).", {
        names: names("x"),
        states: { x: "found" },
        line: null,
        verdict: { ok: true, text: "4 → 7 → 9 → 15" },
      }),
    );
    return out;
  }
  b.next[a] = "x";
  out.push(
    b.snap("`cur.next = node` first. Now 4 leads to 7. But the only reference to 9 was `cur.next`, and it has just been changed. Nothing refers to 9 any more.", {
      names: names("x"),
      states: { [a]: "cur", [m]: "bad", [c]: "bad" },
      edge: { [a]: "cur" },
      extra: [{ from: a, to: m, state: "old" }],
      line: 2,
    }),
  );
  b.next.x = "x";
  out.push(
    b.snap("`node.next = cur.next`. But `cur.next` is now the new node itself, so the node points to itself. A walk from the head would go round 7 for ever.", {
      names: names("x"),
      states: { [a]: "cur", x: "bad", [m]: "bad", [c]: "bad" },
      edge: { x: "bad" },
      line: 3,
      verdict: { ok: false, text: "9 and 15 are lost" },
    }),
  );
  return out;
}

export function deleteSteps(): LinkStep[] {
  const b = new Board();
  const [a, m, c] = row(b, [4, 9, 15]);
  const names: LName[] = [
    { name: "head", at: a },
    { name: "cur", at: a, kind: "mid" },
  ];
  const out: LinkStep[] = [];
  out.push(b.snap("To delete 9, we change the node before it. So `cur` refers to the node holding 4, not to 9 itself.", { names, states: { [a]: "cur" }, line: null }));
  b.next[a] = c;
  b.at[m] = { x: 1, row: -1 };
  out.push(
    b.snap("`cur.next = cur.next.next`. 4 now leads straight to 15. A walk from the head skips 9.", {
      names,
      states: { [a]: "cur" },
      edge: { [a]: "cur" },
      extra: [{ from: a, to: m, state: "old" }],
      line: 1,
    }),
  );
  out.push(
    b.snap("9 still refers to 15, but nothing refers to 9. Python notices this and frees its memory. You do not delete the node yourself.", {
      names,
      states: { [m]: "out" },
      edge: { [m]: "old" },
      line: null,
    }),
  );
  b.at[c] = { x: 1 };
  b.at.nNone = { x: 2 };
  out.push(
    b.snap("The list is now 4, 15. One assignment, so deleting after a node you hold is O(1). Deleting the head is different: there is no node before it. Lesson 2 shows the fix.", {
      names,
      hide: [m],
      line: null,
      verdict: { ok: true, text: "4 → 15" },
    }),
  );
  return out;
}

/* LINK-3.1: removing a node from a two-way list, and going round a circular list */

export const UNLINK = `node.prev.next = node.next
node.next.prev = node.prev`;

export function unlinkSteps(): LinkStep[] {
  const b = new Board();
  b.noneAt("L", 0).node("a", 3, 1).node("m", 8, 2).node("c", 5, 3).noneAt("R", 4);
  Object.assign(b.next, { a: "m", m: "c", c: "R" });
  Object.assign(b.prev, { a: "L", m: "a", c: "m" });
  const names: LName[] = [{ name: "node", at: "m", kind: "mid" }];
  const out: LinkStep[] = [];
  out.push(
    b.snap(
      "Each node has two references: `next` (top arrow, to the right) and `prev` (bottom arrow, to the left). We hold only `node`, the one holding 8, and want to remove it.",
      { names, states: { m: "cur" }, line: null },
    ),
  );
  b.next.a = "c";
  b.at.m = { x: 2, row: -1 };
  out.push(
    b.snap("`node.prev.next = node.next`. `node.prev` is 3, so 3's `next` now skips to 5.", {
      names,
      states: { m: "cur" },
      edge: { a: "cur" },
      extra: [{ from: "a", to: "m", state: "old" }],
      line: 1,
    }),
  );
  b.prev.c = "a";
  out.push(
    b.snap("`node.next.prev = node.prev`. `node.next` is 5, so 5's `prev` now skips back to 3. Both directions skip 8.", {
      names,
      states: { m: "cur" },
      edge: { "c<": "cur" },
      extra: [{ from: "c", to: "m", kind: "prev", state: "old" }],
      line: 2,
    }),
  );
  out.push(
    b.snap("No walk reaches 8 now, in either direction. We did not need the node before it: `node.prev` told us. Removing a node you hold is O(1).", {
      names,
      states: { m: "out" },
      edge: { m: "old", "m<": "old" },
      line: null,
    }),
  );
  b.at.c = { x: 2 };
  b.at.R = { x: 3 };
  out.push(
    b.snap("The list is 3, 5. `node` still refers to 8, but no walk can reach it. Here 3 and 5 had neighbours. If the node is first or last, `node.prev` or `node.next` is None and this code fails. Lesson 3 shows how sentinel nodes remove that case.", {
      names,
      states: { m: "out" },
      edge: { m: "old", "m<": "old" },
      line: null,
      verdict: { ok: true, text: "3 ⇄ 5" },
    }),
  );
  return out;
}

export const ROUND = `cur = start
while True:
    print(cur.value)
    cur = cur.next
    if cur is start:
        break`;

export function circleSteps(): LinkStep[] {
  const b = new Board();
  const vals = [6, 2, 9, 4];
  vals.forEach((v, k) => b.node(`n${k}`, v, k));
  vals.forEach((_, k) => (b.next[`n${k}`] = `n${(k + 1) % vals.length}`));
  const out: LinkStep[] = [];
  const names = (k: number): LName[] => [
    { name: "start", at: "n0" },
    { name: "cur", at: `n${k}`, kind: "mid" },
  ];
  out.push(
    b.snap("In a circular list the last node does not refer to None. It refers back to the first node. There is no end to stop at.", {
      names: names(0),
      states: { n0: "cur" },
      edge: { n3: "cur" },
      line: 1,
    }),
  );
  for (let k = 1; k <= vals.length; k++) {
    const back = k === vals.length;
    out.push(
      b.snap(
        back
          ? "`cur = cur.next` goes from 4 back to 6. Now `cur is start`, so the walk stops. Each value was printed once."
          : `\`cur = cur.next\`. Now \`cur\` holds ${vals[k]}. It is not \`start\`, so keep going.`,
        { names: names(k % vals.length), states: { [`n${k % vals.length}`]: back ? "found" : "cur" }, line: back ? 6 : 4 },
      ),
    );
  }
  out.push(
    b.snap("Use `is`, not `==`. You want the same node, not a node with an equal value. Circular lists suit things that take turns for ever, such as players in a game.", {
      names: names(0),
      line: null,
    }),
  );
  return out;
}

/* LINK-4.1: reversing a list in place */

export const REVERSE = `def reverse(head):
    prev, cur = None, head
    while cur is not None:
        nxt = cur.next
        cur.next = prev
        prev, cur = cur, nxt
    return prev`;

export const REVERSE_BAD = `def reverse(head):
    prev, cur = None, head
    while cur is not None:
        cur.next = prev
        prev, cur = cur, cur.next
    return prev`;

export function reverseSteps(bad: boolean): LinkStep[] {
  const vals = [3, 8, 5, 2];
  const b = new Board();
  b.noneAt("NL", 0);
  const ids = row(b, vals, { start: 1 });
  const out: LinkStep[] = [];
  let prev: string | null = null;
  let cur: string | null = ids[0];
  let nxt: string | null = null;
  const done = new Set<string>();
  const states = (): Record<string, Mark> => {
    const s: Record<string, Mark> = {};
    for (const id of ids) s[id] = done.has(id) ? "done" : id === cur ? "cur" : "";
    return s;
  };
  const names = (): LName[] => [
    { name: "prev", at: prev },
    { name: "cur", at: cur, kind: "mid" },
    ...(bad ? [] : [{ name: "nxt", at: nxt }]),
  ];
  out.push(
    b.snap(
      "Start with `prev` = None and `cur` at the head. The rule for every pass: `prev` is the start of the part already reversed, and `cur` is the start of the part still to do.",
      { names: names(), states: states(), line: 2 },
    ),
  );
  if (bad) {
    const c = cur!;
    b.next[c] = "NL";
    out.push(
      b.snap("`cur.next = prev` straight away. 3 now points to None. But 3's `next` was the only reference to 8. Nothing refers to 8, 5 or 2 any more.", {
        names: names(),
        states: { [c]: "cur", [ids[1]]: "bad", [ids[2]]: "bad", [ids[3]]: "bad" },
        edge: { [c]: "cur" },
        extra: [{ from: c, to: ids[1], state: "old" }],
        line: 4,
      }),
    );
    prev = c;
    cur = null;
    out.push(
      b.snap("`prev, cur = cur, cur.next`. `cur.next` is now None, so `cur` becomes None and the loop stops. The function returns a list with one node, 3.", {
        names: names(),
        states: { [c]: "done", [ids[1]]: "bad", [ids[2]]: "bad", [ids[3]]: "bad" },
        line: 6,
        verdict: { ok: false, text: "8, 5 and 2 are lost" },
      }),
    );
    return out;
  }
  for (let k = 0; k < ids.length; k++) {
    const c: string = cur!;
    const after: string | null = b.next[c];
    const nxtName: string | null = after === "nNone" ? null : after;
    nxt = nxtName;
    out.push(
      b.snap(
        nxtName
          ? `\`nxt = cur.next\`. Save a reference to ${b.label[nxtName]} before we change \`cur.next\`. Without it the rest of the list would be lost.`
          : "`nxt = cur.next`. This is the last node, so `nxt` is None.",
        { names: names(), states: states(), line: 4 },
      ),
    );
    const old = b.next[c]!;
    b.next[c] = prev ?? "NL";
    out.push(
      b.snap(`\`cur.next = prev\`. ${b.label[c]} now points back to ${prev ? b.label[prev] : "None"}. Its old link is gone, but \`nxt\` still holds the rest.`, {
        names: names(),
        states: states(),
        edge: { [c]: "cur" },
        extra: [{ from: c, to: old, state: "old" }],
        line: 5,
      }),
    );
    done.add(c);
    prev = c;
    cur = nxt;
    out.push(
      b.snap(
        cur
          ? `\`prev, cur = cur, nxt\`. Both move one node on. The reversed part is now ${[...done].reverse().map((id) => b.label[id]).join(", ")}.`
          : "`prev, cur = cur, nxt`. `cur` is None, so the loop stops.",
        { names: names(), states: states(), line: 6, hide: cur ? [] : ["nNone"] },
      ),
    );
  }
  out.push(
    b.snap("Return `prev`, the new head: 2, 5, 8, 3. Each node was visited once and only its `next` changed. O(n) time and O(1) extra space.", {
      names: [
        { name: "prev", at: prev },
        { name: "cur", at: null, kind: "mid" },
        { name: "nxt", at: null },
      ],
      states: Object.fromEntries(ids.map((id) => [id, "done" as Mark])),
      hide: ["nNone"],
      line: 7,
      verdict: { ok: true, text: "2 → 5 → 8 → 3" },
    }),
  );
  return out;
}

/* LINK-5.1: fast and slow pointers, for the middle node and for a loop */

export function middleSteps(): LinkStep[] {
  const vals = [4, 7, 1, 9, 3, 6, 2];
  const b = new Board();
  const ids = row(b, vals);
  const out: LinkStep[] = [];
  let s = 0;
  let f = 0;
  const names = (): LName[] => [
    { name: "slow", at: ids[s], kind: "mid" },
    { name: "fast", at: f < ids.length ? ids[f] : null },
  ];
  out.push(
    b.snap("Both names start at the head. Each pass, `slow` moves one node and `fast` moves two. When `fast` reaches the end, `slow` has gone half as far.", {
      names: names(),
      states: { [ids[0]]: "cur" },
    }),
  );
  while (f < ids.length - 1) {
    s += 1;
    f += 2;
    const end = f >= ids.length - 1;
    out.push(
      b.snap(
        end
          ? `\`slow\` is at ${vals[s]}, \`fast\` at ${vals[f]}. \`fast.next\` is None, so stop. \`slow\` is at the middle: 3 nodes before it and 3 after.`
          : `\`slow\` moves to ${vals[s]}, \`fast\` jumps to ${vals[f]}.`,
        { names: names(), states: { [ids[s]]: end ? "found" : "cur" } },
      ),
    );
  }
  out.push(
    b.snap("One walk, with no need to count the nodes first. With an even number of nodes, this loop stops with `slow` on the second of the two middle nodes.", {
      names: names(),
      states: { [ids[s]]: "found" },
    }),
  );
  return out;
}

export const LOOP_VALS = [5, 1, 8, 3, 7, 2, 6, 4];
export const LOOP_AT = 3;

export function loopSteps(): LinkStep[] {
  const b = new Board();
  const n = LOOP_VALS.length;
  LOOP_VALS.forEach((v, k) => b.node(`n${k}`, v, k));
  LOOP_VALS.forEach((_, k) => (b.next[`n${k}`] = `n${k + 1 < n ? k + 1 : LOOP_AT}`));
  const at = (t: number) => (t < n ? t : LOOP_AT + ((t - LOOP_AT) % (n - LOOP_AT)));
  const out: LinkStep[] = [];
  let s = 0;
  let f = 0;
  let p: number | null = null;
  const names = (): LName[] => [
    { name: "slow", at: `n${at(s)}`, kind: "mid" },
    { name: "fast", at: `n${at(f)}` },
    { name: "p", at: p === null ? null : `n${at(p)}`, kind: "blue" },
  ];
  out.push(
    b.snap("The last node points back to 3, so this list has a loop and no end. A plain walk would never stop. Start `slow` and `fast` at the head.", {
      names: names(),
      edge: { [`n${n - 1}`]: "cur" },
    }),
  );
  let t = 0;
  do {
    t++;
    s = t;
    f = 2 * t;
    const meet = at(s) === at(f);
    out.push(
      b.snap(
        meet
          ? `Pass ${t}: \`slow\` is at ${LOOP_VALS[at(s)]} and so is \`fast\`. They meet. If there were no loop, \`fast\` would have reached None instead.`
          : `Pass ${t}: \`slow\` moves to ${LOOP_VALS[at(s)]}, \`fast\` to ${LOOP_VALS[at(f)]}.${at(f) < at(s) || f >= n ? " `fast` has gone round the loop and is now behind `slow`; each pass it gains one node." : ""}`,
        { names: names(), states: { [`n${at(s)}`]: meet ? "found" : "cur" } },
      ),
    );
  } while (at(s) !== at(f));
  p = 0;
  let q = s;
  out.push(
    b.snap("Second part: put a new name `p` at the head and leave `slow` where they met. Now move both one node at a time.", {
      names: names(),
      states: { n0: "cur" },
    }),
  );
  while (at(p!) !== at(q)) {
    p = p! + 1;
    q = q + 1;
    s = q;
    const meet = at(p) === at(q);
    out.push(
      b.snap(
        meet
          ? `\`p\` and \`slow\` meet at ${LOOP_VALS[at(p)]}. That is exactly where the loop starts. Lesson 5 shows why this always works.`
          : `\`p\` moves to ${LOOP_VALS[at(p)]}, \`slow\` to ${LOOP_VALS[at(q)]}.`,
        { names: names(), states: { [`n${at(p)}`]: meet ? "found" : "cur" } },
      ),
    );
  }
  return out;
}

/* LINK-6.1: merging two sorted lists with a dummy node */

export const MERGE = `def merge(a, b):
    dummy = tail = Node(None)
    while a is not None and b is not None:
        if a.value <= b.value:
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next
    tail.next = a if a is not None else b
    return dummy.next`;

export function mergeSteps(): LinkStep[] {
  const A = [2, 5, 9];
  const B = [3, 4, 10];
  const b = new Board();
  const ai = row(b, A, { start: 1, r: 0, p: "a" });
  const bi = row(b, B, { start: 1, r: 1, p: "b" });
  b.node("d", "·", 0, 2);
  b.next.d = null;
  const out: LinkStep[] = [];
  let a = 0;
  let c = 0;
  let tail = "d";
  let k = 0;
  const names = (): LName[] => [
    { name: "a", at: a < A.length ? ai[a] : null },
    { name: "b", at: c < B.length ? bi[c] : null },
    { name: "tail", at: tail, kind: "mid" },
  ];
  out.push(
    b.snap("Two sorted lists, `a` on top and `b` below. The bottom row will hold the result. It starts with a dummy node, so the first real node is not a special case.", {
      names: names(),
      states: { d: "cur" },
      line: 2,
    }),
  );
  while (a < A.length && c < B.length) {
    const fromA = A[a] <= B[c];
    const id = fromA ? ai[a] : bi[c];
    const v = fromA ? A[a] : B[c];
    const other = fromA ? B[c] : A[a];
    b.next[tail] = id;
    k += 1;
    b.at[id] = { x: k, row: 2 };
    tail = id;
    if (fromA) a++;
    else c++;
    out.push(
      b.snap(
        `${v} ${v === other ? "is equal to" : "is smaller than"} ${other}, so ${v} goes next. \`tail.next\` refers to it, then \`tail\` and \`${fromA ? "a" : "b"}\` each move one node on.${k === 1 ? " The node keeps its old `next` for now; it is replaced when the next node is attached." : ""}`,
        { names: names(), states: { [id]: "cur" }, edge: { [Object.keys(b.next).find((x) => b.next[x] === id)!]: "cur" }, line: fromA ? 5 : 7 },
      ),
    );
  }
  const restIds = a < A.length ? ai.slice(a) : bi.slice(c);
  b.next[tail] = restIds[0];
  out.push(
    b.snap(
      `\`${a < A.length ? "b" : "a"}\` is None, so the loop stops. The rest of \`${a < A.length ? "a" : "b"}\` is already sorted and already linked, so one assignment attaches all of it.`,
      { names: names(), states: { [restIds[0]]: "cur" }, edge: { [tail]: "cur" }, line: 9 },
    ),
  );
  restIds.forEach((id) => (b.at[id] = { x: ++k, row: 2 }));
  const restNone = a < A.length ? "aNone" : "bNone";
  b.at[restNone] = { x: k + 1, row: 2 };
  out.push(
    b.snap("Return `dummy.next`: 2, 3, 4, 5, 9, 10. No new nodes were made; only `next` references changed. Each pass is O(1), so merging takes O(n + m) time.", {
      names: [
        { name: "a", at: null },
        { name: "b", at: null },
        { name: "tail", at: tail, kind: "mid" },
      ],
      hide: [a < A.length ? "bNone" : "aNone"],
      line: 10,
      verdict: { ok: true, text: "2 → 3 → 4 → 5 → 9 → 10" },
    }),
  );
  return out;
}
