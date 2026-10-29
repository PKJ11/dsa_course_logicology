from solgen import write_station

write_station("sort", 8, {
    1: ('''def insertion_sort(a):
    for i in range(1, len(a)):
        key = a[i]
        j = i - 1
        while j >= 0 and a[j] > key:   # stop at the first value <= key
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = key
''', [
        "Invariant: at the start of pass i, a[0..i-1] holds the first i values in sorted order. The pass slides a[i] left past every bigger value, so after it a[0..i] is sorted.",
        "Each move of the inner loop fixes one inversion, a pair in the wrong order. So the total time is O(n + I) for I inversions.",
        "In the nearly sorted test, every value is at most 3 places from where it belongs, so I is at most 3n and the sort takes O(n). Selection sort would still make n(n − 1) / 2 comparisons.",
        "`a[j] > key`, not `>=`, means equal values never pass each other. That makes the sort stable, and saves moves.",
    ]),
    2: ('''def merge_sort(a):
    if len(a) <= 1:
        return list(a)                 # a copy, already sorted
    mid = len(a) // 2
    left = merge_sort(a[:mid])
    right = merge_sort(a[mid:])
    out = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:        # ties take the left: stable
            out.append(left[i])
            i += 1
        else:
            out.append(right[j])
            j += 1
    out.extend(left[i:])               # one of these is empty
    out.extend(right[j:])
    return out
''', [
        "Correct by strong induction on the length: lists of 0 or 1 values are sorted; for longer lists both halves are shorter, so they come back sorted, and merging two sorted lists gives a sorted list.",
        "The merge moves one value per pass, so each level of the recursion does O(n) work in total. There are about log₂ n levels: O(n log n) time on every input.",
        "The slices `a[:mid]` and `a[mid:]` copy, which adds O(n) per level: still O(n log n). Passing index ranges instead saves that copying but not the merge buffer, so merge sort needs O(n) extra space either way.",
        "`list(a)` in the base case returns a new list, so the caller's list is never changed or shared.",
    ]),
    3: ('''def count_inversions(a):
    def go(a):                          # returns (sorted copy, inversions)
        if len(a) <= 1:
            return list(a), 0
        mid = len(a) // 2
        left, x = go(a[:mid])
        right, y = go(a[mid:])
        out = []
        count = x + y
        i = j = 0
        while i < len(left) and j < len(right):
            if left[i] <= right[j]:
                out.append(left[i])
                i += 1
            else:
                out.append(right[j])
                j += 1
                count += len(left) - i  # right[j] beats every waiting left value
        out.extend(left[i:])
        out.extend(right[j:])
        return out, count
    return go(a)[1]
''', [
        "Every inversion (i < j, a[i] > a[j]) has both positions in the left half, both in the right half, or one in each. The recursive calls count the first two kinds.",
        "For the cross pairs: the halves are sorted, and sorting a half does not change which left value is bigger than which right value. When right[j] is taken while left[i] waits, right[j] is smaller than left[i], left[i + 1], …, which is len(left) − i inversions.",
        "On a tie the left value is taken first, so equal values are never counted.",
        "The work is merge sort's: O(n log n), instead of O(n²), n times n, for checking every pair.",
    ]),
    4: ('''import random

def kth_smallest(a, k):
    while True:
        p = random.choice(a)
        less = [x for x in a if x < p]
        equal = [x for x in a if x == p]
        if k < len(less):
            a = less
        elif k < len(less) + len(equal):
            return p
        else:
            k -= len(less) + len(equal)
            a = [x for x in a if x > p]
''', [
        "Invariant: the answer is the value at index k of sorted(a), for the current a and k. Splitting into less, equal and greater keeps it true: whichever part holds index k becomes the new a, with k shifted if needed.",
        "The random pivot means no input is bad every time. On average each round keeps at most about three quarters of the values, so the total work is O(n) expected.",
        "The equal part handles repeats. When every value is the same, the first round puts all of them in `equal` and returns at once.",
        "The input is never changed: each round builds new lists. That costs O(n) extra space; Lomuto partitioning on a copy uses one copy and then works in place.",
        "`random.choice(a)` needs a to be non-empty, which holds because k is always a valid index into a.",
    ]),
    5: ('''def sort_ages(ages):
    count = [0] * 151                 # ages 0 to 150
    for x in ages:
        count[x] += 1
    out = []
    for v in range(151):
        out.extend([v] * count[v])
    return out
''', [
        "No two ages are ever compared, so the n log n lower bound of lesson 5 does not apply.",
        "Two passes: n to count, and 151 to write out. That is O(n + k) time with k = 151, and O(k) extra space for the counters.",
        "`out.extend([v] * count[v])` adds all copies of v in one step, which in Python is much faster than appending them one by one.",
        "This version loses nothing because the values are the records. To sort records by age, use the stable version from lesson 6 with starting positions.",
    ]),
    6: ('''def arrange_board(trains):
    by_time = sorted(trains, key=lambda t: t[2], reverse=True)
    board = sorted(by_time, key=lambda t: t[1])
    return [t[0] for t in board]
''', [
        "Sort by the less important field first and the most important field last. The second sort is stable, so among trains on the same platform the time order from the first sort is kept.",
        "`reverse=True` gives the latest time first, and Python keeps equal items in their original order even when reversing, so trains with the same time keep their input order.",
        "'HH:MM' strings sort correctly as text because they have a fixed length and leading zeros. '9:05' without the zero would sort after '10:30'.",
        "A one-sort version converts the time to minutes and negates it: `key=lambda t: (t[1], -minutes(t[2]))`.",
        "Two sorts are O(n log n). `sorted()` returns new lists, so `trains` is unchanged.",
    ]),
})
