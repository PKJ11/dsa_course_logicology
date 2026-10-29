import Link from "next/link";
import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { MemoFigure } from "./figures";

export default function Lesson2() {
  return (
    <>
      <p className="lesson__lede">
        Memoisation is the shortest way from a recursive rule to a DP: keep the recursion exactly as it is, and store each answer the first time
        it is worked out. This lesson covers how to do it in Python, the order in which answers appear, when it beats a table, and the limit
        that stops it on large inputs.
      </p>

      <h2 id="memo">Remember each answer</h2>
      <p>
        RECR-3 met memoisation with Fibonacci. The pattern is the same for any DP. The <strong>memo</strong> is a dictionary from a state to its
        answer. Before working out a state, look it up; after working it out, store it.
      </p>
      <CodeBlock
        title="fewest_memo.py"
        code={`def fewest_coins(amount, coins):
    memo = {0: 0}                  # the base case

    def f(x):
        if x not in memo:
            memo[x] = 1 + min(f(x - c)
                              for c in coins if c <= x)
        return memo[x]

    return f(amount)`}
      />
      <p>
        Each state is worked out once. Every later request for it is a lookup in the dictionary, which takes <M>O(1)</M> time on average
        (HASH). So the cost is the DP cost from lesson 1: the number of states times the work per state.
      </p>
      <p>
        When a state has more than one number, the key is a tuple: <code>memo[(r, c)]</code>. A tuple can be a dictionary key because it cannot
        change; a list cannot.
      </p>

      <h2 id="cache">functools.cache</h2>
      <p>Python can add the memo for you. The decorator <code>@cache</code> wraps a function and keeps a dictionary from its arguments to its result.</p>
      <CodeBlock
        title="grid_paths.py"
        code={`from functools import cache

def grid_paths(rows, cols):
    @cache
    def paths(r, c):
        if r == 0 or c == 0:
            return 1
        return paths(r - 1, c) + paths(r, c - 1)

    return paths(rows - 1, cols - 1)`}
      />
      <ul>
        <li>
          <code>@lru_cache(maxsize=None)</code> does the same as <code>@cache</code>. With a number for <code>maxsize</code> it keeps only that many
          recent answers (HASH-7), which is rarely what a DP wants.
        </li>
        <li>
          Every argument must be <em>hashable</em> (HASH-1): numbers, strings and tuples are; lists, sets and dicts are not. Pass{" "}
          <code>tuple(a)</code>, or better, pass only the numbers that change (positions) and read the list from outside the function.
        </li>
        <li>
          <code>paths.cache_info()</code> reports hits (lookups that found an answer), misses (states worked out) and the size.{" "}
          <code>paths.cache_clear()</code> empties it.
        </li>
      </ul>
      <Note title="Put the cached function inside" warn>
        <p>
          A cache only knows the arguments. If the function also reads something from outside, such as a list of coins, and that list changes
          between calls, the cache returns answers for the old list. Defining the cached function inside the main function, as above, gives each
          call a new, empty cache. The cache is also freed when the main function returns; a cache at the top of a file keeps every answer until
          the program ends.
        </p>
      </Note>

      <h2 id="order">The order answers arrive</h2>
      <p>
        Memoised recursion does not fill the table in a neat order. It fills a state when its call <em>finishes</em>, and a call finishes only
        after all the calls it makes. Step through the figure, which counts paths to the cell (2, 3) of a small grid.
      </p>
      <MemoFigure />
      <p>
        Three things to see. The answers arrive deep cells first, in the order the calls return. A cell that no call needs, here (0, 0), is never
        filled. And while the first answers are being found, a whole chain of calls is waiting: 5 calls for this grid, about <M>r + c</M> for the
        cell (r, c).
      </p>

      <h2 id="sparse">Only the states you reach</h2>
      <p>
        The second point can matter a great deal. Take <M>f(0) = 1</M> and <M>f(n) = f(n // 2) + f(n // 3)</M>, where <code>//</code> divides
        and rounds down. For <M>n = 10¹⁸</M> (a 1 followed by 18 zeros), a table from 0 to n is impossible. But starting from n, the recursion
        only ever reaches numbers of the form n divided by some 2s and some 3s, rounded down.
      </p>
      <CodeBlock
        title="sparse.py"
        code={`from functools import cache

@cache
def f(n):
    return 1 if n == 0 else f(n // 2) + f(n // 3)

f(10 ** 18)          # 224412958156019
f.cache_info()       # ... currsize=1012`}
      />
      <p>
        Only 1,012 different states are ever reached, and the calls go at most about 60 deep (each call at least halves n). When the states a
        problem really needs are few and scattered among a huge range, memoisation is the right tool, and a table is the wrong one.
      </p>
      <Invariant label="Memo">A memo works out only the states that the answer needs, in the order the calls finish.</Invariant>

      <h2 id="limit">The recursion limit</h2>
      <p>
        Each waiting call keeps a frame in memory (RECR-2), and Python stops at about 1,000 nested calls with a <code>RecursionError</code>.{" "}
        <code>sys.getrecursionlimit()</code> shows the limit. A memoised <M>f(x)</M> for the coins calls <M>f(x − 1)</M>, which calls{" "}
        <M>f(x − 2)</M>, and so on, so an amount of 100,000 needs 100,000 nested calls. The grid in the figure needs about <M>r + c</M>.
      </p>
      <ul>
        <li>
          <code>sys.setrecursionlimit(200_000)</code> raises the limit. It is risky: each frame takes memory, and in some places, including the
          Python that runs these practice pages in the browser, a very deep recursion can crash the whole program instead of raising an error.
        </li>
        <li>
          In the browser, <code>@cache</code> makes this worse. The cache wrapper is written in C, and each cached call also uses the
          browser&rsquo;s own, smaller stack, so a cached function can stop after only about 250 nested calls. A memo kept in a dictionary, as in{" "}
          <code>fewest_memo.py</code>, goes further.
        </li>
        <li>
          A loop that asks for small states first keeps the depth low. It fills the memo 500 states at a time, so no call goes more than about
          500 deep. It works, but it is a sign that a table is the better tool.
          <CodeBlock
            code={`for x in range(0, n, 500):
    f(x)                 # fills f(0) to f(x)
f(n)`}
          />
        </li>
        <li>
          The real fix is to fill the table with a loop: tabulation, the next lesson. It has no depth limit and is also faster, because a function
          call and a dictionary lookup cost more than reading a list. For the grid above, the loop version is about 7 times faster.
        </li>
      </ul>
      <p>
        Now try <Link href="/dsa/dynp/practice/2/">DYNP-P2, Exchanging a coin</Link>, where only a memo will do.
      </p>
    </>
  );
}
