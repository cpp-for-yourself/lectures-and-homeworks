---
marp: true
math: katex
theme: custom-theme
footer: ![width:80px](images/C++ForYourselfIcon.png)
---

# Compilation flags and debugging

#### Today:
- What other compilation flags exist
- What compilation flags to use
- How to debug code

### 📺 Watch the related [YouTube video](https://youtu.be/NTlcDv7W2-c)!

---
# Special symbols used in slides
- 🎨 - Style recommendation
- 🎓 - Software design recommendation
- 😱 - **Not** a good practice! Avoid in real life!
- ✅ - Good practice!
- ❌ - Whatever is marked with this is wrong
- 🚨 - Alert! Important information!
- 💡 - Hint or a useful exercise
- 🔼1️⃣7️⃣ - Holds for this version of C++(here, `17`) and **above**
- 🔽1️⃣1️⃣ - Holds for versions **until** this one C++(here, `11`)

Style (🎨) and software design (🎓) recommendations mostly come from [Google Style Sheet](https://google.github.io/styleguide/cppguide.html) and the [CppCoreGuidelines](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines)

---
# Compilation flags
- Lots of flags can be passed while compiling the code
- We have seen some already: `-std=c++17`, `-o`, etc.
  ```cmd
  c++ -std=c++17 -o test test.cpp
  ```
- ✅ Enable **most** [warnings](https://gcc.gnu.org/onlinedocs/gcc/gcc-command-options/options-to-request-or-suppress-warnings.html#cmdoption-Wall), treat them as errors:
  `-Wall`, `-Wextra`, `-Wpedantic`, `-Werror`
- Other warnings possible too:
  `-Wimplicit-fallthrough`, `-Wsign-conversion`, etc.
- Optimization options:
  - `-O0` - no optimization `[default]`
  - `-O3` - full optimization `[preferred]`
- Keep debugging symbols: `-g` (usually used with `-O0`)

---
# Debugging your code
- Debugging **will** take more time than writing your code
- :bulb: Read about [how to think about debugging](https://github.com/kmille/linux-debugging/blob/1e863038859420a50e2ebe3e7e18362aa70e8f57/mindset.md) (**really**, do it!)
- When it comes to tools used for debugging,
  there are largely two different philosophies:
  - Using **print** statements `[my preference]`
  - Using a **debugger**
- Each has advantages and disadvantages
- No debugging methods is complete without you thinking about the **probable cause of the problem**
- You can read [a discussion](https://news.ycombinator.com/item?id=26925570) on Hacker News about it

---
# Using print statements
- Just add any printout statements to your code
- I usually use a form of a print statement shown below:
  <!--
  `CPP_SETUP_START`
  #include <iostream>
  using std::cerr;
  using std::endl;
  int main() {
    int value{};
    $PLACEHOLDER
    return 0;
  }
  `CPP_SETUP_END`
  -->
  ```cpp
  cerr << __FILE__ << ":" << __LINE__ << ": " << value << endl;
  ```
- This will print the filename and a line where its called
- We can also print a `value` of interest at any point
- Usually requires to recompile only part of the program
- **Typical workflow:**
  - Observe the behavior
  - Form a hypothesis of what is wrong
  - Try a fix and repeat until problem is solved
- This workflow forces us **to understand** the problem before rushing into trying a solution
---
# Using a debugger
- Allows stopping a program at a point and looking around
- Requires **debug symbols** (`-g` flag), needs **full** recompilation
- Might be confusing with optimizations enabled
- Best program to use is probably `lldb` or `gdb`
- Insanely popular and powerful (and already installed :wink:)
- Allows to print the **backtrace**
- No built-in gui :cry:
- There are some tools built on top of GDB to fix this:
  - [`gdbgui`](https://gdbgui.com/) is a Python tool that provides a web GUI for GDB
  - VSCode C++ extension provides a GUI for the debugger
- I rarely use a debugger and when I do I use `lldb`/`gdb`
---
# Exercise: debug a simple program!
:x: Beware it has an error!
```cpp
#include <iostream>
#include <vector>
int main() {
  std::vector<int> numbers{1, 2, 3};
  for (auto i = numbers.size() - 1UL; i >= 0; --i) {
    std::cout << numbers[i] << std::endl;
  }
  return 0;
}
```
Once we run the program it crashes at some point:
```css
[1]    74786 segmentation fault  ./program
```
---
# Using print statements
```cpp
#include <iostream>
#include <vector>
int main() {
  std::vector<int> numbers{1, 2, 3};
  int count{};  // <- Count used for debugging
  for (auto i = numbers.size() - 1UL; i >= 0; --i) {
    std::cerr << "i = " << i << std::endl;  // <- Debug print
    std::cout << numbers[i] << std::endl;
    if (count++ > 10) {break;}  // <- Early exit
  }
  return 0;
}
```
- We can see smth like this on `stderr`:
  ```
  i = 2
  i = 1
  i = 0
  i = 18446744073709551615
  ```
- Now we can guess what happens, here is a [hint](cpp_basic_types_and_variables.md#be-careful-with-unsigned-integers) :wink:
---
# Using `lldb` (or `gdb`)
- Recompile the code with `-g -O0` flags
- Start the code in the debugger:
  ```cmd
  λ › lldb ./program
  (lldb) target create "./program"
  Current executable set to '/private/tmp/program' (arm64).
  (lldb) r
  ```
- When it fails, `lldb` shows us **where** it fails
- To find out **why** we will add a breakpoint
  ```
  (lldb) breakpoint set --file program.cpp --line 6
  ```
- Restart by typing `r`, the execution will stop at breakpoint
- We now add a `watch` on the variable `i`
  ```
  (lldb) watch set var i
  ```
- Repeatedly enter `c` and press <kbd>⏎</kbd> until the [issue](cpp_basic_types_and_variables.md#be-careful-with-unsigned-integers) is found
- Full [tutorial](https://lldb.llvm.org/use/tutorial.html) directly from `lldb`
---


![bg](https://fakeimg.pl/1280x1024/226699/fff/?text=Good%20luck!&font=bebas)
