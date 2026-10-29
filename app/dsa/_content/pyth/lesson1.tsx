import { CodeBlock } from "../../_components/Code";
import { Invariant, M, Note } from "../../_components/Prose";
import { IndexFigure } from "./figures";

export default function Lesson1() {
  return (
    <>
      <p className="lesson__lede">
        This station is a short start. It covers the parts of Python that the rest of the course uses. If you already write Python every day, read
        the warnings in each lesson and move on to CORR.
      </p>

      <h2 id="lists">What a list is</h2>
      <p>
        A list holds values in order. You write it with square brackets, and you separate the values with commas:
      </p>
      <CodeBlock
        code={`a = [3, 11, 19, 25, 36, 47, 58, 70]
names = ["Asha", "Ravi", "Meera"]
empty = []
len(a)      # 8, the number of values`}
      />
      <p>
        A list can hold any kind of value, and it can hold a mix of kinds. Most lists in this course hold numbers or strings (text). The
        function <code>len</code> gives the number of values in a list.
      </p>

      <h2 id="indexing">Indexing from the front and the back</h2>
      <p>
        Each value in a list has a position, called its <em>index</em>. The first index is 0, not 1. So in a list of 8 values, the indices go
        from 0 to 7. You read one value with square brackets after the name: <code>a[0]</code> is the first value.
      </p>
      <p>
        A negative index counts from the end. <code>a[-1]</code> is the last value and <code>a[-2]</code> is the one before it. Python turns{" "}
        <code>a[-k]</code> into <code>a[len(a) - k]</code>.
      </p>
      <Invariant label="Rule">
        A list of length <code>n</code> has indices <code>0</code> to <code>n - 1</code>. Index <code>n</code> is one past the end.
      </Invariant>
      <p>
        Step through the figure. The blue plates above the cells are the indices, and the train under the list shows which index is being
        read. The last step reads one past the end. That is an error, and it is the most common index mistake in this whole course.
      </p>

      <IndexFigure />

      <h2 id="slicing">Slicing</h2>
      <p>
        A <em>slice</em> copies part of a list into a new list. <code>a[start:stop]</code> takes the values from index <code>start</code> up to,
        but not including, index <code>stop</code>. Switch the figure to &ldquo;Slicing&rdquo; to see each kind.
      </p>
      <CodeBlock
        code={`a[2:6]      # [19, 25, 36, 47]   indices 2, 3, 4, 5
a[:3]       # [3, 11, 19]        from the start
a[5:]       # [47, 58, 70]       to the end
a[::2]      # [3, 19, 36, 58]    every second value
a[::-1]     # the whole list, reversed`}
      />
      <p>
        Why does the slice stop <em>before</em> <code>stop</code>? Because then the length of <code>a[start:stop]</code> is simply{" "}
        <M>stop − start</M>, and <code>a[:k]</code> and <code>a[k:]</code> split the list into two parts with nothing missing and nothing
        repeated. You will see this kind of range again in binary search, where it is called a half-open window.
      </p>
      <Note title="A slice is a copy, and copying costs time">
        <p>
          <code>a[1:]</code> builds a new list of <M>n − 1</M> values. That takes time in proportion to <M>n</M>. A slice inside a loop can turn a
          fast program into a slow one. BIGO-8 counts these hidden costs.
        </p>
      </Note>

      <h2 id="changing">Changing a list</h2>
      <p>Lists can be changed after they are made. These are the changes you will use most:</p>
      <CodeBlock
        code={`a[0] = 4          # replace the value at index 0
a.append(80)      # add 80 at the end
a.pop()           # remove the last value and return it
a.insert(0, 1)    # put 1 at index 0; every other value moves right
a.pop(0)          # remove the first value; every other value moves left`}
      />
      <p>
        The first three are fast. The last two are slow on long lists, because every value after the change has to move one place. ARRS-1
        explains why.
      </p>

      <h2 id="aliasing">Two names, one list</h2>
      <p>
        In Python, a name does not hold a list. It <em>refers</em> to a list. So <code>b = a</code> does not copy anything. It gives the same list
        a second name.
      </p>
      <CodeBlock
        code={`a = [1, 2, 3]
b = a           # b refers to the same list as a
b.append(4)
print(a)        # [1, 2, 3, 4]   a changed too

c = a[:]        # a slice of everything: a new list
c.append(5)
print(a)        # [1, 2, 3, 4]   a did not change`}
        mark={[2, 7]}
      />
      <p>
        This matters in the course. When a function receives a list and changes it, the caller sees the change. Sometimes that is what you
        want, as in sorting a list in place. Sometimes it is a bug. Lesson 3 comes back to this.
      </p>
    </>
  );
}
