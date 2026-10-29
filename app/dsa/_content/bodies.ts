import type { ComponentType } from "react";
import { BSRC_BODIES } from "./bsrc";
import { CORR_BODIES } from "./corr";
import { BIGO_BODIES } from "./bigo";
import { ARRS_BODIES } from "./arrs";
import { RECR_BODIES } from "./recr";
import { SORT_BODIES } from "./sort";
import { LINK_BODIES } from "./link";
import { STAQ_BODIES } from "./staq";
import { HASH_BODIES } from "./hash";
import { TREE_BODIES } from "./tree";
import { BALT_BODIES } from "./balt";
import { HEAP_BODIES } from "./heap";
import { TRIE_BODIES } from "./trie";
import { DSUF_BODIES } from "./dsuf";
import { RNGQ_BODIES } from "./rngq";
import { GRDY_BODIES } from "./grdy";
import { DVCQ_BODIES } from "./dvcq";
import { DYNP_BODIES } from "./dynp";
import { BITS_BODIES } from "./bits";
import { MATH_BODIES } from "./math";
import { GRPH_BODIES } from "./grph";
import { PATH_BODIES } from "./path";
import { SPAN_BODIES } from "./span";
import { CONN_BODIES } from "./conn";
import { FLOW_BODIES } from "./flow";
import { STRG_BODIES } from "./strg";
import { GEOM_BODIES } from "./geom";
import { ADDP_BODIES } from "./addp";
import { HARD_BODIES } from "./hard";
import { PYTH_BODIES } from "./pyth";

// Lesson bodies by station code, then lesson number. Server-side only (the lesson route).
export const BODIES: Record<string, Record<number, ComponentType>> = {
  PYTH: PYTH_BODIES,
  CORR: CORR_BODIES,
  BIGO: BIGO_BODIES,
  ARRS: ARRS_BODIES,
  RECR: RECR_BODIES,
  SORT: SORT_BODIES,
  LINK: LINK_BODIES,
  STAQ: STAQ_BODIES,
  HASH: HASH_BODIES,
  TREE: TREE_BODIES,
  BALT: BALT_BODIES,
  HEAP: HEAP_BODIES,
  TRIE: TRIE_BODIES,
  DSUF: DSUF_BODIES,
  RNGQ: RNGQ_BODIES,
  GRDY: GRDY_BODIES,
  DVCQ: DVCQ_BODIES,
  DYNP: DYNP_BODIES,
  BITS: BITS_BODIES,
  MATH: MATH_BODIES,
  GRPH: GRPH_BODIES,
  PATH: PATH_BODIES,
  SPAN: SPAN_BODIES,
  CONN: CONN_BODIES,
  FLOW: FLOW_BODIES,
  STRG: STRG_BODIES,
  GEOM: GEOM_BODIES,
  ADDP: ADDP_BODIES,
  HARD: HARD_BODIES,
  BSRC: BSRC_BODIES,
};
