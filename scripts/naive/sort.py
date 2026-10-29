# Naive and buggy SORT solutions and the tests (0-based) that must catch them.
NAIVE = {
    1: ('''
def insertion_sort(a):
    for i in range(len(a) - 1):
        m = i
        for j in range(i + 1, len(a)):
            if a[j] < a[m]:
                m = j
        a[i], a[m] = a[m], a[i]
''', [6]),
    2: ('''
def merge_sort(a):
    out = list(a)
    for i in range(1, len(out)):
        key = out[i]
        j = i - 1
        while j >= 0 and out[j] > key:
            out[j + 1] = out[j]
            j -= 1
        out[j + 1] = key
    return out
''', [6]),
    3: ('''
def count_inversions(a):
    c = 0
    for i in range(len(a)):
        for j in range(i + 1, len(a)):
            if a[i] > a[j]:
                c += 1
    return c
''', [5]),
    4: ('''
def kth_smallest(a, k):
    a = list(a)
    lo, hi = 0, len(a) - 1
    while True:
        p = a[hi]
        i = lo
        for j in range(lo, hi):
            if a[j] < p:
                a[i], a[j] = a[j], a[i]
                i += 1
        a[i], a[hi] = a[hi], a[i]
        if i == k:
            return a[i]
        if k < i:
            hi = i - 1
        else:
            lo = i + 1
''', [4, 5]),
    5: ('''
def sort_ages(ages):
    def ms(a):
        if len(a) <= 1:
            return list(a)
        m = len(a) // 2
        l, r = ms(a[:m]), ms(a[m:])
        out = []
        i = j = 0
        while i < len(l) and j < len(r):
            if l[i] <= r[j]:
                out.append(l[i]); i += 1
            else:
                out.append(r[j]); j += 1
        return out + l[i:] + r[j:]
    return ms(ages)
''', [4]),
    6: ('''
def arrange_board(trains):
    return [t[0] for t in sorted(trains, key=lambda t: (t[1], t[2]), reverse=True)]
''', [0]),
}
