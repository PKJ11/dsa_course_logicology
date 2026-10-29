// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def count_ways(n):
    a, b, c = 1, 0, 0      # count_ways(0), count_ways(-1), count_ways(-2)
    for _ in range(n):
        a, b, c = a + b + c, a, b
    return a
`;

export const notes = [
  "The first move is 1, 2 or 3 steps, and what is left is a smaller staircase. So count_ways(n) = count_ways(n − 1) + count_ways(n − 2) + count_ways(n − 3). Each sequence of moves is counted once, by its first move.",
  "count_ways(0) = 1 (the empty sequence) and there are no ways to go up a negative number of steps. Starting with b = c = 0 for the heights −1 and −2 makes the first few passes come out right without special cases.",
  "Plain recursion repeats the same heights, a tree of about 1.84ⁿ calls (n copies of 1.84 multiplied together). A memo makes it O(n) calls, but n = 10,000 frames deep is too deep for Python.",
  "The loop fills the answers from the bottom up and keeps only the last three: O(n) additions and O(1) names. (The numbers themselves grow to thousands of digits, so each addition costs a little more as n grows.)",
];
