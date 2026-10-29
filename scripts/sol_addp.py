from solgen import write_station
from trusted_addp import P1, P2, P3, P4, P5_MEMO, P6

write_station("addp", 6, {
    1: (P1.lstrip("\n"), [
        "Rerooting (lesson 1), with roads of any length. The tree is rooted at station 0 and listed in BFS order, so each station comes after its parent; up[v] is the length of the road from v to its parent.",
        "Pass 1 runs through the list backwards, so every child is finished before its parent. size[v] counts the stations in v's subtree, and down[v] is their total distance from v: a child c adds down[c] (distances from c) plus up[c] once for each of its size[c] stations.",
        "Pass 2 runs forwards. total[0] = down[0]. Moving the start from p to its child c, the size[c] stations in c's subtree come up[c] closer and the other n − size[c] go up[c] further, so total[c] = total[p] + up[c] · (n − 2 · size[c]).",
        "Neither pass uses recursion, so a line of 100,000 stations is fine. Cost: O(n) time and memory.",
    ]),
    2: (P2.lstrip("\n"), [
        "Inside a group of junctions that reach each other both ways (CONN-1), the van can visit every junction and still leave by any street out of the group. So each group is worth the sum of its values, and the question becomes the most valuable route in the DAG of groups (lesson 2).",
        "Kosaraju's method (CONN-2), written with explicit stacks: pass 1 searches from s and records the finish order; pass 2 takes the junctions by latest finish first and gives each new group everything it reaches along reversed streets. Only junctions seen in pass 1 (reachable from s) take part. The groups come out in topological order: every street goes to the same group or a later one.",
        "So the groups are settled from the last to the first. best[g] is the group's worth plus the largest best of a group one street away (0 if none). The answer is best of s's group.",
        "Cost: O(V + E). A search that never repeats a junction misses routes that go into a loop and come back out; a rule that adds values along a walk never stops on a loop.",
    ]),
    3: (P3.lstrip("\n"), [
        "Sort the marks and add the two ends: p[0] = 0, then the marks, then length. Every piece made during the cutting is a stretch from p[i] to p[j], and it still has to be cut at the points strictly between i and j.",
        "The first cut on the piece p[i]..p[j] is at some p[k] with i < k < j. It costs the length p[j] − p[i] whatever k is, and leaves two pieces that are cut independently. So best[i][j] = p[j] − p[i] + the smallest best[i][k] + best[k][j]; a piece with no point inside costs 0.",
        "The table is filled by gap = j − i, shortest first, so both smaller pieces are ready (lesson 3). Cost: O(m³) for m points, about 560,000 split checks for 150 marks.",
        "Knuth's rule (lesson 6) holds for this cost too and would bring it to O(m²). Memoised recursion on (i, j) is also fine at this size.",
    ]),
    4: (P4.lstrip("\n"), [
        "Wagons are loaded one after another. Any packing can be produced this way: list the parcels of the first wagon, then the second, and so on. So the fewest wagons is found by trying loading orders, and two orders that have loaded the same set of parcels can be merged into one state (lesson 4).",
        "For each mask of loaded parcels, keep the best pair (wagons used, weight in the last wagon), fewer wagons first and then a lighter last wagon. Among states with the same wagon count, a lighter last wagon can always do at least as well later, so the smallest pair is the only one worth keeping.",
        "Adding parcel i: into the last wagon if it fits, else into a new wagon. Python's tuple comparison picks the better pair. Masks rise as parcels are added, so the plain loop order is right.",
        "Cost: 2ⁿ · n, about a million steps for 16 parcels. The submask method of lesson 4 makes 3ⁿ steps, 43 million for 16.",
    ]),
    5: (P5_MEMO.lstrip("\n"), [
        "Count from 0 up to a limit, and take f(b) − f(a − 1) (lesson 5). f(−1) is 0.",
        "go(i, prev, tight, started) counts the ways to fill places i to the end. tight says the digits so far equal the limit's, so the next digit is at most the limit's digit there. started is False while only zeros have been placed: those zeros are not digits of the number, so they are not compared with the next digit. prev is the last real digit (−1 before the start).",
        "The number 0 itself is all zeros and never starts; it is counted once, at the end of the digits, as the problem asks.",
        "A direct count also works: 1 for the number 0, plus 9 ** k for each shorter length k, plus a walk along the limit's digits that adds 9 ** (places left) for every smaller allowed digit, stopping when the limit itself repeats a digit. Both are tiny: at most 19 places.",
    ]),
    6: (P6.lstrip("\n"), [
        "best[j] = x[j]² + c + the smallest (−2·x[i]) · x[j] + (best[i] + x[i]²) over earlier stops i (lesson 6). Each earlier stop is a line with slope −2·x[i] and height best[i] + x[i]², read at X = x[j].",
        "Positions rise, so the slopes fall and the questions move right. The kept lines are a list with a front index head. For a question, the front moves on while the next line is at least as low at X: it will never be needed again.",
        "A new line removes the last kept line while it passes under the line before it no later than the last line does. With slopes m1 > m2 > m3 the test is (b3 − b1)(m1 − m2) ≤ (b2 − b1)(m1 − m3), the two crossing points compared by multiplying across, so no division and no rounding.",
        "Each line is added once and removed at most once: O(n) in all, against O(n²) for trying every earlier stop.",
    ]),
})
