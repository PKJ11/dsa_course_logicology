"""Rough CPython timings for ADDP's big sizes (scratch; not part of the checks)."""
import random
import time
import trusted_addp as T
from cross_addp import load

t = time.perf_counter(); sum(range(30_000_000)); print("baseline", round(time.perf_counter() - t, 2))
rng = random.Random(5)

f1 = load(T.P1, "total_distance")
n = 100_000
roads = [(v - 1, v, 7) for v in range(1, n)]
t = time.perf_counter(); f1(n, roads); print("P1 path", round(time.perf_counter() - t, 2))
roads = [(rng.randrange(v), v, rng.randint(1, 1000)) for v in range(1, n)]
t = time.perf_counter(); f1(n, roads); print("P1 random", round(time.perf_counter() - t, 2))

f2 = load(T.P2, "most_collected")
n = 100_000
streets = [(rng.randrange(n), rng.randrange(n)) for _ in range(200_000)]
val = [rng.randint(0, 1000) for _ in range(n)]
t = time.perf_counter(); r = f2(n, streets, val, 0); print("P2 random", round(time.perf_counter() - t, 2), r)

f3 = load(T.P3, "cheapest_cuts")
marks = rng.sample(range(1, 10 ** 6), 150)
t = time.perf_counter(); f3(10 ** 6, marks); print("P3 150", round(time.perf_counter() - t, 2))

f4 = load(T.P4, "fewest_wagons")
w = [rng.randint(1, 100) for _ in range(16)]
t = time.perf_counter(); f4(w, 150); print("P4 16", round(time.perf_counter() - t, 2))

f6 = load(T.P6, "cheapest_trip")
x = sorted(rng.sample(range(10 ** 9), 200_000))
t = time.perf_counter(); f6(x, 10 ** 12); print("P6 200k", round(time.perf_counter() - t, 2))
