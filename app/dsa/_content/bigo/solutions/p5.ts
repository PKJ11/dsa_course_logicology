// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `import math

def master(a, b, d):
    if a < b ** d:                    # the top level decides
        return (d, 0)
    if a == b ** d:                   # every level the same
        return (d, 1)
    return (round(math.log(a, b), 3), 0)   # the bottom level decides
`;

export const notes = [
  "Level k of the recursion tree does nᵈ × (a / bᵈ)ᵏ work, where a power such as bᵈ means d copies of b multiplied together. The ratio a / bᵈ decides the case: below 1 the top level decides the total, equal to 1 every level is the same, above 1 the bottom level decides.",
  "In the equal case there are about log base b of n levels (the number of times you can divide n by b), each doing nᵈ work, so T(n) is Θ(nᵈ log n): the pair (d, 1).",
  "In the bottom case the last level has a to the power (log base b of n) calls. That equals n to the power (log base b of a), so p = log base b of a: the power b must be raised to, to give a.",
  "`a` and `b ** d` are whole numbers, so comparing them is exact. Comparing `math.log(a, b)` with `d` instead can go wrong: `math.log(125, 5)` is 3.0000000000000004, not 3.",
];
