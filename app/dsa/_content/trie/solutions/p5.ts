// Loaded only when the learner unlocks it (every hint opened, or the instructor passcode).
export const code = `def max_xor(nums):
    B = max(nums).bit_length()    # bits needed for the largest number
    root = [None, None]           # [child for bit 0, child for bit 1]
    best = 0
    for i, x in enumerate(nums):
        if i:                     # best partner among earlier numbers
            node, r = root, 0
            for k in range(B - 1, -1, -1):
                b = x >> k & 1
                if node[1 - b] is not None:
                    r |= 1 << k   # the bits differ: result bit is 1
                    node = node[1 - b]
                else:
                    node = node[b]
            if r > best:
                best = r
        node = root               # insert x, highest bit first
        for k in range(B - 1, -1, -1):
            b = x >> k & 1
            if node[b] is None:
                node[b] = [None, None]
            node = node[b]
    return best
`;

export const notes = [
  "Every number is written with the same number of bits, B, highest bit first, and stored as a path of B edges. A node is a list of two children, which is smaller and faster than a dict.",
  "For a number x, the walk takes the child with the opposite bit whenever it exists, because that sets this bit of the result to 1, and one bit is worth more than all the lower bits together. So the walk ends at the stored number that makes x ^ y largest.",
  "Querying each number before inserting it compares it with every earlier number, so every pair is covered once and a number is never paired with itself.",
  "Each number costs two walks of B steps: O(n · B) time, against O(n²) for trying every pair. With 20,000 numbers that is about 1.2 million steps instead of 200 million XORs.",
];
