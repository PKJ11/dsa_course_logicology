from tb import build

S = "sort"

# P1 insertion sort, in place (sorted blocked)
IN_PLACE = "(lambda a: [insertion_sort(a), list(a)][1])(args[0])"
build(S, 1, "insertion_sort", [
    {"name": "Mixed", "args": "([29, 10, 14, 37, 13, 5, 21],)", "expr": IN_PLACE, "show": "a = [29, 10, 14, 37, 13, 5, 21]; the list after the call", "trace": [29, 10, 14, 37, 13, 5, 21],
     "why": "The list itself must be sorted after the call. If it is unchanged, the function built a new list instead of changing a."},
    {"name": "Reversed", "args": "([5, 4, 3, 2, 1],)", "expr": IN_PLACE, "show": "a = [5, 4, 3, 2, 1]",
     "why": "Every value must travel to the front. If a value stops one place short, the inner loop's condition is j > 0 instead of j >= 0."},
    {"name": "Already sorted", "args": "([1, 2, 3, 4],)", "expr": IN_PLACE, "show": "a = [1, 2, 3, 4]", "why": "Nothing moves. Each inner loop stops after one comparison."},
    {"name": "Repeats", "args": "([3, 1, 3, 1, 2],)", "expr": IN_PLACE, "show": "a = [3, 1, 3, 1, 2]",
     "why": "[1, 1, 2, 3, 3]. Move a value left only past strictly bigger values (a[j] > key). Using >= also sorts, but it moves equal values past each other, which is extra work and not stable."},
    {"name": "Empty and one", "args": "()", "expr": "(lambda a, b: [insertion_sort(a), insertion_sort(b), a, b][2:])([], [7])", "expect": "[[], [7]]", "show": "a = [] and b = [7]",
     "why": "Nothing to do. An IndexError means the code reads a[0] or a[1] without checking the length."},
    {"name": "2,000 values", "args": "([(i * 7919) % 2003 for i in range(2_000)],)", "expr": "(lambda a: [insertion_sort(a), all(a[i] <= a[i + 1] for i in range(len(a) - 1)), len(a)][1:])(args[0])", "timeout": 6000,
     "show": "2,000 values in mixed order; [sorted?, length]",
     "why": "About a million moves: fine for insertion sort. If this timed out, the code may rebuild the list (with slices or insert) inside the loop."},
    {"name": "100,000 values, nearly in order", "args": "([i + (3 if i % 4 == 0 else -1) for i in range(100_000)],)", "expr": "(lambda a: [insertion_sort(a), all(a[i] <= a[i + 1] for i in range(len(a) - 1)), a[:6]][1:])(args[0])", "timeout": 4000,
     "show": "100,000 values, each at most 3 places from its sorted position; [sorted?, first six]",
     "why": "Insertion sort does one move per out-of-order pair, so a nearly sorted list takes about n steps. Selection sort always makes about n² / 2 comparisons (n times n, halved: 5 billion here) and times out. Stop the inner loop as soon as a[j] <= key."},
], trusted="""
def insertion_sort(a):
    for i in range(1, len(a)):
        key = a[i]
        j = i - 1
        while j >= 0 and a[j] > key:
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = key
""")

# P2 merge sort (sorted blocked)
build(S, 2, "merge_sort", [
    {"name": "Eight values", "args": "([38, 27, 43, 3, 9, 82, 10, 15],)", "show": "a = [38, 27, 43, 3, 9, 82, 10, 15]", "trace": [38, 27, 43, 3, 9, 82, 10, 15],
     "why": "[3, 9, 10, 15, 27, 38, 43, 82]. If values are missing, the merge forgets to copy what is left of one list after the other runs out."},
    {"name": "Odd length", "args": "([5, 1, 4, 2, 3],)", "show": "a = [5, 1, 4, 2, 3]", "why": "Halves of 2 and 3. If you get an endless recursion, the split must make both parts strictly shorter: mid = len(a) // 2 with a base case for length 0 and 1."},
    {"name": "Repeats", "args": "([2, 2, 1, 1, 2],)", "show": "a = [2, 2, 1, 1, 2]", "why": "[1, 1, 2, 2, 2]. If a value is missing or appears too often, the merge drops or copies a value on a tie: take exactly one value per pass, and copy what is left of both lists at the end."},
    {"name": "Empty and one", "args": "()", "expr": "[merge_sort([]), merge_sort([9])]", "expect": "[[], [9]]", "show": "merge_sort([]) and merge_sort([9])", "why": "Base cases: a list of 0 or 1 values is already sorted. Return a copy."},
    {"name": "Negative values", "args": "([0, -5, 3, -5, -1],)", "show": "a = [0, -5, 3, -5, -1]", "why": "[-5, -5, -1, 0, 3]. Merge sort only compares values, so negative values need nothing special. If they come out in the wrong place, the code sorts by something other than the value itself, such as abs(x) or str(x)."},
    {"name": "Input not changed", "args": "([3, 1, 2],)", "expr": "(lambda a: [merge_sort(a), a])(args[0])", "show": "a = [3, 1, 2]; returns [merge_sort(a), a]",
     "why": "Return a new sorted list and leave a as it was."},
    {"name": "100,000 values", "args": "([(i * 7919) % 100_003 for i in range(100_000)],)", "expr": "(lambda r: [len(r), all(r[i] <= r[i + 1] for i in range(len(r) - 1)), r[:3], r[-3:]])(merge_sort(args[0]))", "timeout": 8000,
     "show": "100,000 values; [length, sorted?, first three, last three]",
     "why": "n log n is about 1.7 million steps. If this timed out, the merge may use pop(0), which is O(n) each time; use two indexes instead."},
], trusted="""
def merge_sort(a):
    if len(a) <= 1:
        return list(a)
    mid = len(a) // 2
    left, right = merge_sort(a[:mid]), merge_sort(a[mid:])
    out = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            out.append(left[i]); i += 1
        else:
            out.append(right[j]); j += 1
    out.extend(left[i:]); out.extend(right[j:])
    return out
""")

# P3 count inversions
build(S, 3, "count_inversions", [
    {"name": "A few", "args": "([2, 4, 1, 3, 5],)", "show": "a = [2, 4, 1, 3, 5]", "trace": [2, 4, 1, 3, 5],
     "why": "The pairs out of order are (2, 1), (4, 1) and (4, 3): 3 inversions. If you got more, check that you count only pairs i < j with a[i] > a[j]."},
    {"name": "Sorted", "args": "([1, 2, 3, 4],)", "show": "a = [1, 2, 3, 4]", "why": "A sorted list has no inversions: 0. If you got more, the count is added when the left value is taken, or on ties. Add len(left) - i only when a value is taken from the right list."},
    {"name": "Reversed", "args": "([5, 4, 3, 2, 1],)", "show": "a = [5, 4, 3, 2, 1]", "why": "Every pair is out of order: 5 × 4 / 2 = 10."},
    {"name": "Equal values", "args": "([2, 2, 1],)", "show": "a = [2, 2, 1]",
     "why": "Equal values are not out of order, so the answer is 2, not 3. In the merge, take from the left list on a tie (<=), so no inversion is counted for equal values."},
    {"name": "Empty and one", "args": "()", "expr": "[count_inversions([]), count_inversions([7])]", "expect": "[0, 0]", "show": "[] and [7]", "why": "No pairs, no inversions: [0, 0]. If this failed with an error, the base case does not handle 0 or 1 values: return a count of 0 for them."},
    {"name": "100,000 values", "args": "([(i * 7919) % 100_003 for i in range(100_000)],)", "timeout": 8000, "show": "100,000 values in mixed order",
     "why": "Checking every pair is 5 billion comparisons. Count while merge sorting: when you take right[j] before left[i], add len(left) - i, the number of left values still waiting."},
], trusted="""
def count_inversions(a):
    def go(a):
        if len(a) <= 1:
            return list(a), 0
        mid = len(a) // 2
        left, x = go(a[:mid])
        right, y = go(a[mid:])
        out = []
        c = x + y
        i = j = 0
        while i < len(left) and j < len(right):
            if left[i] <= right[j]:
                out.append(left[i]); i += 1
            else:
                out.append(right[j]); j += 1
                c += len(left) - i
        out.extend(left[i:]); out.extend(right[j:])
        return out, c
    return go(a)[1]
""")

# P4 kth smallest (sorted and heapq blocked)
build(S, 4, "kth_smallest", [
    {"name": "Middle", "args": "([29, 10, 14, 37, 13, 5, 33, 18, 21], 4)", "show": "a = [29, 10, 14, 37, 13, 5, 33, 18, 21], k = 4",
     "why": "Sorted, the list is 5 10 13 14 18 21 29 33 37, and index 4 holds 18. k counts from 0."},
    {"name": "Smallest and largest", "args": "()", "expr": "[kth_smallest([4, 9, 1, 7], 0), kth_smallest([4, 9, 1, 7], 3)]", "expect": "[1, 9]", "show": "k = 0 and k = 3 on [4, 9, 1, 7]",
     "why": "k = 0 is the minimum and k = len(a) - 1 the maximum. If either fails, check the narrowing: after partitioning, keep lo..p-1 when k < p and p+1..hi when k > p."},
    {"name": "Repeats", "args": "([3, 1, 3, 3, 2, 3], 3)", "show": "a = [3, 1, 3, 3, 2, 3], k = 3", "why": "Sorted: 1 2 3 3 3 3, so index 3 is 3. If you got another value, the partition loses or moves equal values: every value equal to the pivot must end on one side of it, or in a middle part of its own."},
    {"name": "One value", "args": "([42], 0)", "show": "a = [42], k = 0", "why": "One value, so it is the answer: 42. If this failed with an error, the code partitions an empty range or picks a pivot from an empty part."},
    {"name": "300,000 values in order", "args": "(list(range(300_000)), 150_000)", "timeout": 5000, "show": "a = [0, 1, 2, …, 299999], k = 150000",
     "why": "With the last value as pivot, a sorted list gives the worst split every time: about n² / 2 steps (n times n, halved). Pick the pivot at random."},
    {"name": "300,000 equal values", "args": "([7] * 300_000, 123_456)", "timeout": 5000, "show": "a = 300,000 copies of 7, k = 123456",
     "why": "A two-way partition puts all the equal values on one side, so every round removes only one value. Use a three-way split (less, equal, greater) and stop when k lands in the equal part."},
    {"name": "500,000 mixed values", "args": "([(i * 7919) % 1_000_003 for i in range(500_000)], 250_000)", "timeout": 6000, "show": "500,000 values, k = 250000 (the median)",
     "why": "Quickselect looks at about 2n to 4n values here. Taking min() k times would be n × k steps. If you copy the list each round, copy only the part you keep."},
    {"name": "Input not changed", "args": "([5, 3, 1, 4, 2],)", "expr": "(lambda a: [kth_smallest(a, 2), a])(args[0])", "show": "a = [5, 3, 1, 4, 2]; returns [kth_smallest(a, 2), a]",
     "why": "Work on a copy if you partition in place, so the caller's list keeps its order."},
], trusted="""
def kth_smallest(a, k):
    return sorted(a)[k]
""")

# P5 counting sort for ages (sorted blocked)
# The input is a scattered block of the ages 0..150, repeated; built in C, so building and checking it costs
# almost nothing and the time measured is the learner's sort.
REPS = 9_934
SUMMARY = ("(lambda out: [len(out), out == [*__import__('itertools').chain.from_iterable([v] * 9_934 for v in range(151))], "
           "out[:3], out[len(out) // 2], out[-3:]])(sort_ages(args[0]))")
build(S, 5, "sort_ages", [
    {"name": "A few passengers", "args": "([34, 7, 61, 7, 0, 34, 150],)", "show": "ages = [34, 7, 61, 7, 0, 34, 150]",
     "why": "[0, 7, 7, 34, 34, 61, 150]. If 150 is missing, the counter list is one too short: ages go up to 150, so it needs 151 counters."},
    {"name": "Empty", "args": "([],)", "show": "ages = []", "why": "No ages: []. If this failed with an error, the code reads ages[0] or max(ages) on an empty list. A count list of 151 zeros works for any input."},
    {"name": "All the same", "args": "([20] * 5,)", "show": "ages = [20, 20, 20, 20, 20]", "why": "Five 20s: [20, 20, 20, 20, 20]. If you got one 20, the code writes each age once instead of count[v] times."},
    {"name": "Input not changed", "args": "([3, 1, 2],)", "expr": "(lambda a: [sort_ages(a), a])(args[0])", "show": "a = [3, 1, 2]; returns [sort_ages(a), a]", "why": "Return a new list and leave the input alone. If the second list changed, the code wrote the sorted ages back into ages."},
    {"name": "1.5 million passengers", "args": "([(i * 7919) % 151 for i in range(151)] * REPS,)".replace("REPS", str(REPS)), "expr": SUMMARY, "timeout": 2500,
     "show": "1,500,034 ages from 0 to 150; [length, exactly right?, first three, middle, last three]",
     "why": "Counting is two short passes: O(n + 151). A comparison sort written in Python needs about 30 million steps here and runs out of time."},
], trusted="""
def sort_ages(ages):
    count = [0] * 151
    for x in ages:
        count[x] += 1
    out = []
    for v in range(151):
        out.extend([v] * count[v])
    return out
""")

# P6 departure board (sorted allowed)
B1 = "([['Rajdhani', 3, '16:55'], ['Shatabdi', 1, '06:00'], ['Duronto', 3, '23:10'], ['Garib Rath', 1, '17:40'], ['Mail', 2, '09:15']],)"
build(S, 6, "arrange_board", [
    {"name": "Five trains", "args": B1, "show": "trains = [[name, platform, time], …] (five trains)",
     "why": "Platform 1 first, then 2, then 3. On platform 1, Garib Rath (17:40) comes before Shatabdi (06:00): latest first. If the platforms come out 3, 2, 1, reverse=True was applied to the whole key."},
    {"name": "Equal times keep their order", "args": "([['A', 1, '10:00'], ['B', 1, '12:00'], ['C', 1, '10:00'], ['D', 1, '12:00']],)", "show": "four trains on platform 1, two at 10:00 and two at 12:00",
     "why": "['B', 'D', 'A', 'C']: 12:00 before 10:00, and trains with the same time stay in their original order (B before D, A before C). Python's sort is stable, also with reverse=True."},
    {"name": "Times as text", "args": "([['X', 2, '09:05'], ['Y', 2, '10:30'], ['Z', 2, '23:59']],)", "show": "three trains on platform 2",
     "why": "'HH:MM' strings compare correctly as text, because they have the same length and leading zeros. Latest first: Z, Y, X."},
    {"name": "Empty board", "args": "([],)", "show": "trains = []", "why": "No trains: []. If this failed with an error, the code reads trains[0] before checking that the list has any trains."},
    {"name": "Input not changed", "args": B1, "expr": "(lambda t: [arrange_board(t)[0], t[0][0]])(args[0])", "show": "returns [the first name on the board, the first train in the input]",
     "why": "Use sorted(), which makes a new list. trains.sort() would reorder the caller's list."},
    {"name": "100,000 trains", "args": "([[f'T{i}', (i * 7) % 12 + 1, f'{(i * 13) % 24:02d}:{(i * 7) % 60:02d}'] for i in range(100_000)],)",
     "expr": "(lambda r: [len(r), r[:3], r[-3:]])(arrange_board(args[0]))", "timeout": 5000, "show": "100,000 trains on 12 platforms; [length, first three, last three]",
     "why": "sorted() with a key is O(n log n) and fast. If this timed out, the code may sort inside a loop."},
], trusted="""
def arrange_board(trains):
    by_time = sorted(trains, key=lambda t: t[2], reverse=True)
    return [t[0] for t in sorted(by_time, key=lambda t: t[1])]
""")
