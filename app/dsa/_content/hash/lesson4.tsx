import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { AttackFigure } from "./figures";

export default function Lesson4() {
  return (
    <>
      <p className="lesson__lede">
        The <M>O(1)</M> average in lessons 2 and 3 assumed the keys spread out. When the keys come from strangers, someone can choose them to
        collide. Then a hash table becomes very slow. This lesson shows the attack and the defence: choose the hash function at random.
      </p>

      <h2 id="attack">Keys chosen against you</h2>
      <p>
        Any fixed hash function has bad sets of keys. With <M>m</M> buckets and many possible keys, some bucket receives at least a share{" "}
        <M>1/m</M> of all possible keys. Anyone who knows the function can pick <M>n</M> keys from that bucket. Then all <M>n</M> keys share one
        chain, and inserting them costs <M>1 + 2 + … + n</M> steps, which is <M>O(n²)</M>.
      </p>
      <p>
        This is a real attack, called <em>hash flooding</em>. A web server stores the fields of each request in a hash table. In 2011, researchers
        showed that one request with about 100,000 carefully chosen field names could keep a server busy for minutes. PHP, Java, Ruby and Python
        were all affected. An attack that makes a program slow, rather than wrong, is called a <em>denial of service</em>: real users cannot get
        served.
      </p>

      <h2 id="universal">Choosing the function at random</h2>
      <p>
        The attacker needs to know the hash function in advance. So the table picks its function at random when it is created, from a large family
        of functions. The attacker can still see the code, and so the family, but not which member was picked. Compare a fixed function with a
        random one on the attacker&rsquo;s keys:
      </p>

      <AttackFigure />

      <p>
        A family of hash functions is called <em>universal</em> if, for any two different keys <M>x</M> and <M>y</M>, a function picked at random
        from the family makes them collide with chance at most <M>1/m</M>. That is the same chance as if each key were thrown into a random bucket.
      </p>
      <p>
        The family in the figure is a classic one, found by Carter and Wegman in 1979. Pick a prime number <M>p</M> bigger than every key. Then pick
        two random whole numbers: <M>a</M> from 1 to <M>p − 1</M>, and <M>b</M> from 0 to <M>p − 1</M>. The function is
      </p>
      <CodeBlock code={`h(k) = ((a * k + b) % p) % m`} />
      <p>
        Why does universality help? Take any key <M>x</M>. Each of the other <M>n − 1</M> keys collides with <M>x</M> with chance at most{" "}
        <M>1/m</M>. Adding up these chances, <M>x</M>&rsquo;s chain is expected to hold at most <M>1 + (n − 1)/m</M> keys, which is less than{" "}
        <M>1 + α</M>. This holds for <em>every</em> set of keys, even keys chosen by an attacker. The average is now over the table&rsquo;s random
        choice, which the attacker cannot control.
      </p>
      <Invariant label="Rule">With a universal family, every set of keys gets O(1 + α) expected cost per job. No set of keys is bad for every function.</Invariant>

      <h2 id="proof">Why collisions stay rare</h2>
      <p>
        Here is why the Carter and Wegman family is universal. Take two different keys <M>x</M> and <M>y</M>, both less than <M>p</M>. Before the
        final <code>% m</code>, they become
      </p>
      <CodeBlock
        code={`r = (a*x + b) % p
s = (a*y + b) % p`}
      />
      <p>The argument has three steps.</p>
      <ol>
        <li>
          <strong>r and s are different.</strong> Their difference is <M>a·(x − y)</M>, taken <code>% p</code>. Neither <M>a</M> nor <M>x − y</M> is
          a multiple of the prime <M>p</M>, so their product is not a multiple of <M>p</M> either. (This is where <M>p</M> being prime matters.) So{" "}
          <M>r ≠ s</M>.
        </li>
        <li>
          <strong>Every pair (r, s) with r ≠ s is equally likely.</strong> There are <M>p(p − 1)</M> choices of <M>(a, b)</M>, and exactly{" "}
          <M>p(p − 1)</M> pairs <M>(r, s)</M> with <M>r ≠ s</M>. Given <M>r</M> and <M>s</M>, the two lines above can be solved for exactly one{" "}
          <M>a</M> and one <M>b</M>. So each choice of <M>(a, b)</M> gives a different pair, and each pair comes from exactly one choice. Picking{" "}
          <M>(a, b)</M> at random therefore picks <M>(r, s)</M> at random.
        </li>
        <li>
          <strong>Few pairs collide after % m.</strong> Fix <M>r</M>. The keys collide when <M>s % m = r % m</M>. Among the <M>p − 1</M> values{" "}
          <M>s</M> can take, at most <M>(p − 1)/m</M> share <M>r</M>&rsquo;s remainder. So the chance is at most <M>((p − 1)/m) / (p − 1) = 1/m</M>.
        </li>
      </ol>
      <p>
        Hashing a key now costs one multiplication, one addition and two remainders: still <M>O(1)</M>. Strings and other long keys use related
        families that read the key once, in <M>O(L)</M> for length <M>L</M>.
      </p>

      <h2 id="python">What Python does</h2>
      <p>
        Python took this path after the 2011 attack. For <code>str</code> and <code>bytes</code>, the hash uses a function called SipHash with a
        secret random key chosen each time Python starts. That is why <code>hash(&apos;cat&apos;)</code> differs between runs (lesson 1). The
        environment variable <code>PYTHONHASHSEED</code> can fix the key, for example to make a test repeatable.
      </p>
      <p>
        Whole numbers are not protected. On a 64-bit computer, <code>hash(k)</code> is the remainder of <M>k</M> after dividing by{" "}
        <M>2<sup>61</sup> − 1</M> (61 twos multiplied together, minus 1), with no randomness at all:
      </p>
      <CodeBlock
        code={`import sys
sys.hash_info.modulus           # 2305843009213693951, that is 2**61 - 1
hash(2**61 - 1)                 # 0
hash(2 * (2**61 - 1))           # 0 as well`}
      />
      <p>
        (The practice pages run Python inside the browser as a 32-bit program. There the number is <M>2<sup>31</sup> − 1</M> instead.)
      </p>
      <p>
        So a dict filled with many multiples of <M>2<sup>61</sup> − 1</M> puts every key on the same probe sequence, and each insert costs <M>O(n)</M>. If a
        program builds a dict from whole numbers sent by strangers, it should limit how many it accepts, or turn them into strings first.
      </p>
      <Note title="Does a random hash solve everything?">
        <p>
          No. It protects the average against keys chosen in advance. An attacker who can measure the program&rsquo;s timing, and send many
          requests, may still learn about the secret key. SipHash was designed to make this very hard. For your own code, the lesson is simpler:
          when keys come from outside, do not rely on a fixed, simple hash function.
        </p>
      </Note>
    </>
  );
}
