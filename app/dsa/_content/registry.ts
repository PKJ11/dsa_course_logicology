// Every written station, by code. Lesson and problem tables only, so the course map can import it on
// the client without pulling in lesson bodies. Add a station here, in bodies.ts, defs.ts and
// solutions.ts, then set `open: true` on it in _data/syllabus.ts.

import type { LessonMeta, ProblemMeta } from "./types";
import { BSRC_LESSONS, BSRC_PROBLEMS } from "./bsrc/meta";
import { CORR_LESSONS, CORR_PROBLEMS } from "./corr/meta";
import { BIGO_LESSONS, BIGO_PROBLEMS } from "./bigo/meta";
import { ARRS_LESSONS, ARRS_PROBLEMS } from "./arrs/meta";
import { RECR_LESSONS, RECR_PROBLEMS } from "./recr/meta";
import { SORT_LESSONS, SORT_PROBLEMS } from "./sort/meta";
import { LINK_LESSONS, LINK_PROBLEMS } from "./link/meta";
import { STAQ_LESSONS, STAQ_PROBLEMS } from "./staq/meta";
import { HASH_LESSONS, HASH_PROBLEMS } from "./hash/meta";
import { TREE_LESSONS, TREE_PROBLEMS } from "./tree/meta";
import { BALT_LESSONS, BALT_PROBLEMS } from "./balt/meta";
import { HEAP_LESSONS, HEAP_PROBLEMS } from "./heap/meta";
import { TRIE_LESSONS, TRIE_PROBLEMS } from "./trie/meta";
import { DSUF_LESSONS, DSUF_PROBLEMS } from "./dsuf/meta";
import { RNGQ_LESSONS, RNGQ_PROBLEMS } from "./rngq/meta";
import { GRDY_LESSONS, GRDY_PROBLEMS } from "./grdy/meta";
import { DVCQ_LESSONS, DVCQ_PROBLEMS } from "./dvcq/meta";
import { DYNP_LESSONS, DYNP_PROBLEMS } from "./dynp/meta";
import { BITS_LESSONS, BITS_PROBLEMS } from "./bits/meta";
import { MATH_LESSONS, MATH_PROBLEMS } from "./math/meta";
import { GRPH_LESSONS, GRPH_PROBLEMS } from "./grph/meta";
import { PATH_LESSONS, PATH_PROBLEMS } from "./path/meta";
import { SPAN_LESSONS, SPAN_PROBLEMS } from "./span/meta";
import { CONN_LESSONS, CONN_PROBLEMS } from "./conn/meta";
import { FLOW_LESSONS, FLOW_PROBLEMS } from "./flow/meta";
import { STRG_LESSONS, STRG_PROBLEMS } from "./strg/meta";
import { GEOM_LESSONS, GEOM_PROBLEMS } from "./geom/meta";
import { ADDP_LESSONS, ADDP_PROBLEMS } from "./addp/meta";
import { HARD_LESSONS, HARD_PROBLEMS } from "./hard/meta";
import { PYTH_LESSONS, PYTH_PROBLEMS } from "./pyth/meta";

export const META: Record<string, { lessons: LessonMeta[]; problems: ProblemMeta[] }> = {
  PYTH: { lessons: PYTH_LESSONS, problems: PYTH_PROBLEMS },
  CORR: { lessons: CORR_LESSONS, problems: CORR_PROBLEMS },
  BIGO: { lessons: BIGO_LESSONS, problems: BIGO_PROBLEMS },
  ARRS: { lessons: ARRS_LESSONS, problems: ARRS_PROBLEMS },
  RECR: { lessons: RECR_LESSONS, problems: RECR_PROBLEMS },
  SORT: { lessons: SORT_LESSONS, problems: SORT_PROBLEMS },
  LINK: { lessons: LINK_LESSONS, problems: LINK_PROBLEMS },
  STAQ: { lessons: STAQ_LESSONS, problems: STAQ_PROBLEMS },
  HASH: { lessons: HASH_LESSONS, problems: HASH_PROBLEMS },
  TREE: { lessons: TREE_LESSONS, problems: TREE_PROBLEMS },
  BALT: { lessons: BALT_LESSONS, problems: BALT_PROBLEMS },
  HEAP: { lessons: HEAP_LESSONS, problems: HEAP_PROBLEMS },
  TRIE: { lessons: TRIE_LESSONS, problems: TRIE_PROBLEMS },
  DSUF: { lessons: DSUF_LESSONS, problems: DSUF_PROBLEMS },
  RNGQ: { lessons: RNGQ_LESSONS, problems: RNGQ_PROBLEMS },
  GRDY: { lessons: GRDY_LESSONS, problems: GRDY_PROBLEMS },
  DVCQ: { lessons: DVCQ_LESSONS, problems: DVCQ_PROBLEMS },
  DYNP: { lessons: DYNP_LESSONS, problems: DYNP_PROBLEMS },
  BITS: { lessons: BITS_LESSONS, problems: BITS_PROBLEMS },
  MATH: { lessons: MATH_LESSONS, problems: MATH_PROBLEMS },
  GRPH: { lessons: GRPH_LESSONS, problems: GRPH_PROBLEMS },
  PATH: { lessons: PATH_LESSONS, problems: PATH_PROBLEMS },
  SPAN: { lessons: SPAN_LESSONS, problems: SPAN_PROBLEMS },
  CONN: { lessons: CONN_LESSONS, problems: CONN_PROBLEMS },
  FLOW: { lessons: FLOW_LESSONS, problems: FLOW_PROBLEMS },
  STRG: { lessons: STRG_LESSONS, problems: STRG_PROBLEMS },
  GEOM: { lessons: GEOM_LESSONS, problems: GEOM_PROBLEMS },
  ADDP: { lessons: ADDP_LESSONS, problems: ADDP_PROBLEMS },
  HARD: { lessons: HARD_LESSONS, problems: HARD_PROBLEMS },
  BSRC: { lessons: BSRC_LESSONS, problems: BSRC_PROBLEMS },
};
