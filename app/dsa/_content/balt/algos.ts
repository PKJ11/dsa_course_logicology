// Step generators for the BALT figures. Every figure is a pure function of its step number.
// Captions use `backticks` for code. Binary trees use the Tree stage in binary mode with `slide`, so a
// rotation moves nodes instead of redrawing them; ids stay with their keys.

import type { Mark, SkipEdge, TNode } from "../../_components/Stages";
import type { CellState } from "../kit";

export type Verdict = { ok: boolean; text: string; info?: boolean };
type St = Mark | "hidden";
type Tag = { tag: string; kind?: "ink" | "plain" | "bad" };

const MINUS = "−";
const signed = (k: number) => (k > 0 ? `+${k}` : k < 0 ? `${MINUS}${-k}` : "0");

/** A small binary search tree model: nodes by id (one id per key), left and right child ids, an optional colour. */
class BT {
  l: Record<string, string | null> = {};
  r: Record<string, string | null> = {};
  v: Record<string, number> = {};
  red: Record<string, boolean> = {};
  root: string | null = null;

  static id = (k: number) => `k${k}`;

  insert(k: number) {
    const id = BT.id(k);
    this.v[id] = k;
    this.l[id] = this.r[id] = null;
    this.red[id] = true;
    const path: string[] = [];
    if (this.root === null) {
      this.root = id;
      return path;
    }
    let cur = this.root;
    for (;;) {
      path.push(cur);
      const side = k < this.v[cur] ? this.l : this.r;
      if (side[cur] === null) {
        side[cur] = id;
        return path;
      }
      cur = side[cur]!;
    }
  }

  static of(keys: number[]) {
    const t = new BT();
    keys.forEach((k) => t.insert(k));
    return t;
  }

  clone() {
    const t = new BT();
    t.l = { ...this.l };
    t.r = { ...this.r };
    t.v = { ...this.v };
    t.red = { ...this.red };
    t.root = this.root;
    return t;
  }

  parent(id: string) {
    return Object.keys(this.v).find((p) => this.l[p] === id || this.r[p] === id) ?? null;
  }

  h(id: string | null): number {
    return id === null ? -1 : 1 + Math.max(this.h(this.l[id]), this.h(this.r[id]));
  }

  bf(id: string) {
    return this.h(this.l[id]) - this.h(this.r[id]);
  }

  ids(from = this.root): string[] {
    if (from === null) return [];
    return [from, ...this.ids(this.l[from]), ...this.ids(this.r[from])];
  }

  /** rotate at id; the child on the other side comes up. Fixes the parent's link (or the root). Returns the new top. */
  rotate(id: string, dir: "left" | "right") {
    const p = this.parent(id);
    const up = dir === "left" ? this.r[id]! : this.l[id]!;
    if (dir === "left") {
      this.r[id] = this.l[up];
      this.l[up] = id;
    } else {
      this.l[id] = this.r[up];
      this.r[up] = id;
    }
    if (p === null) this.root = up;
    else if (this.l[p] === id) this.l[p] = up;
    else this.r[p] = up;
    return up;
  }

  /** Tree-stage nodes. Keys in `later` are drawn hidden in their final places. */
  snap({ states = {}, tags = {}, later }: { states?: Record<string, St>; tags?: Record<string, Tag>; later?: BT } = {}): TNode[] {
    const out: TNode[] = [];
    const src = later ?? this;
    const walk = (id: string, parent?: string, side?: "L" | "R") => {
      const here = this.v[id] !== undefined && (id === this.root || this.parent(id) !== null);
      const tg = tags[id];
      out.push({ id, label: String(src.v[id]), parent, side, state: here ? states[id] : "hidden", tag: tg?.tag, tagKind: tg?.kind });
      if (src.l[id]) walk(src.l[id]!, id, "L");
      if (src.r[id]) walk(src.r[id]!, id, "R");
    };
    if (src.root !== null) walk(src.root);
    return out;
  }
}

const by = (ks: number[], s: St) => Object.fromEntries(ks.map((k) => [BT.id(k), s]));

export type TreeStep = {
  nodes: TNode[];
  caption: string;
  readout?: string;
  verdict?: Verdict;
  line?: number | null;
  /** the in-order list under the tree */
  arr?: { values: number[]; states: CellState[]; lo?: number; hi?: number; mid?: number };
};

/* BALT-1.1: the same keys, two shapes */

export function shapeSteps(v: "sorted" | "middle"): TreeStep[] {
  const steps: TreeStep[] = [];
  if (v === "sorted") {
    const all = BT.of([1, 2, 3, 4, 5, 6, 7]);
    for (let k = 1; k <= 7; k++) {
      const t = BT.of(Array.from({ length: k }, (_, i) => i + 1));
      const caption =
        k === 1
          ? "Insert the keys 1 to 7, in increasing order, into a plain search tree (TREE-4). The first key, 1, becomes the root."
          : `${k} is bigger than every key already in the tree, so it goes right at every node. Placing it takes ${k - 1} comparison${k > 2 ? "s" : ""}.`;
      steps.push({ nodes: t.snap({ states: by([k], "cur"), later: all }), caption, readout: `height ${k - 1}` });
    }
    steps.push({
      nodes: all.snap({ states: by([7], "cur") }),
      caption:
        "The result is a path: height 6 for 7 keys. A search for 7 checks every node, just as a list would. With n keys in sorted order, the height is n − 1, so search and insert cost O(n).",
      readout: "height 6",
      verdict: { ok: false, info: true, text: "as slow as a list" },
    });
    return steps;
  }
  // build from the middle of a sorted list
  const order = [4, 2, 1, 3, 6, 5, 7];
  const ranges: [number, number][] = [
    [0, 6],
    [0, 2],
    [0, 0],
    [2, 2],
    [4, 6],
    [4, 4],
    [6, 6],
  ];
  const all = BT.of(order);
  const vals = [1, 2, 3, 4, 5, 6, 7];
  const why = [
    "The same seven keys, sorted, in a list. Take the middle one, 4, as the root. The three smaller keys will go in its left subtree and the three bigger ones in its right subtree.",
    "Do the same for the left half, 1 to 3: its middle key, 2, becomes the left child of 4.",
    "The half below 2 holds only 1. One key is its own middle, so 1 becomes the left child of 2.",
    "The half above 2 holds only 3: it becomes the right child of 2.",
    "Now the right half of the list, 5 to 7. Its middle, 6, becomes the right child of 4.",
    "5 becomes the left child of 6.",
    "7 becomes the right child of 6.",
  ];
  order.forEach((k, i) => {
    const t = BT.of(order.slice(0, i + 1));
    const [lo, hi] = ranges[i];
    steps.push({
      nodes: t.snap({ states: by([k], "cur"), later: all }),
      caption: why[i],
      readout: `middle of positions ${lo} to ${hi} is ${k}`,
      arr: { values: vals, states: vals.map((x) => (x === k ? "mid" : "")), lo, hi, mid: vals.indexOf(k) },
    });
  });
  steps.push({
    nodes: all.snap({ states: by([1, 3, 5, 7], "found") }),
    caption:
      "Height 2, the smallest possible for 7 keys: every key is at most two steps below the root. Choosing the middle each time gives a height of about log₂ n, the number of times you can halve n.",
    readout: "height 2",
    verdict: { ok: true, text: "perfectly balanced" },
    arr: { values: vals, states: vals.map(() => "found") },
  });
  return steps;
}

/* BALT-2.1: rotations */

export const ROT_RIGHT = `def rotate_right(y):
    x = y.left           # x will come up
    y.left = x.right     # x's right subtree moves across
    x.right = y          # y goes down to the right
    return x             # the new top of this part`;

export const ROT_LEFT = `def rotate_left(y):
    x = y.right          # x will come up
    y.right = x.left     # x's left subtree moves across
    x.left = y           # y goes down to the left
    return x             # the new top of this part`;

export const ROT_DOUBLE = `def rotate_left_right(z):
    z.left = rotate_left(z.left)    # first lift the middle key
    return rotate_right(z)          # then lift it again, to the top`;

export type RotVariant = "right" | "left" | "double";

const nameTags = (pairs: [number, string][]): Record<string, Tag> => Object.fromEntries(pairs.map(([k, t]) => [BT.id(k), { tag: t, kind: "plain" }]));

export function rotSteps(v: RotVariant): TreeStep[] {
  const steps: TreeStep[] = [];
  const io = (t: BT, st: CellState = ""): TreeStep["arr"] => {
    const vals = Object.values(t.v).sort((a, b) => a - b);
    return { values: vals, states: vals.map(() => st) };
  };
  const hs = (t: BT, id: string) => `left side ${t.h(t.l[id]) + 1} levels, right side ${t.h(t.r[id]) + 1} levels`;
  if (v === "right" || v === "left") {
    const R = v === "right";
    const t = BT.of(R ? [6, 4, 7, 2, 5, 1] : [2, 1, 4, 3, 6, 7]);
    const y = R ? 6 : 2;
    const x = 4;
    const mid = R ? 5 : 3;
    const tags = nameTags([
      [y, "y"],
      [x, "x"],
    ]);
    steps.push({
      nodes: t.snap(),
      caption: R
        ? "A search tree that leans left: under 6, the left side is three levels deep and the right side only one. A right rotation at 6 will lift its left child, 4, by one level."
        : "A search tree that leans right: under 2, the right side is three levels deep and the left side only one. A left rotation at 2 will lift its right child, 4, by one level.",
      readout: `at ${y}: ${hs(t, BT.id(y))}`,
      line: 1,
      arr: io(t),
    });
    steps.push({
      nodes: t.snap({ states: by([y], "cur"), tags }),
      caption: `Call the node we rotate at \`y\` (here ${y}) and the child that comes up \`x\` (here ${x}). The small tags name them.`,
      line: 2,
      arr: io(t),
    });
    steps.push({
      nodes: t.snap({ states: by([y], "cur"), tags: { ...tags, ...nameTags([[mid, "moves"]]) } }),
      caption: R
        ? `5 is the right subtree of x. It is bigger than 4 and smaller than 6, so it can hang below either of them (tagged \`moves\`). It becomes the left child of 6.`
        : `3 is the left subtree of x. It is bigger than 2 and smaller than 4, so it can hang below either of them (tagged \`moves\`). It becomes the right child of 2.`,
      line: 3,
      arr: io(t),
    });
    t.rotate(BT.id(y), R ? "right" : "left");
    steps.push({
      nodes: t.snap({ states: by([x], "cur"), tags: { ...tags, ...nameTags([[mid, "moves"]]) } }),
      caption: R
        ? "6 becomes the right child of 4, and 4 is on top. 2 and 1 came up one level with 4, 7 went down one level with 6, and 5 stayed at the same depth. Both sides are now 2 levels deep."
        : "2 becomes the left child of 4, and 4 is on top. 6 and 7 came up one level with 4, 1 went down one level with 2, and 3 stayed at the same depth. Both sides are now 2 levels deep.",
      line: 4,
      readout: `at ${x}: ${hs(t, BT.id(x))}`,
      arr: io(t),
    });
    steps.push({
      nodes: t.snap({ states: by([x], "cur"), tags }),
      caption: `Return x, the new top. The code that called the rotation links x where y used to be: here x becomes the root. Three links changed, and the work is the same whatever the size of the tree: O(1).`,
      line: 5,
      arr: io(t),
    });
    steps.push({
      nodes: t.snap({ states: by(Object.values(t.v), "found") }),
      caption: `Read the tree in order: ${Object.values(t.v).sort((a, b) => a - b).join(", ")}, the same list as before. A rotation changes the shape and never the order, so the tree is still a search tree.`,
      line: null,
      readout: "the in-order list did not change",
      verdict: { ok: true, text: "still a search tree" },
      arr: io(t, "found"),
    });
    return steps;
  }
  // double rotation: left at 2, then right at 6
  const t = BT.of([6, 2, 7, 1, 4, 3, 5]);
  steps.push({
    nodes: t.snap({ states: by([4], "found") }),
    caption:
      "Here the tall part is in the middle: 4 is the right child of 2, which is the left child of 6. A right rotation at 6 would lift 2, but 4 would move across with its subtree and the tree would lean right instead.",
    readout: `at 6: ${hs(t, BT.id(6))}`,
    line: 1,
    arr: io(t),
  });
  steps.push({
    nodes: t.snap({ states: { ...by([2], "cur"), ...by([4], "found") } }),
    caption: "So first rotate left at 2. This lifts 4 above 2, and the tall part moves to the outside of the tree.",
    line: 2,
    arr: io(t),
  });
  t.rotate(BT.id(2), "left");
  steps.push({
    nodes: t.snap({ states: { ...by([4], "found"), ...by([3], "cur") } }),
    caption: "After the first rotation, 4 is the left child of 6 and 2 is below 4. 3 moved across: it is now the right child of 2.",
    line: 2,
    arr: io(t),
  });
  steps.push({
    nodes: t.snap({ states: { ...by([6], "cur"), ...by([4], "found") } }),
    caption: "Now the tree leans left on the outside, which one right rotation fixes. Rotate right at 6.",
    line: 3,
    arr: io(t),
  });
  t.rotate(BT.id(6), "right");
  steps.push({
    nodes: t.snap({ states: { ...by([4], "found"), ...by([5], "cur") } }),
    caption: "4 is now on top, with 2 and 6 as its children. 5 moved across to become the left child of 6. Two rotations, six links, still O(1).",
    line: 3,
    readout: `at 4: ${hs(t, BT.id(4))}`,
    arr: io(t),
  });
  steps.push({
    nodes: t.snap({ states: by([1, 2, 3, 4, 5, 6, 7], "found") }),
    caption: "In order: 1, 2, 3, 4, 5, 6, 7, the same as at the start. The middle key ended on top, which is why this is called a double rotation.",
    line: null,
    verdict: { ok: true, text: "still a search tree" },
    arr: io(t, "found"),
  });
  return steps;
}

/* BALT-3.1: AVL insert, with balance tags */

const bfTags = (t: BT): Record<string, Tag> =>
  Object.fromEntries(
    t.ids().map((id) => {
      const b = t.bf(id);
      return [id, { tag: signed(b), kind: Math.abs(b) > 1 ? ("bad" as const) : ("plain" as const) }];
    }),
  );

export type AvlVariant = "sorted" | "double";

export function avlSteps(v: AvlVariant): TreeStep[] {
  const keys = v === "sorted" ? [1, 2, 3, 4, 5, 6, 7] : [50, 20, 80, 10, 30, 25];
  const t = new BT();
  const steps: TreeStep[] = [];
  const intro =
    v === "sorted"
      ? "Insert 1 to 7 in increasing order into an AVL tree. The tag on each node is its balance: the height of its left subtree minus the height of its right subtree. The AVL rule allows −1, 0 and +1. "
      : "Insert 50, 20, 80, 10, 30 and then 25. The tag on each node is its balance: left height minus right height. Watch what happens when the last key goes in. ";
  for (const k of keys) {
    const path = t.insert(k);
    const id = BT.id(k);
    // the lowest node on the path that broke the rule
    const z = [...path].reverse().find((p) => Math.abs(t.bf(p)) > 1);
    steps.push({
      nodes: t.snap({ states: by([k], "cur"), tags: bfTags(t) }),
      caption: (k === keys[0] ? intro : "") + (path.length
        ? `Insert ${k} as a new leaf, as in a plain search tree. Then walk back up the path and work out each balance again.${z ? "" : " Every balance is still −1, 0 or +1, so nothing more to do."}`
        : `${k} becomes the root. A single node has balance 0.`),
      readout: `height ${t.h(t.root)}`,
    });
    if (!z) continue;
    const zb = t.bf(z);
    const zk = t.v[z];
    const child = zb > 0 ? t.l[z]! : t.r[z]!;
    const cb = t.bf(child);
    const ck = t.v[child];
    const outer = zb > 0 ? cb >= 0 : cb <= 0;
    const side = zb > 0 ? "left" : "right";
    steps.push({
      nodes: t.snap({ states: { ...by([zk], "bad"), ...by([k], "cur") }, tags: bfTags(t) }),
      caption: `${zk} has balance ${signed(zb)}: its ${side} side is two levels taller than the other. That breaks the AVL rule. The new key went ${side} at ${zk}, then ${
        (zb > 0 ? cb >= 0 : cb > 0) ? "left" : "right"
      } at ${ck}: ${outer ? "on the outside, so one rotation fixes it" : "on the inside, so it takes a double rotation"}.`,
      verdict: { ok: false, text: `balance ${signed(zb)} at ${zk}` },
    });
    if (!outer) {
      t.rotate(child, zb > 0 ? "left" : "right");
      const m = t.v[zb > 0 ? t.l[z]! : t.r[z]!];
      steps.push({
        nodes: t.snap({ states: { ...by([zk], "bad"), ...by([m], "cur") }, tags: bfTags(t) }),
        caption: `First rotate ${zb > 0 ? "left" : "right"} at ${ck}. This lifts ${m} and moves the tall part to the outside.`,
      });
    }
    const top = t.rotate(z, zb > 0 ? "right" : "left");
    steps.push({
      nodes: t.snap({ states: by([t.v[top]], "found"), tags: bfTags(t) }),
      caption: `Rotate ${zb > 0 ? "right" : "left"} at ${zk}. ${t.v[top]} comes up and ${zk} goes down. Every balance is back within −1 to +1, and this part of the tree is as tall as it was before the insert, so the nodes above need no change.`,
      readout: `height ${t.h(t.root)}`,
      verdict: { ok: true, text: "balanced again" },
    });
  }
  steps.push({
    nodes: t.snap({ tags: bfTags(t) }),
    caption:
      v === "sorted"
        ? "All seven keys, inserted in sorted order, give a tree of height 2. A plain search tree would have been a path of height 6 (BALT-1). Each insert did at most one rotation step."
        : "25 went in on the inside of the tall side, so it needed two rotations. The tree has height 2 again, and in-order still reads 10, 20, 25, 30, 50, 80.",
    readout: `height ${t.h(t.root)}`,
  });
  return steps;
}

/* BALT-4.1: red-black trees (the version from CLRS, Introduction to Algorithms) */

const colourTags = (t: BT): Record<string, Tag> =>
  Object.fromEntries(t.ids().map((id) => [id, t.red[id] ? { tag: "R", kind: "plain" as const } : { tag: "B", kind: "ink" as const }]));

export type RbVariant = "rules" | "insert";

export function rbSteps(v: RbVariant): TreeStep[] {
  const steps: TreeStep[] = [];
  const t = new BT();
  let intro = "";
  const push = (caption: string, states: Record<string, St> = {}, extra: Partial<TreeStep> = {}) => {
    steps.push({ nodes: t.snap({ states, tags: colourTags(t) }), caption: intro + caption, ...extra });
    intro = "";
  };

  const insert = (k: number, quiet: boolean) => {
    t.insert(k);
    let z = BT.id(k);
    if (!quiet) push(`Insert ${k} as in a plain search tree and colour it red. A red node adds nothing to the black counts, so only the rule “a red node never has a red child” can break.`, by([k], "cur"));
    for (;;) {
      const p = t.parent(z);
      if (p === null || !t.red[p]) break;
      const g = t.parent(p)!;
      const left = t.l[g] === p;
      const u = left ? t.r[g] : t.l[g];
      // The broken rule is shown in the readout, not on the nodes: a red frame on a node tagged R would read as "a red node".
      const redRed = (): Partial<TreeStep> => ({
        readout: `${t.v[p]} (R) has a red child, ${t.v[z]} (R)`,
        verdict: { ok: false, text: "a red node has a red child" },
      });
      if (u !== null && t.red[u]) {
        if (!quiet)
          push(
            `${t.v[z]} and its parent ${t.v[p]} are both red. The uncle (the parent's sibling), ${t.v[u]}, is red too. Fix: make ${t.v[p]} and ${t.v[u]} black and the grandparent ${t.v[g]} red.`,
            { [z]: "cur" },
            redRed(),
          );
        t.red[p] = false;
        t.red[u] = false;
        t.red[g] = true;
        if (!quiet) push(`Recoloured. Each path through ${t.v[g]} still has the same number of black nodes. But ${t.v[g]} is now red, so check it against its own parent.`, { [g]: "cur" });
        z = g;
        continue;
      }
      if (!quiet)
        push(
          `${t.v[z]} and its parent ${t.v[p]} are both red, and the uncle is ${u === null ? "missing (a missing child counts as black)" : `${t.v[u]}, which is black`}. Recolouring would not be enough: rotate.`,
          { [z]: "cur" },
          redRed(),
        );
      if (z === (left ? t.r[p] : t.l[p])) {
        t.rotate(p, left ? "left" : "right");
        if (!quiet) push(`${t.v[z]} is on the inside, so first rotate ${left ? "left" : "right"} at ${t.v[p]} to move it to the outside.`, { [z]: "cur" });
        z = p;
      }
      const p2 = t.parent(z)!;
      t.red[p2] = false;
      t.red[g] = true;
      t.rotate(g, left ? "right" : "left");
      if (!quiet) push(`Make ${t.v[p2]} black and ${t.v[g]} red, then rotate ${left ? "right" : "left"} at ${t.v[g]}. ${t.v[p2]} comes up. No red node has a red child now, and the black counts did not change.`, { [p2]: "found" });
      break;
    }
    if (t.red[t.root!]) {
      t.red[t.root!] = false;
      if (!quiet) push(`The root is red. Colour it black: this adds one black node to every path, so the paths stay equal.`, { [t.root!]: "cur" });
    }
  };

  if (v === "insert") {
    intro = "Insert 1 to 8 in increasing order into a red-black tree. Each node's tag shows its colour: R for red, B for black. (In this course the colour red marks mistakes, so the drawing shows the colour as a letter.) ";
    for (let k = 1; k <= 8; k++) {
      const before = steps.length;
      insert(k, false);
      if (steps.length === before + 1) {
        const last = steps[steps.length - 1];
        last.caption += " Its parent is black, so every rule still holds.";
      }
    }
    push(`Eight keys in sorted order, and the height is ${t.h(t.root)}. A plain search tree would be a path of height 7. The longest path down is never more than twice the shortest.`, {}, {
      readout: `height ${t.h(t.root)}`,
      verdict: { ok: true, text: "all rules hold" },
    });
    return steps;
  }
  for (let k = 1; k <= 8; k++) insert(k, true);
  const reds = t.ids().filter((id) => t.red[id]);
  push("A red-black tree with the keys 1 to 8. Rule 1: every node is red or black. The tags show the colour: R for red, B for black.");
  push("Rule 2: the root is black.", { [t.root!]: "cur" });
  push(`Rule 3: a red node never has a red child. The red nodes here are ${reds.map((id) => t.v[id]).join(", ")}; each one's children are black or missing.`, Object.fromEntries(reds.map((id) => [id, "cur" as St])));
  const path = (k: number) => {
    const out: string[] = [];
    let cur: string | null = t.root;
    while (cur !== null) {
      out.push(cur);
      cur = k < t.v[cur] ? t.l[cur] : t.r[cur];
    }
    return out;
  };
  const longest = path(8);
  const shortest = path(1);
  const blacks = (p: string[]) => p.filter((id) => !t.red[id]).length;
  push(
    `Rule 4: every path from a node down to a missing child passes the same number of black nodes. The path down to 8 passes ${longest.map((id) => t.v[id]).join(", ")}: ${blacks(longest)} black nodes.`,
    Object.fromEntries(longest.map((id) => [id, "cur" as St])),
  );
  push(
    `The path down to 1 passes ${shortest.map((id) => t.v[id]).join(", ")}: also ${blacks(shortest)} black nodes. This count is called the black height.`,
    Object.fromEntries(shortest.map((id) => [id, "cur" as St])),
  );
  push(
    `Rules 3 and 4 together: the shortest path can be all black, and the longest can put a red node between each pair of black ones. So the longest path is at most twice the shortest, and the height is at most 2 log₂(n + 1).`,
    {},
    { readout: `${longest.length} nodes on the longest path, ${shortest.length} on the shortest`, verdict: { ok: true, text: "height O(log n)" } },
  );
  return steps;
}

/* BALT-5.1: B-tree insert with splits on the way down (each node holds 1 to 3 keys) */

type BN = { id: string; keys: number[]; kids: BN[] };

export type BStep = { nodes: TNode[]; caption: string; readout?: string; verdict?: Verdict };

function bsnap(root: BN, states: Record<string, St> = {}): TNode[] {
  const out: TNode[] = [];
  const walk = (n: BN, parent?: string) => {
    out.push({ id: n.id, label: n.keys.join(" · "), parent, state: states[n.id] });
    n.kids.forEach((k) => walk(k, n.id));
  };
  walk(root);
  return out;
}

const bh = (n: BN): number => (n.kids.length ? 1 + bh(n.kids[0]) : 0);

export function btreeSteps(v: "insert" | "search"): BStep[] {
  let ids = 0;
  const node = (keys: number[], kids: BN[] = []): BN => ({ id: `b${ids++}`, keys, kids });
  const steps: BStep[] = [];
  let root = node([]);
  const push = (caption: string, states: Record<string, St> = {}, extra: Partial<BStep> = {}) =>
    steps.push({ nodes: bsnap(root, states), caption, readout: extra.readout ?? `height ${bh(root)}`, ...extra });
  // split the full child i of parent: its middle key moves up
  const split = (parent: BN, i: number, quiet: boolean) => {
    const c = parent.kids[i];
    const right = node(c.keys.slice(2), c.kids.slice(2));
    const midKey = c.keys[1];
    c.keys = c.keys.slice(0, 1);
    c.kids = c.kids.slice(0, 2);
    parent.keys.splice(i, 0, midKey);
    parent.kids.splice(i + 1, 0, right);
    if (!quiet) push(`Split: the middle key, ${midKey}, moves up into the node above. ${c.keys[0]} and ${right.keys.join(" · ")} become two separate nodes, side by side.`, { [parent.id]: "found", [c.id]: "cur", [right.id]: "cur" });
  };
  const insert = (k: number, quiet: boolean) => {
    if (root.keys.length === 3) {
      if (!quiet) push(`Insert ${k}. The root is full (3 keys), so split it before going down. Its middle key becomes a new root above it: this is the only way a B-tree grows taller.`, { [root.id]: "bad" });
      const old = root;
      root = node([], [old]);
      split(root, 0, quiet);
    }
    let n = root;
    for (;;) {
      if (!n.kids.length) {
        n.keys.push(k);
        n.keys.sort((a, b) => a - b);
        if (!quiet) push(`${k} goes into the leaf, in order: ${n.keys.join(", ")}. A leaf has room for up to 3 keys.`, { [n.id]: "cur" });
        return;
      }
      let i = 0;
      while (i < n.keys.length && k > n.keys[i]) i++;
      if (n.kids[i].keys.length === 3) {
        if (!quiet) push(`On the way down to ${k}'s place, the next node is full. Split it now, so there will be room if a key has to move up later.`, { [n.id]: "cur", [n.kids[i].id]: "bad" });
        split(n, i, quiet);
        if (k > n.keys[i]) i++;
      }
      n = n.kids[i];
    }
  };
  const keys = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  if (v === "insert") {
    insert(10, true);
    push("A B-tree in which each node holds 1 to 3 keys in order. It starts with one node, holding 10. Insert 20 to 100 in order.", {});
    for (const k of keys.slice(1)) insert(k, false);
    push("Ten keys in increasing order, and every leaf is at depth 2. Splits keep all the leaves at the same depth, so the tree never leans to one side.", {}, { verdict: { ok: true, text: "all leaves at one depth" } });
    return steps;
  }
  keys.forEach((k) => insert(k, true));
  const r = root;
  const mid = r.kids[1];
  const leaf = mid.kids[1];
  push("Search for 70 in the B-tree built from 10 to 100. Each node is one block on the disk: reading it costs one disk read.");
  push(`Read the root: 70 is bigger than 40, so 70 can only be in the subtree to the right of 40.`, { [r.id]: "cur" }, { readout: "1 disk read" });
  push(`Read the next node: 70 is between 60 and 80, so follow the child between those two keys.`, { [r.id]: "done", [mid.id]: "cur" }, { readout: "2 disk reads" });
  push(`Read the leaf: 70 is here. Three disk reads, one per level. With 1,000 keys per node, three levels hold about a billion keys.`, { [r.id]: "done", [mid.id]: "done", [leaf.id]: "found" }, { readout: "3 disk reads", verdict: { ok: true, text: "found" } });
  return steps;
}

/* BALT-6.1: skip list search and insert */

export const SKIP_KEYS = [3, 6, 7, 9, 12, 17, 19, 21, 25, 26];
const SEARCH_H = [1, 2, 1, 3, 1, 4, 1, 2, 1, 2];

export type SkipStep = {
  heights: number[];
  states: Record<string, Mark>;
  edges: Record<string, SkipEdge>;
  caption: string;
  readout?: string;
  verdict?: Verdict;
};

export function skipSteps(v: "search" | "insert"): SkipStep[] {
  const steps: SkipStep[] = [];
  const n = SKIP_KEYS.length;
  const nextOf = (h: number[], lv: number, c: number) => {
    for (let k = c + 1; k < n; k++) if (h[k] > lv) return k;
    return n;
  };
  const target = v === "search" ? 19 : 12;
  const h = v === "search" ? SEARCH_H.slice() : SEARCH_H.map((x, k) => (SKIP_KEYS[k] === 12 ? 0 : x));
  const states: Record<string, Mark> = {};
  const edges: Record<string, SkipEdge> = {};
  const update: number[] = [];
  steps.push({
    heights: h.slice(),
    states: {},
    edges: {},
    caption:
      v === "search"
        ? "A skip list: the bottom row (level 0) is a sorted linked list of all the keys. Each row above it skips over some keys. Search for 19, starting at the head on the top level."
        : "Insert 12. First search for it, as for any key, and remember the last node visited on each level: those are the nodes whose links will change.",
  });
  let c = -1;
  let looked = 0;
  for (let lv = 3; lv >= 0; lv--) {
    states[`${lv}:${c}`] = "cur";
    for (;;) {
      const nx = nextOf(h, lv, c);
      const key = nx < n ? SKIP_KEYS[nx] : null;
      if (key !== null) looked++;
      if (key !== null && key < target) {
        edges[`${lv}:${c}`] = "cur";
        states[`${lv}:${c}`] = "done";
        steps.push({
          heights: h.slice(),
          states: { ...states, [`${lv}:${nx}`]: "cur" },
          edges: { ...edges },
          caption: `Level ${lv}: the next key is ${key}, which is smaller than ${target}. Move right to it.`,
        });
        c = nx;
        states[`${lv}:${c}`] = "cur";
        continue;
      }
      update[lv] = c;
      if (key === target) {
        steps.push({
          heights: h.slice(),
          states: { ...states, [`${lv}:${nx}`]: "found" },
          edges: { ...edges, [`${lv}:${c}`]: "cur" },
          caption: `Level ${lv}: the next key is ${target}. Found, after looking at ${looked} keys. A plain sorted linked list would have looked at ${SKIP_KEYS.indexOf(target) + 1}.`,
          verdict: { ok: true, text: "found" },
        });
        return steps;
      }
      steps.push({
        heights: h.slice(),
        states: { ...states },
        edges: { ...edges },
        caption:
          key === null
            ? `Level ${lv}: nothing comes after this node on this level. ${lv > 0 ? `Go down to level ${lv - 1}.` : `${target} is not in the list.`}`
            : `Level ${lv}: the next key is ${key}, which is bigger than ${target}, so ${target} cannot be further along this row. ${lv > 0 ? `Go down to level ${lv - 1}.` : `${target} belongs right after this node.`}`,
      });
      if (lv > 0) states[`${lv}:${c}`] = "done";
      break;
    }
  }
  // insert: flip coins for the height
  const col = SKIP_KEYS.indexOf(12);
  const flips = ["heads", "heads", "tails"];
  let height = 1;
  steps.push({
    heights: h.slice(),
    states: { ...states },
    edges: { ...edges },
    caption: "12 always goes in level 0. Now flip a coin: on heads it also goes one level higher, and we flip again. First flip: heads.",
    readout: `flips: ${flips[0]}`,
  });
  height++;
  steps.push({
    heights: h.slice(),
    states: { ...states },
    edges: { ...edges },
    caption: "Second flip: heads again, so 12 also goes in level 2. Third flip: tails, so we stop. 12 gets a tower of 3 nodes, on levels 0, 1 and 2.",
    readout: `flips: ${flips.join(", ")}`,
  });
  height++;
  const h2 = h.slice();
  h2[col] = height;
  const changed: Record<string, SkipEdge> = {};
  for (let lv = 0; lv < height; lv++) changed[`${lv}:${update[lv]}`] = "cur";
  for (let lv = 0; lv < height; lv++) changed[`${lv}:${col}`] = "cur";
  const st: Record<string, Mark> = {};
  for (let lv = 0; lv < height; lv++) st[`${lv}:${col}`] = "found";
  steps.push({
    heights: h2,
    states: st,
    edges: changed,
    caption:
      "On each of those levels, link 12 in after the node we remembered there, as in a linked-list insert: 12 points to that node's old next, and that node now points to 12. The thick arrows are the links that changed.",
    readout: "6 links changed",
    verdict: { ok: true, text: "inserted" },
  });
  steps.push({
    heights: h2,
    states: {},
    edges: {},
    caption:
      "On average, half the keys reach level 1, a quarter reach level 2, and so on. So there are about log₂ n levels, and a search looks at about 2 nodes per level: O(log n) expected time.",
  });
  return steps;
}
