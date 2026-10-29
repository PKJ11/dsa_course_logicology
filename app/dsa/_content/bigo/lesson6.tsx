import Link from "next/link";
import { Invariant, M, Note } from "../../_components/Prose";
import { MasterFigure } from "./figures";

export default function Lesson6() {
  return (
    <>
      <p className="lesson__lede">
        Many recursive algorithms split their input into equal parts, solve the parts, and combine the answers. Their recurrences all have the
        same form, and the master theorem solves that form in one step.
      </p>

      <h2 id="form">The form a T(n/b) + n<sup>d</sup></h2>
      <Invariant label="Form">T(n) = a × T(n / b) + n<sup>d</sup></Invariant>
      <ul>
        <li>
          <M>a</M> is how many calls each call makes (at least 1).
        </li>
        <li>
          <M>b</M> is how many times smaller each part is (more than 1).
        </li>
        <li>
          <M>n<sup>d</sup></M> (d copies of n multiplied together) is the work a call does itself, outside its calls. <M>d = 0</M> means a fixed amount, because <M>n⁰ = 1</M>, and <M>d = 1</M> means work in step with <M>n</M>.
        </li>
      </ul>
      <p>
        Merge sort is <M>a = 2</M>, <M>b = 2</M>, <M>d = 1</M>. Binary search is <M>a = 1</M>, <M>b = 2</M>, <M>d = 0</M>.
      </p>

      <h2 id="three">Three cases</h2>
      <p>
        Look at the recursion tree level by level. Level <M>k</M> has <M>aᵏ</M> calls, each of size <M>n / bᵏ</M>, each doing{" "}
        <M>(n / bᵏ)<sup>d</sup></M> work. So level <M>k</M> does
      </p>
      <Invariant label="Level k">n<sup>d</sup> × (a / b<sup>d</sup>)<sup>k</sup></Invariant>
      <p>
        Every level is the level above it times the same ratio <M>r = a / b<sup>d</sup></M>. The total is a sum where each term is <M>r</M> times the one
        before. Only three things can happen:
      </p>
      <ol>
        <li>
          <strong><M>r &lt; 1</M>, so <M>a &lt; b<sup>d</sup></M>.</strong> Each level does less than the one above. The sum is at most a fixed multiple of its
          first term, so the top level decides: <M>T(n) = Θ(n<sup>d</sup>)</M>.
        </li>
        <li>
          <strong><M>r = 1</M>, so <M>a = b<sup>d</sup></M>.</strong> Every level does <M>n<sup>d</sup></M> work, and there are about <M>log<sub>b</sub> n</M> levels (the
          number of times you can divide <M>n</M> by <M>b</M>). So <M>T(n) = Θ(n<sup>d</sup> log n)</M>.
        </li>
        <li>
          <strong><M>r &gt; 1</M>, so <M>a &gt; b<sup>d</sup></M>.</strong> Each level does more than the one above. The bottom level, with the most calls,
          decides. It has <M>a<sup>log<sub>b</sub> n</sup> = n<sup>log<sub>b</sub> a</sup></M> calls, so <M>T(n) = Θ(n<sup>log<sub>b</sub> a</sup>)</M>. Here <M>log<sub>b</sub> a</M> is the power that <M>b</M> must be raised to, to give <M>a</M>: for example, <M>log₂ 8 = 3</M>, because <M>2³ = 8</M>.
        </li>
      </ol>
      <p>Step through the four examples and watch where the work sits:</p>

      <MasterFigure />

      <p>
        The &ldquo;sum where each term is <M>r</M> times the last&rdquo; is called a <em>geometric series</em>. The fact behind case 1 is that{" "}
        <M>1 + r + r² + …</M> stays below <M>1 / (1 − r)</M> when <M>r &lt; 1</M>, however many terms there are. For <M>r = 1/2</M> it stays below
        2.
      </p>

      <h2 id="using">Using it</h2>
      <p>Find <M>a</M>, <M>b</M> and <M>d</M>, compare <M>a</M> with <M>b<sup>d</sup></M>, and read off the case:</p>
      <ul>
        <li>
          <M>T(n) = 2T(n/2) + n</M>: <M>2 = 2¹</M>, case 2, <M>Θ(n log n)</M>.
        </li>
        <li>
          <M>T(n) = T(n/2) + 1</M>: <M>1 = 2⁰</M>, case 2, <M>Θ(log n)</M>.
        </li>
        <li>
          <M>T(n) = 4T(n/2) + n</M>: <M>4 &gt; 2¹</M>, case 3, <M>Θ(n<sup>log₂ 4</sup>) = Θ(n²)</M>, and <M>n²</M> is n times n.
        </li>
        <li>
          <M>T(n) = 3T(n/2) + n</M>: <M>3 &gt; 2</M>, case 3, <M>Θ(n<sup>log₂ 3</sup>)</M>, which is about <M>Θ(n<sup>1.585</sup>)</M>. This is Karatsuba&rsquo;s method for multiplying
          large numbers (the DVCQ station).
        </li>
        <li>
          <M>T(n) = 2T(n/2) + n²</M>: <M>2 &lt; 4</M>, case 1, <M>Θ(n²)</M>.
        </li>
      </ul>

      <h2 id="limits">When it does not apply</h2>
      <ul>
        <li>
          The parts are not equal in size, such as <M>T(n) = T(n/3) + T(2n/3) + n</M>. Draw the recursion tree instead.
        </li>
        <li>
          The input shrinks by subtracting, such as <M>T(n) = T(n − 1) + n</M>. That is not division by <M>b</M>. Unroll it as in lesson 5.
        </li>
        <li>The work outside the calls is not a power of <M>n</M>, such as <M>n log n</M>. Extended versions of the theorem exist, but a tree is simpler.</li>
      </ul>
      <Note title="Remember the shape, not the table">
        <p>
          You do not need to memorise the three cases. Remember the picture: level totals form a geometric series, and the total is decided by the top level, by every
          level equally, or by the bottom level.
        </p>
      </Note>
      <p>
        Now try <Link href="/dsa/bigo/practice/5/">BIGO-P5, Solve the recurrence</Link>, which asks you to write the theorem as a function.
      </p>
    </>
  );
}
