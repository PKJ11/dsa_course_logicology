export const code = `def isqrt(n):
    """Largest r with r * r <= n, using only integer arithmetic."""
    lo, hi = 0, n                       # r = 0 always works; r = n is never too small
    while lo < hi:
        mid = (lo + hi + 1) // 2        # round up: lo < mid <= hi
        if mid * mid <= n:
            lo = mid                    # mid works and may be the last T: keep it
        else:
            hi = mid - 1                # mid is too big
    return lo
`;

export const notes = [
  "The question `r * r <= n` is true for small r and false for large r: T … T F … F. We want the last T, so the branch that keeps `mid` is `lo = mid`, and `mid` must round up. With `(lo + hi) // 2`, a window of two values would set `lo = mid = lo` forever.",
  "Invariant: `lo * lo <= n`, and every r above `hi` has `r * r > n`. When `lo == hi`, `lo` is the answer.",
  "Exact answers: every value is a Python `int`, which never rounds or overflows, so the answer is exact for any n. Any code that uses `** 0.5`, `/` or `math.sqrt` goes through a float, which stores only about 16 significant digits, so it fails on large inputs.",
  "How long it takes: about log₂ n passes, so roughly 133 for a 41-digit n. `math.isqrt` uses Newton's method, which is even faster.",
];
