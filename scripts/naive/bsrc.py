# Naive BSRC solutions and the tests (0-based) that must catch them.
NAIVE = {
    1: ('''
def search(platforms, target):
    for i, v in enumerate(platforms):
        if v == target:
            return i
    return -1
''', [10, 11]),
    2: ('''
def first_and_last(times, t):
    idx = [i for i, v in enumerate(times) if v == t]
    return [idx[0], idx[-1]] if idx else [-1, -1]
''', [7, 8]),
    4: ('''
def isqrt(n):
    return int(n ** 0.5)
''', [7, 9]),
    5: ('''
def search_rotated(a, target):
    return a.index(target) if target in a else -1
''', [9, 10]),
}
