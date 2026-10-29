"""Test builder: computes expected answers with a trusted function, writes tests/pN.json."""
import json
import pathlib
import sys

ROOT = pathlib.Path(r"D:/claude/dsa-self-paced")
sys.path.insert(0, str(ROOT / "public" / "dsa"))
import harness  # noqa: E402


def build(station, n, fn, tests, trusted, extra_ns=None):
    """trusted: python source defining `fn` (a brute force or the reference)."""
    ns = {"__name__": "trusted", **harness._HELPERS}
    exec(trusted, ns)
    if extra_ns:
        ns.update(extra_ns)
    out = []
    for t in tests:
        t = dict(t)
        if "expect" not in t:
            args = list(eval(t["args"], {}))
            if "expr" in t:
                try:
                    got = eval(t["expr"], {**ns, "args": args})
                finally:
                    harness._cut_chains()
            else:
                got = ns[fn](*args)
            t["expect"] = repr(got)
        # key order like the hand-written files
        order = ["name", "args", "expect", "probe", "timeout", "expr", "show", "trace", "why"]
        out.append({k: t[k] for k in order if k in t})
    path = ROOT / "app" / "dsa" / "_content" / station / "tests" / f"p{n}.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    lines = ",\n".join("  " + json.dumps(x, ensure_ascii=False) for x in out)
    path.write_text("[\n" + lines + "\n]\n", encoding="utf-8")
    print(f"{station}/p{n}: {len(out)} tests")
