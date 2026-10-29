import sys
sys.path.insert(0, r"D:/claude/dsa-self-paced/public/dsa")
from tb import build
from trusted_strg import P1, P2, P3, P4, P4_SA, P5, P6

S = "strg"
A = 6364136223846793005
B = 3935559000370003845
M = 1_000_000_007


def mix(var, seed):
    """Comprehension clauses that set x to a well-mixed 64-bit number made from `var` (README rule 16)."""
    return f"for y in [({var} + {seed * 10_000_019}) * {A} % 2 ** 64] for x in [(y ^ y >> 29) * {B} % 2 ** 64]"


def rstr(n, k, seed):
    """A pseudo-random string of n letters from the first k letters of the alphabet, as an expression."""
    return f"''.join('abcdefghijklmnopqrstuvwxyz'[(x >> 36) % {k}] for i in range({n}) {mix('i', seed)})"


# Thue-Morse string of 2**k letters: letter i is 'a' or 'b' by the parity of the number of 1 bits in i.
def thue(k):
    return f"''.join('ab'[bin(i).count('1') % 2] for i in range({2 ** k}))"


def fib_word(n):
    """The Fibonacci word, cut to n letters: rich in repeats and palindromes."""
    return f"(lambda f: f(f, 'a', 'ab'))(lambda f, a, b: b[:{n}] if len(b) >= {n} else f(f, b, b + a))"


LIST_SUM = f"[len(r), r[:3], r[-3:], sum(r) % {M}, sum(k * v for k, v in enumerate(r)) % {M}]"


def summary(call):
    return f"(lambda r: {LIST_SUM})({call})"


# ---------- P1: patterns with blanks ----------

build(S, 1, "find_all", [
    {"name": "The example", "args": "('abcabcab', 'cab')", "show": "find_all('abcabcab', 'cab')",
     "why": "[2, 5]. This is the figure's first variant: P occurs at places 2 and 5."},
    {"name": "A blank", "args": "('banana', '?an')", "show": "find_all('banana', '?an')",
     "why": "[0, 2]: “ban” and “nan” both have “an” after their first letter. A ? matches any one letter."},
    {"name": "Overlapping places", "args": "('aaaa', 'aa')", "show": "find_all('aaaa', 'aa')",
     "why": "[0, 1, 2]. After a match, move on by one place, not by the length of the pattern."},
    {"name": "Only blanks", "args": "('abc', '??')", "show": "find_all('abc', '??')",
     "why": "[0, 1]: every place where two letters fit. Place 2 would stick out past the end."},
    {"name": "Pattern longer than the text", "args": "('ab', 'abc')", "show": "find_all('ab', 'abc')",
     "why": "[]. There is no place where three letters fit in a text of two."},
    {"name": "The last place", "args": "('xxab', 'ab')", "show": "find_all('xxab', 'ab')",
     "why": "[2]. The last place to try is n − m = 2. A loop over range(n - m) stops one place too early."},
    {"name": "The whole text", "args": "('abc', 'a?c')", "show": "find_all('abc', 'a?c')",
     "why": "[0]. The pattern is as long as the text, so there is exactly one place to try."},
    {"name": "A blank at each end", "args": "('racecar', '?ace?')", "show": "find_all('racecar', '?ace?')",
     "why": "[0]: “racec” matches, with the blanks on r and c. Letters next to a blank still have to match: no other place has “ace” in the middle."},
    {"name": "No match", "args": "('abcabc', 'ad')", "show": "find_all('abcabc', 'ad')",
     "why": "[]. A ? in the text would be an ordinary letter, but this text has none."},
    {"name": "A question mark is not a letter", "args": "('ab?b', 'a?')", "show": "find_all('ab?b', 'a?')",
     "why": "[0]. Only the pattern's ? is a blank. Here the text happens to contain one, and it is matched like any letter."},
    {"name": "20,000 letters", "timeout": 3000, "args": f"({rstr(20_000, 2, 1)}, 'ab?ba??bab')",
     "expr": summary("find_all(args[0], args[1])"), "show": "a text of 20,000 letters a and b, pattern 'ab?ba??bab'",
     "why": "[how many, first three, last three, two check numbers]. The naive method makes at most 10 comparisons per place here, which is quick."},
    {"name": "Nearly every place", "timeout": 3000, "args": "('a' * 20_000, 'a' * 9 + '?' + 'a' * 9)",
     "expr": summary("find_all(args[0], args[1])"), "show": "'a' * 20000, pattern 'aaaaaaaaa?aaaaaaaaa'",
     "why": "19,982 places. Every place matches, so each one costs all 19 comparisons: (n − m + 1) · m, about 380,000 here."},
], P1)

# ---------- P2: every place, fast ----------

build(S, 2, "find_every", [
    {"name": "The example", "args": "('abababac', 'ababac')", "show": "find_every('abababac', 'ababac')",
     "why": "[2]. This is the figure's search: after the mismatch at place 5, P slides by 2 and three letters stay matched."},
    {"name": "Overlapping places", "args": "('aaaaa', 'aa')", "show": "find_every('aaaaa', 'aa')",
     "why": "[0, 1, 2, 3]. After a full match, keep the longest border matched: j = pi[m - 1]."},
    {"name": "Matches that share letters", "args": "('abababab', 'abab')", "show": "find_every('abababab', 'abab')",
     "why": "[0, 2, 4]. The border “ab” of “abab” lets each match start inside the last one. Place 6 has only two letters left."},
    {"name": "A short pattern", "args": "('abacabab', 'ab')", "show": "find_every('abacabab', 'ab')",
     "why": "[0, 4, 6]."},
    {"name": "One letter", "args": "('banana', 'a')", "show": "find_every('banana', 'a')", "why": "[1, 3, 5]."},
    {"name": "Pattern longer than the text", "args": "('ab', 'aba')", "show": "find_every('ab', 'aba')", "why": "[]."},
    {"name": "The same length", "args": "('abc', 'abc')", "show": "find_every('abc', 'abc')", "why": "[0]."},
    {"name": "No match", "args": "('abcabd', 'abd' * 2)", "show": "find_every('abcabd', 'abdabd')", "why": "[]."},
    {"name": "Half a million in a row", "timeout": 4000, "args": "('a' * 1_000_000, 'a' * 500_000)",
     "expr": summary("find_every(args[0], args[1])"), "show": "'a' * 1000000, pattern 'a' * 500000",
     "why": "[how many, first three, last three, two check numbers]: 500,001 places. Calling find again from one place after each hit checks all 500,000 letters every time: about 250 billion steps. KMP reads each letter of the text once."},
    {"name": "Every second place", "timeout": 4000, "args": "('ab' * 500_000, 'ab' * 50_000)",
     "expr": summary("find_every(args[0], args[1])"), "show": "'ab' * 500000, pattern 'ab' * 50000",
     "why": "450,001 places, every second one. A loop of find calls checks all 100,000 letters again for each of them."},
    {"name": "Half a million random letters", "timeout": 4000, "args": f"({rstr(500_000, 2, 2)}, 'abbabaab')",
     "expr": summary("find_every(args[0], args[1])"), "show": "500,000 random letters a and b, pattern 'abbabaab'",
     "why": "About 2,000 places, spread out. Any correct O(n + m) method is quick here."},
], P2)

# ---------- P3: how much of the pattern fits ----------

build(S, 3, "fits", [
    {"name": "The example", "args": "('aabxaab', 'aab')", "show": "fits('aabxaab', 'aab')",
     "why": "[3, 1, 0, 0, 3, 1, 0]. At place 0 all of “aab” fits; at place 1 only “a” does (then b ≠ a); at place 3 the x stops it at once."},
    {"name": "Starts of a longer pattern", "args": "('abacabab', 'abacaba')", "show": "fits('abacabab', 'abacaba')",
     "why": "[7, 0, 1, 0, 3, 0, 2, 0]. At place 4, “aba” fits and then b ≠ c."},
    {"name": "Runs off the end", "args": "('xxaba', 'abab')", "show": "fits('xxaba', 'abab')",
     "why": "[0, 0, 3, 0, 1]. At place 2 the text ends after three letters, so only 3 fit."},
    {"name": "Pattern longer than the text", "args": "('ab', 'abab')", "show": "fits('ab', 'abab')",
     "why": "[2, 0]. The answer can never be more than the letters left in the text."},
    {"name": "One letter", "args": "('a', 'a')", "show": "fits('a', 'a')", "why": "[1]."},
    {"name": "Nothing fits", "args": "('bbb', 'a')", "show": "fits('bbb', 'a')", "why": "[0, 0, 0]."},
    {"name": "Long runs", "timeout": 3000, "args": "('a' * 300_000, 'a' * 100_000)",
     "expr": summary("fits(args[0], args[1])"), "show": "'a' * 300000, pattern 'a' * 100000",
     "why": "[how many, first three, last three, two check numbers]. Every answer is long, so comparing letter by letter at each place takes about 25 billion steps. The box (lesson 3) gives each answer from the last one."},
    {"name": "A periodic text", "timeout": 3000, "args": "('ab' * 150_000, 'ab' * 50_000 + 'b')",
     "expr": summary("fits(args[0], args[1])"), "show": "'ab' * 150000, pattern 'ab' * 50000 + 'b'",
     "why": "At every even place 100,000 letters fit before the last b fails, and none fit at odd places."},
    {"name": "Random letters", "timeout": 3000, "args": f"({rstr(500_000, 2, 3)}, 'abba' * 250)",
     "expr": summary("fits(args[0], args[1])"), "show": "500,000 random letters a and b, pattern 'abba' * 250",
     "why": "Most answers are short. Make sure the separator you put between pattern and text is a character neither of them contains."},
], P3)

# ---------- P4: the longest repeated piece ----------

RSUM = "(lambda s, r: [len(r), s.find(r), s.find(r, s.find(r) + 1) >= 0, r[:12]])(args[0], longest_repeat(args[0]))"
PLANT = (f"(lambda X: {rstr(20_000, 26, 4)} + X + {rstr(5_000, 26, 5)} + X + {rstr(10_000, 26, 6)})"
         f"({rstr(5_000, 26, 7)})")

build(S, 4, "longest_repeat", [
    {"name": "banana", "args": "('banana',)", "show": "longest_repeat('banana')",
     "why": "'ana': it occurs at places 1 and 3. Occurrences may overlap."},
    {"name": "No repeat", "args": "('abcd',)", "show": "longest_repeat('abcd')", "why": "''. Every letter occurs once, so nothing repeats."},
    {"name": "One letter", "args": "('a',)", "show": "longest_repeat('a')", "why": "''."},
    {"name": "A run", "args": "('aaaa',)", "show": "longest_repeat('aaaa')",
     "why": "'aaa', at places 0 and 1. The two copies overlap, which is allowed."},
    {"name": "mississippi", "args": "('mississippi',)", "show": "longest_repeat('mississippi')",
     "why": "'issi', at places 1 and 4."},
    {"name": "Two of the same length", "args": "('cdqcdabqab',)", "show": "longest_repeat('cdqcdabqab')",
     "why": "'cd'. Both “cd” and “ab” repeat. “cd” first occurs at place 0 and “ab” at place 5, so “cd” is the answer. Alphabetical order does not matter."},
    {"name": "The earlier copy wins", "args": "('xabyabzcd',)", "show": "longest_repeat('xabyabzcd')",
     "why": "'ab'. Answer with the piece itself, taken from its first place."},
    {"name": "50,000 random letters", "timeout": 5000, "args": f"({rstr(50_000, 4, 8)},)", "expr": RSUM,
     "show": "50,000 random letters from a to d",
     "why": "[length, first place, occurs again?, first 12 letters]. Binary search on the length with a set of hashes is O(n log n). Trying each length with a set of slices works only while the answer is short."},
    {"name": "A copy planted far apart", "timeout": 5000, "args": f"({PLANT},)", "expr": RSUM,
     "show": "40,000 random letters with one block of 5,000 letters copied twice",
     "why": "The planted block (and perhaps a letter or two around it) is the answer. Slices of 5,000 letters at 40,000 places are 200 million letters of copying for each length you try."},
    {"name": "Nearly all of it", "timeout": 5000, "args": "('ab' * 25_000,)", "expr": RSUM, "show": "'ab' * 25000",
     "why": "49,998 letters: 'abab…' starting at 0 occurs again at place 2. Each check of a long length touches about 50,000 pieces of that length, so a slice for each piece is far too slow; a rolling hash is O(1) per piece."},
    {"name": "One half written twice", "timeout": 4000, "args": f"((lambda X: X + X)({rstr(50_000, 26, 12)}),)", "expr": RSUM,
     "show": "50,000 random letters, then the same 50,000 again",
     "why": "50,000 letters: the whole first half. Every length the binary search tries is near 50,000, where there are about 50,000 pieces of that length. Slicing and hashing each one copies billions of letters; the rolling hash gives each piece's hash in O(1)."},
    {"name": "Thue–Morse", "timeout": 5000, "args": f"({thue(15)},)", "expr": RSUM,
     "show": "the Thue–Morse string of 32,768 letters (lesson 4)",
     "why": "Hashing modulo 2 to the power 64 (letting numbers wrap around) gives the same hash for many different pieces of this string, so an unchecked hash finds a “repeat” that is not one. Use a large prime modulus, and compare the letters when two hashes are equal."},
], P4)

# ---------- P5: suffix array and lcp ----------

SSUM = (f"(lambda s, r: [len(r[0]), sorted(r[0]) == list(range(len(s))), r[0][:4], r[0][-4:], "
        f"sum(k * v for k, v in enumerate(r[0])) % {M}, r[1][:4], sum(r[1]), max(r[1]), "
        f"sum(k * v for k, v in enumerate(r[1])) % {M}])(args[0], suffix_lcp(args[0]))")

build(S, 5, "suffix_lcp", [
    {"name": "banana", "args": "('banana',)", "show": "suffix_lcp('banana')",
     "why": "([5, 3, 1, 0, 4, 2], [0, 1, 3, 0, 0, 2]): the figure's suffix array and lcp column, with 0 in the first row."},
    {"name": "One letter", "args": "('a',)", "show": "suffix_lcp('a')", "why": "([0], [0])."},
    {"name": "A run", "args": "('aaaa',)", "show": "suffix_lcp('aaaa')",
     "why": "([3, 2, 1, 0], [0, 1, 2, 3]). A shorter string comes before a longer one that starts with it, so the shortest suffix is first."},
    {"name": "All different", "args": "('dcba',)", "show": "suffix_lcp('dcba')", "why": "([3, 2, 1, 0], [0, 0, 0, 0])."},
    {"name": "mississippi", "args": "('mississippi',)", "show": "suffix_lcp('mississippi')",
     "why": "([10, 7, 4, 1, 0, 9, 8, 6, 3, 5, 2], [0, 1, 1, 4, 0, 0, 1, 0, 2, 1, 3])."},
    {"name": "Repeats", "args": "('abaab',)", "show": "suffix_lcp('abaab')",
     "why": "([2, 3, 0, 4, 1], [0, 1, 2, 0, 1]). “aab” < “ab” < “abaab”: the third letter decides between the last two."},
    {"name": "100,000 of one letter", "timeout": 5000, "args": "('a' * 100_000,)", "expr": SSUM, "show": "'a' * 100000",
     "why": "[length, a reordering of 0..n−1?, first four, last four, check, first lcp values, lcp sum, largest lcp, check]. Sorting by slices copies 5 billion letters here. Prefix doubling needs about 17 rounds and never copies a suffix."},
    {"name": "100,000 random letters", "timeout": 5000, "args": f"({rstr(100_000, 26, 9)},)", "expr": SSUM,
     "show": "100,000 random letters a to z",
     "why": "Random text: the ranks all differ after 3 or 4 rounds, so stop early when every rank is different."},
    {"name": "Two letters, 100,000", "timeout": 5000, "args": f"({rstr(100_000, 2, 10)},)", "expr": SSUM,
     "show": "100,000 random letters a and b", "why": "More rounds than with 26 letters (about 7), because pieces of 30 letters or so repeat by chance."},
    {"name": "The Fibonacci word", "timeout": 5000, "args": f"({fib_word(75_025)},)", "expr": SSUM,
     "show": "the Fibonacci word of 75,025 letters (abaababaabaab…)",
     "why": "This string has very long repeats, so the ranks stay shared for many rounds and the lcp values are large. Kasai's method still costs O(n)."},
], P5)

# ---------- P6: palindromes ----------

PSUM = "(lambda s, r: [r[0], len(r[1]), s.find(r[1]), r[1] == r[1][::-1], r[1][:8]])(args[0], palindromes(args[0]))"

build(S, 6, "palindromes", [
    {"name": "abacaba", "args": "('abacaba',)", "show": "palindromes('abacaba')",
     "why": "(12, 'abacaba'): 7 single letters, “aba” twice, “aca”, “bacab” and “abacaba”."},
    {"name": "A run", "args": "('aaa',)", "show": "palindromes('aaa')",
     "why": "(6, 'aaa'): three of length 1, two of length 2, one of length 3. Pieces at different places count separately."},
    {"name": "Even length", "args": "('abba',)", "show": "palindromes('abba')",
     "why": "(6, 'abba'): four letters, “bb” and “abba”. Even-length palindromes have their centre between two letters."},
    {"name": "Nothing longer than a letter", "args": "('abc',)", "show": "palindromes('abc')",
     "why": "(3, 'a'). All three are single letters; the earliest is the answer."},
    {"name": "One letter", "args": "('z',)", "show": "palindromes('z')", "why": "(1, 'z')."},
    {"name": "A tie", "args": "('abaxcdc',)", "show": "palindromes('abaxcdc')",
     "why": "(9, 'aba'). “aba” and “cdc” are both 3 long; “aba” starts first."},
    {"name": "Even wins", "args": "('xabbay',)", "show": "palindromes('xabbay')", "why": "(8, 'abba'): the six single letters, bb and abba. The longest is the even palindrome abba, which growing only from single letters misses."},
    {"name": "200,000 of one letter", "timeout": 4000, "args": "('a' * 200_000,)", "expr": PSUM, "show": "'a' * 200000",
     "why": "[count, length of the longest, its place, a palindrome?, its first 8 letters]: 20,000,100,000 palindromes. Growing each one from its centre takes about 10 billion steps; the mirror rule makes it O(n)."},
    {"name": "A long alternating string", "timeout": 4000, "args": "('ab' * 100_000 + 'a',)", "expr": PSUM,
     "show": "'abab…aba', 200,001 letters",
     "why": "The whole string is a palindrome, and so are many long pieces centred on each letter. Even-length ones do not exist here at all."},
    {"name": "Random letters", "timeout": 4000, "args": f"({rstr(200_000, 2, 11)},)", "expr": PSUM,
     "show": "200,000 random letters a and b", "why": "Most palindromes are short here; the longest is about 30 letters."},
    {"name": "The Fibonacci word", "timeout": 4000, "args": f"({fib_word(121_393)},)", "expr": PSUM,
     "show": "the Fibonacci word of 121,393 letters",
     "why": "Rich in long palindromes of both lengths. Check that your even-length mirror uses d₂[l + r − i + 1]."},
], P6)
