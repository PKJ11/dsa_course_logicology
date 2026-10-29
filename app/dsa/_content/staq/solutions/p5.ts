// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def next_greater(a):
    answer = [-1] * len(a)
    stack = []                        # places still waiting for an answer
    for i, x in enumerate(a):
        while stack and a[stack[-1]] < x:
            answer[stack.pop()] = x   # x is the first taller value for it
        stack.append(i)
    return answer
`;

export const notes = [
  "The stack holds the places still waiting. Their values go down from bottom to top, so every place smaller than the new value x is at the top, together.",
  "Popping stops at the first value that is not smaller than x. Everything below it is bigger still, so it must keep waiting.",
  "`<` (not `<=`) makes the answer strictly taller: equal values stay on the stack.",
  "Each place is pushed once and popped at most once, so the total work is O(n), even though there is a loop inside the loop.",
  "Places left on the stack at the end never found a taller value. They keep the -1 the answer list started with.",
];
