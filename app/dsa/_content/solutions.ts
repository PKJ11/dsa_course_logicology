import type { Solution } from "./types";

// Each station's solutions index is its own chunk, and each solution inside it is another. Nothing
// here loads until a learner unlocks a solution.
type Index = { SOLUTIONS: Record<number, () => Promise<Solution>> };

export const STATION_SOLUTIONS: Record<string, () => Promise<Index>> = {
  PYTH: () => import("./pyth/solutions"),
  CORR: () => import("./corr/solutions"),
  BIGO: () => import("./bigo/solutions"),
  ARRS: () => import("./arrs/solutions"),
  RECR: () => import("./recr/solutions"),
  SORT: () => import("./sort/solutions"),
  LINK: () => import("./link/solutions"),
  STAQ: () => import("./staq/solutions"),
  HASH: () => import("./hash/solutions"),
  TREE: () => import("./tree/solutions"),
  BALT: () => import("./balt/solutions"),
  HEAP: () => import("./heap/solutions"),
  TRIE: () => import("./trie/solutions"),
  DSUF: () => import("./dsuf/solutions"),
  RNGQ: () => import("./rngq/solutions"),
  GRDY: () => import("./grdy/solutions"),
  DVCQ: () => import("./dvcq/solutions"),
  DYNP: () => import("./dynp/solutions"),
  BITS: () => import("./bits/solutions"),
  MATH: () => import("./math/solutions"),
  GRPH: () => import("./grph/solutions"),
  PATH: () => import("./path/solutions"),
  SPAN: () => import("./span/solutions"),
  CONN: () => import("./conn/solutions"),
  FLOW: () => import("./flow/solutions"),
  STRG: () => import("./strg/solutions"),
  GEOM: () => import("./geom/solutions"),
  ADDP: () => import("./addp/solutions"),
  HARD: () => import("./hard/solutions"),
  BSRC: () => import("./bsrc/solutions"),
};
