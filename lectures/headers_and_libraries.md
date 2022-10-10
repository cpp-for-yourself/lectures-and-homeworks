---
marp: true
math: katex
theme: custom-theme
paginate: true
# footer: ![width:80px](images/C++ForYourselfIcon.png)
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
# What if we want to use it somewhere else?
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
![center](images/im-not-sure.jpg)

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
#pragma once
#include <vector>
[[nodiscard]] inline int 
PredictNumber(const std::vector<int>& numbers) {
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
- Compilation remains **simple**
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
# Avoid long compilation by using binary libraries!
- Move only **declarations** to header files: `*.h` or `*.hpp`
- Move **definitions** to source files: `*.cpp` or `*.cc`
- Compile corresponding source files to modules
- Bind the modules into libraries
- **Link** the libraries to executables

---
- **Declaration:** `ml.h`<br>
  <!--
  `CPP_COPY_SNIPPET` ml_lib/ml.h
  -->
  ```cpp
  #pragma once
  #include <vector>
  [[nodiscard]] int 
  PredictNumber(const std::vector<int>& numbers);
  ```
- **Definition:** `ml.cpp`
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
  [[nodiscard]] int PredictNumber(const std::vector<int>& numbers) {
    // Compute next number (skipped to fit on the slide)
    return next_number;
  }
  ```
- **Calling it:** `predict_prices.cpp`:<br>
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
c++ -std=c++17 predict_prices.cpp -o predict_prices
```
### Error: compiler sees only the declaration
```css
λ › c++ -std=c++17 predict_prices.cpp
Undefined symbols for architecture arm64:
  "PredictNumber()", referenced from:
      _main in predict_prices-a44513.o
ld: symbol(s) not found for architecture arm64
clang: error: linker command failed with exit code 1
(use -v to see invocation)
```
:bulb: Your error will look similar but slightly different


### :thinking: Compile all together - solution?
```cmd
c++ -std=c++17 predict_prices.cpp ml.cpp
```
:x: not really - does not solve our "recompilation" issue!

---

# Compile modules and libraries
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
# Then link libraries to binaries
- Linking tells the compiler in which binary file to find the **definition** for a **declaration** it sees
- **Link** our `main` executable to the libraries it uses
  ```cmd
  c++ -std=c++17 main.cpp -L folder -lml -o main
  ```
  - `-L folder` - Add `folder` to the library search path
  - `-lml` - Link to the library file `libml.a` or `libml.so`
  - 🚨 Same usage for both static and dynamic libraries but different result!
- **Static** libraries are **copied** inside the resulting `main` binary
- **Dynamic** libraries are **linked** to the resulting `main` binary
- TODO: show difference

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
  c++ -std=c++17 -c -I . foo.cpp -o foo.o
  ar rcs libfoo.a foo.o
  c++ -std=c++17 -c -I . bar.cpp -o bar.o
  ar rcs libbar.a bar.o
  c++ -std=c++17 main.cpp -L . -I . -lfoo -lbar -o main
  ```
- :x: Oops, it does not link! (build it to see the error :wink:)

---
# But.. why?
- Linker failed because we violated **ODR** --- [**O**ne **D**efinition **R**ule](https://en.cppreference.com/w/cpp/language/definition)
- It states that there must be **exactly one** definition of every symbol in the program, i.e., your **functions** and **variables**
- We have two libraries `foo.a` and `bar.a` with source files that both include the `print.h` and therefore have a **definition** of the `Print(...)` function
- Our executable links to both `foo.a` and `bar.a`, so it has two definitions for the `Print(...)` function --- :x: **error**
---
# `inline` to the rescue! 🦸‍♀️

- It is allowed to have multiple definitions of `inline` functions (as long as all of them are in different translation units)
- So adding `inline` to `Print(...)` will tell the compiler that we know there will be multiple definitions of it and we guarantee that they are all the same!
  <!--
  `CPP_COPY_SNIPPET` print/print.h
  `CPP_RUN_CMD` CWD:print c++ -std=c++17 -c -I . foo.cpp -o foo.o && c++ -std=c++17 -c -I . bar.cpp -o bar.o && ar rcs libfoo.a foo.o && ar rcs libbar.a bar.o && c++ -std=c++17 main.cpp -L . -I . -lfoo -lbar -o main
  -->
  ```cpp
  #include <iostream>
  inline void 
  Print(const std::string& str) { std::cout << str << "\n"; }
  ```
- So we must use `inline` for functions that have a definition in a header file in case they are used in compiled libraries

---
# Not so fast cowboy!
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
`CPP_RUN_CMD` CWD:print c++ -std=c++17 -c -I . foo_inline.cpp -o foo_inline.o && c++ -std=c++17 -c -I . bar_inline.cpp -o bar_inline.o && ar rcs libfoo_inline.a foo_inline.o && ar rcs libbar_inline.a bar_inline.o && c++ -std=c++17 main.cpp -L . -I . -lfoo_inline -lbar_inline -o main_inline
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

- Let's compile it in exactly the same way:
  ```cmd
  c++ -std=c++17 -c -I . foo.cpp -o foo.o
  ar rcs libfoo.a foo.o
  c++ -std=c++17 -c -I . bar.cpp -o bar.o
  ar rcs libbar.a bar.o
  c++ -std=c++17 main.cpp -L . -I . -lfoo -lbar -o main
  ```
- What will be the output of `./main`?
---
## <br><br><br><br><br><br><br><br><br>Output is...
![bg w:100%](images/ub.jpg)
```
Bar
Bar
```

---

# What happened? How to fix this?
- We have two functions with the same signature:
  <!--
  `CPP_SKIP_SNIPPET`
  -->
  ```cpp
  void Print();
  ```
- The definitions of this function are different and are in different translation units `foo.cpp` and `bar.cpp`
- When we link them together into `main` the compiler sees multiple signatures and assumes they are the same
- It picks the first one it sees and discard the other one
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

# What to do
- Don't use `inline` in source files --- only use it in headers!
- Always use `inline` if you define functions in headers
- Do the same holds for constants:
  ```c++
  inline constexpr auto kConst = 42;
  ```
- Use **namespaces** rigorously. A good rule of thumb is to mimic the folder structure of your project with namespaces
- Use **anonymous (unnamed) namespaces** in your source files for local functions and constants


<!-- 
Great article: https://jm4r.github.io/Inline/

ELF: https://stackoverflow.com/questions/41879433/file-format-differences-between-a-static-library-a-and-a-shared-library-so -->