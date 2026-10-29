from solgen import write_station

write_station("grdy", 5, {
    1: ('''def how_much(capacity, items):
    # positions, most value per kg first
    order = sorted(range(len(items)), key=lambda i: items[i][1] / items[i][0], reverse=True)
    take = [0] * len(items)           # kilograms of each item, in the order given
    for i in order:
        if capacity <= 0:
            break                     # the bag is full
        take[i] = min(items[i][0], capacity)   # all of it, or what fits
        capacity -= take[i]
    return take
''', [
        "Think of the bag as `capacity` separate kilograms. Each kilogram is worth the value per kg of whatever fills it, so the best bag fills every kilogram with the best value per kg still available. That is exactly what taking items in order of `value / weight` does.",
        "Sort the positions, not the items, so each amount can be written at its item's own place in the answer. Only the last item taken can be cut: every item before it fitted whole. After it the bag is full and the loop stops; the rest stay 0.",
        "The exchange proof (lesson 2): if a best bag held less of a better item than it could, swapping one kilogram of a worse item for it would not lower the value. When two items have the same value per kg, either can be cut: the tests check the value of the plan, so any best plan passes.",
        "Sorting is O(n log n) and the walk O(n). Sorting by value or by weight alone fails: see the tests \"Valuable but heavy\" and \"Light but cheap\".",
    ]),
    2: ('''def least_lateness(jobs):
    t = worst = 0
    for length, due in sorted(jobs, key=lambda j: j[1]):  # earliest deadline first
        t += length                   # this job finishes at t
        worst = max(worst, t - due)   # stays 0 while everything is on time
    return worst
''', [
        "Earliest deadline first is a best order. If a job runs just before a neighbour that is due earlier, swapping them never raises the largest lateness: the earlier-due job finishes sooner, and the other one now finishes when the first used to, against a later deadline.",
        "Repeating such swaps turns any order, including a best one, into the deadline order without making it worse. So the deadline order is best too.",
        "`worst` starts at 0, so a job that finishes early counts as late by 0, not by a negative amount, and an empty list gives 0.",
        "Shortest first and least slack first both fail; the tests include a two-job example for each. O(n log n) for the sort.",
    ]),
    3: ('''def most_bookings(bookings):
    # positions, sorted by the end time of their booking
    order = sorted(range(len(bookings)), key=lambda i: bookings[i][1])
    chosen = []
    free = float("-inf")          # the room is free from here
    for i in order:
        start, end = bookings[i]
        if start >= free:         # fits after the last choice
            chosen.append(i)
            free = end
    return chosen
''', [
        "Sorting the positions rather than the bookings keeps each booking's index, which the answer needs.",
        "Taking the booking that ends first leaves the room free as early as possible. Lesson 3's \"greedy stays ahead\" proof shows that the i-th choice always ends no later than the i-th booking of any best set, so no set can have more bookings.",
        "Bookings are taken in order of end, so a new one overlaps a chosen one exactly when it starts before `free`; one comparison is enough. `start >= free` (not `>`) lets a booking start the moment the last one ends.",
        "`free` starts at minus infinity because times can be negative. The chosen positions come out in time order. O(n log n).",
    ]),
    4: ('''import heapq

def platforms(trains):
    busy = []                         # departure times, smallest on top
    for arrive, depart in sorted(trains):
        if busy and busy[0] <= arrive:
            heapq.heapreplace(busy, depart)   # that platform is free: reuse it
        else:
            heapq.heappush(busy, depart)      # every platform is busy: open one
    return len(busy)
''', [
        "Trains are taken in order of arrival. The heap holds one departure time per platform; its smallest is the platform that frees up first. If even that one is still busy, every platform is busy.",
        "The method opens a new platform only when every open platform holds a train at that moment, so it never uses more platforms than the largest number of trains in at once, and no plan can use fewer.",
        "`<=` makes a platform free again at its train's departure time (the times are half-open).",
        "O(n log n). The event method also works: sort (time, +1 or -1) pairs so that -1 comes first at equal times, and keep the largest running total.",
    ]),
    5: ('''import heapq

def huffman(counts):
    # entries are (weight, n, tree); n is unique, so trees are never compared
    heap = [(w, n, letter) for n, (letter, w) in enumerate(counts.items())]
    heapq.heapify(heap)
    if len(heap) == 1:
        return {heap[0][2]: "0"}      # one letter still needs one bit
    n = len(heap)
    while len(heap) > 1:
        wa, _, a = heapq.heappop(heap)    # the two lightest trees
        wb, _, b = heapq.heappop(heap)
        heapq.heappush(heap, (wa + wb, n, (a, b)))
        n += 1
    codes = {}
    stack = [(heap[0][2], "")]
    while stack:
        tree, code = stack.pop()
        if isinstance(tree, tuple):       # a join: (left, right)
            stack.append((tree[0], code + "0"))
            stack.append((tree[1], code + "1"))
        else:
            codes[tree] = code            # a leaf: a letter
    return codes
''', [
        "A leaf is the letter itself and a joined tree is a pair `(left, right)`. The letters are strings, never tuples, so `isinstance(tree, tuple)` tells the two apart.",
        "The counter `n` in each heap entry is unique, so when two weights are equal Python compares the counters and never reaches the trees (comparing a string with a tuple would raise an error).",
        "Each join takes the two lightest trees, which lesson 4 proves is safe: some best tree has the two rarest letters side by side at the bottom.",
        "The codes are read off the leaves of one tree, so none is the start of another. The walk uses a stack instead of recursion. k − 1 joins at O(log k) each: O(k log k).",
    ]),
    6: ('''def first_failure(coins):
    coins = sorted(coins)
    if len(coins) < 2:
        return None
    big = coins[::-1]                 # largest first, for the greedy count
    limit = coins[-1] + coins[-2]     # any failure shows up below this
    fewest = [0] * limit
    for x in range(1, limit):
        best = x                      # x coins of 1 always work
        for c in coins:
            if c > x:
                break
            if fewest[x - c] < best:
                best = fewest[x - c]
        fewest[x] = best + 1          # the last coin c, plus the best for x - c
        g, y = 0, x                   # how many coins greedy uses
        for c in big:
            g += y // c
            y %= c
        if g > fewest[x]:
            return x
    return None
''', [
        "Kozen and Zaks (1994): if the largest-coin-first method fails for any amount, the smallest such amount is below the sum of the two largest coins. So only amounts below `limit` need checking.",
        "`fewest[x]` is built from smaller amounts: the best way to pay x ends with some coin c, and before it is the best way to pay x − c. This is dynamic programming (DYNP).",
        "The greedy count takes as many of each coin as fit, from the largest down: `y // c` coins of value c, leaving `y % c`.",
        "The first amount where greedy uses more coins is the answer, because amounts are checked in increasing order. O(limit × k) time and O(limit) memory. Pearson (1994) found an O(k³) test that needs no table at all.",
    ]),
})
