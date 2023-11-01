Keyword `static` outside of classes
---

<p align="center">
  <a href="https://youtu.be/blah"><img src="https://img.youtube.com/vi/blah/maxresdefault.jpg" alt="Video" align="right" width=50%></a>
</p>


- [Keyword `static` outside of classes](#keyword-static-outside-of-classes)
- [Storage duration](#storage-duration)
  - [Automatic storage duration an local namespace scope](#automatic-storage-duration-an-local-namespace-scope)
  - [Static storage duration at namespace scope](#static-storage-duration-at-namespace-scope)
  - [Static storage duration at function scope](#static-storage-duration-at-function-scope)
  - [Very rare use of `static` to create mutable variables with static storage duration from a function](#very-rare-use-of-static-to-create-mutable-variables-with-static-storage-duration-from-a-function)
  - [Summary of controlling storage duration with `static`](#summary-of-controlling-storage-duration-with-static)
- [Linkage](#linkage)
  - [What is linkage](#what-is-linkage)
  - [Intuition behind the levels of linkage](#intuition-behind-the-levels-of-linkage)
  - [Why we care about linkage](#why-we-care-about-linkage)
    - [Naive example](#naive-example)
    - [What went wrong?](#what-went-wrong)
    - [How to fix the ODR violation?](#how-to-fix-the-odr-violation)
    - [Prefer `inline` to `static`](#prefer-inline-to-static)
  - [How to understand what linkage a name has](#how-to-understand-what-linkage-a-name-has)
    - [Anything declared at local scope has **no linkage**](#anything-declared-at-local-scope-has-no-linkage)
    - [Anything declared in an unnamed namespace has **internal linkage**](#anything-declared-in-an-unnamed-namespace-has-internal-linkage)
    - [Use diagrams to understand external vs internal linkage](#use-diagrams-to-understand-external-vs-internal-linkage)
      - [Linkage of functions declared at namespace scope](#linkage-of-functions-declared-at-namespace-scope)
      - [Linkage of data defined at namespace scope](#linkage-of-data-defined-at-namespace-scope)
- [Conclusion and a rule of thumb](#conclusion-and-a-rule-of-thumb)
- [Final words](#final-words)


The keyword [`static`](https://en.cppreference.com/w/cpp/keyword/static) is a very important keyword in C++ and is used a lot. Honestly, because of a very general name, it is probably a bit _overused_. Largely speaking, it can be used outside of classes and inside classes and these two cases are slightly different. Today we focus on the former - using `static` outside of classes. If you are interested in how and when to use `static` _inside_ of classes, I will link this lecture here when it's out.

Anyway, as for using `static` _outside_ of classes, I have good news for you. If you follow my advices about best practices from before then the rule-of-thumb for using `static` outside of classes in modern C++ (that is at least C++17) is very simple - don't! **Don't use `static` at all!**

Technically, that's all you need to know. But if you want to learn _why_ then keep watching this video and see how deep this rabbit hole goes :wink:

<!-- Intro -->

In order to explain why we mostly don't want to use `static` for anything outside of classes we will need to think about why we _might_ want to use `static` in the first place. The keyword `static` really controls just two things:
- The storage duration
- The linkage

These terms feel a bit technical and I can already feel the confused faces on the other side of the screen from me :wink: So... what do these words mean?

## Storage duration
We'll start with "storage duration". Every object declared in C++ has a certain lifetime, or, in other words, a _storage duration_. There is a number of storage durations that any variable can have. At this point, we care about these two:
- Automatic storage duration
- Static storage duration

To explain the difference between the two we start with a simple `main` function that calls another function `Foo` that has a single local variable in it:

<img src="images/program_lifetime.png" align="right" width=250 style="margin: 0.5rem">

```cpp
void Foo() {
  int local_value{};
  // Use local_value
}

int main() {
  Foo();
  return 0;
}
```
We can then draw the execution time of the program, `main` and `Foo` functions as lines that indicate that most of the time that the program runs is spends int `main`, while most of the time in `main` is spent executing the `Foo` function.

### Automatic storage duration an local namespace scope

If we focus now on the lifetime of the `local_value` variable, shown as a blue box in the image, it lives as long as is needed for the execution of the `Foo` function. It's memory is allocated at the start of the function and is freed at the end of the scope.

We say that a variable `local_value` and any other variable that lives in some local scope, has **automatic storage duration**.

### Static storage duration at namespace scope
Let's further extend our example by adding some value `kValue`, that is defined at **namespace scope**, and use it to initialize our `local_value`. We will introduce it in an unnamed namespace following the best practices, but it could live in any namespace including the global one.


<img src="images/static_storage.png" align="right" width=250 style="margin: 0.5rem">


```cpp
namespace {
constexpr int kValue{42};
}  // namespace

void Foo() {
  int local_value{kValue};
  // Use local_value
}

int main() {
  Foo();
  return 0;
}
```
The `kValue` here has what is called the **static storage duration** and lives for the whole duration of the program. Its data gets allocated at the start of the program and freed at the end of the program.

:bulb: While we _can_ use `static` for an object declaration at namespace scope to indicate that it has the static storage duration **we don't have to**, as any such object has **automatic storage duration** by default. So all of these definitions are equivalent in terms of storage duration:
<!--
`CPP_SETUP_START`
$PLACEHOLDER
int main(){}
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` consts/main.cpp
`CPP_RUN_CMD` CWD:consts c++ -std=c++17 -c main.cpp
-->
```cpp
constexpr auto answer_1 = 42;
const auto answer_2 = 42;
auto answer_3 = 42;  // 😱 please don't create non-const globals...

// 😱 please don't use static like this ...
static constexpr auto answer_4 = 42;
static const auto answer_5 = 42;
static auto answer_6 = 42;  // 😱 please don't create non-const globals...
```

### Static storage duration at function scope
Finally, use of `static` can extend the storage duration of a local variable within some function scope to have the static storage duration.

If we add `static` in front of our `local_value` definition, it will have **static storage duration** again even though it is defined in a local scope. Now `local_value` will get allocated when the function `Foo` is called for the first time and will get de-allocated at the end of the program.

<img src="images/static_storage_function.png" align="right" width=250 style="margin: 0.5rem">

```cpp
namespace {
constexpr int kValue{42};
}  // namespace

void Foo() {
  static int local_value{kValue};
  // Use local_value
}

int main() {
  Foo();
  return 0;
}
```

Such a `static` variable will be initialized when first encountered during the program flow and destroyed when the program exits.

One interesting peculiarity of using `static` to extend the storage duration of a local variable is that if the flow of our program encounters the line that defines the `static` variable multiple times, this line will **only be executed once**. The reason being is that the variable already exists when the program flow reaches the variable definition for the second time, so the definition is skipped and the existing `static` variable is simply used further.

<img src="images/static_foo_twice.png" align="right" width=250 style="margin: 0.5rem">

```cpp
namespace {
constexpr int kValue{42};
}  // namespace

void Foo() {
  static int local_value{kValue};
  // Use local_value
}

int main() {
  Foo();
  Foo();
  return 0;
}
```

You can easily see (*C++) this for yourself if you replace the creation of a `static` `int` object by the creation of a `static` object of your custom type that prints something on construction and destruction and calling the function `Foo` a couple of times from `main`, like we just discussed. Your object will only print once from its constructor and destructor. Really, give this a try, it should take you no more than a couple of minutes by now :wink:

### Very rare use of `static` to create mutable variables with static storage duration from a function
Now this is where I lied to you a bit about _never_ needing to use `static`. There _are_ situations when you might want to create a static object within a function. In our `Foo` function we could have returned a non-const reference and essentially model a global mutable variable that will live for the rest of the program lifetime.
```cpp
int& Foo() {
  static int local_value{};
  return local_value;
}

int main() {
  // Reference to our static variable.
  auto& ref_to_static = Foo();
  return 0;
}
```

This is also very similar to the **singleton** design pattern and we will talk about what it is and why you probably don't want to use it later in the course. Anyway, if you remember what we talked about before, you will know that using non-`const` global variables tends to wreak havoc and we probably don't want to do this.

> For completeness, one use for such an improvised singleton is to deal with the **"static initialization order fiasco"**. It should not hit you as long as you only create variables that rely *exclusively* on values within the same translation unit file and not across translation unit boundaries.
> <!--
> `CPP_SKIP_SNIPPET`
> -->
> ```cpp
> constexpr int kAnswer = 42;  // ✅ this is ok.
> constexpr int kValue = kValueFromOtherCppFile;  // ❌ not ok!
> ```
>
> I won't go into details here, but tell me in the comments if you are interested to learn more about it!

### Summary of controlling storage duration with `static`
It's time we sum up where `static` can be used and what it gives us in terms of changing the storage duration of variables. Generally speaking, when used outside of classes, `static` can be used in two places:
- at namespace scope (outside of functions) which adds nothing as any such variable already have static storage duration.
- inside of functions to extend the local variable's automatic storage duration to static storage duration, which we mostly don't want to do.

:bulb: So, all in all, there is really **no good reason** to use `static` to change storage duration of our variables!

## Linkage
Now it's time to talk about the second thing that `static` controls - linkage.

<!-- The topic of linkage is a bit nuanced and I tried to simplify it as much as I could here, but if I missed something or made a mistake in my strive for simplicity, please comment below this video. Oh, and maybe subscribe once you're at it? You did make it this far, right? Anyway, back to linkage. -->

### What is linkage
First, let me try to explain what linkage is by describing what it is used for. When we write programs we name things like our variables, classes, functions etc. These names _can_ (but don't have to) have linkage. A name corresponds to its declaration in a different scope if they have sufficient linkage. We distinguish linkage of several levels:
- No linkage
- Internal linkage
- External linkage

This concept allows us to reuse names in various scopes without introducing mistakes while keeping the memory layout efficient, more on that a bit later.

### Intuition behind the levels of linkage
Intuitively speaking, if we want some name to be available only in the current scope, it should have **no linkage**. As an example, any variable defined in any local scope usually has no linkage.
<!--
`CPP_SETUP_START`
$PLACEHOLDER

int main() {
  Foo();
}
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` no_linkage/main.cpp
`CPP_RUN_CMD` CWD:no_linkage c++ -std=c++17 -c main.cpp
-->
```cpp
void Foo() {
  int bar;  // bar has no linkage
}
```

If a name should be available beyond local scopes but still **only** from within the same translation unit (think, within one `.cpp` file) - it should have **internal linkage**. The typical examples of these are functions and data put into an unnamed namespaces within a `.cpp` file.
<!--
`CPP_SETUP_START`
#include <string>
$PLACEHOLDER

int main() {}
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` internal_linkage/main.cpp
`CPP_RUN_CMD` CWD:internal_linkage c++ -std=c++17 -c main.cpp
-->
```cpp
// In some cpp file
namespace {
// Everything within this namespace has internal linkage
constexpr int kNumber{};
const std::string kWord{};
void Foo() {}
}  // namespace
```

Finally, **external linkage** is needed for symbols that need to be available globally throughout the program. These are usually classes, enums `inline` functions and `inline` constants declared in some header files.
<!--
`CPP_SETUP_START`
#include <string>
$PLACEHOLDER

int main() {}
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` external_linkage/main.cpp
`CPP_RUN_CMD` CWD:external_linkage c++ -std=c++17 -c main.cpp
-->
```cpp
// In some header file
// All of the below have external linkage
inline void GlobalFoo() {}
inline constexpr int kGlobalNumber{};
inline const std::string kGlobalString{};
```

### Why we care about linkage
#### Naive example
To understand why linkage is so important, let's start with a pretty naive [example](code/static_no_classes/odr_violation/).
<!-- The code for the whole example is as always in the repository linked below the video -->
Say we have a large project and in it we write a library that has a declaration of a function `SayHello` in a header file `our_cool_lib.hpp` which prints "Hello!" to the terminal when we call it:

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

We further write a definition of our function in a corresponding source file `our_cool_lib.cpp`:
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

Now, we just need to instruct the compiler and the linker on how to build and link this code and we do that using CMake. Let's further assume that we implement this as part of some large project so we also link to some `other_lib` that might link to other libraries too.
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

So far so good. Now, we build it and run it:
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

And this is, I believe, where `static` historically, that is before C++11, has been used. Remember how I mentioned that `static` functions have **internal** linkage? We can make use of this.

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
λ › cmake --build build -j 12                                                                                                                                                               static_no_classes/odr_violation static
Consolidate compiler generated dependencies of target our_cool_lib
[ 50%] Building CXX object CMakeFiles/our_cool_lib.dir/our_cool_lib.cpp.o
/Users/igor/Documents/C++ Course/Slides/lectures/code/static_no_classes/odr_violation/our_cool_lib.cpp:5:13: warning: unused function 'SayHello' [-Wunused-function]
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

Overall, the important thing to note here is that our `main` executable sees that there is a function `SayHello` declared as `static`. Which is to say that its linkage is **internal**. So the linker tries to find the definition of this function **within the same translation unit**, aka `main.cpp`. But our definition lives in a **different** translation unit `our_cool_lib.cpp`. So in that translation unit our function is unused, thus the warning, while there is no implementation for the `static void SayHello()` function within the `main.cpp` file which makes the linker fail.

The typical thing that people used to do before C++11 to solve this is to move the implementation of the function into the header file `our_cool_lib.hpp` while marking the function `static`:
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

This is where `inline` comes to the rescue! It implies **external** linkage but, as stated in the ODR formulation, multiple definitions _are_ allowed for `inline` functions (🔼 C++11) and data (🔼 C++17). So in our case, if we replace `static` with `inline` for our `SayHello` function, we will only ever have one instance of the compiled binary code for this function that the linker will happily link everywhere. I also urge you to watch [the video](https://www.youtube.com/watch?v=QVHwOOrSh3w) by Jason Turner on this topic to learn even more about it.
<!-- Link is in the description. -->

:bulb: This is the best way to declare functions and data that should be visible globally in modern C++. So, you see, there is no reason to mark functions or data as `static` anymore due to linkage reasons. We should mark them `inline` instead.

### How to understand what linkage a name has
So I hope that by now it is clear that it is up to us which linkage our entities have. We can pick linkage of anything that we declare at declaration time by choosing **where** we put our declarations (local scope, namespace scope, unnamed namespace etc.) and by using keywords `const`, `constexpr`, `static` and `inline` all of which have their influence on linkage.

The complete rules of how linkage is selected are slightly convoluted, as you can see on the cppreference pages for [linkage](https://en.cppreference.com/w/cpp/language/storage_duration) and [inline](https://en.cppreference.com/w/cpp/language/inline) but the good news is that when _we_ write the code the rules to follow the best practices are pretty simple.

In the remainder of this lecture, however, I want to dive even deeper and provide you with a method to understand which linkage a name has by just looking at its declaration. This is helpful to debug code that we did not write and see issues in the code _before_ they happen.

#### Anything declared at local scope has **no linkage**
Let's start with the simplest case. Any entity that is declared within some local scope has **no linkage**. Any data beyond the local scopes has either **internal** or **external** linkage. Which also means that it is relatively hard to mess things up with names that have no linkage. But we _do_ have to be careful with internal and external linkage. So let's dive into all the details for these linkages.

#### Anything declared in an unnamed namespace has **internal linkage**
First of all, in case you see an unnamed namespace you're in luck! If your declaration (**any** declaration) is within an unnamed namespace, then the linkage of this name is **internal**. Things get slightly more complex from here on.

#### Use diagrams to understand external vs internal linkage
##### Linkage of functions declared at namespace scope
Let's once again start with a simpler case - with functions at namespace scope. By default they have external linkage. But, as we have seen in the example before, if we are not careful with such functions we might be in a world of trouble because of the ODR. So historically there have been two ways to deal with this:
- Making the functions `static`, which gives it **internal** linkage
- `[preferred]` Making the function `inline`, which keeps the **external** linkage but allows for multiple definitions (which are assumed to be all the same)

Which leads us to a preferred way to declare global functions at namespace scope. **We should declare them `inline`**:
<!--
`CPP_SETUP_START`
$PLACEHOLDER

int main() {
  Foo();
}
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` best_practice_foo/main.cpp
`CPP_RUN_CMD` CWD:best_practice_foo c++ -std=c++17 -c main.cpp
-->
```cpp
inline void Foo() {}
```

Finally, just to make sure we can easily determine the linkage of a function we are looking at, here is a simple handy diagram:
```mermaid
graph LR;
  Type([Start])
  Static-->Int([Internal<br>linkage])
  Type---->Static([<code>static</code>])

  Type-->Inline[<code>inline</code>]
  Inline-->Static

  Type--->Ext([External<br>linkage])
  Inline-->Ext

  style Type fill:green;
  style Inline fill:green;
  style Ext fill:green;
```
You can read this diagram by taking any function declaration and reading all of its keywords (skipping the ones related to the return type) in any order until you read all of them. Once we read all of these, we navigate to the only end node of the diagram that is adjacent to our current position, which will be either `External linkage` or `Internal linkage`.

Green marks the recommended set of keywords (only `inline` in this case) to use when declaring a function at namespace scope to follow the best practices we have just talked about.

> One final remark. If you declare your function `constexpr` this implies `inline` so using it is also fine.

##### Linkage of data defined at namespace scope
<!-- Animate -->
The situation is slightly worse with the data defined at namespace scope. There are many keywords we can use here and depending on their combination, the linkage of the data being defined changes. For example, if we have mutable data at namespace scope (think, "a global variable" 😱) it has external linkage. But if it is `const` or `constexpr` it then has internal linkage again. If we additionally mark it `inline` as we can in 🔼 C++17 it changes linkage to external again. This sounds complicated, right? Don't worry, we're going to figure this out!

The good news is that it is relatively easy to do the right thing when defining new data and it should be done following a simple rule: **if your data can be `constexpr` then define it as `inline constexpr`. Use `inline const` otherwise**:
<!--
`CPP_SETUP_START`
#include <string>
$PLACEHOLDER

int main() {}
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` best_practice_data/main.cpp
`CPP_RUN_CMD` CWD:best_practice_data c++ -std=c++17 -c main.cpp
-->
```cpp
// Recommended way to define data
inline constexpr int kNumber{};
inline const std::string kString{};
```

But in case we are reading the code that we did not write and want to make sure we understand what the linkage of these particular data are, we can use this diagram:

```mermaid
graph LR;
  Type([Start])
  Const-->Inline
  Const2-->Static
  Type-->Const[<code>const<br>constexpr</code>]
  Const-->Int([Internal])
  Const-->Static[<code>static</code>]
  Static-->Int([Internal<br>linkage])
  Type---->Static

  Inline-->Static
  Type-->Inline[<code>inline</code>]
  Inline-->Const2[<code>const<br>constexpr</code>]

  Type--->Ext([External<br>linkage])
  Inline-->Ext
  Const2-->Ext

  style Type fill:green;
  style Const2 fill:green;
  style Inline fill:green;
  style Ext fill:green;
```
Again, to navigate it we read all of the special keywords before your data definition moving along the diagram as we do it. Once we're done we should have either "External linkage" or "Internal linkage" node just one step away.
The green nodes mark the preferred selection of keywords that lead to "External linkage".

## Conclusion and a rule of thumb
I guess this sums up everything I wanted to talk about with regard to using `static` outside of classes. This has led us down a couple of rabbit holes, linkage being a pretty deep one.

But I hope that by now you see that **there is no need to use `static` outside of classes at all in modern C++**. Here is a guideline to follow along with this:

- When defining variables at namespace scope always mark them as `inline const` or, even better `constexpr`. Do **not** mark them `static`!
- When defining variables at local scope, do not mark them `static` unless you are explicitly implementing a singleton-like design pattern (which you probably shouldn't do anyway)
- When declaring functions at namespace scope, declare (and define) them as `inline`. Do **not** declare them as `static`!

This will guarantee that all data with static storage duration lives in namespace scope and has external linkage, i.e., visibility across the whole program for the duration of the whole program, while not violating the ODR.

## Final words
Understanding the key role that linkage and ODR play here is crucial to understanding what `inline` and, previously `static` were designed to solve. Initially `static` was introduced into the C programming language and then was inherited by C++. It was in the times when `inline` meant something different and could not be used as it can be now. Thankfully, we live in better times now, which makes `static` close to obsolete when used outside of classes. Now if you want to know how to use `static` in classes you can see a video about that once it's ready and maybe also go back and refresh how `inline` plays a huge role in creating [libraries](headers_and_libraries.md) in C++.

<!-- Video by <a href="https://pixabay.com/users/imotivation-12701738/?utm_source=link-attribution&utm_medium=referral&utm_campaign=video&utm_content=29881">imotivationita</a> from <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=video&utm_content=29881">Pixabay</a> -->
