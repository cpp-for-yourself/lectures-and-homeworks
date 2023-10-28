Keyword `static`
---

<p align="center">
  <a href="https://youtu.be/blah"><img src="https://img.youtube.com/vi/blah/maxresdefault.jpg" alt="Video" align="right" width=50%></a>
</p>


- [Keyword `static`](#keyword-static)
- [Storage duration](#storage-duration)
  - [Automatic storage duration](#automatic-storage-duration)
  - [Static storage duration at namespace scope](#static-storage-duration-at-namespace-scope)
  - [Static storage duration at function scope](#static-storage-duration-at-function-scope)
  - [Summary of controlling storage duration with static](#summary-of-controlling-storage-duration-with-static)
- [Linkage](#linkage)
  - [What is linkage](#what-is-linkage)
  - [Levels of linkage](#levels-of-linkage)
  - [Why we need external linkage](#why-we-need-external-linkage)
    - [What went wrong?](#what-went-wrong)
    - [How to fix this?](#how-to-fix-this)
    - [Why `inline` is better than `static` for linkage](#why-inline-is-better-than-static-for-linkage)
  - [The data](#the-data)
- [Conclusion and a rule of thumb](#conclusion-and-a-rule-of-thumb)
  - [For functions and variables at namespace scope](#for-functions-and-variables-at-namespace-scope)
  - [For variables at local scopes](#for-variables-at-local-scopes)
  - [Final words](#final-words)

The keyword [`static`](https://en.cppreference.com/w/cpp/keyword/static) is a very important keyword in C++ and is used a lot. Honestly, probably, because of a very general name, it is a bit overused. Largely speaking, it can be used inside and outside classes and these two cases are very different. Today we focus on the latter - using `static` outside of classes. If you are interested in how and when to use `static` _inside_ of classes, I will link this lecture here when it's out.

Anyway, as for using `static` _outside_ of classes, I have good news for you. If you follow my advices from before then the rule-of-thumb for using `static` outside of classes in modern C++ (that is at least C++17) is very simple - don't! **Don't use `static` at all!**

<!-- Thanks for watching, subscribe and see you soon! Get up, walk away, wait. Come back. -->

What? Still here? I guess you did learn something about C++ and you know that nothing is as simple. But it _is_ not much harder than that, this I can promise you. Anyway, let's dive into this rule and talk about why it _mostly_ holds.

<!-- Intro -->

In order to explain why we _mostly_ don't want to use `static` for anything outside of classes we will need to think about _why_ we want to use `static` in the first place. The keyword `static` really controls two things:
- The storage duration
- The linkage

I can already feel the confused faces on the other side of the screen from me :wink:

Now, what do these words mean?

## Storage duration
### Automatic storage duration
Every object declared in C++ has a certain lifetime, or, in other words, a _storage duration_. Lots of objects live within a single scope and their memory gets freed upon the end of their scope. These objects are usually said to have **automatic storage duration**. Looking at a simple example:
```cpp
void Foo() {
  int bar = 42; // bar has automatic storage duration
}
```
the variable `bar` will exist until the end of the scope and will be freed afterwards.


But what if there is no scope? What happens with those variables declared outside of class or function scope?

### Static storage duration at namespace scope
These variables are said to be declared at **namespace scope**. Their data gets allocated at the start of the program and gets freed when the program terminates, which is to say that these data have the **static storage duration**. I believe that this is what inspired the name `static` back when it was introduced in C. Anyway, we _can_ use `static` for an object declaration at namespace scope to indicate that it has the static storage duration but we don't have to, as any such object has this storage duration by default. So the following definitions are equivalent in terms of storage duration:
```cpp
constexpr auto answer = 42;
const auto answer = 42;
auto answer = 42;  // 😱 please don't...

static constexpr auto answer = 42;
static const auto answer = 42;
static auto answer = 42;  // 😱 please don't...
```

### Static storage duration at function scope
Another use of `static` is to extend the storage duration of a local variable within some function scope to have the static storage duration.

Such a `static` variable will be initialized when first encountered during the program flow and destroyed when the program exits.

Let's illustrate it using an example. Assuming we have a `struct` `Helper` that prints something in its constructor and destructor, let's write a function `GetHelper` that creates a helper object and returns a reference to it. Note how this function returns a non-const reference to an object created within a function. If you followed the lecture on [functions](functions.md) your eye might start twitching now but in this situation it's all right - the helper object is `static`, so, once created it will exist until the end of the program - `static` ensures it has the static storage duration. If we call our `GetHelper` function twice we will see that the `Helper` object is only created once when the `static` variable definition is encountered for the first time by comparing the pointers to the object we receive.
```cpp
#include <iostream>

struct Helper {
  Helper(int number) {
    std::cout << "Create helper with number: " << number << std::endl;
  }
  ~Helper() { std::cout << "Destroy helper" << std::endl; }
  // 😱 Implement the rest for the rule of all or nothing!
};

Helper& GetHelper(int number) {
  // Will only be initialized when encountered for the first time
  static Helper helper{number};
  return helper;
}

int main() {
  auto& helper_1 = GetHelper(42);
  auto& helper_2 = GetHelper(23);
  std::cout << "Is same object: " << (&helper_1 == &helper_2) << std::endl;
}
```

Now this is where I lied to you a bit about _never_ needing to use `static`. There _are_ situations when you might want to create a static object within a function. Notice how we return a non-const reference, so what we essentially model here is a global variable that will live for the rest of the program lifetime. This is also very similar to the Singleton design pattern and we will talk why you probably don't want to use it later in the course. Anyway, if you remember what we talked about before, you will know that using global variables tends to wreak havoc and we probably don't want to do this.

For completeness, another use for such a method with a `static` variable inside of it is to deal with the "static initialization order fiasco". It should not hit you as long as you only create variables that rely only on values within the same cpp file and not across translation unit boundaries.
```cpp
const int kAnswer = 42;  // ✅ this is ok.
const int kValue = kValueFromOtherCppFile;  // ❌ not ok!
```

I won't go into details here, but tell me in the comments if you are interested to learn more about it!

### Summary of controlling storage duration with static
Let's sum up where `static` can be used and what it gives us in terms of changing the storage duration of variables. Generally speaking, when used outside of classes, `static` can be used in two places:
- outside of functions which adds nothing as any such variables or functions declared at namespace scope already have static storage duration.
- inside of functions to extend the local variable's automatic storage duration to static storage duration, which we mostly don't want to do.

:bulb: So, all in all, there is really **no good reason** to use static to change storage duration of our variables!

## Linkage
Now it's time to talk about the second thing that `static` controls - linkage. We touched upon linkage before, when we talked about [libraries](headers_and_libraries.md), and especially the `inline` keyword.

If you don't want to go into detail here, just remember this rule:
> 🚨 Don't use `static` on functions and data in the namespace scope to avoid linkage problems, use `inline` instead!

If you _do_ want to understand why, then let me tell you a story of linkage. :wink:

### What is linkage
First, let me explain what linkage is. Any name that denotes some entity, be it an object, function, namespace, type, etc., _can_ have linkage but doesn't have to have it. So if we have a program that consists of multiple translation units, there might be different entities that have the same name introduced by a declaration in one or another scope. Linkage controls if these names refer to the same entity.

### Levels of linkage
To decide this, we use the "levels" of linkage. So, any name of some entity can have one of the following three options:
- **No linkage** - a name can only be referred to from the same scope. Any mentions of the same name from other scopes will refer to other entities. You might have guessed that any local variable that lives within some local scope (say, of a function or a class) usually has this linkage.
- **Internal linkage** - a name can be referred to from any scope within the same translation unit (think, same cpp file). Other translation units can have their own separate entities with the same name without issues. Largely speaking, any constant defined at namespace scope, as well as functions and even non-const data that are declared either as `static` will also have internal linkage, more on that in a minute. Oh, and everything declared in an [unnamed namespace](namespaces_using.md#use-unnamed-namespaces) (remember we talked about those?) will too have internal linkage!
- **External linkage** - a name can be referred to from other translation units, i.e., it is globally visible. The typical examples are everything that does not fit to the previous categories, i.e., non-`static` functions and non-`const`, non-`static` variables at namespace scopes, enums, and a bunch of stuff related to classes that we will discuss in the next video. Oh, and also, `inline` data and functions.

Intuitively speaking, if we want some name to be available only in the current scope, it should have **no linkage**. If it should be available **only** from within the same translation unit - it should have **internal linkage**. Finally, **external linkage** is needed for symbols that need to be available globally throughout the program.

In the cases of **no linkage** and **internal linkage** it is relatively hard to do anything wrong on our side. But using **external linkage** requires some care. So let's reiterate why we want to have things with external linkage in the first place, what can go wrong and what is the best way to protect ourselves against the typical pitfalls.

<!-- Maybe an example here
2 libs with A header with cpp file
Header has a function decl, cpp file has a def
main links to both, one expected, one not

 -->

### Why we need external linkage
Let's start with a pretty naive [example](code/static_no_classes/odr_violation/).
<!-- The code for the whole example is as always in the repository linked below the video -->
Say we have a large project and in it we write a library that has a declaration of a function `SayHello` in a header file `our_cool_lib.hpp` which prints "Hello!" to the terminal when we call it:

`our_cool_lib.hpp`
```cpp
void SayHello();  // 😱 This really should be inline
```

We further write a definition of our function in a corresponding source file `our_cool_lib.cpp`:
```cpp
#include "our_cool_lib.hpp"

#include <iostream>

void SayHello() { std::cout << "Hello!" << std::endl; }
```

And we also add another file `main.cpp` that calls this function in the `main` function:
```cpp
#include "our_cool_lib.hpp"

int main() {
  SayHello();
  return 0;
}
```

Now, we just need instruct the compiler and linker on how to build this code and we do that using CMake. Remember, we implement this as part of some large project so we also link to some `other_lib` that might link to other libraries too.
```cmake
# Omitting CMake boilerplate and creation of other_lib

add_library(our_cool_lib our_cool_lib.cpp)
target_link_libraries(our_cool_lib PUBLIC cxx_setup)

add_executable(main main.cpp)
target_link_libraries(main PRIVATE other_lib our_cool_lib)
```

So far so goo. Now, we build it and run it (the `λ ›` part is just an artifact of how my terminal is setup):
```cmd
λ › cmake  -S . -B build
λ › cmake --build build -j 12
λ › ./build/main
What??? 🤯
```

#### What went wrong?
Wait... What? Why did it not print "Hello!" as we expected?

Well, there are two things that we have to know to explain this.

The first one is the code in that `other_lib` that we linked against. Somehow, somebody had a header `other_lib.h` that had exactly the same declaration of the `SayHello` function as we did!
```cpp
void SayHello();  // 😱 This really should be inline
```

However, in the corresponding source file `other_lib.cpp` they had a different printout!
```cpp
#include "other_lib.hpp"

#include <iostream>

void SayHello() { std::cout << "What??? 🤯" << std::endl; }
```

Ok, so we start getting the feeling that something _might_ go wrong here, but why does it?

The reason for this is that the linkage of the `SayHello` function is **external**, and we get into trouble because of the [One Definition Rule (ODR)](https://en.cppreference.com/w/cpp/language/definition) violations. That rule states roughly this: that any symbol must have exactly one definition in the entire program, i.e., across all of its translation units. Only `inline` symbols can have more than one definition which are then all assumed to be exactly the same.

So, here is a slightly simplified explanation of what happens when we compile our code. First, the compiler sees the declaration of the function in our `our_cool_lib.hpp` file, understands that the linkage of the `SayHello` symbol is external and calmly continues, knowing that the linker will take care of finding where the implementation of `SayHello` lives. Which the linker does. The issue arises because the linked sees the `SayHello` symbol from the `other_lib` first. As that symbol also has external linkage and expecting that we know about ODR, it happily links these symbols together and stops. So we end up calling a wrong function!

:bulb: Note that _which_ function is called in such a situation is pure luck as the way the linker will search for the proper symbol is implementation defined. Which is to say, that we are firmly in the "Undefined behavior land" 🌈🦄

Oh, and ODR is simply assumed to be followed, nobody checks that we actually do, which is why it is so important to have the right muscle memory when writing C++ code to never end up in such a situation!

#### How to fix this?
Now that we understand _what_ went wrong, how can we fix this?

And this is where `static` historically, that is before C++11, has been used. Remember how I mentioned that `static` functions have **internal** linkage? We can make use of this.

First, let's consider what would happen if we added `static` before the declaration and the definition of _our_ `SayHello` function?

`our_cool_lib.hpp`
```cpp
static void SayHello();  // 😱 This really should be inline
```

`our_cool_lib.cpp`:
```cpp
#include "our_cool_lib.hpp"

#include <iostream>

static void SayHello() { std::cout << "Hello!" << std::endl; }
```

If we try to compile this, we get a couple of warnings and an error (note that I'm using clang so if you are using gcc your error might be different):
```cmd
λ › cmake --build build -j 12                                                                                                                                                               static_no_classes/odr_violation static
Consolidate compiler generated dependencies of target our_cool_lib
[ 33%] Built target other_lib
[ 50%] Building CXX object CMakeFiles/our_cool_lib.dir/our_cool_lib.cpp.o
/Users/igor/Documents/C++ Course/Slides/lectures/code/static_no_classes/odr_violation/our_cool_lib.cpp:5:13: warning: unused function 'SayHello' [-Wunused-function]
static void SayHello() { std::cout << "Hello!" << std::endl; }
            ^
1 warning generated.
[ 66%] Linking CXX static library libour_cool_lib.a
warning: /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/ranlib: archive library: libour_cool_lib.a the table of contents is empty (no object file members in the library define global symbols)
[ 66%] Built target our_cool_lib
Consolidate compiler generated dependencies of target main
[ 83%] Building CXX object CMakeFiles/main.dir/main.cpp.o
In file included from /Users/igor/Documents/C++ Course/Slides/lectures/code/static_no_classes/odr_violation/main.cpp:1:
/Users/igor/Documents/C++ Course/Slides/lectures/code/static_no_classes/odr_violation/our_cool_lib.hpp:5:13: warning: function 'SayHello' has internal linkage but is not defined [-Wundefined-internal]
static void SayHello();  // 😱 This really should be inline
            ^
/Users/igor/Documents/C++ Course/Slides/lectures/code/static_no_classes/odr_violation/main.cpp:4:3: note: used here
  SayHello();
  ^
1 warning generated.
[100%] Linking CXX executable main
ld: Undefined symbols:
  SayHello(), referenced from:
      _main in main.cpp.o
clang: error: linker command failed with exit code 1 (use -v to see invocation)
make[2]: *** [main] Error 1
make[1]: *** [CMakeFiles/main.dir/all] Error 2
make: *** [all] Error 2
```

Overall, the important thing to note here is that our `main` executable sees that there is a function `SayHello` declared as `static`. Which is to say that its linkage is **internal**. So the linker tries to find the definition of this function **within the same translation unit**, aka `main.cpp`. But our definition lives in a **different** translation unit `our_cool_lib.cpp`. So in that translation unit our function is unused, while there is no implementation for the `static SayHello()` function within the `main.cpp`. Therefore the linker fails.

So the typical thing that people used to do before C++11 is to move the implementation of the function into the header file `our_cool_lib.hpp`:
```cpp
#include <iostream>
// 😱 Should really be inline instead
static void SayHello() { std::cout << "Hello!" << std::endl; }
```

In addition to that, we don't need the `our_cool_lib` target in CMake anymore and just include this file into `main.cpp` directly.

If we now build our code it will build without issues and when we run it, we get the correct output.

Seems like we've solved everything, right? Well, technically yes, but there is a minor issue with using `static` like this which might or might not be important to us depending on the application.

#### Why `inline` is better than `static` for linkage
The issue with `static` is that it enforces internal linkage. That is to say, that in our example, if we include our `our_cool_lib.hpp` file into multiple translation units, we will have a **copy** of the compiled binary code of the `SayHello` function in every single translation unit. This takes space which might become problematic on constrained hardware.

This is where `inline` comes to the rescue! It implies **external** linkage but, as stated in the ODR formulation, multiple definitions _are_ allowed for `inline` functions (🔼 C++11) and data (🔼 C++17). So in our case, if we replace `static` with `inline` for our `SayHello` function, we will only ever have one instance of the compiled binary code for this function that the linker will happily link everywhere.

This is the best way to declare functions and data that should be visible globally in modern C++. So, you see, there is no reason to mark functions as `static` anymore due to linkage reasons.

> :bulb: Note that in the example above, we still have the `other_lib` which is implemented in a bad way and we still technically violate ODR. Which is why it is so important to maintain high coding standards. If the function `SayHello` in the `other_lib.hpp` would be declared as `inline` and we would try to include both headers into our `main.cpp` we would get a "redefinition" error for this function.

### The data
But what about the data, I hear you ask! Here, the situation is a bit simpler. We cannot declare data without definition, unless we use the keyword `extern`, which we did not discuss and should avoid in most cases. The fact that we cannot _declare_ data removes most of the issues that we discussed above.

Furthermore, if we define `const` (or `constexpr`) data at namespace scope they get **internal linkage** by default. So, you see, there is no need for `static` at all.

Still, the best way with C++17 and onward is, similarly to functions, to define our data as `const` or `constexpr` `inline` with exactly the same reasoning.

## Conclusion and a rule of thumb
So, I hope that by now you see that there is no need to use `static` outside of classes at all in modern C++. Here is a guideline to follow along with this:

### For functions and variables at namespace scope
- When defining variables at namespace scope always declare them as `inline` `constexpr` or `const`. Do **not** define them as `static`!
- When declaring functions at namespace scope, declare (and define) them as `inline`. Do **not** declare them as `static`!

This will guarantee their external linkage, i.e., visibility across the whole program, while not violating the ODR.

### For variables at local scopes
- When declaring a variable at local scope, do not declare it as `static` unless you are explicitly implementing a singleton-like design pattern (which you probably shouldn't do anyway)

### Final words
Understanding the key role that ODR plays here is crucial to understanding why `static` was introduced into the language in the first place. It was in the times when `inline` meant something different and could not be used as it can be now. So it was the only way to provide a definition of a function or a variable directly in the header. Thankfully, we live in better times now, which makes `static` close to obsolete when used outside of classes. Now if you want to know how to use `static` in classes you can see a video about that once it's ready and maybe also go back and refresh how `inline` plays a huge role in creating libraries in C++.
