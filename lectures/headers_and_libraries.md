---
marp: true
math: katex
theme: custom-theme
footer: ![width:80px](images/C++ForYourselfIcon.png)
---
# Libraries

#### Today:
- Different types of libraries
  - Header-only
  - Static
  - Dynamic
- What is linking
- When to use the keyword `inline`
- Some common best practices

### 📺 Watch the related [YouTube video](https://youtu.be/Lxo8ftglwXE)! 

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

# Let's start with an example

Let's say we implement a new machine learning framework :wink:

```cpp
#include <vector>
#include <iostream>

[[nodiscard]] int 
PredictNumber(const std::vector<int>& numbers) {
  // Arbitrarily complex code goes here.
  if (numbers.empty()) { return 0; }
  if (numbers.size() < 2) { return numbers.front(); }
  const auto& one_before_last = numbers[numbers.size() - 2UL];
  const auto difference = numbers.back() - one_before_last;
  return numbers.back() + difference;
}
// Many more similar functions.

int main() {
  const auto number = PredictNumber({1, 2});
  if (number != 3) {
    std::cerr << "Our function does not work as expected 😥\n";
    return 1;
  }
  return 0;
}
```

---
# What if we want to use it in multiple places?
- For now code lives **in a single binary**
- Now assume that we have **two programs** we want to write:
  - One to predict the **house pricing**
  - One to predict the **bitcoin price**
- These should use our "machine learning" functions
- And other things special for those usecases
- :scream: Should we just **copy the code over?**

---
# :scream: Problems with copying?
- Our code is **duplicated**
- If we have more binaries, we have more copies
- Any changes for the functionality needs to be synced
- It requires **us** to keep this in mind - which is **error prone**
- (violates the **DRY** principle)
<br>

<div data-marpit-fragment>

![center w:700](images/im-not-sure.jpg)

</div>

---
# Better solution: header files!
`ml.h`<br>
<!--
`CPP_SETUP_START`
inline constexpr auto next_number{42};
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` ml/ml.h
-->
```cpp
#pragma once  // Stay tuned 😉
#include <vector>
[[nodiscard]] inline  // Stay tuned for "inline"
int PredictNumber(const std::vector<int>& numbers) {
  // Compute next number (skipped to fit on the slide)
  return next_number;
}
```

<div class="grid-container">
<div>

`predict_housing.cpp`
<!--
`CPP_SETUP_START`
#include <vector>
std::vector<int> MagicallyGetHousePrices() {
  return {1, 2, 3};
}
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` ml/main_houses.cpp
`CPP_RUN_CMD` CWD:ml c++ -std=c++17 -I . main_houses.cpp
-->
```cpp
#include <ml.h>  
#include <iostream>
int main() {
  const auto prices = 
    MagicallyGetHousePrices();
  std::cout 
    << "Upcoming price: " 
    << PredictNumber(prices);
  return 0;
}
```
</div>

<div>

`predict_bitcoin.cpp`
<!--
`CPP_SETUP_START`
#include <vector>
std::vector<int> MagicallyGetBitcoinPrices() {
  return {1, 2, 3};
}
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` ml/main_bitcoin.cpp
`CPP_RUN_CMD` CWD:ml c++ -std=c++17 -I . main_bitcoin.cpp
-->
```cpp
#include <ml.h>  
#include <iostream>
int main() {
  const auto prices = 
    MagicallyGetBitcoinPrices();
  std::cout 
    << "Upcoming price: " 
    << PredictNumber(prices);
  return 0;
}
```

</div>
</div>
  
---
# Yay! A header-only library! :tada:
- All functions are implemented in header files (`.h`, `.hpp`)
- We `#include` these header files in our binaries
- :bulb: Put your includes first, then other libraries, then standard

**Pros:**
- **Compiler sees all code** so it can optimize it well
- Compilation remains **simple** (just need the new `-I` flag)
  ```cmd
  c++ -std=c++17 -I folder_with_headers binary.cpp
  ```
**Cons:**
- We **always** recompile the code in headers
- Changes in headers **require recompilation** of depending code
- If we ship the code it **remains readable to anyone**
- We should make the functions `inline` (stay tuned)

---
# What's `#pragma once`?
- A **preprocessor directive** that ensures the header in which it is written is only included once
- There are compilers that don't support it, but most do
- Alternative --- **include guards** 
  For file `file.h` in `folder/` they can be:<br>
  <!--
  `CPP_SKIP_SNIPPET`
  -->
  ```cpp
  #ifndef FOLDER_FILE_H_
  #define FOLDER_FILE_H_

  #endif /* FOLDER_FILE_H_ */
  ```
- They also ensure the header file will be included only once
- ✅ Always use one of these in your header files!
---
# Avoid long compilation times by using binary libraries!
- Move only **declarations** to header files: `*.h` or `*.hpp`
- Move **definitions** to source files: `*.cpp` or `*.cc`
- Compile corresponding source files to **object files**
- Bind the object files into **libraries**
- **Link** the libraries to executables
- The library is **built once**, and **linked** to multiple targets!
- If we change the code in a library we only need to:
  - Rebuild **only** the library
  - `[maybe]` Relink this library to our executables

---
**Declaration:** `ml.h`<br>
<!--
`CPP_COPY_SNIPPET` ml_lib/ml.h
-->
```cpp
#pragma once
#include <vector>
[[nodiscard]] int 
PredictNumber(const std::vector<int>& numbers);
```

**Definition:** `ml.cpp`
<!--
`CPP_SETUP_START`
inline constexpr auto next_number{42};
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` ml_lib/ml.cpp
-->
```cpp
#include <ml.h>
#include <vector>
[[nodiscard]] int 
PredictNumber(const std::vector<int>& numbers) {
  // Compute next number (skipped to fit on the slide)
  return next_number;
}
```

**Calling it:** `predict_prices.cpp`:<br>
<!--
`CPP_SETUP_START`
#include <vector>
std::vector<int> MagicallyGetBitcoinPrices() {
  return {1, 2, 3};
}
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` ml_lib/predict_prices.cpp
`CPP_RUN_CMD` CWD:ml_lib c++ -std=c++17 -I . ml.cpp predict_prices.cpp
-->
```cpp
#include <ml.h>
#include <iostream>
int main() {
  const auto prices = MagicallyGetBitcoinPrices();
  std::cout << "Upcoming price: " << PredictNumber(prices);
  return 0;
}
```

---

# Just build it as before?
```cmd
c++ -std=c++17 predict_prices.cpp -I . -o predict_prices
```
<div data-marpit-fragment>

### Error: compiler sees only the declaration
```css
Undefined symbols for architecture arm64:
  "PredictNumber(
    std::__1::vector<int, std::__1::allocator<int> > const&)", 
    referenced from: _main in predict_prices-066946.o
ld: symbol(s) not found for architecture arm64
clang: error: linker command failed with exit code 1
(use -v to see invocation)
```
:bulb: Your error will look similar but slightly different


### :thinking: Compile all together - solution?
```cmd
c++ -std=c++17 -I . ml.cpp predict_prices.cpp
```
<div data-marpit-fragment>

:x: not really - does not solve our "recompilation" issue!

</div>
</div>

---

# Compile objects and libraries
- **Compile** source files into **object files** (use the `-c` flag) <br>
  ```cmd
  c++ -std=c++17 -c ml.cpp -I includes -o ml_static.o
  ```
  ```cmd
  c++ -std=c++17 -c -fPIC ml.cpp -I includes -o ml_dynamic.o 
  ```
  <br>Assuming that all includes live in the `includes` folder,
  results in `*.o` binary files that an OS can read and interpret
- Pack objects into **libraries:**
  - **Static** libraries (`*.a`) are just archives of object files
    ```cmd
    ar rcs libml.a ml_static.o <other_object_files>
    ```
  - **Dynamic** libraries (`*.so`) are a bit more complex
    ```cmd
    c++ -shared ml_dynamic.o <other_object_files> -o libml.so
    ```
- Finally, we **link** the libraries to our binary

---
# Linking libraries to binaries
- Linking tells the compiler in which binary library file to find the **definition** for a **declaration** it sees in a header file
- **Link** our `main` executable to the libraries it uses
  ```cmd
  c++ -std=c++17 main.cpp -L folder -I includes -lml -o main
  ```
  - `-I includes` - Headers are in the `includes` folder
  - `-L folder` - Add `folder` to the library search path
  - `-lml` - Link to the library file `libml.a` or `libml.so`
  - 🚨 Note that `-l` flags must be **after** all `.cpp` or `.o` files
  - 🚨 Same usage for both static and dynamic libraries but a different resulting executable
- **Static** libraries are **copied** inside the resulting `main` binary
- **Dynamic** libraries are **linked** to the resulting `main` binary

---
# What's the difference between static and dynamic libraries?
- Binaries with **static linkage**:
  - Contain **binary code** of other libraries, usually **bigger**
  - Can be copied anywhere on any similar operating system
- Binaries with **dynamic linkage**:
  - Contain **references** to other libraries, usually **smaller**
  - Dependencies (dynamic libraries) are looked up at runtime
    - Relative to the current path
    - In the paths stored in `LD_LIBRARY_PATH` variable
  - If you move your binary or libraries you might break it
  - See linked libs with `ldd` (Linux) or `otool -L` (MacOS)
- In this course **we will use static libraries**

---
# Mixing header-only and compiled libraries requires caution 🚨
- Let's assume we have a header file `print.h`:
  <!--
  `CPP_COPY_SNIPPET` print/print.h
  -->
  ```cpp
  #include <iostream>
  // Notice no inline keyword here
  void Print(const std::string& str) { std::cout << str << "\n"; }
  ```
- We use this file in two **compiled libraries**: `foo` and `bar`
<div class="grid-container">
<div>

`foo.h`
<!--
`CPP_COPY_SNIPPET` print/foo.h
-->
```cpp
void Foo();
```

`foo.cpp`
<!--
`CPP_COPY_SNIPPET` print/foo.cpp
-->
```cpp
#include <print.h>
void Foo() {
  Print("Foo");
}
```

</div>
<div>

`bar.h`
<!--
`CPP_COPY_SNIPPET` print/bar.h
-->
```cpp
void Bar();
```

`bar.cpp`
<!--
`CPP_COPY_SNIPPET` print/bar.cpp
-->
```cpp
#include <print.h>
void Bar() {
  Print("Bar");
}
```

</div>
</div>

---
# Mixing header-only and compiled libraries requires caution 🚨
- Finally, we write a program that uses them: `main.cpp`
  <!--
  `CPP_COPY_SNIPPET` print/main.cpp
  `CPP_RUN_CMD` CWD:print c++ -std=c++17 -c -I . foo.cpp -o foo.o && c++ -std=c++17 -c -I . bar.cpp -o bar.o && ar rcs libfoo.a foo.o && ar rcs libbar.a bar.o
  -->
  ```cpp
  #include <foo.h>
  #include <bar.h>
  int main() {
    Foo();
    Bar();
    return 0;
  }
  ```
- And compile it as an executable `main`:
  ```cmd
  c++ -std=c++17 -c -I . main.cpp -o main.o
  c++ -std=c++17 -c -I . foo.cpp -o foo.o
  ar rcs libfoo.a foo.o
  c++ -std=c++17 -c -I . bar.cpp -o bar.o
  ar rcs libbar.a bar.o
  c++ main.o -L . -I . -lfoo -lbar -o main
  ```

<div data-marpit-fragment>

:x: Oops, it does not link! (build it to see the error :wink:)

</div>

---
# But.. why?
- Linker failed because we violated **ODR** --- [**O**ne **D**efinition **R**ule](https://en.cppreference.com/w/cpp/language/definition)
- It states that there must be **exactly one** definition of every symbol in the program, i.e., your **functions** and **variables**
- We have two libraries `libfoo.a` and `libbar.a` with source files that both include the `print.h` and therefore have a **definition** of the `Print(...)` function
- Our executable links to both `libfoo.a` and `libbar.a`, so it has two definitions for the `Print(...)` function, which causes an **error** :x:
---
# `inline` to the rescue! 🦸‍♀️

- ODR allows to have multiple definitions of `inline` functions (as long as all of them are in different translation units)
- So adding `inline` to `Print(...)` will tell the compiler that we know there will be multiple definitions of it and we **guarantee that they are all the same**!
  <!--
  `CPP_COPY_SNIPPET` print/print.h
  `CPP_RUN_CMD` CWD:print c++ -std=c++17 -c -I . foo.cpp -o foo.o && c++ -std=c++17 -c -I . bar.cpp -o bar.o && ar rcs libfoo.a foo.o && ar rcs libbar.a bar.o && c++ -std=c++17 main.cpp -L . -I . -lfoo -lbar -o main
  -->
  ```cpp
  #include <iostream>
  inline void 
  Print(const std::string& str) { std::cout << str << "\n"; }
  ```
- 🚨 `inline` can only be used in function **definition**
- :bulb: `inline` also **hints** to the compiler that it should **inline** a function --- copy its binary code in-place

---
# We have to be careful!
Let's change our `foo.cpp` and `bar.cpp` a little
<div class="grid-container">
<div>

`foo.cpp`
<!--
`CPP_COPY_SNIPPET` print/foo_inline.cpp
-->
```cpp
#include <iostream>
inline void Print() {
  std::cout << "Foo\n";
}
void Foo() { Print(); }
```

</div>
<div>

`bar.cpp`
<!--
`CPP_COPY_SNIPPET` print/bar_inline.cpp
`CPP_RUN_CMD` CWD:print c++ -std=c++17 -c -I . main.cpp -o main.o && c++ -std=c++17 -c -I . foo_inline.cpp -o foo_inline.o && c++ -std=c++17 -c -I . bar_inline.cpp -o bar_inline.o && ar rcs libfoo_inline.a foo_inline.o && ar rcs libbar_inline.a bar_inline.o && c++ main.o -L . -I . -lfoo_inline -lbar_inline -o main_inline
-->
```cpp
#include <iostream>
inline void Print() {
  std::cout << "Bar\n";
}
void Bar() { Print(); }
```

</div>
</div>

<div class="grid-container">
<div>

`main.cpp`
<!--
`CPP_COPY_SNIPPET` print/main.cpp
`CPP_RUN_CMD` CWD:print c++ -std=c++17 -c -I . foo.cpp -o foo.o && c++ -std=c++17 -c -I . bar.cpp -o bar.o && ar rcs libfoo.a foo.o && ar rcs libbar.a bar.o
-->
```cpp
#include <foo.h>
#include <bar.h>
int main() {
  Foo(); Bar(); return 0;
}
```


</div>

<div>

#### Output of `./main`?
  
<div data-marpit-fragment>

```
Bar
Bar
```
:scream:

</div>
</div>

</div>

```cmd
c++ -std=c++17 -c -I . foo.cpp -o foo.o && ar rcs libfoo.a foo.o
c++ -std=c++17 -c -I . bar.cpp -o bar.o && ar rcs libbar.a bar.o
c++ -std=c++17 main.cpp -L . -I . -lfoo -lbar -o main
```

---
# Welcome back to the UB land!
![bg center w:1100](images/this-is-fine.gif)

---

# What happened?
- We have two functions with the same signature:
  <!--
  `CPP_SKIP_SNIPPET`
  -->
  ```cpp
  void Print();
  ```
- The definitions of this function are different and are in different translation units `foo.cpp` and `bar.cpp`
- When we link them together into `main` the compiler sees multiple definitions and **assumes they are the same**
- It **picks the first one** it sees and discard the other one

---

# How to avoid errors?
- Don't use `inline` in source files
- ✅ Always use `inline` if you **define** functions in headers
- ✅ Do the same for constants 🔼1️⃣7️⃣ 
  ```c++
  inline constexpr auto kConst = 42;
  ```
- ✅ Use **namespaces** rigorously
- ✅ Use **unnamed namespaces** in your source files for functions and constants used only within that source file

<div class="grid-container">
<div>

`foo.cpp`
<!--
`CPP_COPY_SNIPPET` print/foo_inline_unnamed.cpp
-->
```cpp
#include <iostream>
namespace {
void Print() {
  std::cout << "Foo\n";
}
} // namespace
void Foo() { Print(); }
```

</div>
<div>

`bar.cpp`
<!--
`CPP_COPY_SNIPPET` print/bar_inline_unnamed.cpp
`CPP_RUN_CMD` CWD:print c++ -std=c++17 -c -I . foo_inline_unnamed.cpp -o foo_inline_unnamed.o && c++ -std=c++17 -c -I . bar_inline_unnamed.cpp -o bar_inline_unnamed.o && ar rcs libfoo_inline_unnamed.a foo_inline_unnamed.o && ar rcs libbar_inline_unnamed.a bar_inline_unnamed.o && c++ -std=c++17 main.cpp -L . -I . -lfoo_inline_unnamed -lbar_inline_unnamed -o main_inline_unnamed
-->
```cpp
#include <iostream>
namespace {
void Print() {
  std::cout << "Bar\n";
}
} // namespace
void Bar() { Print(); }
```

</div>
</div>

---
# Summary
- Use libraries to reuse/share your code
- You have **3 options** for libraries:
  - **Header-only**
  - **Static**
  - **Dynamic**
- Each has their own benefits and downsides
- In this course we will mostly use a combination of
  header-only and static libraries

---

![bg](https://fakeimg.pl/1280x1024/226699/fff/?text=Good%20luck!&font=bebas)

<!-- 
Great article: https://jm4r.github.io/Inline/

ELF: https://stackoverflow.com/questions/41879433/file-format-differences-between-a-static-library-a-and-a-shared-library-so -->