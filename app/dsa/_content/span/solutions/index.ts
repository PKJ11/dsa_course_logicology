// Each solution is its own chunk, fetched only when it unlocks.
export const SOLUTIONS: Record<number, () => Promise<{ code: string; notes: string[] }>> = {
  1: () => import("./p1"),
  2: () => import("./p2"),
  3: () => import("./p3"),
  4: () => import("./p4"),
};
