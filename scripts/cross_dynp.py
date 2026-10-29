"""Cross-check the trusted DYNP solutions against brute force on random small inputs. Run from scripts/."""
import random
import sys

sys.path.insert(0, r"D:/claude/dsa-self-paced/public/dsa")
import trusted_dynp as T  # noqa: E402


def load(src):
    ns = {}
    exec(src, ns)
    return ns


R = random.Random(18)
N = 3000

a, b = load(T.SHAPES), load(T.SHAPES_BRUTE)
for n in range(0, 11):
    assert a["shapes"](n) == b["shapes"](n), n

a, b = load(T.EXCHANGE), load(T.EXCHANGE_BRUTE)
for n in list(range(0, 3000)) + [R.randint(0, 300_000) for _ in range(200)]:
    assert a["exchange"](n) == b["exchange"](n), n

a, b = load(T.DECODE), load(T.DECODE_BRUTE)
for _ in range(N):
    s = "".join(R.choice("0123456789" if R.random() < 0.3 else "1122220123456") for _ in range(R.randint(0, 14)))
    assert a["decode_ways"](s) == b["decode_ways"](s), s

a, b = load(T.TICKETS), load(T.TICKETS_BRUTE)
for _ in range(N):
    days = sorted(R.sample(range(1, 60), R.randint(0, 20)))
    passes = [(R.randint(1, 15), R.randint(1, 20)) for _ in range(R.randint(1, 4))]
    assert a["season_tickets"](days, passes) == b["season_tickets"](days, passes), (days, passes)

a, b = load(T.SQUARE), load(T.SQUARE_BRUTE)
for _ in range(N):
    h, w = R.randint(0, 7), R.randint(1, 7)
    p = R.random()
    rows = ["".join("." if R.random() < p else "#" for _ in range(w)) for _ in range(h)]
    assert a["largest_square"](rows) == b["largest_square"](rows), rows

a, b = load(T.NEST), load(T.NEST_BRUTE)
for _ in range(N):
    boxes = [(R.randint(1, 6), R.randint(1, 6)) for _ in range(R.randint(0, 12))]
    assert a["nest"](list(boxes)) == b["nest"](list(boxes)), boxes

a, b = load(T.EDIT), load(T.EDIT_BRUTE)
for _ in range(N):
    x = "".join(R.choice("abc") for _ in range(R.randint(0, 7)))
    y = "".join(R.choice("abc") for _ in range(R.randint(0, 7)))
    assert a["edit_distance"](x, y) == b["edit_distance"](x, y), (x, y)

a, b = load(T.WAYS), load(T.WAYS_BRUTE)
for _ in range(N):
    coins = R.sample(range(1, 12), R.randint(1, 5))
    amt = R.randint(0, 40)
    assert a["ways_to_pay"](amt, coins) == b["ways_to_pay"](amt, coins), (amt, coins)

a, b = load(T.PACK), load(T.PACK_BRUTE)
for _ in range(N):
    items = [(R.randint(1, 9), R.randint(1, 12)) for _ in range(R.randint(0, 10))]
    cap = R.randint(0, 25)
    got = a["pack"](list(items), cap)
    assert len(set(got)) == len(got) and all(0 <= i < len(items) for i in got), (items, cap, got)
    assert sum(items[i][0] for i in got) <= cap, (items, cap, got)
    assert sum(items[i][1] for i in got) == b["pack_value"](items, cap), (items, cap, got)

print(f"all DYNP cross-checks pass ({N:,} random cases per problem; shapes for n <= 10, exchange for n < 3,000 and 200 larger)")
