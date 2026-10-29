// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def ways_to_pay(amount, coins):
    # ways[x] = ways to pay x with the coins seen so far
    ways = [1] + [0] * amount      # pay 0 with nothing
    for c in coins:                # coins on the outside
        for x in range(c, amount + 1):
            # the ways that use at least one more c
            ways[x] += ways[x - c]
    return ways[amount]
`;

export const notes = [
  "Counting each set of coins once means fixing an order in which the coins are used: all the first coin's uses, then the second's, and so on. Looping over coins on the outside does exactly that. After the loop for coin c, `ways[x]` counts the ways to pay x with the coins up to c.",
  "Inside, x goes upwards, so `ways[x - c]` already includes ways that use c. That lets a coin be used any number of times (lesson 8: left to right means unlimited copies).",
  "With amounts on the outside and coins inside, the count includes every order (1 + 2 and 2 + 1 separately): 7 for paying 4 with 1, 2 and 3, instead of 4.",
  "O(amount × number of coins) additions. The counts grow large, and Python's whole numbers keep them exact.",
];
