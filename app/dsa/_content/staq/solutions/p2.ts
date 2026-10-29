// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def eval_postfix(tokens):
    stack = []
    for t in tokens:
        if t in ('+', '-', '*', '/'):
            b = stack.pop()           # the right-hand number comes off first
            a = stack.pop()
            if t == '+':
                stack.append(a + b)
            elif t == '-':
                stack.append(a - b)
            elif t == '*':
                stack.append(a * b)
            else:
                stack.append(a // b)
        else:
            stack.append(int(t))      # '-3' is a number, not an operator
    return stack[0]
`;

export const notes = [
  "Numbers are pushed. An operator pops its two numbers, the right-hand one first, and pushes the result. A valid expression leaves exactly one number.",
  "The operator test is an exact match against the four symbols, so a negative number such as '-3' is read as a number.",
  "`//` rounds down, so 7 // -2 is -4. `int(7 / -2)` would round towards zero and give -3, and dividing with `/` uses floats, which lose digits on big numbers.",
  "Each token does a fixed amount of work: O(n) time and at most O(n) stack space.",
];
