// Step generators for the TREE figures. Every figure is a pure function of its step number.
// Captions use `backticks` for code. Trees are drawn with the Tree stage in binary mode.

import type { Mark, TNode, Var } from "../../_components/Stages";
import { vars, type CellState } from "../kit";

export type Verdict = { ok: boolean; text: string; info?: boolean };
type St = Mark | "hidden";

/** A small binary tree model: nodes by id, with left and right child ids. */
class BT {
  v: Record<string, number | string> = {};
  l: Record<string, string | null> = {};
  r: Record<string, string | null> = {};
  root: string | null = null;
  private n = 0;

  add(v: number | string) {
    const id = `t${this.n++}`;
    this.v[id] = v;
    this.l[id] = this.r[id] = null;
    return id;
  }

  /** insert into a search tree; returns the path of ids walked and the new id */
  insert(v: number) {
    const id = this.add(v);
    const path: string[] = [];
    if (this.root === null) {
      this.root = id;
      return { id, path };
    }
    let cur = this.root;
    for (;;) {
      path.push(cur);
      const side = v < (this.v[cur] as number) ? this.l : this.r;
      if (side[cur] === null) {
        side[cur] = id;
        return { id, path };
      }
      cur = side[cur]!;
    }
  }

  static bst(keys: number[]) {
    const t = new BT();
    keys.forEach((k) => t.insert(k));
    return t;
  }

  find(v: number | string) {
    return Object.keys(this.v).find((id) => this.v[id] === v && this.reachable(id))!;
  }

  reachable(id: string) {
    return this.ids().includes(id);
  }

  /** ids in pre-order */
  ids(from = this.root): string[] {
    if (from === null) return [];
    return [from, ...this.ids(this.l[from]), ...this.ids(this.r[from])];
  }

  inorderIds(from = this.root): string[] {
    if (from === null) return [];
    return [...this.inorderIds(this.l[from]), from, ...this.inorderIds(this.r[from])];
  }

  postIds(from = this.root): string[] {
    if (from === null) return [];
    return [...this.postIds(this.l[from]), ...this.postIds(this.r[from]), from];
  }

  levelIds(): string[] {
    const out: string[] = [];
    const q = this.root === null ? [] : [this.root];
    while (q.length) {
      const id = q.shift()!;
      out.push(id);
      if (this.l[id]) q.push(this.l[id]!);
      if (this.r[id]) q.push(this.r[id]!);
    }
    return out;
  }

  parentOf(id: string) {
    return Object.keys(this.v).find((p) => this.l[p] === id || this.r[p] === id) ?? null;
  }

  /** the tree as Tree-stage nodes; `extra` adds stub or hidden nodes under given parents */
  snap({
    states = {},
    labels = {},
    extra = [],
  }: { states?: Record<string, St>; labels?: Record<string, string>; extra?: TNode[] } = {}): TNode[] {
    const out: TNode[] = [];
    const walk = (id: string, parent?: string, side?: "L" | "R") => {
      out.push({ id, label: labels[id] ?? String(this.v[id]), parent, side, state: states[id] });
      if (this.l[id]) walk(this.l[id]!, id, "L");
      if (this.r[id]) walk(this.r[id]!, id, "R");
    };
    if (this.root !== null) walk(this.root);
    return [...out, ...extra];
  }
}

export const KEYS = [8, 3, 10, 1, 6, 14, 4, 7, 13];

export type TreeStep = {
  nodes: TNode[];
  caption: string;
  line?: number | null;
  vars?: Var[];
  readout?: string;
  verdict?: Verdict;
};

const val = (t: BT, ids: string[]) => ids.map((id) => t.v[id]).join(", ");

/* TREE-1.1: the parts of a tree, and its height by recursion */

export function wordSteps(): TreeStep[] {
  const t = BT.bst(KEYS);
  const id = (v: number) => t.find(v);
  const mark = (vs: number[], s: Mark) => Object.fromEntries(vs.map((v) => [id(v), s]));
  return [
    { nodes: t.snap(), caption: "A tree. Each box is a node, and each line is an edge joining a node to a node below it. This tree has 9 nodes and 8 edges: every node except the top one has exactly one edge going up." },
    { nodes: t.snap({ states: mark([8], "cur") }), caption: "The node at the top is the root. It is the only node with nothing above it. A tree is reached from its root, as a linked list is reached from its head." },
    {
      nodes: t.snap({ states: { ...mark([3], "cur"), ...mark([1, 6], "found") } }),
      caption: "3 is the parent of 1 and 6, and 1 and 6 are the children of 3. Nodes with the same parent, like 1 and 6, are called siblings.",
    },
    { nodes: t.snap({ states: mark([1, 4, 7, 13], "found") }), caption: "A node with no children is a leaf. This tree has four leaves: 1, 4, 7 and 13." },
    {
      nodes: t.snap({ states: mark([1, 6, 14], "cur") }),
      caption: "The depth of a node is the number of edges from the root down to it. The root has depth 0. 1, 6 and 14 have depth 2. All nodes at one depth form a level.",
    },
    {
      nodes: t.snap({ states: mark([8, 3, 6, 4], "cur") }),
      caption: "The height of the tree is the largest depth of any node: the number of edges on the longest path down from the root. Here it is 3, along 8, 3, 6, 4 (or 8, 3, 6, 7, or 8, 10, 14, 13).",
      verdict: { ok: true, text: "height 3", info: true },
    },
    {
      nodes: t.snap({ states: { ...mark([6], "cur"), ...mark([4, 7], "found") } }),
      caption: "A node together with everything below it is a subtree. The subtree of 6 holds 6, 4 and 7. A subtree is itself a tree, with 6 as its root. That is why so much tree code is recursive.",
    },
    {
      nodes: t.snap({ states: mark([10, 14], "cur") }),
      caption: "In a binary tree, every node has at most two children, called left and right. They are different places: 10 has only a right child, and 14 has only a left child.",
    },
  ];
}

export const HEIGHT_CODE = `def height(node):
    if node is None:
        return -1
    left = height(node.left)
    right = height(node.right)
    return 1 + max(left, right)`;

export function heightSteps(): TreeStep[] {
  const t = BT.bst(KEYS);
  const h: Record<string, number> = {};
  const out: TreeStep[] = [];
  const labels = () => Object.fromEntries(Object.keys(h).map((id) => [id, `${t.v[id]}: ${h[id]}`]));
  out.push({
    nodes: t.snap(),
    line: null,
    caption: "Compute the height recursively. The height of a node's subtree is 1 more than the taller of its two children's subtrees. An empty tree (None) has height −1, so a leaf gets 1 + (−1) = 0.",
  });
  for (const id of t.postIds()) {
    const hl = t.l[id] ? h[t.l[id]!] : -1;
    const hr = t.r[id] ? h[t.r[id]!] : -1;
    h[id] = 1 + Math.max(hl, hr);
    const states: Record<string, St> = {};
    for (const k of Object.keys(h)) states[k] = k === id ? "cur" : "done";
    const leaf = !t.l[id] && !t.r[id];
    out.push({
      nodes: t.snap({ states, labels: labels() }),
      line: 6,
      caption: leaf
        ? `\`height(${t.v[id]})\`: both children are None, height −1 each. So 1 + max(−1, −1) = 0.`
        : `\`height(${t.v[id]})\` = 1 + max(${hl}, ${hr}) = ${h[id]}. Both children were finished first: the work happens on the way back up.${id === t.root ? " That is the height of the whole tree." : ""}`,
      verdict: id === t.root ? { ok: true, text: `height ${h[id]}` } : undefined,
    });
  }
  out[out.length - 1].caption += " Each node is visited once: O(n).";
  return out;
}

/* TREE-2.1: the four traversals */

export type Order = "pre" | "in" | "post" | "level";

export function traversalSteps(order: Order): TreeStep[] {
  const t = BT.bst(KEYS);
  const seq = order === "pre" ? t.ids() : order === "in" ? t.inorderIds() : order === "post" ? t.postIds() : t.levelIds();
  const intro: Record<Order, string> = {
    pre: "Pre-order: visit the node, then its left subtree, then its right subtree. A node is written before anything below it.",
    in: "In-order: visit the left subtree, then the node, then the right subtree. A node is written between its two subtrees.",
    post: "Post-order: visit the left subtree, then the right subtree, then the node. A node is written after everything below it.",
    level: "Level order: visit the tree level by level, left to right. A queue holds the nodes waiting to be visited; it starts with the root.",
  };
  const out: TreeStep[] = [{ nodes: t.snap(), caption: intro[order], readout: order === "level" ? "queue: 8" : "output: (none yet)" }];
  const done: string[] = [];
  const queue = t.root ? [t.root] : [];
  seq.forEach((id, k) => {
    done.push(id);
    const states: Record<string, St> = Object.fromEntries(done.map((d) => [d, d === id ? "cur" : "done"]));
    let caption = "";
    if (order === "level") {
      queue.shift();
      const kids = [t.l[id], t.r[id]].filter(Boolean) as string[];
      queue.push(...kids);
      caption = `Take ${t.v[id]} from the front of the queue and write it.${kids.length ? ` Add its children ${val(t, kids)} to the back.` : " It has no children."}`;
    } else {
      const l = t.l[id] ? t.v[t.l[id]!] : null;
      const r = t.r[id] ? t.v[t.r[id]!] : null;
      if (order === "pre") caption = k === 0 ? `Write 8, the root, first. Then go into its left subtree.` : `Write ${t.v[id]}.${l !== null ? ` Next comes its left subtree, from ${l}.` : r !== null ? ` It has no left child, so its right subtree, from ${r}, comes next.` : " It is a leaf, so go back up to the nearest right subtree not yet visited."}`;
      if (order === "in") caption = l !== null ? `${t.v[id]}'s left subtree is finished, so write ${t.v[id]}.${r !== null ? ` Then its right subtree.` : ""}` : `${t.v[id]} has no left child, so write ${t.v[id]} now.${r !== null ? ` Then its right subtree.` : ""}`;
      if (order === "post") caption = l === null && r === null ? `${t.v[id]} is a leaf: nothing below it, so write it.` : `Everything below ${t.v[id]} is written, so write ${t.v[id]}.`;
    }
    const last = k === seq.length - 1;
    if (last) {
      if (order === "in") caption += " The output is sorted. That is no accident: this tree is a search tree (lesson 4).";
      if (order === "post") caption += " The root comes last. Post-order suits work that needs the children's answers first, like the height in lesson 1.";
      if (order === "pre") caption += " The root comes first. Pre-order suits copying a tree or writing it out (lesson 7).";
      if (order === "level") caption += " The queue is empty, so the walk is over.";
    }
    out.push({
      nodes: t.snap({ states }),
      caption,
      readout: order === "level" ? `queue: ${queue.length ? val(t, queue) : "empty"}  ·  output: ${val(t, done)}` : `output: ${val(t, done)}`,
      verdict: last ? { ok: true, text: `${seq.length} nodes, each visited once` } : undefined,
    });
  });
  return out;
}

/* TREE-3.1: rebuilding a tree from pre-order and in-order */

export type RebuildStep = TreeStep & { pre: CellState[]; ins: CellState[]; next: number | null; lo: number; hi: number; showWin: boolean };

export const RB_PRE = [8, 3, 1, 6, 4, 7, 10, 14, 13];
export const RB_IN = [1, 3, 4, 6, 7, 8, 10, 13, 14];

export function rebuildSteps(): RebuildStep[] {
  const t = BT.bst(KEYS);
  const all = t.ids();
  const made = new Set<string>();
  const out: RebuildStep[] = [];
  const n = RB_PRE.length;
  const snap = (cur: string | null) =>
    t.snap({ states: Object.fromEntries(all.map((id) => [id, made.has(id) ? (id === cur ? "cur" : "done") : "hidden"])) });
  out.push({
    nodes: snap(null),
    pre: Array(n).fill(""),
    ins: Array(n).fill(""),
    next: 0,
    lo: 0,
    hi: n - 1,
    showWin: true,
    caption: "Two lists of the same tree: pre-order (root first) and in-order (root in the middle of its subtrees). The tree itself is unknown. The window marks the in-order range of the subtree being built: at first, all of it.",
  });
  let nxt = 0;
  const make = (lo: number, hi: number, under: string) => {
    if (lo > hi) return;
    const v = RB_PRE[nxt];
    const id = t.find(v);
    const at = RB_IN.indexOf(v);
    made.add(id);
    const pre = RB_PRE.map((_, k) => (k < nxt ? "out" : k === nxt ? "mid" : "")) as CellState[];
    const ins = RB_IN.map((_, k) => (k === at ? "found" : k < lo || k > hi ? "out" : "")) as CellState[];
    const left = at - lo;
    const right = hi - at;
    out.push({
      nodes: snap(id),
      pre,
      ins,
      next: nxt,
      lo,
      hi,
      showWin: true,
      caption:
        nxt === 0
          ? `The first pre-order value, 8, is the root. In the in-order list, 8 is at place ${at}: the ${left} values left of it form the left subtree, the ${right} values right of it the right subtree.`
          : `${under} The next pre-order value, ${v}, is its root. In in-order, ${v} splits the window: ${left === 0 ? "nothing on its left" : `${left} on its left`}, ${right === 0 ? "nothing on its right" : `${right} on its right`}.${left === 0 && right === 0 ? ` So ${v} is a leaf.` : ""}`,
    });
    nxt++;
    const span = (a: number, b: number) => (a === b ? `in-order place ${a} only` : `in-order places ${a} to ${b}`);
    make(lo, at - 1, `Build ${v}'s left subtree, which covers ${span(lo, at - 1)}.`);
    make(at + 1, hi, `Build ${v}'s right subtree, which covers ${span(at + 1, hi)}.`);
  };
  make(0, n - 1, "");
  out.push({
    nodes: snap(null),
    pre: Array(n).fill("out"),
    ins: Array(n).fill(""),
    next: null,
    lo: 0,
    hi: n - 1,
    showWin: false,
    caption: "Every pre-order value has been used once, and the tree is complete. Finding each root in the in-order list with a dict makes the whole rebuild O(n).",
    verdict: { ok: true, text: "tree rebuilt" },
  });
  return out;
}

/* TREE-4.1: search and insert in a binary search tree */

export type BstVariant = "search" | "insert" | "sorted";

export function bstSteps(v: BstVariant): TreeStep[] {
  const out: TreeStep[] = [];
  if (v === "sorted") {
    const t = new BT();
    const keys = [1, 2, 3, 4, 5, 6];
    const ids = keys.map((k) => t.add(k));
    // build the final shape first (each key the right child of the one before), then reveal it
    t.root = ids[0];
    ids.forEach((id, k) => (t.r[id] = ids[k + 1] ?? null));
    out.push({
      nodes: t.snap({ states: Object.fromEntries(ids.map((id) => [id, "hidden"])) }),
      caption: "Insert the keys 1, 2, 3, 4, 5, 6 into an empty search tree, in that order.",
    });
    ids.forEach((id, k) => {
      out.push({
        nodes: t.snap({ states: Object.fromEntries(ids.map((x, j) => [x, j > k ? "hidden" : j === k ? "cur" : "done"])) }),
        caption:
          k === 0
            ? "1 becomes the root."
            : `${keys[k]} is bigger than every key so far, so it goes right at every node, ${k} ${k === 1 ? "step" : "steps"}, and ends up at the bottom.`,
        verdict: k === ids.length - 1 ? { ok: false, text: "height 5 for 6 keys" } : undefined,
      });
    });
    out[out.length - 1].caption += " The tree is a path, and it behaves exactly like a linked list. Search now costs O(n). Keeping trees short is the job of the BALT station.";
    return out;
  }
  const t = BT.bst(KEYS);
  const id = (k: number) => t.find(k);
  if (v === "search") {
    const target = 7;
    const ruled = new Set<string>();
    out.push({ nodes: t.snap(), caption: "Search for 7. In a search tree, every key in a node's left subtree is smaller than the node's key, and every key in its right subtree is bigger." });
    let cur: string | null = t.root;
    let steps = 0;
    while (cur) {
      steps++;
      const k = t.v[cur] as number;
      const states: Record<string, St> = Object.fromEntries([...ruled].map((r) => [r, "out"]));
      if (k === target) {
        states[cur] = "found";
        out.push({ nodes: t.snap({ states }), caption: `7 == 7: found, after ${steps} comparisons. A search follows one path from the root, so it costs O(h), where h is the height.`, readout: `comparisons: ${steps}`, verdict: { ok: true, text: "found 7" } });
        break;
      }
      states[cur] = "cur";
      const goLeft = target < k;
      const skip = goLeft ? t.r[cur] : t.l[cur];
      if (skip) t.ids(skip).forEach((x) => ruled.add(x));
      for (const r of ruled) states[r] = "out";
      out.push({
        nodes: t.snap({ states }),
        readout: `comparisons: ${steps}`,
        caption: `7 ${goLeft ? "<" : ">"} ${k}, so 7 can only be in ${k}'s ${goLeft ? "left" : "right"} subtree.${skip ? ` The whole ${goLeft ? "right" : "left"} subtree is ruled out, as in binary search.` : ""}`,
      });
      cur = goLeft ? t.l[cur] : t.r[cur];
    }
    return out;
  }
  // insert 5: compute where it will go, keep it hidden until it is attached
  const path = [8, 3, 6, 4].map(id);
  const { id: nid } = t.insert(5);
  out.push({ nodes: t.snap({ states: { [nid]: "hidden" } }), caption: "Insert 5. An insert is a search for 5 that is sure to fail. Where the search falls off the tree, the new node goes." });
  path.forEach((p, k) => {
    const key = t.v[p] as number;
    const left = 5 < key;
    const states: Record<string, St> = { [nid]: "hidden" };
    path.slice(0, k).forEach((q) => (states[q] = "done"));
    states[p] = "cur";
    const nextNone = k === path.length - 1;
    out.push({
      nodes: t.snap({ states }),
      caption: `5 ${left ? "<" : ">"} ${key}: go ${left ? "left" : "right"}.${nextNone ? ` ${key} has no ${left ? "left" : "right"} child: this is the place.` : ""}`,
    });
  });
  const states: Record<string, St> = { [nid]: "found" };
  path.forEach((q) => (states[q] = "done"));
  out.push({ nodes: t.snap({ states }), caption: "5 becomes the right child of 4. Nothing else moves. An in-order walk still gives the keys in sorted order: 1, 3, 4, 5, 6, 7, 8, 10, 13, 14.", verdict: { ok: true, text: "inserted 5" } });
  return out;
}

/* TREE-5.1: deleting from a search tree */

export type DelVariant = "leaf" | "one" | "two";

export function deleteSteps(v: DelVariant): TreeStep[] {
  const t = BT.bst(KEYS);
  const id = (k: number) => t.find(k);
  const out: TreeStep[] = [];
  const key = v === "leaf" ? 4 : v === "one" ? 10 : 3;
  const path: string[] = [];
  let cur: string | null = t.root;
  while (cur && t.v[cur] !== key) {
    path.push(cur);
    cur = key < (t.v[cur] as number) ? t.l[cur] : t.r[cur];
  }
  const target = cur!;
  out.push({ nodes: t.snap(), caption: `Delete ${key}. First search for it, remembering the parent of each node on the way: removing a node means changing a link in its parent.` });
  const pathStates = Object.fromEntries(path.map((p) => [p, "done" as St]));
  out.push({ nodes: t.snap({ states: { ...pathStates, [target]: "cur" } }), caption: `Found ${key}, below ${t.v[path[path.length - 1]]}. ${v === "leaf" ? "It has no children." : v === "one" ? "It has one child, 14." : "It has two children, 1 and 6. This is the hard case."}` });
  const parent = path[path.length - 1];
  if (v === "leaf") {
    out.push({ nodes: t.snap({ states: { ...pathStates, [target]: "out" } }), caption: "A leaf can simply go: set its parent's link to None. Here that is `6.left = None`." });
    t.l[parent] = null;
    out.push({ nodes: t.snap({ states: { [parent]: "cur" } }), caption: "Done. 6 now has only a right child.", verdict: { ok: true, text: "deleted 4" } });
    return out;
  }
  if (v === "one") {
    const child = t.r[target]!;
    out.push({ nodes: t.snap({ states: { ...pathStates, [target]: "out", [child]: "cur" } }), caption: "With one child, the child takes the node's place: link the parent straight to the child. Here that is `8.right = 14`." });
    t.r[parent] = child;
    out.push({ nodes: t.snap({ states: { [child]: "cur", [id(13)]: "done" } }), caption: "Done. 14 and everything below it moved up one level. Every key in it was bigger than 8 before, and still is, so the tree is still a search tree.", verdict: { ok: true, text: "deleted 10" } });
    return out;
  }
  // two children: successor
  const s1 = t.r[target]!;
  const succ = t.l[s1]!;
  out.push({ nodes: t.snap({ states: { [target]: "cur", [s1]: "done" } }), caption: "Find the successor of 3: the next bigger key, which is the smallest key in its right subtree. Go right once, to 6 …" });
  out.push({ nodes: t.snap({ states: { [target]: "cur", [s1]: "done", [succ]: "found" } }), caption: "… then left as far as possible: 4. It is bigger than everything in 3's left subtree and smaller than everything else in its right subtree, so it can take 3's place." });
  out.push({ nodes: t.snap({ states: { [target]: "cur", [succ]: "out" }, labels: { [target]: "4" } }), caption: "Copy 4 into 3's node. Now 4 appears twice; remove the old copy. The successor has no left child (otherwise that child would be smaller), so this is the easy case." });
  t.v[target] = 4;
  t.l[s1] = t.r[succ];
  out.push({ nodes: t.snap({ states: { [target]: "cur" } }), caption: "Done. The old 4 was a leaf, so `6.left = None`. In-order is still sorted: 1, 4, 6, 7, 8, 10, 13, 14. Every delete walks down the tree once at most: O(h).", verdict: { ok: true, text: "deleted 3" } });
  return out;
}

/* TREE-6.1: lowest common ancestor */

export function lcaBstSteps(): TreeStep[] {
  const t = BT.bst(KEYS);
  const id = (k: number) => t.find(k);
  const out: TreeStep[] = [];
  const pq = { [id(4)]: "found", [id(7)]: "found" } as Record<string, St>;
  out.push({ nodes: t.snap({ states: pq }), caption: "Find the lowest common ancestor of 4 and 7: the deepest node that has both in its subtree. Here the tree is a search tree, so values tell us which way to go." });
  const ruled = new Set<string>();
  const states = () => ({ ...Object.fromEntries([...ruled].map((r) => [r, "out" as St])), ...pq });
  ruled.clear();
  t.ids(t.r[t.root!]).forEach((x) => ruled.add(x));
  out.push({ nodes: t.snap({ states: { ...states(), [t.root!]: "cur" } }), caption: "At 8: both 4 and 7 are smaller, so both are in the left subtree. Go left. The right subtree is ruled out." });
  t.ids(t.l[id(3)]).forEach((x) => ruled.add(x));
  out.push({ nodes: t.snap({ states: { ...states(), [id(8)]: "done", [id(3)]: "cur" } }), caption: "At 3: both are bigger. Go right." });
  out.push({
    nodes: t.snap({ states: { ...states(), [id(8)]: "done", [id(3)]: "done", [id(6)]: "found" } }),
    caption: "At 6: 4 < 6 < 7. The two values are on different sides, so their paths split here: 6 is the answer. One path from the root: O(h).",
    verdict: { ok: true, text: "lca(4, 7) = 6" },
  });
  return out;
}

export const LCA_TREE = [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4];

export function lcaAnySteps(): TreeStep[] {
  const t = new BT();
  // build from the level-order list
  const ids = LCA_TREE.map((v) => (v === null ? null : t.add(v)));
  t.root = ids[0];
  let k = 1;
  for (const id of ids) {
    if (id === null) continue;
    if (k < ids.length) t.l[id] = ids[k++];
    if (k < ids.length) t.r[id] = ids[k++];
  }
  const p = 7;
  const q = 4;
  const out: TreeStep[] = [];
  const st: Record<string, St> = {};
  out.push({
    nodes: t.snap({ states: { [t.find(p)]: "todo", [t.find(q)]: "todo" } }),
    caption: `Now any binary tree: the values are not sorted. Find the lowest common ancestor of ${p} and ${q}. Each call \`find(node)\` reports what it found below: None, ${p} or ${q}, or the answer.`,
  });
  let answer: string | null = null;
  const find = (id: string | null): string | null => {
    if (id === null) return null;
    const v = t.v[id];
    if (v === p || v === q) {
      st[id] = "found";
      out.push({ nodes: t.snap({ states: { ...st } }), caption: `\`find(${v})\`: ${v} is one of the two values, so it returns ${v} at once. It does not look below.`, readout: `find(${v}) returns ${v}` });
      return id;
    }
    const a = find(t.l[id]);
    const b = find(t.r[id]);
    let caption: string;
    let ret: string | null;
    if (a && b) {
      ret = id;
      answer = id;
      st[id] = "found";
      caption = `\`find(${v})\`: the left side returned ${t.v[a]} and the right side returned ${t.v[b]}. The two values are on different sides of ${v}, so ${v} is the answer. It returns ${v}.`;
    } else if (a || b) {
      ret = a ?? b;
      st[id] = "done";
      caption = `\`find(${v})\`: only one side found something (${t.v[ret!]}), so ${v} passes it up.`;
    } else {
      ret = null;
      st[id] = "out";
      caption = `\`find(${v})\`: neither side found anything, so it returns None.`;
    }
    out.push({ nodes: t.snap({ states: { ...st } }), caption, readout: `find(${v}) returns ${ret ? t.v[ret] : "None"}` });
    return ret;
  };
  find(t.root);
  const last = out[out.length - 1];
  last.caption += ` The root returns ${t.v[answer!]}: that is the answer. Every node was visited at most once: O(n).`;
  last.verdict = { ok: true, text: `lca(${p}, ${q}) = ${t.v[answer!]}` };
  return out;
}

/* TREE-7.1: writing a tree as text and reading it back */

export type SerStep = TreeStep & { tokens: string[]; at: number | null; tstates: CellState[] };

function serTree() {
  const t = new BT();
  const a = t.add(1);
  const b = t.add(2);
  const c = t.add(3);
  const d = t.add(4);
  const e = t.add(5);
  t.root = a;
  t.l[a] = b;
  t.r[a] = c;
  t.l[c] = d;
  t.r[c] = e;
  return t;
}

/** pre-order tokens with '#' for every missing child, with the node (or stub) each token stands for */
function serTokens(t: BT) {
  const out: { tok: string; id: string; stub?: { parent: string; side: "L" | "R" } }[] = [];
  const walk = (id: string) => {
    out.push({ tok: String(t.v[id]), id });
    for (const side of ["L", "R"] as const) {
      const c = side === "L" ? t.l[id] : t.r[id];
      if (c) walk(c);
      else out.push({ tok: "#", id: `${id}${side}`, stub: { parent: id, side } });
    }
  };
  walk(t.root!);
  return out;
}

export const SER_TOKENS = serTokens(serTree()).map((x) => x.tok);

export function serSteps(read: boolean): SerStep[] {
  const t = serTree();
  const toks = serTokens(t);
  const out: SerStep[] = [];
  const shown = new Set<string>();
  const snap = (cur: string | null): TNode[] => {
    const stubs: TNode[] = toks
      .filter((x) => x.stub)
      .map((x) => ({ id: x.id, label: "#", parent: x.stub!.parent, side: x.stub!.side, state: (read ? (shown.has(x.id) ? (x.id === cur ? "cur" : "todo") : "hidden") : x.id === cur ? "cur" : shown.has(x.id) ? "done" : "todo") as St }));
    const states: Record<string, St> = {};
    for (const x of toks)
      if (!x.stub) states[x.id] = read ? (shown.has(x.id) ? (x.id === cur ? "cur" : "done") : "hidden") : x.id === cur ? "cur" : shown.has(x.id) ? "done" : "";
    return t.snap({ states, extra: stubs });
  };
  const all = toks.map((x) => x.tok);
  if (!read) {
    out.push({
      nodes: snap(null),
      tokens: [],
      at: null,
      tstates: [],
      caption: "Write the tree in pre-order. The dashed # boxes mark the places where a child is missing. Each one is written too: without them, the reader could not tell where a subtree ends.",
    });
    toks.forEach((x, k) => {
      shown.add(x.id);
      out.push({
        nodes: snap(x.id),
        tokens: all.slice(0, k + 1),
        at: k,
        tstates: all.slice(0, k + 1).map((_, j) => (j === k ? "mid" : "")),
        caption: x.stub
          ? `${t.v[x.stub.parent]} has no ${x.stub.side === "L" ? "left" : "right"} child: write #.`
          : `Write ${x.tok}, then its left subtree, then its right subtree.`,
        readout: `text: '${all.slice(0, k + 1).join(" ")}'`,
        verdict: k === toks.length - 1 ? { ok: true, text: `${toks.length} tokens: 5 values, 6 markers` } : undefined,
      });
    });
    out[out.length - 1].caption += " A tree with n nodes always has n + 1 missing children, so the text has 2n + 1 tokens.";
    return out;
  }
  out.push({
    nodes: snap(null),
    tokens: all,
    at: 0,
    tstates: all.map(() => ""),
    caption: "Read it back. Split the text into tokens and read them in order with the same rule: a value makes a node, then read its left subtree, then its right subtree. A # means None.",
  });
  toks.forEach((x, k) => {
    shown.add(x.id);
    out.push({
      nodes: snap(x.id),
      tokens: all,
      at: k,
      tstates: all.map((_, j) => (j < k ? "out" : j === k ? "mid" : "")),
      caption: x.stub
        ? `This # says that ${t.v[x.stub.parent]} has no ${x.stub.side === "L" ? "left" : "right"} child.${x.stub.side === "R" ? ` So the subtree of ${t.v[x.stub.parent]} is finished.` : ""}`
        : `The token ${x.tok} is a value, so make a node for it${k === 0 ? ": the root" : ""}. Next, read its left subtree.`,
      verdict: k === toks.length - 1 ? { ok: true, text: "the same tree" } : undefined,
    });
  });
  out[out.length - 1].caption += " Every token was used exactly once, and the tree is back.";
  return out;
}
