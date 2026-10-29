"""Check every practice problem in every written station.

For each problem, the reference solution must pass every test, and comfortably inside the time limit
(CPython here is faster than Pyodide in the browser, so a reference must finish in a fifth of the
limit). Each naive solution listed below must fail the tests written to catch it; a naive test that
is meant to time out must still be running when the full browser limit runs out here.

Run with: python scripts/check-problems.py [station ...]
"""

import json
import pathlib
import re
import subprocess
import sys
import time

ROOT = pathlib.Path(__file__).resolve().parent.parent
HARNESS = ROOT / "public" / "dsa"
CONTENT = ROOT / "app" / "dsa" / "_content"
sys.path.insert(0, str(HARNESS))
import harness  # noqa: E402

# Naive solutions live in scripts/naive/<station>.py as NAIVE = {problem: (code, [test numbers, 0-based, that must catch it])}.
def naive(station):
    path = ROOT / "scripts" / "naive" / f"{station}.py"
    if not path.exists():
        return {}
    ns = {}
    exec(path.read_text(encoding="utf-8"), ns)
    return ns["NAIVE"]


def problems(station):
    """Read fn and blocked for each problem from the station's problems.tsx."""
    src = (CONTENT / station / "problems.tsx").read_text(encoding="utf-8")
    out = {}
    for chunk in re.split(r"\n  \{\n    n: ", src)[1:]:
        n = int(re.match(r"\d+", chunk).group(0))
        fn = re.search(r'\n    fn: "(\w+)"', chunk).group(1)
        b = re.search(r"\n    blocked: \[(.*?)\]", chunk)
        out[n] = (fn, re.findall(r'"([^"]+)"', b.group(1)) if b else [])
    return out


def solution(station, n):
    src = (CONTENT / station / "solutions" / f"p{n}.ts").read_text(encoding="utf-8")
    return re.search(r"export const code = `(.*?)`;", src, re.S).group(1).replace("\\`", "`").replace("\\\\", "\\")


def tests_of(station, n):
    return json.loads((CONTENT / station / "tests" / f"p{n}.json").read_text(encoding="utf-8"))


def run_inline(code, fn, blocked, tests):
    loaded = json.loads(harness.dsa_load(code, json.dumps(blocked)))
    assert loaded["ok"], loaded
    results = []
    for t in tests:
        t0 = time.perf_counter()
        r = json.loads(harness.dsa_test(fn, t["args"], t["expect"], t.get("probe", 0), t.get("expr", "")))
        r["s"] = round(time.perf_counter() - t0, 3)
        results.append(r)
    return results


CHILD = """
import json, sys
sys.path.insert(0, sys.argv[1])
import harness
job = json.load(sys.stdin)
loaded = json.loads(harness.dsa_load(job["code"], json.dumps(job["blocked"])))
if not loaded["ok"]:
    print(json.dumps({"status": "error", "error": loaded.get("error")}))
else:
    t = job["test"]
    print(harness.dsa_test(job["fn"], t["args"], t["expect"], t.get("probe", 0), t.get("expr", "")))
"""


def run_isolated(code, fn, blocked, test):
    limit = test.get("timeout", 3000) / 1000
    job = json.dumps({"code": code, "fn": fn, "blocked": blocked, "test": test})
    try:
        p = subprocess.run([sys.executable, "-c", CHILD, str(HARNESS)], input=job, capture_output=True, text=True, timeout=limit)
    except subprocess.TimeoutExpired:
        return {"status": "timeout"}
    lines = p.stdout.strip().splitlines()
    return json.loads(lines[-1]) if lines else {"status": "error", "error": p.stderr[-400:]}


def check(station):
    ok = True
    for n, (fn, blocked) in problems(station).items():
        tests = tests_of(station, n)
        results = run_inline(solution(station, n), fn, blocked, tests)
        bad = [(t["name"], r) for t, r in zip(tests, results) if r["status"] != "pass"]
        slow = [(t["name"], r["s"]) for t, r in zip(tests, results) if r["s"] > t.get("timeout", 3000) / 1000 / 5]
        print(f"{station.upper()}-P{n} {fn}: reference {len(tests) - len(bad)}/{len(tests)} pass, slowest {max(r['s'] for r in results)}s")
        for name, r in bad:
            ok = False
            print("   FAIL", name, r)
        for name, s in slow:
            ok = False
            print(f"   TOO SLOW for the browser: {name} took {s}s")
        if n in naive(station):
            code, must_fail = naive(station)[n]
            caught = [k for k in must_fail if run_isolated(code, fn, blocked, tests[k])["status"] != "pass"]
            print(f"     naive caught by tests {caught} of {must_fail}")
            if caught != must_fail:
                ok = False
    return ok


if __name__ == "__main__":
    wanted = [a.lower() for a in sys.argv[1:]] or sorted(p.name for p in CONTENT.iterdir() if (p / "problems.tsx").exists())
    results = [check(s) for s in wanted]
    sys.exit(0 if all(results) else 1)
