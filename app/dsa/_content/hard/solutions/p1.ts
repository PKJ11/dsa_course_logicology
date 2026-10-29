// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def find_assignment(n, clauses, sat):
    if not sat(clauses):               # no assignment at all
        return None
    fixed = [list(c) for c in clauses]
    answer = []
    for x in range(1, n + 1):
        if sat(fixed + [[x]]):         # can x be True, with the choices so far?
            fixed.append([x])
            answer.append(True)
        else:                          # then it must be False
            fixed.append([-x])
            answer.append(False)
    return answer
`;

export const notes = [
  "Search from decision (lesson 1). The first question asks whether any assignment exists at all; if not, the answer is None.",
  "Then each variable is fixed in turn. The clause [x] forces x to be True, so sat(fixed + [[x]]) asks whether an answer exists with every choice so far and x True. If yes, that choice is kept.",
  "If no, x must be False: an answer exists with the earlier choices (the previous question said so), and it cannot have x True. The clause [-x] records that without another question.",
  "After the last variable, the clauses fix every value and are still satisfiable, so the values are an answer. That is at most n + 1 questions: a fast yes/no method would give a fast way to find answers.",
];
