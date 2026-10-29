import sys
sys.path.insert(0, r"D:/claude/dsa-self-paced/public/dsa")
from tb import build
from trusted_bits import CLOSEST, GRAY, NEXT, ONES, WRAP

S = "bits"


# Pseudo-random numbers built inside a test's args (no random module, so CPython and Pyodide agree).
def nums(n, m, mod, sub=0, seed=13):
    return f"[(k * k * {m} + k * 104729 + {seed}) % {mod} - {sub} for k in range({n})]"


# ---------- P1: wrap to w bits ----------

build(S, 1, "wrap", [
    {"name": "The example", "args": "(200, 8)", "show": "wrap(200, 8)",
     "why": "−56. 200 is 11001000 in 8 bits. The top bit is worth −128, not +128, so the value is −128 + 64 + 8 = −56."},
    {"name": "Top bit 0", "args": "(127, 8)", "show": "wrap(127, 8)",
     "why": "127. In 8 bits, 127 is 01111111. The top bit is 0, so nothing changes."},
    {"name": "Just past the top", "args": "(128, 8)", "show": "wrap(128, 8)",
     "why": "−128. 128 is 10000000: only the top bit is 1, and it is worth −128. This is the smallest 8-bit number."},
    {"name": "All ones", "args": "(255, 8)", "show": "wrap(255, 8)",
     "why": "−1. 11111111 is −128 + 127 = −1. All ones always means −1, whatever the width."},
    {"name": "Bits above the width", "args": "(256 + 5, 8)", "show": "wrap(261, 8)",
     "why": "5. 261 is 1 00000101 in 9 bits. Only the lowest 8 bits are kept, so the 1 in place 8 is dropped. Use x & 0xFF (or x % 256) to keep the lowest 8 bits."},
    {"name": "Already negative", "args": "(-6, 8)", "show": "wrap(-6, 8)",
     "why": "−6. It fits in 8 bits, so it stays as it is. In Python, -6 & 0xFF is 250 (11111010), and reading 11111010 with the top bit worth −128 gives −6 again."},
    {"name": "Too negative", "args": "(-129, 8)", "show": "wrap(-129, 8)",
     "why": "127. −129 does not fit in 8 bits: its lowest 8 bits are 01111111. Python's & works on negative numbers as if they had endless 1s on the left, so -129 & 0xFF = 127."},
    {"name": "One bit", "args": "()", "expr": "[wrap(0, 1), wrap(1, 1), wrap(2, 1), wrap(3, 1), wrap(-1, 1)]",
     "show": "[wrap(0, 1), wrap(1, 1), wrap(2, 1), wrap(3, 1), wrap(-1, 1)]",
     "why": "[0, −1, 0, −1, −1]. With one bit, that bit is the top bit, so it is worth −1. A width of 1 holds only 0 and −1."},
    {"name": "A 32-bit counter overflows", "args": "(2 ** 31, 32)", "show": "wrap(2 ** 31, 32)",
     "why": "−2,147,483,648. This is 2,147,483,647 + 1 on a 32-bit machine: the largest 32-bit number plus 1 becomes the smallest."},
    {"name": "A 32-bit product", "args": "(123456789 * 987654321, 32)", "show": "wrap(123456789 * 987654321, 32)",
     "why": "The product has 57 bits. A 32-bit machine keeps only the lowest 32 and reads the top one as negative."},
    {"name": "64 bits", "args": "(2 ** 64 - 5, 64)", "show": "wrap(2 ** 64 - 5, 64)",
     "why": "−5. 2⁶⁴ − 5 is 64 bits that read as −5: 2⁶⁴ − 5 and −5 differ by exactly 2⁶⁴."},
    {"name": "Every value, 5 bits", "args": "()", "expr": "[wrap(x, 5) for x in range(-40, 40)]",
     "show": "[wrap(x, 5) for x in range(-40, 40)]",
     "why": "5 bits hold −16 to 15. The answers rise to 15, then start again at −16 and rise again: the values wrap around every 32."},
    {"name": "Minus one, very wide", "args": "(-1, 200)", "show": "wrap(-1, 200)",
     "why": "−1. 200 ones. If you build the mask with a fixed width such as 0xFFFFFFFF, wide tests like this one fail."},
    {"name": "A huge number", "args": "(3 ** 1000, 100)", "show": "wrap(3 ** 1000, 100)",
     "why": "The lowest 100 bits of 3¹⁰⁰⁰, read with the top one worth −2⁹⁹. Shifts and masks work on Python whole numbers of any size."},
], trusted=WRAP)


# ---------- P2: from Gray code ----------

BIG_G = "(lambda x: x ^ (x >> 1))((1 << 1_000_000) // 3 + 12345)"
build(S, 2, "from_gray", [
    {"name": "The example", "args": "(6,)", "show": "from_gray(6)",
     "why": "4. 4 is 100, and 4 ^ (4 >> 1) = 100 ^ 010 = 110, which is 6."},
    {"name": "Zero", "args": "(0,)", "show": "from_gray(0)", "why": "0: the Gray code of 0 is 0."},
    {"name": "One", "args": "(1,)", "show": "from_gray(1)", "why": "1."},
    {"name": "The 3-bit order", "args": "()", "expr": "[from_gray(g) for g in [0, 1, 3, 2, 6, 7, 5, 4]]",
     "show": "[from_gray(g) for g in [0, 1, 3, 2, 6, 7, 5, 4]]",
     "why": "[0, 1, …, 7]. These are the Gray codes of 0 to 7 in order. Next to each other, they differ in one bit."},
    {"name": "All 4-bit codes", "args": "()", "expr": "[from_gray(g) for g in range(16)]", "show": "[from_gray(g) for g in range(16)]",
     "why": "Bit k of the answer is the XOR of the bits of g from the top down to place k. Check the top bit: it is the same in g and in the answer."},
    {"name": "A single 1 at the top", "args": "(1 << 20,)", "show": "from_gray(1 << 20)",
     "why": "2²¹ − 1, that is, 21 ones. Every bit of the answer is the XOR of the bits of g above it and at it, and the one 1 at the top makes every one of them 1."},
    {"name": "Alternating bits", "args": "(0b1010101010101010,)", "show": "from_gray(0b1010101010101010)",
     "why": "0b1100110011001100. Going down from the top, the running XOR flips at every 1 of g."},
    {"name": "Round trip up to 3,000", "args": "()", "expr": "all(from_gray(n ^ (n >> 1)) == n for n in range(3000))",
     "show": "all(from_gray(n ^ (n >> 1)) == n for n in range(3000))",
     "why": "True. Your function must undo n ^ (n >> 1) for every n. If this fails and the small tests pass, look at numbers whose top bit is in a different place."},
    {"name": "A million bits", "args": f"({BIG_G},)", "timeout": 2000,
     "expr": "(lambda n: [n.bit_length(), n % 1_000_000_007])(from_gray(args[0]))",
     "show": "from_gray(g) for a g of 1,000,000 bits; shows [bit_length, remainder after dividing by 1,000,000,007]",
     "why": "A loop that shifts g one place at a time does a million shifts, and each shift copies the whole number: about 10¹² bit steps, far too slow. "
            "Shift by 1, then 2, then 4, … : about 20 shifts in all (lesson 2)."},
    {"name": "A million ones", "args": "(1 << 999_999,)", "timeout": 2000,
     "expr": "(lambda n: [n.bit_length(), n.bit_count()])(from_gray(args[0]))",
     "show": "from_gray(1 << 999_999); shows [bit_length, number of 1 bits]",
     "why": "[1000000, 1000000]: the answer is a million ones. Again, about 20 shifts are enough; one shift per bit is too slow."},
], trusted=GRAY)


# ---------- P3: the next number with the same number of 1 bits ----------

build(S, 3, "next_same_ones", [
    {"name": "The example", "args": "(6,)", "show": "next_same_ones(6)",
     "why": "9. 6 is 110 (two 1s). 7 is 111 (three 1s), 8 is 1000 (one 1), and 9 is 1001 (two 1s)."},
    {"name": "One", "args": "(1,)", "show": "next_same_ones(1)", "why": "2: a single 1 moves up one place."},
    {"name": "A run at the bottom", "args": "(7,)", "show": "next_same_ones(7)",
     "why": "11, which is 1011. The top 1 of the run moves up one place, and the other two 1s drop to the bottom."},
    {"name": "A run with zeros below", "args": "(12,)", "show": "next_same_ones(12)",
     "why": "17. 12 is 1100. The top 1 of the run moves up (10000) and the other 1 drops to place 0: 10001."},
    {"name": "The lesson's example", "args": "(156,)", "show": "next_same_ones(156)",
     "why": "163. 10011100 becomes 10100011: the lowest run is 111 (places 2 to 4); its top 1 moves to place 5, and the other two go to places 0 and 1."},
    {"name": "Ten in a row", "args": "()", "expr": "[x := 7] + [x := next_same_ones(x) for _ in range(9)]",
     "show": "[7, then next_same_ones 9 times]",
     "why": "Every 5-bit number with three 1s, smallest first: 7, 11, 13, 14, 19, 21, 22, 25, 26, 28. Calling the function again and again lists all subsets of size 3 of 5 items (lesson 5)."},
    {"name": "1 to 64", "args": "()", "expr": "[next_same_ones(x) for x in range(1, 65)]", "show": "[next_same_ones(x) for x in range(1, 65)]",
     "why": "Every small case. If only some fail, look at the numbers with 1s at the bottom (odd numbers), and at numbers with 0s below the lowest run."},
    {"name": "Forty 1s in a row", "args": "(2 ** 40 - 1,)", "timeout": 2000, "show": "next_same_ones(2 ** 40 - 1)",
     "why": "2⁴⁰ + 2³⁹ − 1. The answer is 2³⁹ − 1 more than x, so trying x + 1, x + 2, … one at a time takes about 550 billion steps. "
            "Build the answer from the lowest run of 1s directly (lesson 3)."},
    {"name": "A run in the middle", "args": "((2 ** 30 - 1) << 20,)", "timeout": 2000, "show": "next_same_ones((2 ** 30 - 1) << 20)",
     "why": "2⁵⁰ + 2²⁹ − 1: the top 1 of the run moves to place 50, and the other 29 drop to places 0 to 28."},
    {"name": "A huge number", "args": "(((1 << 100_000) - 1) << 7 | 5,)", "timeout": 2000,
     "expr": "(lambda y: [y.bit_length(), y.bit_count(), y % 1_000_000_007])(next_same_ones(args[0]))",
     "show": "next_same_ones(x) for x with 100,002 ones and 100,007 bits; shows [bit_length, number of 1 bits, remainder after dividing by 1,000,000,007]",
     "why": "The lowest run is just the 1 in place 0 (x ends in ...101), so the answer moves it up one place: ...110. Your function must find the lowest run, not the lowest 1 of the long run."},
], trusted=NEXT)


# ---------- P4: all the 1 bits from 0 to n ----------

build(S, 4, "ones_upto", [
    {"name": "The example", "args": "(5,)", "show": "ones_upto(5)",
     "why": "7. 0, 1, 10, 11, 100, 101 have 0 + 1 + 1 + 2 + 1 + 2 = 7 ones."},
    {"name": "Zero", "args": "(0,)", "show": "ones_upto(0)", "why": "0: the number 0 has no 1 bits."},
    {"name": "One", "args": "(1,)", "show": "ones_upto(1)", "why": "1."},
    {"name": "Up to 7", "args": "(7,)", "show": "ones_upto(7)",
     "why": "12. 0 to 7 are all eight 3-bit patterns. Each place is 1 in exactly half of them: 3 places × 4 = 12."},
    {"name": "Up to 8", "args": "(8,)", "show": "ones_upto(8)", "why": "13: 12 for 0 to 7, plus one 1 in 1000."},
    {"name": "Every n below 40", "args": "()", "expr": "[ones_upto(n) for n in range(40)]", "show": "[ones_upto(n) for n in range(40)]",
     "why": "Every small case. If some fail, check the part cycle at the end: place k is 1 for the last ((n + 1) % 2ᵏ⁺¹) − 2ᵏ numbers, if that is more than 0."},
    {"name": "A thousand", "args": "(1000,)", "show": "ones_upto(1000)", "why": "4,938 ones in the binary forms of 0 to 1000. Counting each number's bits still works here; the big tests need the count place by place (lesson 4)."},
    {"name": "A million", "args": "(10 ** 6,)", "show": "ones_upto(10 ** 6)",
     "why": "Counting the bits of every number one by one still finishes at this size. The next test is a thousand times bigger."},
    {"name": "A billion", "args": "(10 ** 9,)", "timeout": 2000, "show": "ones_upto(10 ** 9)",
     "why": "Counting the 1s of every number means a billion numbers, far too slow. Count place by place instead: about 30 places, each counted with one formula."},
    {"name": "All 60-bit numbers", "args": "(2 ** 60 - 1,)", "timeout": 2000, "show": "ones_upto(2 ** 60 - 1)",
     "why": "60 × 2⁵⁹: there are 2⁶⁰ numbers, and each of the 60 places is 1 in exactly half of them."},
    {"name": "10¹⁸", "args": "(10 ** 18,)", "timeout": 2000, "show": "ones_upto(10 ** 18)",
     "why": "About 60 places to count. Python's whole numbers hold the answer exactly."},
    {"name": "10¹⁰⁰", "args": "(10 ** 100,)", "timeout": 2000, "show": "ones_upto(10 ** 100)",
     "why": "333 places. The method is O(log n): one step per bit of n."},
], trusted=ONES)


# ---------- P5: the closest subset sum ----------

def big(n, seed):
    # spread over the whole range: a 64-bit multiplier, then the remainder
    return (f"[(k * 6364136223846793005 + {seed} * 1442695040888963407) % 2 ** 64 % {2 * 10 ** 12} - {10 ** 12}"
            f" for k in range(1, {n + 1})]")

build(S, 5, "closest_sum", [
    {"name": "The example", "args": "([3, 9, 14], 20)", "show": "closest_sum([3, 9, 14], 20)",
     "why": "3. The subset sums are 0, 3, 9, 12, 14, 17, 23 and 26. The closest to 20 are 17 and 23, both 3 away."},
    {"name": "An exact hit", "args": "([3, 9, 14], 23)", "show": "closest_sum([3, 9, 14], 23)", "why": "0: 9 + 14 = 23."},
    {"name": "No items", "args": "([], 5)", "show": "closest_sum([], 5)",
     "why": "5. The only subset is the empty one, whose sum is 0. 0 is 5 away from 5."},
    {"name": "Target 0", "args": "([4, 8], 0)", "show": "closest_sum([4, 8], 0)", "why": "0: the empty subset sums to 0."},
    {"name": "Negative values", "args": "([-7, 4, 10], 2)", "show": "closest_sum([-7, 4, 10], 2)",
     "why": "1. −7 + 10 = 3 is 1 away from 2. With negative values, adding an item can make the sum smaller, so do not stop early when a sum passes the target."},
    {"name": "One item", "args": "([5], 4)", "show": "closest_sum([5], 4)", "why": "1: the sums are 0 and 5."},
    {"name": "Equal items", "args": "([1] * 36, 17)", "timeout": 5000, "show": "closest_sum([1] * 36, 17)",
     "why": "0: take any 17 of the 36 items. 36 items have 2³⁶ (about 69 billion) subsets, so listing them all is far too slow."},
    {"name": "16 small values", "args": f"({nums(16, 31, 200, sub=100, seed=3)}, 77)", "show": "closest_sum(16 values from −100 to 99, 77)",
     "why": "2¹⁶ = 65,536 subsets: any method finishes here."},
    {"name": "20 large values", "args": f"({big(20, 5)}, 2_718_281_828_459)", "timeout": 3000,
     "show": "closest_sum(20 values from −10¹² to 10¹², 2,718,281,828,459)",
     "why": "About a million subsets. Listing them all can just about finish here, if the work per subset is small; the next tests have far more."},
    {"name": "30 values", "args": f"({big(30, 7)}, 987_654_321_000)", "timeout": 3000,
     "show": "closest_sum(30 values from −10¹² to 10¹², 987,654,321,000)",
     "why": "2³⁰ is about a billion subsets: listing them all is too slow. Split the items into two halves of 15 and list each half's 32,768 sums (lesson 5)."},
    {"name": "35 values", "args": f"({big(35, 11)}, -555_555_555_555)", "timeout": 5000,
     "show": "closest_sum(35 values from −10¹² to 10¹², −555,555,555,555)",
     "why": "An odd number of items: the halves have 17 and 18 items. Sort one half's sums and, for each sum in the other half, find its best partner by binary search."},
    {"name": "36 values", "args": f"({big(36, 17)}, 31_415_926_535)", "timeout": 5000,
     "show": "closest_sum(36 values from −10¹² to 10¹², 31,415,926,535)",
     "why": "Two halves of 2¹⁸ = 262,144 sums each. Checking every pair of sums (about 69 billion pairs) is as slow as listing every subset; binary search makes it about 262,144 × 18 steps."},
    {"name": "Far above every sum", "args": f"({nums(36, 13, 1000, seed=19)}, 10 ** 15)", "timeout": 5000,
     "show": "closest_sum(36 values from 0 to 999, 10¹⁵)",
     "why": "The best is to take every item: the answer is 10¹⁵ minus the total. A binary search that runs off the end of the sorted list must still look at the last sum."},
], trusted=CLOSEST)
