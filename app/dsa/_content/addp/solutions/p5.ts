// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `from functools import cache

def count_no_repeat(a, b):
    def upto(x):
        if x < 0:
            return 0
        s = str(x)

        @cache
        def go(i, prev, tight, started):
            if i == len(s):
                return 1
            top = int(s[i]) if tight else 9
            total = 0
            for d in range(top + 1):
                if started and d == prev:
                    continue
                now = started or d != 0
                total += go(i + 1, d if now else -1, tight and d == top, now)
            return total
        return go(0, -1, True, False)
    return upto(b) - upto(a - 1)
`;

export const notes = [
  "Count from 0 up to a limit, and take f(b) − f(a − 1) (lesson 5). f(−1) is 0.",
  "go(i, prev, tight, started) counts the ways to fill places i to the end. tight says the digits so far equal the limit's, so the next digit is at most the limit's digit there. started is False while only zeros have been placed: those zeros are not digits of the number, so they are not compared with the next digit. prev is the last real digit (−1 before the start).",
  "The number 0 itself is all zeros and never starts; it is counted once, at the end of the digits, as the problem asks.",
  "A direct count also works: 1 for the number 0, plus 9 ** k for each shorter length k, plus a walk along the limit's digits that adds 9 ** (places left) for every smaller allowed digit, stopping when the limit itself repeats a digit. Both are tiny: at most 19 places.",
];
