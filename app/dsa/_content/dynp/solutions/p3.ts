// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def decode_ways(s):
    MOD = 1_000_000_007
    # ways for the first i - 2 and the first i - 1 digits
    before, cur = 1, 1             # empty prefix: one way
    for i in range(1, len(s) + 1):
        ways = 0
        if s[i - 1] != "0":        # the last digit alone
            ways += cur
        if i >= 2:                 # the last two digits together
            pair = s[i - 2:i]
            if "10" <= pair <= "26":
                ways += before
        before, cur = cur, ways % MOD
    return cur
`;

export const notes = [
  "The state is the length of the prefix read so far. The last letter of a decoding of `s[:i]` is either the last digit alone (if it is not 0) or the last two digits together (if they make 10 to 26). So ways(i) = ways(i − 1) + ways(i − 2), each term only when its letter is allowed.",
  "Comparing the two-digit string with `\"10\"` and `\"26\"` works because both have two digits: it rules out a leading zero (`\"06\"`) and anything above 26 in one step.",
  "Each prefix needs only the two before it, so two names are enough: O(n) time and O(1) space. A loop has no depth limit. Memoised recursion on 100,000 digits goes 100,000 calls deep, far past Python's limit of about 1,000, so it fails.",
  "Taking the remainder after each step keeps the numbers small. The remainder of a sum is the remainder of the sum of remainders, so the answer is the same as taking the remainder of the full count at the end.",
];
