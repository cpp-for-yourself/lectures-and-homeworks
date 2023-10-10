Static keyword
---

<p align="center">
  <a href="https://youtu.be/blah"><img src="https://img.youtube.com/vi/blah/maxresdefault.jpg" alt="Video" align="right" width=50%></a>
</p>

What I want to talk about:
- `static` functions in classes and outside of classes
- `static` data (also `inline`, `const` and `constexpr`)
  - When used needs to be defined at namespace scope (unless `inline` or `constexpr` (which implies `inline`))
- Why static is called this way
- How it _should_ be used and how it _can_ be used (singleton?)
- internal linkage
- static initialization order fiasco
- I might need to split this into two videos
- How the objects actually get initialized (top-bottom)

The keyword [`static`](https://en.cppreference.com/w/cpp/keyword/static) is a very important keyword in C++ and is used a lot. Honestly, probably it is used too much due to it coming into C++ from C but also acquiring new use cases. Largely speaking, it can be used inside and outside classes and these two cases are very different. Today we focus on the latter - using `static` outside classes.

And the good news is that if you follow my advices from before then the rule-of-thumb for using `static` outside of classes in modern C++ is very simple - **don't**! Don't use it at all!

<!-- Thanks for watching, subscribe and see you soon! Get up, walk away, wait. Come back. -->

What? Still here? I guess you did learn something about C++ and you know that nothing is as simple. But it _is_ not much harder than that, this I can promise you. Anyway, let's dive into this rule and talk about why it _mostly_ holds.

<!-- Intro -->

In order to explain why we _mostly_ don't want to use `static` for anything outside of classes we will need to introduce (or remember) some nomenclature. The keyword `static` really controls two things:
- The storage duration
- The linkage

Now, what are these?

## Storage duration
Every object declared in C++ has a certain lifetime. Lots of data lives within a single scope and its memory gets freed upon the end of its scope.

### Namespace scope
But there is also data declared at **namespace scope**. These data gets allocated at the start of the program and gets freed when the program terminates, which is to say that these data have the **static storage duration**. I believe that this is what inspired the name `static` back when it was introduced in C. Anyway, we _can_ use `static` for an object declaration at namespace scope to indicate that it has the static storage duration but we don't have to, as any such object has this storage duration by default. So the following definitions are equivalent in terms of storage duration:
```cpp
constexpr auto answer = 42;
const auto answer = 42;
auto answer = 42;  // 😱 please don't...

static constexpr auto answer = 42;
static const auto answer = 42;
static auto answer = 42;  // 😱 please don't...
```

### Function scope
Another use of `static` is to extend the storage duration of a local variable within some function scope to have the static storage duration.

Such a `static` variable will be initialized when first encountered during the program flow and destroyed when the program exits.

Let's illustrate it using an example. Assuming we have a `struct` `Helper` that prints something in its constructor, let's write a function `GetHelper` that creates a helper object and returns a reference to it. Note how this function returns a non-const reference to an object created within a function. If you followed the lecture on [functions](functions.md) your eye might start twitching now but in this situation it's all right - the helper object is `static`, so, once created once it will exist until the end of the program. If we call our `GetHelper` function twice we will see that the `Helper` object is only created once when the `static` variable definition is encountered for the first time by comparing the pointers to the object we receive.
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

Now this is where I lied to you a bit about never needing to use `static`. There _are_ situations when you might want to create a static object within a function. However the ones that come to mind are hard to come by if we follow a good style. For completeness, I can think of using such method to deal with the "static initialization order fiasco" and for implementing a singleton pattern (which you probably anyway don't want to use, more on that later).

Generally speaking, when used outside classes, `static` can be used in two places:
- outside of functions (aka at namespace scope)
- inside of functions (to declare `static` local variables)

## Linkage
We touched upon linkage before, when we talked about [libraries](headers_and_libraries.md), and especially the `inline` keyword. Linkage of any symbol, be it a variable or a function, determines if this symbol can be seen from a different translation unit (aka, a `*.cpp` file).
<!-- If this is confusing, do watch the video about libraries -->

When using `static`, any variable or function declared at namespace scope will get **internal linkage**, meaning that it will only be available from within the translation unit in which it is declared. This seems like something that we usually want to avoid breaking the ODR, right? So sounds like we would _want_ to use `static` here? Why did I say that we don't need it?

### The data
Well, it turns out that if we declare const (or constexpr) objects at namespace scope they _also_ get **internal linkage** by default. The only ones getting external linkage are the non-const data declared at namespace scope. And we talked about it before, right? We should only have const global data. So if we follow the guidelines from before, we can safely skip the `static` keyword and nothing will change.

### The functions
The situation is a bit more complicated with functions. We talked about using the `inline` keyword, which essentially tells the compiler that we expect that there are going to be a number of implementations of a certain function across multiple translation units and that we promise that they are all the same. The compiler still sees one function declaration, but knows that there will be many function definitions across multiple translation units, which is exactly what we want.

Now, if we replace `inline` with `static`, we are telling the compiler to generate a separate copy of this function for each translation unit. This includes both - the declaration and definition. It _does_ serve the same purpose of avoiding the ODR violations but it _also_ reduces the capabilities of the compiler to optimize the generated code, so this method is inferior to using `inline`. Therefore, simply don't declare namespace scope functions as `static`
