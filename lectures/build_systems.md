---
marp: true
math: katex
theme: custom-theme
# paginate: true
footer: ![width:80px](images/C++ForYourselfIcon.png)
---

# Build systems

#### Today:
- Intro to build systems
- Build commands in a script
- Build commands in Makefile

### 📺 Watch the related [YouTube video](https://youtu.be/kbk4DphsYPU)!

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
# Let's set up our [C++ files](code/make/simple_build) (again)
[`blah.h`](code/make/simple_build/blah.h)
<!--
`CPP_COPY_SNIPPET` make_simple/blah.h
-->
```cpp
#pragma once
namespace tools {
void PrintHello();
} // namespace tools
```

[`blah.cpp`](code/make/simple_build/blah.cpp)
<!--
`CPP_COPY_SNIPPET` make_simple/blah.cpp
-->
```cpp
#include <blah.h>
#include <iostream>
namespace tools {
void PrintHello() { std::cout << "Hello!" << std::endl; }
} // namespace tools
```

[`main.cpp`](code/make/simple_build/main.cpp)
<!--
`CPP_COPY_SNIPPET` make_simple/main.cpp
`CPP_RUN_CMD` CWD:make_simple c++ -std=c++17 -c blah.cpp -I . -o blah.o && ar rcs libblah.a blah.o && c++ -std=c++17 main.cpp -L . -I . -lblah -o main
-->
```cpp
#include <blah.h>
int main() {
  tools::PrintHello();
  return 0;
}
```

---
# It's annoying to compile libraries by hand, isn't it?
- There are **many commands** we have to type **in the right order**
- If we **mess up their order** --- the libraries **don't compile**!
- **We can definitely do better!**
- :thinking: **Naive solution:** we could write a **bash script**!
  `build.sh`<br>
  <!--
  `CPP_COPY_SNIPPET` make_simple/build.sh
  `CPP_RUN_CMD` CWD:make_simple bash build.sh
  -->
  ```bash
  # Building an executable from main.cpp using library blah.cpp
  c++ -std=c++17 -c blah.cpp -I . -o blah.o
  ar rcs libblah.a blah.o
  c++ -std=c++17 main.cpp -L . -I . -lblah -o main
  ```
- Now imagine building **many** libraries and executables
  or **only** rebuilding **when the code changes**
- We have to write **lots of bash code** to support this
- To avoid that, people have written multiple **build systems**!

---
# [Make](https://www.gnu.org/software/make/) - a basic build system
- Stores the commands in a `Makefile` file
- Commands are executed as a **chain of dependencies**
- 🚨 Use **tabs** (<kbd>↹</kbd>) **not spaces** (<kbd>⎵</kbd>) to indent code in this file!
- Has **block structure** and **simple syntax** (for simple cases :wink:)<br>
  <!--
  `CPP_SKIP_SNIPPET`
  -->
  ```make
  target: dependencies
    command
    command
    command
  ```
- Run `make target` from a folder with `Makefile`
- Can have many targets with many dependencies
- If `target` **file** exists and is **not older** than its `dependencies` --- **nothing happens**!
- :bulb: This allows us to **avoid doing the work twice**!
- :bulb: A very good `make` tutorial: https://makefiletutorial.com

---
# A [`Makefile`](code/make/simple_build/Makefile) to build C++ code
<!--
`CPP_COPY_SNIPPET` make_simple/Makefile
`CPP_RUN_CMD` CWD:make_simple make
-->
```make
all: main

main: main.cpp libblah.a
	c++ -std=c++17 main.cpp -I . -L . -lblah -o main

libblah.a: blah.o
	ar rcs libblah.a blah.o

blah.o: blah.cpp
	c++ -std=c++17 -c blah.cpp -I . -o blah.o

clean:
	rm -f blah.o libblah.a main
```
- Run this with `make` from the same [folder](code/make/simple_build/)
- :bulb: Follow the order of operations here! What happens when?
- :bulb: Try to run `make` **again**! What happens now?
- :bulb: Change a file and re-run `make` **again**! Did it re-build?
- :bulb: Run `make clean` to remove the generated files

---
# Problems with Makefiles :thinking:
- `Makefile`s are **very powerful** but can get pretty **complex**
- The syntax is **finicky** and a bit **too detailed**, not really abstract
- Writing a `Makefile` for a big project can be hard
- Supporting **different configurations** also gets complex

# Alternatives?
- Use a **different build system**, e.g. [ninja](https://ninja-build.org), [bazel](https://bazel.build) etc.
- And/or use a **build generator**, like [CMake](https://cmake.org), [Meson](https://mesonbuild.com/Tutorial.html), etc.

# Stay tuned!

---

![bg](https://fakeimg.pl/1280x1024/226699/fff/?text=Good%20luck!&font=bebas)
