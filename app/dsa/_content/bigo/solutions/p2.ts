// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def count_steps(n):
    first = n * (n + 1) // 2     # n + (n - 1) + ... + 1
    second = 2 * n               # n passes, adding 2 each
    return first + second
`;

export const notes = [
  "For a given `i`, the inner loop runs for `j` from `i` to `n - 1`, which is `n - i` times. As `i` goes from 0 to `n - 1`, that is n, n − 1, …, 1 runs.",
  "1 + 2 + … + n = n(n + 1) / 2. Write the sum forwards and backwards: each of the n columns adds to n + 1, so two copies make n(n + 1).",
  "The second loop adds 2 on each of its n passes, which is 2n. Loops one after the other add.",
  "`//` keeps the answer an int. `n * (n + 1)` is always even (one of two neighbouring numbers is even), so nothing is lost. A float has only about 16 significant digits, so `/` gives a wrong answer for n = 10¹⁸.",
  "The formula is O(1) arithmetic steps. Its leading term is n² / 2 (n times n, halved), so work(n) itself is Θ(n²).",
];
