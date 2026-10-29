from tb import build

S = "corr"

# P1 is_sorted
build(S, 1, "is_sorted", [
    {"name": "Sorted", "args": "([905, 1010, 1130, 1245],)", "show": "times = [905, 1010, 1130, 1245]",
     "why": "A sorted timetable should give True. If you got False, the comparison may be the wrong way round: check that each time is compared with the one after it, using <=."},
    {"name": "One pair out of order", "args": "([905, 1130, 1010, 1245],)", "show": "times = [905, 1130, 1010, 1245]", "trace": [905, 1130, 1010, 1245],
     "why": "1130 comes before 1010, so the answer is False. If you got True, the code may compare only the first and last times, or return True too early inside the loop."},
    {"name": "Out of order only at the end", "args": "([1, 2, 3, 4, 5, 6, 0],)", "show": "times = [1, 2, 3, 4, 5, 6, 0]", "trace": [1, 2, 3, 4, 5, 6, 0],
     "why": "Only the last pair is wrong. If this passes as True, your loop stops one pair early. With n times there are n - 1 pairs: i runs from 1 to n - 1, comparing times[i - 1] and times[i]."},
    {"name": "Equal times are allowed", "args": "([905, 905, 1010],)", "show": "times = [905, 905, 1010]",
     "why": "Two trains can leave at the same time. 'In order' means each time is at most the next one, so use <=, not <."},
    {"name": "Empty timetable", "args": "([],)", "show": "times = []",
     "why": "An empty timetable is in order: there is no pair that is out of order. An IndexError means the code reads times[0] without checking that the list is not empty."},
    {"name": "One train", "args": "([1200],)", "show": "times = [1200]",
     "why": "A single time is in order. Code that compares times[0] with times[1] fails here with an IndexError."},
    {"name": "First and last fine, middle wrong", "args": "([1, 5, 3, 9],)", "show": "times = [1, 5, 3, 9]",
     "why": "times[0] <= times[-1], but 5 > 3 in the middle. Checking the ends is not enough: every neighbouring pair must be checked."},
    {"name": "Descending", "args": "([9, 7, 5],)", "show": "times = [9, 7, 5]",
     "why": "Times that go down are not in order. If you got True, the comparison is reversed."},
    {"name": "500,000 times, one swap at the end", "args": "(list(range(500_000)) + [3],)", "expect": "False", "timeout": 4000, "show": "times = [0, 1, 2, …, 499999, 3]",
     "why": "Comparing the list with sorted(times) also works, but it sorts first. One pass over neighbouring pairs is enough. If this timed out, the code may compare every pair, not just neighbours."},
], trusted="""
def is_sorted(times):
    return all(times[i - 1] <= times[i] for i in range(1, len(times)))
""")

# P2 second largest distinct
build(S, 2, "second_largest", [
    {"name": "Different speeds", "args": "([110, 130, 90, 120],)", "show": "speeds = [110, 130, 90, 120]", "trace": [110, 130, 90, 120],
     "why": "The fastest is 130 and the next is 120. If you got 110 or 90, the code does not update the second value when the best value changes."},
    {"name": "Fastest repeated", "args": "([130, 110, 130],)", "show": "speeds = [130, 110, 130]", "trace": [130, 110, 130],
     "why": "130 appears twice, but the second fastest speed is 110. Equal values are the same speed. If you got 130, the code treats the second copy of the best as a new second best. Only update the second when the value is strictly between."},
    {"name": "Second best comes first", "args": "([120, 130, 90],)", "show": "speeds = [120, 130, 90]", "trace": [120, 130, 90],
     "why": "When a new best arrives, the old best becomes the second best. If you got 90, the code forgot to move the old best down."},
    {"name": "Only one speed", "args": "([100, 100, 100],)", "show": "speeds = [100, 100, 100]",
     "why": "All trains have the same speed, so there is no second speed: return None. If you got 100, the repeats were counted as different speeds."},
    {"name": "One train", "args": "([75],)", "show": "speeds = [75]",
     "why": "With one train there is no second speed: return None. If you got 75, the second name started equal to the first value. If you got an error, the code reads speeds[1] without checking the length."},
    {"name": "Two speeds", "args": "([60, 80],)", "show": "speeds = [60, 80]",
     "why": "The smallest case with an answer: 60. If you got 80 or None, the two names are set up wrongly before the loop: after the first two values, the largest must hold 80 and the second must hold 60."},
    {"name": "Negative values", "args": "([-5, -2, -9],)", "show": "speeds = [-5, -2, -9]",
     "why": "If you got None or 0, the starting values were 0. Start with None (or with the first value), not 0, so negative values work."},
    {"name": "Input not changed", "args": "([3, 1, 2],)", "expr": "(lambda a: [second_largest(a), a])(args[0])", "show": "a = [3, 1, 2]; returns [second_largest(a), a]",
     "why": "Do not sort or change the list you were given. If the second list changed, you called a.sort() or removed values from a."},
    {"name": "A million speeds", "args": "([(i * 7919) % 1_000_003 for i in range(1_000_000)],)", "timeout": 6000, "show": "speeds = 1,000,000 different values below 1,000,003",
     "why": "One pass with two names is enough. If this timed out, the code may search the list once for every value."},
], trusted="""
def second_largest(speeds):
    s = sorted(set(speeds))
    return s[-2] if len(s) >= 2 else None
""")

# P3 sort colours in place (Dutch flag)
IN_PLACE = "(lambda a: [sort_coaches(a), list(a)][1])(args[0])"
build(S, 3, "sort_coaches", [
    {"name": "A short train", "args": "([2, 0, 1, 2, 0],)", "expr": IN_PLACE, "show": "coaches = [2, 0, 1, 2, 0]; the list after the call", "trace": [2, 0, 1, 2, 0],
     "why": "After the call, the same list must read 0s, then 1s, then 2s. If the list is unchanged, your function built a new list and returned it. Change the list you were given."},
    {"name": "Already in order", "args": "([0, 0, 1, 1, 2],)", "expr": IN_PLACE, "show": "coaches = [0, 0, 1, 1, 2]",
     "why": "An ordered train must stay ordered. If values moved, a swap is happening when it should not. Check which pointer moves after each swap."},
    {"name": "Reversed", "args": "([2, 2, 1, 1, 0, 0],)", "expr": IN_PLACE, "show": "coaches = [2, 2, 1, 1, 0, 0]", "trace": [2, 2, 1, 1, 0, 0],
     "why": "After swapping a 2 to the back, the value that arrives at i has not been looked at yet. Do not move i forward after that swap: check the new value first."},
    {"name": "Only 1s and 2s", "args": "([2, 1, 2, 1],)", "expr": IN_PLACE, "show": "coaches = [2, 1, 2, 1]",
     "why": "With no 0s, the 0 region stays empty. If this fails, the code assumes there is at least one 0, or moves the 0 boundary when it should not."},
    {"name": "One coach", "args": "([1],)", "expr": IN_PLACE, "show": "coaches = [1]",
     "why": "One coach is already in order. An IndexError means a pointer starts outside the list or moves past it."},
    {"name": "Empty train", "args": "([],)", "expr": IN_PLACE, "show": "coaches = []",
     "why": "Nothing to do. If this fails, the code reads coaches[0] or sets a pointer to len - 1 and uses it without a check."},
    {"name": "Same list object", "args": "([1, 0, 2],)", "expr": "(lambda a: [sort_coaches(a) is None or True, a == [0, 1, 2]])(args[0])", "show": "coaches = [1, 0, 2]; was the original list put in order?",
     "why": "The tests read the list you were given after the call. Writing coaches = sorted(...) or coaches = new_list inside the function only changes the local name, not the caller's list. Assign into it with coaches[i] = …, or swap values in place."},
    {"name": "300,000 coaches", "args": "([(i * 7) % 3 for i in range(300_000)],)", "expr": "(lambda a: [sort_coaches(a), all(a[i] <= a[i + 1] for i in range(len(a) - 1)), a.count(0), a.count(1), a.count(2)][1:])(args[0])", "expect": "[True, 100000, 100000, 100000]", "timeout": 5000,
     "show": "coaches = [0, 1, 2, 0, 1, 2, …] (300,000 coaches); checks the order and the counts",
     "why": "One pass with three pointers handles each coach a constant number of times. If this timed out, the code moves coaches one place at a time, which is about n² steps (n times n)."},
], trusted="""
def sort_coaches(coaches):
    lo, i, hi = 0, 0, len(coaches) - 1
    while i <= hi:
        if coaches[i] == 0:
            coaches[lo], coaches[i] = coaches[i], coaches[lo]
            lo += 1
            i += 1
        elif coaches[i] == 1:
            i += 1
        else:
            coaches[i], coaches[hi] = coaches[hi], coaches[i]
            hi -= 1
""")

# P4 counterexamples
CHECK = {
    1: "(lambda a: isinstance(a, list) and all(type(x) is int for x in a) and sum(1 for i in range(1, len(a) - 1) if a[i] > a[i - 1]) != sum(1 for i in range(1, len(a)) if a[i] > a[i - 1]))(counterexample(1))",
    2: "(lambda a: isinstance(a, list) and len(a) > 0 and all(type(x) is int for x in a) and (a[0] <= a[-1]) != all(a[i] <= a[i + 1] for i in range(len(a) - 1)))(counterexample(2))",
    3: "(lambda a: isinstance(a, list) and len(a) > 0 and all(type(x) is int for x in a) and max(i for i in range(len(a)) if a[i] == max(a)) != a.index(max(a)))(counterexample(3))",
    4: "(lambda a: isinstance(a, list) and all(type(x) is int for x in a) and len(set(a)) >= 2 and sorted(a)[-2] != sorted(set(a))[-2])(counterexample(4))",
}
build(S, 4, "counterexample", [
    {"name": "Break count_rises", "args": "(1,)", "expr": CHECK[1], "expect": "True", "show": "a = counterexample(1); count_rises(a) must be wrong",
     "why": "count_rises stops one pair early: range(1, len(a) - 1) never reaches the last index. It is wrong only when the last value is bigger than the one before it. If your list fails, look at its last two values."},
    {"name": "Break is_sorted", "args": "(2,)", "expr": CHECK[2], "expect": "True", "show": "a = counterexample(2); is_sorted(a) must be wrong",
     "why": "This is_sorted compares only the first and last values. Find a list where the ends are in order but a pair in the middle is not, such as a bigger value just before a smaller one."},
    {"name": "Break first_max_index", "args": "(3,)", "expr": CHECK[3], "expect": "True", "show": "a = counterexample(3); first_max_index(a) must be wrong",
     "why": "first_max_index moves to every value that is at least as big as the best so far, so on a tie it moves on. It is wrong only when the largest value appears more than once. A list with one largest value cannot break it."},
    {"name": "Break second_best", "args": "(4,)", "expr": CHECK[4], "expect": "True", "show": "a = counterexample(4); second_best(a) must be wrong",
     "why": "second_best takes the second value from the end of the sorted list. That is wrong when the largest value appears more than once. The list must still have at least two different values."},
    {"name": "Returns lists of whole numbers", "args": "()", "expr": "[type(counterexample(k)).__name__ for k in (1, 2, 3, 4)]", "expect": "['list', 'list', 'list', 'list']", "show": "the type of each answer",
     "why": "Each answer must be a list (not a tuple or a string), so that it meets the input condition of the function it breaks."},
], trusted="""
def counterexample(which):
    return {1: [1, 2], 2: [1, 3, 2, 4], 3: [5, 5], 4: [5, 5, 3]}[which]
""")

# P5 best stretch (Kadane)
build(S, 5, "best_stretch", [
    {"name": "Mixed gains and losses", "args": "([2, -5, 3, 4, -1, 2, -6, 1],)", "show": "a = [2, -5, 3, 4, -1, 2, -6, 1]", "trace": [2, -5, 3, 4, -1, 2, -6, 1],
     "why": "The best stretch is 3, 4, -1, 2 with sum 8. It crosses a small loss (-1) because the gain after it is bigger. If you got 7, the code restarts at every negative value. Restart only when the running sum itself drops below the current value."},
    {"name": "All positive", "args": "([1, 2, 3],)", "show": "a = [1, 2, 3]",
     "why": "With no losses, the best stretch is the whole line. If this fails, the running sum is reset too often."},
    {"name": "All negative", "args": "([-4, -2, -7],)", "show": "a = [-4, -2, -7]",
     "why": "The stretch must hold at least one value, so the answer is the least negative value, -2. If you got 0, the code allows an empty stretch, or starts best at 0. Start best at a[0]."},
    {"name": "One value", "args": "([-3],)", "show": "a = [-3]",
     "why": "One value is the only stretch: -3. Starting best at 0 gives 0 here, which is wrong."},
    {"name": "Best at the very end", "args": "([-1, -2, 5],)", "show": "a = [-1, -2, 5]",
     "why": "The best stretch is the last value. If you got less, the code may update best before adding the last value, or the loop stops one short."},
    {"name": "A big loss splits two gains", "args": "([6, -10, 7],)", "show": "a = [6, -10, 7]",
     "why": "6 + (-10) + 7 = 3, which is worse than 7 alone. When the running sum before a value is negative, drop it and start a new stretch at that value."},
    {"name": "Zeros", "args": "([0, -1, 0],)", "show": "a = [0, -1, 0]",
     "why": "The best sum is 0, a stretch of one 0. If you got -1, best was not updated after the first value, or the stretch was made to start at the -1. Compare best with the running sum after every value."},
    {"name": "200,000 values", "args": "([((i * 37) % 101) - 50 for i in range(200_000)],)", "timeout": 4000, "show": "a = 200,000 values between -50 and 50",
     "why": "Trying every start and end is about 20 billion sums. One pass is enough if you keep two numbers: the best sum of a stretch ending here, and the best sum seen anywhere."},
], trusted="""
def best_stretch(a):
    best = cur = a[0]
    for x in a[1:]:
        cur = max(x, cur + x)
        best = max(best, cur)
    return best
""")
