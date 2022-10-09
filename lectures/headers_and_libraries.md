---
marp: true
math: katex
theme: custom-theme
paginate: true
# footer: ![width:80px](images/C++ForYourselfIcon.png)
---
# Let's start with an example
```cpp
#include <vector>
#include <string>
using std::vector;
using std::string;

vector<string> Split(const string& str, const string& delimiter) {
  vector<string> split{};
  auto start = 0UL;
  auto found_position = str.find(delimiter, start);
  while(found_position != string::npos) {
    split.emplace_back(str.substr(start, found_position - start));
    start = found_position + delimiter.length();
    found_position = str.find(delimiter, start);
  }
  split.emplace_back(str.substr(start));
}
// Many more similar functions.

int main() {
  const auto split = Split("hello world", " ");
  // Do smth with it.
}
```

---
# What if we want to use the functions in another binary?
- The functions that we wrote might be useful in other situations too
- We can only use them within our current binary for now
- In order to use them elsewhere we must make a library out of them
- The remainder of this lecture will be all about this - how to create and work with libraries in C++

---
# The obvious solution:<br>put them in header files!
- This _is_ a viable solution, called a **"header-only"** library
- All of the functions go to a header file now, which we include from our binary file
- We should make the functions `inline` (more on that later)
- There is still just one binary and we compile it as before

### Problems:
- We always recompile all the code
- Changes to the code in a header file require recompiling all the files that include it
- If we _do_ use `inline` the binaries become bigger
- If we ship the code to other people - they can read it easily

---
# Alternative:<br>split to header and source files
- Move all declarations to header files: `*.h` or `*.hpp`
- Move implementation to source files: `*.cpp` or `*.cc`
- Compile corresponding source files to modules
- Bind the modules into libraries
- Link the libraries to our main binary
---

TODO:
if we have functions with the same signature in 2 files:
- all in headers - works
- compile into modules and link together - linker complains
- compile into libraries and link - linker silent - UB
- inline - allows use of the same function in different 

Great article: https://jm4r.github.io/Inline/

---
## Example
- **Declaration:** `tools.h`<br>
  <!--
  `CPP_COPY_SNIPPET` weather/tools.h
  -->
  ```cpp
  #pragma once  // Stay tuned 😉
  void MakeItSunny();
  void MakeItRain();
  ```
- **Definition:** `tools.cpp`
  <!--
  `CPP_COPY_SNIPPET` weather/tools.cpp
  -->
  ```cpp
  #include <iostream>
  #include "tools.h"
  void MakeItRain() {
    // Important weather manipulation code
    std::cout << "Here! Now it rains! Happy?\n";
  }
  void MakeItSunny() { std::cerr << "Not available\n"; }
  ```
- **Calling it:** `main.cpp`:<br>
  <!--
  `CPP_COPY_SNIPPET` weather/main.cpp
  `CPP_RUN_CMD` CWD:weather c++ -std=c++17 tools.cpp main.cpp
  -->
  ```cpp
  #include "tools.h"
  int main() {
    MakeItRain();
    MakeItSunny();
    return 0;
  }
  ```
---

# Just build it as before?
```cmd
c++ -std=c++17 main.cpp -o main
```
## Error:
```css
λ › c++ -std=c++17 main.cpp
Undefined symbols for architecture arm64:
  "MakeItRain()", referenced from:
      _main in main-a44513.o
  "MakeItSunny()", referenced from:
      _main in main-a44513.o
ld: symbol(s) not found for architecture arm64
clang: error: linker command failed with exit code 1
(use -v to see invocation)
```
:bulb: Your error will look similar but slightly different


### :thinking: Compile all together - solution?
```cmd
c++ -std=c++17 main.cpp tools.cpp -o main
```

---

# Compile modules and libraries!
- **Compile modules:**<br>
  ```cmd
  c++ -std=c++17 -c tools.cpp -o tools.o
  ```
- **Organize modules into libraries:**
  ```cmd
  ar rcs libtools.a tools.o <other_modules>
  ```
- **Link libraries when building code:**
  ```cmd
  c++ -std=c++17 main.cpp -L . -ltools -o main
  ```
  - `-L` - Add a folder to the library search path
  - `-ltools` - link to the library file `libtools.a`
- **Run the code:**<br>
  ```cmd
  ./main
  ```

---

# Libraries
- **Library:** multiple object files that are logically
connected
- Types of libraries:
  - **Static:** usually faster, take more space, become part of the end binary, named: `lib*.a`
  - **Dynamic:** usually slower, can be copied, referenced by a program, named `lib*.so`
- Create a static library with
  ```cmd
  ar rcs libname.a module.o module.o ...
  ```
- Static libraries are just archives just like `zip`, `tar` etc.

---

# What is linking?
- The library is a binary object that contains the **compiled implementation** of some methods
- Linking maps a function declaration to its compiled implementation
- To use a library we **need a header and the compiled library** object

--- 
# Mixing header-only and compiled libraries - beware of ODR
- Let's set the stage
- We have a header-only library with one header. There is a function _defined_ in it
- We have two libraries with source files that both include the above-mentioned header
- We have a binary that links to the two libraries
- The linking will fail without the inline
- With the inline we might have issues too

---
# What to do
- Use namespaces rigorously. A good rule of thumb is to mimic the folder structure of your project with namespaces
- Use inline if you define functions in headers
- Use anonymous (unnamed) namespaces in your source files for local functions
- The same holds for constants