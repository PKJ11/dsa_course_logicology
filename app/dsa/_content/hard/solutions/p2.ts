// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def colouring_formula(n, edges):
    def x(v, c):                       # "vertex v has colour c"
        return 3 * v + c + 1
    formula = [[x(v, 0), x(v, 1), x(v, 2)] for v in range(n)]   # at least one colour
    for u, v in edges:
        for c in range(3):
            formula.append([-x(u, c), -x(v, c)])                 # not both colour c
    return formula
`;

export const notes = [
  "A reduction to SAT (lesson 2). Variable 3v + c + 1 stands for 'vertex v is in group c'.",
  "One clause per vertex says it is in at least one group. Three clauses per edge say its two ends are not both in group 0, not both in group 1, not both in group 2. That is n + 3E clauses, built in O(n + E).",
  "Yes to yes: a split into groups gives an assignment (set exactly the variables of the chosen groups) that satisfies every clause. Yes to yes, backwards: in any satisfying assignment every vertex has a True group, and no edge has the same True group at both ends, so giving each vertex any one of its True groups is a valid split.",
  "No 'at most one group' clauses are needed for that, though adding them (three per vertex) keeps the formula within the limit and is also right.",
];
