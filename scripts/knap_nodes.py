"""Count search nodes of knapsack branch and bound with different bounds (scratch helper for build_hard.py)."""
import random
import time
from fractions import Fraction

A = 6364136223846793005
B = 3935559000370003845


def mixed(k, seed):
    y = (k + seed * 10_000_019) * A % 2 ** 64
    return (y ^ y >> 29) * B % 2 ** 64


def bnb(items, cap, kind="frac", limit=3_000_000):
    its = sorted(items, key=lambda t: Fraction(t[1], t[0]), reverse=True)
    n = len(its)
    suf = [0] * (n + 1)
    for k in range(n - 1, -1, -1):
        suf[k] = suf[k + 1] + its[k][1]
    best = 0
    nodes = 0

    def bound(k, room, value):
        if kind == "sum":
            return value + suf[k]
        for w, v in its[k:]:
            if w <= room:
                room -= w
                value += v
            else:
                return value + v * room // w
        return value

    def go(k, room, value):
        nonlocal best, nodes
        nodes += 1
        if nodes > limit:
            raise TimeoutError
        if value > best:
            best = value
        if k == n or (kind != "none" and bound(k, room, value) <= best):
            return
        w, v = its[k]
        if w <= room:
            go(k + 1, room - w, value + v)
        go(k + 1, room, value)
    try:
        go(0, cap, 0)
    except TimeoutError:
        return best, ">" + str(limit)
    return best, nodes


def gen(n, seed, style):
    out = []
    for k in range(n):
        x = mixed(k, seed)
        w = (x >> 8) % 900_000_000 + 100_000_000
        if style == "uncorrelated":
            v = (x >> 36) % 900_000_000 + 100_000_000
        elif style == "weak":
            v = w + (x >> 36) % 200_000_000 - 100_000_000
        elif style == "strong":
            v = w + 100_000_000
        out.append((w, v))
    cap = sum(w for w, _ in out) // 2
    return out, cap


if __name__ == "__main__":
  for style in ["uncorrelated", "weak", "strong"]:
    for n in [40, 60, 80, 100]:
        items, cap = gen(n, 3, style)
        t = time.perf_counter()
        r = bnb(items, cap)
        dt = time.perf_counter() - t
        r2 = bnb(items, cap, "sum", 300_000)
        print(style, n, "frac", r[1], round(dt, 2), "| sum", r2[1])
