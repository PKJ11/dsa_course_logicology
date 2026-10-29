import { CodeBlock } from "../../_components/Code";
import { Note } from "../../_components/Prose";
import { FunctionFigure } from "./figures";

export default function Lesson3() {
  return (
    <>
      <p className="lesson__lede">
        Every practice problem asks you to write one function. This lesson covers how functions take values in, give a value back, and keep
        their own names separate from everyone else&rsquo;s.
      </p>

      <h2 id="def">Defining a function</h2>
      <p>
        <code>def</code> gives a block of code a name. The names in brackets are the <em>parameters</em>: they receive the values passed in when the
        function is called.
      </p>
      <CodeBlock
        code={`def area(width, height):
    return width * height

area(3, 4)      # 12`}
      />
      <p>
        Defining a function does not run it. The body runs only when the function is called, and it runs again on every call.
      </p>

      <h2 id="return">return is not print</h2>
      <p>
        <code>return</code> ends the function and hands a value back to the code that called it. <code>print</code> only shows text on the screen.
        The tests check what your function <em>returns</em>. A function that prints the right answer but returns nothing fails every test.
      </p>
      <CodeBlock
        code={`def double_wrong(x):
    print(x * 2)     # shows 10 on screen, then returns None

def double(x):
    return x * 2     # gives 10 back to the caller

y = double_wrong(5)  # y is None
y = double(5)        # y is 10`}
        mark={[2]}
      />
      <p>
        A function with no <code>return</code> line, or with a bare <code>return</code>, gives back <code>None</code>. In a failing test, &ldquo;got{" "}
        <code>None</code>&rdquo; almost always means a missing <code>return</code>.
      </p>

      <h2 id="locals">Local names and frames</h2>
      <p>
        Each call gets a fresh <em>frame</em>: a small box that holds that call&rsquo;s parameters and the names it creates. These are called{" "}
        <em>local names</em>. Two functions can both use a name like <code>a</code> or <code>s</code> without any clash, because each name belongs to
        its own frame. The frame is removed when the call returns.
      </p>
      <p>
        The frames of the calls in progress form a list called the <em>call stack</em>. A new call is added on top. The function on top is the
        one running, and every frame below it is waiting for an answer. Step through the figure and watch the stack grow and shrink.
      </p>

      <FunctionFigure />

      <p>
        The call stack is worth learning now. RECR-2 uses it to explain recursion, which is a function that calls itself, and BIGO-4 uses it to
        count the memory that recursion needs.
      </p>

      <h2 id="lists-in">Passing a list in</h2>
      <p>
        When you pass a list to a function, the parameter refers to the same list. No copy is made. So if the function changes the list, the
        caller sees the change:
      </p>
      <CodeBlock
        code={`def add_zero(a):
    a.append(0)

trains = [5, 7]
add_zero(trains)
print(trains)        # [5, 7, 0]`}
      />
      <p>
        Passing a list costs almost nothing, even for a million values, because nothing is copied. Each practice problem says whether you may
        change the list you are given. If it does not say, return a new list and leave the input alone.
      </p>

      <h2 id="defaults">A mistake with default values</h2>
      <p>A parameter can have a default value, used when the caller leaves it out:</p>
      <CodeBlock
        code={`def greet(name, greeting="Hello"):
    return greeting + ", " + name

greet("Asha")              # 'Hello, Asha'
greet("Asha", "Namaste")   # 'Namaste, Asha'`}
      />
      <Note title="Never use a list as a default value" warn>
        <p>
          The default value is made once, when the function is defined, not on each call. So <code>def f(seen=[])</code> shares one list across
          every call, and values added in one call are still there in the next. Write <code>def f(seen=None)</code>, and inside the function write{" "}
          <code>if seen is None: seen = []</code>.
        </p>
      </Note>
    </>
  );
}
