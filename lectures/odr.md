### Why we care about linkage
#### Example with broken linkage
Now I think is a good time to dive into an [example](code/static_no_classes/odr_violation/) that should show us why linkage is so important and what can go wrong if we don't follow best practices.
<!-- The code for the whole example is as always in the repository linked below the video -->

Say we have a somewhat large project and in it we write a library that has a declaration of a function `SayHello` in a header file `our_cool_lib.hpp`:

`our_cool_lib.hpp`
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` linkage/our_cool_lib.hpp
-->
```cpp
void SayHello();  // 😱 This really should be inline
```

We further write a definition of our function, which prints "Hello!" to the terminal when we call it, in a corresponding source file `our_cool_lib.cpp`:
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` linkage/our_cool_lib.cpp
-->
```cpp
#include "our_cool_lib.hpp"

#include <iostream>

void SayHello() { std::cout << "Hello!" << std::endl; }
```

And we also add another file `main.cpp` that includes our header and calls the `SayHello` function in the `main` function:
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` linkage/main.cpp
`CPP_RUN_CMD` CWD:linkage c++ -std=c++17 -c main.cpp
-->
```cpp
#include "our_cool_lib.hpp"

int main() {
  SayHello();
  return 0;
}
```

Now, we just need to instruct the compiler and the linker on how to build and link this code and we do that using CMake. Let's further assume that we implement this as part of some large project so we also link to some `other_lib` that might itself be linked against other libraries too. We will see why this matters in a second.
<!--
`CPP_SKIP_SNIPPET`
-->
```cmake
# Omitting CMake boilerplate and creation of other_lib

add_library(our_cool_lib our_cool_lib.cpp)
target_link_libraries(our_cool_lib PUBLIC cxx_setup)

add_executable(main main.cpp)
target_link_libraries(main PRIVATE other_lib our_cool_lib)
```

So far so good. Now, we build it and run it and should get our "Hello!" printed to the terminal:
```cmd
λ › cmake  -S . -B build
λ › cmake --build build -j 12
λ › ./build/main
What??? 🤯
```

#### What went wrong?
Wait... What? Why did it not print "Hello!" as we expected?

Well, I hid something from you before. But only because this can happen in real projects! You might have guessed that the `other_lib` is somehow involved. Somehow, somebody had a header `other_lib.hpp` that had exactly the same declaration of the `SayHello` function as we did!
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` other_lib/other_lib.hpp
-->
```cpp
void SayHello();  // 😱 This really should be inline
```

However, in the corresponding source file `other_lib.cpp` they had a different printout!
<!--
`CPP_SETUP_START`
$PLACEHOLDER

int main() {
  SayHello();
}
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` other_lib/other_lib.cpp
`CPP_RUN_CMD` CWD:other_lib c++ -std=c++17 -c other_lib.cpp
-->
```cpp
#include "other_lib.hpp"

#include <iostream>

void SayHello() { std::cout << "What??? 🤯" << std::endl; }
```

Ok, so we start getting the feeling that something _might_ go wrong here, but why does it?

The reason for this is that the linkage of the `SayHello` function is **external** as it is a function in the namespace scope and every function at namespace scope has external linkage by default. And there are now two definitions of the `SayHello` function in two different libraries. And these definitions are different. This means that we get into trouble because of the [One Definition Rule (ODR)](https://en.cppreference.com/w/cpp/language/definition) violation. That rule states roughly this: that any symbol must have exactly one definition in the entire program, i.e., across all of its translation units. Only `inline` symbols can have more than one definition which are then all assumed to be exactly the same.

So, here is a slightly simplified explanation of what happens when we compile our code. First, the compiler sees the declaration of the function in our `our_cool_lib.hpp` file, understands that the linkage of the `SayHello` symbol is external and calmly continues, knowing that the linker will take care of finding where the implementation of `SayHello` lives. Which the linker does. The issue arises because the linked sees the `SayHello` symbol from the `other_lib` first. As that symbol also has external linkage and expecting that we know about ODR, it happily links these symbols together and stops. So we end up calling a wrong function!

:bulb: Note that _which_ function is called in such a situation is pure luck as the way the linker will search for the proper symbol is implementation defined. It is implicitly assumed that we follow the ODR and nobody double checks it. Which is to say, that we are firmly in the "Undefined behavior land" 🌈🦄

This is why it is so important to have the right muscle memory when writing C++ code to never end up in such a situation!

#### How to fix the ODR violation?
Now that we understand _what_ went wrong, how can we fix this?

And this is, I believe, where `static` historically has been used. Remember how I mentioned that `static` functions have **internal** linkage? We can make use of this.

First, let's consider what would happen if we added `static` before the declaration and the definition of _our_ `SayHello` function?

`our_cool_lib.hpp`
<!--
`CPP_SKIP_SNIPPET`
-->
```cpp
static void SayHello();  // 😱 This really should be inline
```

`our_cool_lib.cpp`:
<!--
`CPP_SKIP_SNIPPET`
-->
```cpp
#include "our_cool_lib.hpp"

#include <iostream>

static void SayHello() { std::cout << "Hello!" << std::endl; }
```

If we try to compile this, we get a couple of warnings and an error (note that I'm using clang so if you are using gcc your error might be different):
```cmd
λ › cmake --build build -j 12
Consolidate compiler generated dependencies of target our_cool_lib
[ 50%] Building CXX object CMakeFiles/our_cool_lib.dir/our_cool_lib.cpp.o
/static_no_classes/odr_violation/our_cool_lib.cpp:5:13: warning: unused function 'SayHello' [-Wunused-function]
static void SayHello() { std::cout << "Hello!" << std::endl; }
            ^
1 warning generated.
...
[100%] Linking CXX executable main
ld: Undefined symbols:
  SayHello(), referenced from:
      _main in main.cpp.o
clang: error: linker command failed with exit code 1 (use -v to see invocation)
make[2]: *** [main] Error 1
```

Overall, the important things to note here are that our `main` executable sees that there is a function `SayHello` declared as `static`. Which is to say that its linkage is **internal**. So the linker tries to find the definition of this function **within the same translation unit**, aka `main.cpp`. But our definition lives in a **different** translation unit `our_cool_lib.cpp`. So in that translation unit our function is unused, thus the warning, while there is no implementation for the `static void SayHello()` function within the `main.cpp` file which makes the linker fail.

To solve this we can move the implementation of the function into the header file `our_cool_lib.hpp` while marking the function `static`:
<!--
`CPP_SETUP_START`
$PLACEHOLDER

int main() {
  SayHello();
}
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` cool_lib_static/main.cpp
`CPP_RUN_CMD` CWD:cool_lib_static c++ -std=c++17 -c main.cpp
-->
```cpp
#include <iostream>
// 😱 Should really be inline instead
static void SayHello() { std::cout << "Hello!" << std::endl; }
```

If we do that, we don't need the `our_cool_lib` target in CMake anymore and just include this file into `main.cpp` directly.

Now our code builds without issues and when we run it, we get the correct output.

Seems like we've solved everything, right? Well, technically yes, but there is a minor issue with using `static` like this which might or might not be important to us depending on the application.

#### Prefer `inline` to `static`
The issue with `static` is that it **enforces** internal linkage. This means that in our example, if we include our `our_cool_lib.hpp` file into multiple translation units, we will have a **copy** of the compiled binary code of the `SayHello` function in every single translation unit. This takes space which might become problematic on constrained hardware.

<p align="center">
  <a href="https://youtu.be/QVHwOOrSh3w"><img src="https://img.youtube.com/vi/QVHwOOrSh3w/maxresdefault.jpg" alt="Video" align="right" width=300 style="margin: 0.5rem"></a>
</p>

This is where `inline` comes to the rescue! It implies **external** linkage but, as stated in the ODR formulation, multiple definitions _are_ allowed for `inline` functions and data (🔼 C++17). So in our case, if we replace `static` with `inline` for our `SayHello` function, we will only ever have one instance of the compiled binary code for this function that the linker will happily link everywhere.

`our_cool_lib.hpp`:
<!--
`CPP_SETUP_START`
$PLACEHOLDER

int main() {
  SayHello();
}
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` cool_lib_inline/main.cpp
`CPP_RUN_CMD` CWD:cool_lib_inline c++ -std=c++17 -c main.cpp
-->
```cpp
#include <iostream>
inline void SayHello() { std::cout << "Hello!" << std::endl; }
```

I also urge you to watch [this video](https://www.youtube.com/watch?v=QVHwOOrSh3w) by Jason Turner on his C++ Weekly chanel about this to learn the intuitive differences between `static` and `inline` in this context.
<!-- Link is in the description. -->

:bulb: Overall, using `inline` is the best way to declare functions and data that should be visible globally in modern C++. So, you see, there is no reason to mark functions or data as `static` anymore due to linkage reasons. We should mark them `inline` instead.
