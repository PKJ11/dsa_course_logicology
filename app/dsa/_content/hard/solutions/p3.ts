// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `from fractions import Fraction

def best_value(items, cap):
    # best value per kilogram first: the bound below is then easy to work out
    its = sorted(items, key=lambda t: Fraction(t[1], t[0]), reverse=True)
    n = len(its)
    best = 0

    def bound(k, room, value):         # fill the room greedily, the last item cut
        for w, v in its[k:]:
            if w <= room:
                room -= w
                value += v
            else:
                return value + v * room // w
        return value

    def go(k, room, value):
        nonlocal best
        if value > best:
            best = value
        if k == n or bound(k, room, value) <= best:
            return                     # nothing below here can do better
        w, v = its[k]
        if w <= room:
            go(k + 1, room - w, value + v)     # take item k
        go(k + 1, room, value)                 # leave it

    go(0, cap, 0)
    return best
`;

export const notes = [
  "Branch and bound (lesson 3). The items are sorted by value per kilogram, best first, compared exactly with Fraction.",
  "go(k, room, value) has decided items 0 .. k − 1. The best complete value found so far is best; every node is itself a valid packing (leave the rest), so its value can update best.",
  "The bound fills the room with the next items whole while they fit and then the fitting part of the first one that does not: the fractional knapsack, which GRDY-1 proved optimal when items may be cut. No whole-item packing below the node can beat it, so when it is not above best, the branch is skipped. Rounding it down is safe because values are whole numbers.",
  "Taking an item is tried before leaving it, so good packings are found early and the bound prunes from the start. The tests need a few hundred to a few thousand nodes; a bound that adds up every undecided value passes millions.",
];
