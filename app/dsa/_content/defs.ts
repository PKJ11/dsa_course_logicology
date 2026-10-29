import type { Problem } from "./types";
import { BSRC_PROBLEM_DEFS } from "./bsrc/problems";
import { CORR_PROBLEM_DEFS } from "./corr/problems";
import { BIGO_PROBLEM_DEFS } from "./bigo/problems";
import { ARRS_PROBLEM_DEFS } from "./arrs/problems";
import { RECR_PROBLEM_DEFS } from "./recr/problems";
import { SORT_PROBLEM_DEFS } from "./sort/problems";
import { LINK_PROBLEM_DEFS } from "./link/problems";
import { STAQ_PROBLEM_DEFS } from "./staq/problems";
import { HASH_PROBLEM_DEFS } from "./hash/problems";
import { TREE_PROBLEM_DEFS } from "./tree/problems";
import { BALT_PROBLEM_DEFS } from "./balt/problems";
import { HEAP_PROBLEM_DEFS } from "./heap/problems";
import { TRIE_PROBLEM_DEFS } from "./trie/problems";
import { DSUF_PROBLEM_DEFS } from "./dsuf/problems";
import { RNGQ_PROBLEM_DEFS } from "./rngq/problems";
import { GRDY_PROBLEM_DEFS } from "./grdy/problems";
import { DVCQ_PROBLEM_DEFS } from "./dvcq/problems";
import { DYNP_PROBLEM_DEFS } from "./dynp/problems";
import { BITS_PROBLEM_DEFS } from "./bits/problems";
import { MATH_PROBLEM_DEFS } from "./math/problems";
import { GRPH_PROBLEM_DEFS } from "./grph/problems";
import { PATH_PROBLEM_DEFS } from "./path/problems";
import { SPAN_PROBLEM_DEFS } from "./span/problems";
import { CONN_PROBLEM_DEFS } from "./conn/problems";
import { FLOW_PROBLEM_DEFS } from "./flow/problems";
import { STRG_PROBLEM_DEFS } from "./strg/problems";
import { GEOM_PROBLEM_DEFS } from "./geom/problems";
import { ADDP_PROBLEM_DEFS } from "./addp/problems";
import { HARD_PROBLEM_DEFS } from "./hard/problems";
import { PYTH_PROBLEM_DEFS } from "./pyth/problems";

// Full problem definitions by station code. Server-side only (the practice route).
export const DEFS: Record<string, Problem[]> = {
  PYTH: PYTH_PROBLEM_DEFS,
  CORR: CORR_PROBLEM_DEFS,
  BIGO: BIGO_PROBLEM_DEFS,
  ARRS: ARRS_PROBLEM_DEFS,
  RECR: RECR_PROBLEM_DEFS,
  SORT: SORT_PROBLEM_DEFS,
  LINK: LINK_PROBLEM_DEFS,
  STAQ: STAQ_PROBLEM_DEFS,
  HASH: HASH_PROBLEM_DEFS,
  TREE: TREE_PROBLEM_DEFS,
  BALT: BALT_PROBLEM_DEFS,
  HEAP: HEAP_PROBLEM_DEFS,
  TRIE: TRIE_PROBLEM_DEFS,
  DSUF: DSUF_PROBLEM_DEFS,
  RNGQ: RNGQ_PROBLEM_DEFS,
  GRDY: GRDY_PROBLEM_DEFS,
  DVCQ: DVCQ_PROBLEM_DEFS,
  DYNP: DYNP_PROBLEM_DEFS,
  BITS: BITS_PROBLEM_DEFS,
  MATH: MATH_PROBLEM_DEFS,
  GRPH: GRPH_PROBLEM_DEFS,
  PATH: PATH_PROBLEM_DEFS,
  SPAN: SPAN_PROBLEM_DEFS,
  CONN: CONN_PROBLEM_DEFS,
  FLOW: FLOW_PROBLEM_DEFS,
  STRG: STRG_PROBLEM_DEFS,
  GEOM: GEOM_PROBLEM_DEFS,
  ADDP: ADDP_PROBLEM_DEFS,
  HARD: HARD_PROBLEM_DEFS,
  BSRC: BSRC_PROBLEM_DEFS,
};
