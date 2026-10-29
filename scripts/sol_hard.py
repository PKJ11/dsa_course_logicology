from solgen import write_station
from trusted_hard import P1, P2, P3, P4, P5

write_station("hard", 5, {
    1: (P1.lstrip("\n"), [
        "Search from decision (lesson 1). The first question asks whether any assignment exists at all; if not, the answer is None.",
        "Then each variable is fixed in turn. The clause [x] forces x to be True, so sat(fixed + [[x]]) asks whether an answer exists with every choice so far and x True. If yes, that choice is kept.",
        "If no, x must be False: an answer exists with the earlier choices (the previous question said so), and it cannot have x True. The clause [-x] records that without another question.",
        "After the last variable, the clauses fix every value and are still satisfiable, so the values are an answer. That is at most n + 1 questions: a fast yes/no method would give a fast way to find answers.",
    ]),
    2: (P2.lstrip("\n"), [
        "A reduction to SAT (lesson 2). Variable 3v + c + 1 stands for 'vertex v is in group c'.",
        "One clause per vertex says it is in at least one group. Three clauses per edge say its two ends are not both in group 0, not both in group 1, not both in group 2. That is n + 3E clauses, built in O(n + E).",
        "Yes to yes: a split into groups gives an assignment (set exactly the variables of the chosen groups) that satisfies every clause. Yes to yes, backwards: in any satisfying assignment every vertex has a True group, and no edge has the same True group at both ends, so giving each vertex any one of its True groups is a valid split.",
        "No 'at most one group' clauses are needed for that, though adding them (three per vertex) keeps the formula within the limit and is also right.",
    ]),
    3: (P3.lstrip("\n"), [
        "Branch and bound (lesson 3). The items are sorted by value per kilogram, best first, compared exactly with Fraction.",
        "go(k, room, value) has decided items 0 .. k − 1. The best complete value found so far is best; every node is itself a valid packing (leave the rest), so its value can update best.",
        "The bound fills the room with the next items whole while they fit and then the fitting part of the first one that does not: the fractional knapsack, which GRDY-1 proved optimal when items may be cut. No whole-item packing below the node can beat it, so when it is not above best, the branch is skipped. Rounding it down is safe because values are whole numbers.",
        "Taking an item is tried before leaving it, so good packings are found early and the bound prunes from the start. The tests need a few hundred to a few thousand nodes; a bound that adds up every undecided value passes millions.",
    ]),
    4: (P4.lstrip("\n"), [
        "Longest job first, each onto the machine with the smallest total so far (lesson 4, Graham 1969). Its busiest machine is at most 4/3 − 1/(3m) times the best possible.",
        "The job positions are sorted by length, so the answer can still be written in the given order of the jobs.",
        "The machines sit in a heap of (total, machine) pairs: the least loaded is popped, given the job and pushed back with its new total. That is O(n log n) for the sort and O(n log m) for the heap.",
        "Taking the jobs in the given order instead is only within 2 − 1/m: six short jobs and then a long one end with the long job on top of two short ones.",
    ]),
    5: (P5.lstrip("\n"), [
        "Miller–Rabin with fixed bases (lesson 5). Small cases first: below 2 is not prime, and a number divisible by one of the bases is prime only if it is that base.",
        "n − 1 = d · 2^s with d odd. For each base a, x = a^d mod n. If x is 1 or n − 1, a proves nothing. Otherwise x is squared up to s − 1 times; reaching n − 1 means a proves nothing, and never reaching it means a is a witness: n is composite.",
        "For a prime n, every base passes, because modulo a prime only 1 and −1 square to 1. For composites, the 13 prime bases 2 to 41 are known (by computer search) to include a witness for every n below about 3.3 × 10²⁴, so the answer is exact in this range. The first 12 bases are not enough: 318,665,857,834,031,151,167,461 fools them all.",
        "Each base costs one pow(a, d, n) and at most s squarings: O(log n) multiplications of numbers of about 80 bits.",
    ]),
})
