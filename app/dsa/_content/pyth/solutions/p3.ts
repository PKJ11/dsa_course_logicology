// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def first_repeat(codes):
    seen = set()
    for c in codes:
        if c in seen:      # check first ...
            return c
        seen.add(c)        # ... then remember it
    return None
`;

export const notes = [
  "Read the log once, from left to right. The first code that is already in `seen` is the first code to appear a second time.",
  "The order of the two lines matters. If you add `c` before checking, every code looks as if it has been seen already.",
  "A set answers `c in seen` in about the same time however many codes it holds. A list would be searched value by value, which for 100,000 codes means about 5 billion checks.",
];
