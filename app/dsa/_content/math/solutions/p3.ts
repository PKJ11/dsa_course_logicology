// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def ways_mod(n, steps, m):
    k = max(steps)
    # The column (w(n), w(n-1), ..., w(n-k+1)) times M gives the next one.
    M = [[0] * k for _ in range(k)]
    for s in steps:
        M[0][s - 1] = 1                # w(n+1) adds w(n+1-s) for each move s
    for i in range(1, k):
        M[i][i - 1] = 1                # shift the other values down

    def mul(A, B):
        return [[sum(A[i][t] * B[t][j] for t in range(k)) % m
                 for j in range(k)] for i in range(k)]

    R = [[int(i == j) for j in range(k)] for i in range(k)]
    while n:
        if n & 1:
            R = mul(R, M)
        M = mul(M, M)
        n >>= 1
    # start column for n = 0 is (1, 0, ..., 0), so w(n) is the top-left entry
    return R[0][0] % m
`;

export const notes = [
  "w(n) = the sum of w(n − s) over the allowed moves s: the last move of a way up is one of them, and before it the way up reached n − s. With w(0) = 1 and w of a negative number 0, this is a linear rule over the last k = max(steps) values.",
  "The k × k matrix's top row makes the next value from the last k; the other rows copy the values one place down. So Mⁿ times the starting column (1, 0, …, 0) gives (w(n), …), and w(n) is entry [0][0] of Mⁿ.",
  "Raising M to the power n by squaring takes about log₂ n squarings and as many products: 60 each for n = 10¹⁸, each costing k³ ≤ 1,000 multiplications. Taking % m after every product keeps the entries below m.",
  "`% m` at the end handles n = 0 with m = 1, where the identity matrix is returned unreduced. A plain loop over n would need 10¹⁸ steps.",
];
