from solgen import write_station

write_station("dynp", 9, {
    1: ('''def shapes(n):
    # count[m] = the number of shapes with m keys
    count = [1] * (n + 1)          # 0 keys and 1 key: one shape
    for m in range(2, n + 1):
        total = 0
        for left in range(m):      # keys in the left subtree
            right = m - 1 - left   # the root takes one key
            total += count[left] * count[right]
        count[m] = total
    return count[n]
''', [
        "The state is the number of keys, m. Which keys they are does not matter: any m keys in order make the same shapes as the keys 1 to m. So there are only n + 1 different questions.",
        "Choosing the root splits the other m − 1 keys into a left part and a right part. Every left shape can go with every right shape, so a root with `left` keys on its left gives `count[left] * count[right]` shapes. Add over all roots.",
        "The list is filled from small m to large m, so every count the loop needs is already there. That is O(n²) multiplications. The numbers grow to hundreds of digits; Python's whole numbers hold them exactly.",
        "These are the Catalan numbers: 1, 1, 2, 5, 14, 42, … They also count correctly nested brackets and the ways to cut a polygon into triangles. The closed form `comb(2n, n) // (n + 1)` exists, which is why `math.comb` is switched off here.",
    ]),
    2: ('''def exchange(n):
    memo = {}                      # a new memo for each call

    def best(m):
        if m == 0:
            return 0
        if m not in memo:
            swap = best(m // 2) + best(m // 3) + best(m // 4)
            memo[m] = max(m, swap)  # sell, or exchange
        return memo[m]

    return best(n)
''', [
        "The value of a coin depends only on its number, so `best(m)` is the state. The choice is to sell it (m rupees) or to exchange it and take the best value of the three new coins.",
        "A table from 0 to n is impossible for n = 10¹²: it would need a million million entries. The recursion only reaches numbers of the form n // 2ᵃ // 3ᵇ // 4ᶜ, which are a few thousand at most. Memoisation stores just those.",
        "The recursion is shallow: every call divides m by at least 2, so the depth is about log₂ n, 60 for n = 10¹⁸. The recursion limit is no problem here.",
        "`functools.cache` on an inner function does the same as the dict. A module-level cache also works for this problem, because the answer depends on n alone and nothing else changes between calls.",
        "For every m below 12, selling is at least as good as exchanging (11 gives 5 + 3 + 2 = 10). The first coin worth exchanging is 12.",
    ]),
    3: ('''def decode_ways(s):
    MOD = 1_000_000_007
    # ways for the first i - 2 and the first i - 1 digits
    before, cur = 1, 1             # empty prefix: one way
    for i in range(1, len(s) + 1):
        ways = 0
        if s[i - 1] != "0":        # the last digit alone
            ways += cur
        if i >= 2:                 # the last two digits together
            pair = s[i - 2:i]
            if "10" <= pair <= "26":
                ways += before
        before, cur = cur, ways % MOD
    return cur
''', [
        "The state is the length of the prefix read so far. The last letter of a decoding of `s[:i]` is either the last digit alone (if it is not 0) or the last two digits together (if they make 10 to 26). So ways(i) = ways(i − 1) + ways(i − 2), each term only when its letter is allowed.",
        "Comparing the two-digit string with `\"10\"` and `\"26\"` works because both have two digits: it rules out a leading zero (`\"06\"`) and anything above 26 in one step.",
        "Each prefix needs only the two before it, so two names are enough: O(n) time and O(1) space. A loop has no depth limit. Memoised recursion on 100,000 digits goes 100,000 calls deep, far past Python's limit of about 1,000, so it fails.",
        "Taking the remainder after each step keeps the numbers small. The remainder of a sum is the remainder of the sum of remainders, so the answer is the same as taking the remainder of the full count at the end.",
    ]),
    4: ('''import bisect

def season_tickets(days, passes):
    n = len(days)
    # best[i] = cheapest way to cover trips i, i + 1, ..., n - 1
    best = [0] * (n + 1)
    for i in range(n - 1, -1, -1):
        cheapest = None
        for length, price in passes:
            # a pass bought on days[i] covers up to
            # days[i] + length - 1; j is the first trip after it
            j = bisect.bisect_left(days, days[i] + length, i)
            cost = price + best[j]
            if cheapest is None or cost < cheapest:
                cheapest = cost
        best[i] = cheapest
    return best[0]
''', [
        "Some ticket must cover the first trip that is not yet covered, and it is never worse to buy it on that trip's day. So the state is a trip number i: the cheapest way to cover trips i to the end. One entry per trip, not per calendar day.",
        "For each pass, the first trip it does not cover is the first day ≥ `days[i] + length`. `bisect_left` finds it in O(log n), searching only from i onwards. In all O(n · p · log n) for p passes.",
        "The table is filled from the last trip backwards, because each entry needs later ones. A forward version also works: cheapest[i] = the cheapest way to cover the first i trips.",
        "A pointer per pass that only moves forward also works in O(n · p) in all: as i goes down, the end of each pass moves down too.",
    ]),
    5: ('''def largest_square(rows):
    if not rows:
        return 0
    w = len(rows[0])
    # side[c + 1] = the largest free square whose
    # bottom-right corner is at column c of this row
    prev = [0] * (w + 1)
    best = 0
    for line in rows:
        cur = [0] * (w + 1)
        for c in range(w):
            if line[c] == ".":
                s = 1 + min(prev[c],       # above-left
                            prev[c + 1],   # above
                            cur[c])        # left
                cur[c + 1] = s
                best = max(best, s)
        prev = cur
    return best
''', [
        "The state is a cell, and the value is the side of the largest free square whose bottom-right corner is that cell. The answer is the largest value in the table.",
        "If a free cell has squares of sides a (above), b (left) and c (above-left) ending at its neighbours, the largest square ending at it has side 1 + min(a, b, c). It cannot be bigger, because one of the three neighbours' squares would then be bigger too; and the three squares together cover a square of that size.",
        "The extra 0 at the start of each row stands for the cells left of column 0, so the first column needs no special case. Only the row above is needed, so two rows are kept: O(width) space and O(rows × width) time.",
    ]),
    6: ('''import bisect

def nest(boxes):
    # widths rising; equal widths with heights falling,
    # so two boxes of the same width can never chain
    order = sorted(boxes, key=lambda b: (b[0], -b[1]))
    # tails[k] = smallest last height of a chain of k + 1
    tails = []
    for w, h in order:
        k = bisect.bisect_left(tails, h)   # strictly rising
        if k == len(tails):
            tails.append(h)
        else:
            tails[k] = h
    return len(tails)
''', [
        "After sorting by width, a chain of boxes is a strictly rising run of heights (a subsequence, not necessarily neighbours), as long as boxes of equal width cannot both be in it. Sorting equal widths by falling height makes sure of that: their heights can never rise.",
        "The longest strictly rising subsequence is lesson 6's method: `tails[k]` is the smallest height that ends a chain of k + 1 boxes. `bisect_left` finds the first tail that is not smaller than h; h replaces it, or extends the longest chain.",
        "`tails` stays sorted, so each step is one binary search: O(n log n) with the sort. The O(n²) table that checks every earlier box is too slow for 100,000 boxes.",
        "`tails` is not itself a chain of boxes. To rebuild a chain, store for each box the box before it (lesson 9).",
    ]),
    7: ('''def edit_distance(a, b):
    # prev[j] = distance from a[:i - 1] to b[:j]
    prev = list(range(len(b) + 1))     # from '': insert j
    for i in range(1, len(a) + 1):
        cur = [i] + [0] * len(b)       # to '': delete i
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                cur[j] = prev[j - 1]   # last letters match
            else:
                cur[j] = 1 + min(prev[j - 1],  # replace
                                 prev[j],      # delete
                                 cur[j - 1])   # insert
        prev = cur
    return prev[len(b)]
''', [
        "The state is a pair of prefix lengths (i, j): the fewest edits that turn the first i letters of a into the first j letters of b. Row 0 is j insertions; column 0 is i deletions.",
        "Look at the last letters. If they are equal, keep both: the cost is that of the shorter prefixes. If not, the last edit is a replacement (both prefixes shrink), a deletion of a's last letter (i shrinks), or an insertion of b's last letter (j shrinks). Take the cheapest and add 1.",
        "Each cell needs the cell above, the cell to its left and the cell above-left, so two rows are enough: O(len(a) × len(b)) time and O(len(b)) space.",
        "Memoised recursion on two 1,000-letter strings goes up to 2,000 calls deep, past Python's limit, so it fails; the loop has no such limit.",
    ]),
    8: ('''def ways_to_pay(amount, coins):
    # ways[x] = ways to pay x with the coins seen so far
    ways = [1] + [0] * amount      # pay 0 with nothing
    for c in coins:                # coins on the outside
        for x in range(c, amount + 1):
            # the ways that use at least one more c
            ways[x] += ways[x - c]
    return ways[amount]
''', [
        "Counting each set of coins once means fixing an order in which the coins are used: all the first coin's uses, then the second's, and so on. Looping over coins on the outside does exactly that. After the loop for coin c, `ways[x]` counts the ways to pay x with the coins up to c.",
        "Inside, x goes upwards, so `ways[x - c]` already includes ways that use c. That lets a coin be used any number of times (lesson 8: left to right means unlimited copies).",
        "With amounts on the outside and coins inside, the count includes every order (1 + 2 and 2 + 1 separately): 7 for paying 4 with 1, 2 and 3, instead of 4.",
        "O(amount × number of coins) additions. The counts grow large, and Python's whole numbers keep them exact.",
    ]),
    9: ('''def pack(items, cap):
    n = len(items)
    # best[i][x] = best value from the first i items
    # in a bag that holds x kilograms
    best = [[0] * (cap + 1)]
    for w, v in items:
        prev = best[-1]
        row = prev[:]                  # skip the item
        for x in range(w, cap + 1):
            if prev[x - w] + v > row[x]:
                row[x] = prev[x - w] + v   # take it
        best.append(row)
    # walk back from the last row
    chosen = []
    x = cap
    for i in range(n, 0, -1):
        if best[i][x] != best[i - 1][x]:   # item i - 1 taken
            chosen.append(i - 1)
            x -= items[i - 1][0]
    return chosen[::-1]
''', [
        "The forward pass is the 0/1 knapsack table of lesson 8, but every row is kept. The one-row version gives the best value, not the choice.",
        "Walking back: at row i with x kilograms left, if `best[i][x]` equals `best[i - 1][x]`, the best value is reachable without item i − 1, so skip it. Otherwise the item must have been taken: add it and move to x − its weight.",
        "Each step of the walk is O(1), so rebuilding costs O(n) after the O(n × cap) table. The table holds (n + 1) × (cap + 1) numbers; to save memory, store one bit per cell for \"taken\" instead.",
        "When skipping and taking give the same value, this walk skips. Any best choice is accepted, so the tests check the facts (positions, weight, value) rather than one list.",
    ]),
})
