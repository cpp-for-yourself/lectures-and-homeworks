Keyword `static` outside of classes
---

<p align="center">
  <a href="https://youtu.be/m8kN3MIUEpg"><img src="https://img.youtube.com/vi/m8kN3MIUEpg/maxresdefault.jpg" alt="Video" align="right" width=50% style="margin: 0.5rem"></a>
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
  - [Levels of linkage](#levels-of-linkage)
  - [How to understand what linkage a name has](#how-to-understand-what-linkage-a-name-has)
  - [Why we care about linkage](#why-we-care-about-linkage)
    - [Example with broken linkage](#example-with-broken-linkage)
    - [What went wrong?](#what-went-wrong)
    - [How to fix the ODR violation?](#how-to-fix-the-odr-violation)
    - [Prefer `inline` to `static`](#prefer-inline-to-static)
- [Conclusion and a rule of thumb](#conclusion-and-a-rule-of-thumb)
- [Final words](#final-words)


The keyword [`static`](https://en.cppreference.com/w/cpp/keyword/static) is a very important keyword in C++ and is used a lot. Honestly, because of a very general name, it is probably a bit _overused_. Largely speaking, it can be used outside of classes and inside classes and these two cases are slightly different. Today we focus on the former - using `static` outside of classes. If you are interested in how and when to use `static` _inside_ of classes, I will link that lecture here when it's out.

Anyway, as for using `static` _outside_ of classes, I have good news for you. If you follow my advices about best practices from before then the rule-of-thumb for using `static` outside of classes in modern C++ (that is at least C++17) is very simple - don't! **Don't use `static` at all!**

Technically, that's all you need to know. But if you want to learn _why_ you shouldn't use `static` outside of classes then keep watching this video and see how deep this rabbit hole goes :wink:

<!-- Intro -->

In order to explain why we mostly don't want to use `static` for anything outside of classes we will need to talk about why we _might_ want to use `static` in the first place. The keyword `static` really controls just two things:
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
We can then draw the execution time of the program, `main` and `Foo` functions as lines that indicate that most of the time that the program runs is spends in `main`, while most of the time in `main` is spent executing the `Foo` function.

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

:bulb: While we _can_ use `static` for an object definition at namespace scope to indicate that it has the static storage duration **we don't have to**, as any such object has **static storage duration** by default. So all of these definitions are equivalent in terms of storage duration:
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

> For completeness, one use for such an improvised singleton is to deal with the **"static initialization order fiasco"**. It should not hit you as long as you only create variables that rely *exclusively* on values within the same translation unit and not across translation unit boundaries.
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
- at namespace scope which adds nothing as any such variable already has the static storage duration
- inside of functions to extend the local variable's automatic storage duration to static storage duration, which we mostly don't want to do

:bulb: So, all in all, there is really **no good reason** to use `static` to change storage duration of our variables!

## Linkage
Now it's time to talk about the second thing that `static` controls - linkage.

<!-- The topic of linkage is a bit nuanced and I tried to simplify it as much as I could here, but if I missed something or made a mistake in my strive for simplicity, please comment below this video. Oh, and maybe subscribe once you're at it? You did make it this far, right? Anyway, back to linkage. -->

### What is linkage
First, let me try to explain what linkage is by describing what it is used for. When we write programs we name things like our variables, classes, functions etc. We can think of linkage as of a property of any given name. This property basically controls if a name of any symbol can correspond (in other words - be linked) to its declaration in a different scope. We distinguish linkage of several levels that control which boundaries such links can cross:
- No linkage
- Internal linkage
- External linkage

Let's dive into these.

### Levels of linkage
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

If a name should be available beyond local scopes but still **only** from within the same translation unit (think, within one `.cpp` file) - it should have **internal linkage**. The typical examples of these are constants defined at namespace scope, any data and functions put into an unnamed namespaces within a `.cpp` file. Oh, and also any `static` data and functions, but more on that in a minute.
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
// Constants have internal linkage by default
constexpr int kGlobalConst{};  // 😱 should be inline
const std::string kGlobalWord{};  // 😱 should be inline


// In some cpp file
namespace {
// Everything within unnamed namespaces has internal linkage
constexpr int kNumber{};
const std::string kWord{};
void Foo() {}
}  // namespace

// Any static variable or function has internal linkage
static int kStaticVariable{};  // 😱 don't use static like this
static void StaticFoo(){}  // 😱 don't use static like this
```

Finally, **external linkage** is needed for symbols that need to be available globally throughout the program. These are usually classes, enums, non-`static`  (usually `inline`) functions and `inline` constants declared at namespace scope in some header files.
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

void OtherGlobalFoo() {}  // 😱 should be inline
```

### How to understand what linkage a name has
In the end it is up to us which linkage our entities have. We can pick linkage of anything that we declare at declaration time by choosing **where** we put our declarations (local scope, namespace scope, unnamed namespace etc.) and by using keywords `const`, `constexpr`, `static` and `inline` all of which have their influence on linkage.

As you might start to suspect, the complete rules of how linkage is selected are slightly convoluted. If you want to figure out these rules in all details you can always read the cppreference pages for [linkage](https://en.cppreference.com/w/cpp/language/storage_duration) and [inline](https://en.cppreference.com/w/cpp/language/inline). The good news is that when _we_ write the code the rules to follow the best practices are pretty simple and I will summarize them at the end of this lecture.

However, in order to read the code written by others we have to dive a bit deeper into these convoluted rules. So, to save you the trouble of figuring out all of the intricate details, I came up with a flow chart. If we follow it, we can find out the linkage of any symbol we are looking at. This is helpful to debug code that we did not write and see issues in the code _before_ they happen as well as to know how to make sure the symbol we want to write has the linkage we want.

```mermaid
graph TB;
  Local -->|yes| No[No linkage]
  Local{{Is in local scope?}} -->|no| Unnamed
  Unnamed{{Is in unnamed namespace?}} -->|yes| Internal
  Unnamed -->|no| Static
  Static{{<code>static</code>?}} -->|yes| Internal[Internal linkage]
  Static -->|no| Inline{{<code>inline</code>?}}
  Inline -->|no| Const{{<code>const? constexpr?</code>}}
  Inline -->|yes| External[External linkage]
  Const -->|yes| Func{{Is function?}}
  Func -->|no| Internal
  Func -->|yes| External

  style No fill:#226666,color:white;
  style Internal fill:#763289,color:white;
  style External fill:#3355AA,color:white;
```

Here is how to read it. This chart should work with any function or data declaration you might encounter. First, if you are looking at a function, ignore the return type along with any const qualifiers it might have. Then, follow the chart by answering the questions.

Let's see a couple of examples that follow best practices:
<!--
`CPP_SETUP_START`
#include <string>
$PLACEHOLDER

int main(){}
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` flow_char/main.cpp
`CPP_RUN_CMD` CWD:flow_char c++ -std=c++17 -c main.cpp
-->
```cpp
// In some hpp file
inline constexpr int kNumber{};  // external linkage
inline const std::string kWord{};  // external linkage
inline void Func();  // external linkage

// Lives in some cpp file
namespace {
constexpr int kOtherNumber{};  // internal linkage

void OtherFunc() {  // internal linkage
  int local_variable{};  // no linkage
}
}  // namespace
```
<!-- So, looking at the kNumber here, we can follow the chart: Is in in local scope? No, it's not! Is it in unnamed namespace? Nope! Does it use the static keyword? No, it doesn't. Is it inline? Yeah it is, which brings us to it having external linkage. Feel free to do this for all other examples or any other ones that you see in any code you encounter. -->


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

## Conclusion and a rule of thumb
And I guess this pretty much sums up everything I wanted to talk about with regard to using `static` outside of classes. This has led us down a couple of rabbit holes, linkage being a pretty deep one.

But I hope that by now you see that **there is no need to use `static` outside of classes at all in modern C++**. Here is a guideline to follow along with this:

- When defining variables at namespace scope always mark them as `inline const` or, even better `inline constexpr`. Do **not** mark them `static`!
- When defining variables at local scope, do **not** mark them `static` unless you are explicitly implementing a singleton-like design pattern (which you probably shouldn't do anyway, stay tuned...)
- When declaring functions at namespace scope, declare (and define) them as `inline`. Do **not** use `static` for this!
- When declaring data or functions in an unnamed namespace, do not mark them as `static` or `inline`. Data should still be `const` or `constexpr`

## Final words
Understanding the key role that linkage and ODR play here is crucial to understanding what `inline` and, previously, `static` were designed to solve. Initially `static` was introduced into the C programming language and then was inherited by C++. It was in the times when C did not have `inline` and in C++ it meant something different and could not be used as it can be now. Thankfully, we live in better times now, which makes `static` close to obsolete when used outside of classes. Now if you want to know how to use `static` *in classes* you can see a video about that once it's ready and maybe also go back and refresh how `inline` plays a huge role in creating [libraries](headers_and_libraries.md) in C++.

<!-- Video by <a href="https://pixabay.com/users/imotivation-12701738/?utm_source=link-attribution&utm_medium=referral&utm_campaign=video&utm_content=29881">imotivationita</a> from <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=video&utm_content=29881">Pixabay</a> -->
