# Naive and buggy CORR solutions and the tests (0-based) that must catch them.
NAIVE = {
    1: ('''
def is_sorted(times):
    return len(times) == 0 or times[0] <= times[-1]
''', [6]),
    2: ('''
def second_largest(speeds):
    s = sorted(speeds)
    return s[-2] if len(s) >= 2 else None
''', [1, 3]),
    3: ('''
def sort_coaches(coaches):
    for i in range(len(coaches)):
        for j in range(len(coaches) - 1 - i):
            if coaches[j] > coaches[j + 1]:
                coaches[j], coaches[j + 1] = coaches[j + 1], coaches[j]
''', [7]),
    4: ('''
def counterexample(which):
    return {1: [2, 1], 2: [1, 2], 3: [1, 2], 4: [3, 5]}[which]
''', [0, 1, 2, 3]),
    5: ('''
def best_stretch(a):
    best = a[0]
    for i in range(len(a)):
        s = 0
        for j in range(i, len(a)):
            s += a[j]
            best = max(best, s)
    return best
''', [7]),
}
