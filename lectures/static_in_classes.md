Keyword `static` inside classes
---

<p align="center">
  <a href="https://youtu.be/blah"><img src="https://img.youtube.com/vi/blah/maxresdefault.jpg" alt="Video" align="right" width=50% style="margin: 0.5rem"></a>
</p>

- [Keyword `static` inside classes](#keyword-static-inside-classes)
- [Using `static` class methods](#using-static-class-methods)
- [Using `static` class data](#using-static-class-data)


The keyword [`static`](https://en.cppreference.com/w/cpp/keyword/static) is a very important keyword in C++ and is used a lot. Honestly, because of a very general name, it is probably a bit _overused_. Largely speaking, it can be used outside of classes and inside classes and these two cases are slightly different. Today we focus on the *latter* - using `static` inside classes. If you are interested in how and when (khm-khm... *not*) to use `static` _outside_ of classes, I'm linking that [lecture right here](static_outside_classes.md).

Now as opposed to that, using `static` _within_ classes is actually quite useful and is used very often. If you just want to understand the gist of what `static` is used for within classes, here is a very concise summary: if any class data or methods are marked as `static` they are **not associated to any object of this class**: they are independent variables of static storage duration and general functions. So much so that we can nearly think of them as being normal variables and functions in the namespace that represents the class with a small additional feature that they respect class access modifiers.

If this sounds a bit confusing - don't worry. I, as always, have examples for you that hopefully will clear things up a bit :wink:

<!-- Intro -->

Basically, `static` can be applied to class data or to class methods. Both of these cases are actually quite useful.

## Using `static` class methods
We'll start with the class methods and talk about the data later as there are some minor complications with how such data can be declared and defined.

To mark a class method `static` we just have to add the keyword `static` at the beginning of its declaration. The definition of such a method (should it be separate from the declaration) remains intact, without the `static` keyword.

So, for a class `Foo` we can write two `static` functions:
- `InlineBar()` which is defined in-place and
- `Bar()` which has an out-of-class definition (that could also be in a separate `*.cpp` file of course)
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` static_methods/foo.hpp
-->
```cpp
#include <iostream>

class Foo {
  public:
    static void InlineBar() {
      std::cout << "InlineBar()" << std::endl;
    }
    static void Bar();
};

void Bar() {
  std::cout << "Bar()" << std::endl;
}
```

To call these functions in a canonical way, we have to prefix their names with the name of the class they belong to along with the double-colon symbol. Meaning that our functions can be called as `Foo::InlineBar()` and `Foo::Bar()` respectively:
<!--
`CPP_SETUP_START`
#include "foo.hpp"
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` static_methods/main_simple.cpp
`CPP_RUN_CMD` CWD:static_methods c++ -std=c++17 -c main_simple.cpp
-->
```cpp
int main() {
  Foo::InlineBar();
  Foo::Bar();
  return 0;
}
```

Essentially, the simplest way to think about `static` class methods is to think about them as just normal general functions and treat their surrounding class as a sort of *namespace* for these functions. To show that these are mostly equivalent to general functions, we can show that we can store a pointer to such a `static` member function interchangeably with a pointer to a general function:
<!--
`CPP_SETUP_START`
#include "foo.hpp"
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` static_methods/main_interchangeable.cpp
`CPP_RUN_CMD` CWD:static_methods c++ -std=c++17 -c main_interchangeable.cpp
-->
```cpp
void FreeStandingFunction() {
  std::cout << "FreeStandingFunction()" << std::endl;
}

int main() {
  auto* function_ptr = &Foo::InlineBar;
  (*function_ptr)();
  // Note that we do not change the type!
  function_ptr = &FreeStandingFunction;
  (*function_ptr)();
  return 0;
}
```
Here, we use the `&` to take the address of each of our functions and store them as a function pointer. We then call these functions through our `function_ptr` variable by dereferencing the pointer (`*function_ptr`) and calling the underlying function with the round brackets.

:bulb: Don't worry, you don't have to do this very often in the code. I just wanted to illustrate that a pointer to a general function and one to a `static` class method can be stored in the same variable, which means that they are more or less equivalent.

<!-- Please comment below what you think about it? Did it help? Did it confuse you more? Do let me know! -->

There is one slight difference that makes the `static` class methods differ from the general functions - the `static` class methods obey class access modifiers! If we have a `static` class method in the `private` region of our class, we can only call it from within the class, i.e., from other `static` and non-`static` member functions.
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` weird_calling/foo.hpp
-->
```cpp
class Foo {
 public:
    static void PublicStaticFunction() {
      PrivateStaticFunction();
    }

    void NormalFunction() {
      PrivateStaticFunction();
    }
 private:
   static void PrivateStaticFunction() {}
};
```
<!--
`CPP_SETUP_START`
#include "foo.hpp"
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` weird_calling/main.cpp
`CPP_RUN_CMD` CWD:weird_calling c++ -std=c++17 -c main.cpp
-->
```cpp
int main() {
  Foo::PublicStaticFunction();
  Foo foo;
  foo.NormalFunction();
  // ❌ Cannot call private function!
  // Foo::PrivateStaticFunction();
}
```
If we try to call our `PrivateStaticFunction` from outside our class, we will get a compilation error.
```css
<source>: In function 'int main()':
<source>:20:29: error: 'static void Foo::PrivateStaticFunction()' is private within this context
   20 |   Foo::PrivateStaticFunction();
      |   ~~~~~~~~~~~~~~~~~~~~~~~~~~^~
<source>:13:16: note: declared private here
   13 |    static void PrivateStaticFunction() {}
      |                ^~~~~~~~~~~~~~~~~~~~~
```

That's _nearly_ it! There is one more thing, which is slightly confusing, nobody uses it (or at least nobody should) but I still need to tell you about it in case you see it in somebody else's code. Remember how we used the double-colon symbol `::` when calling the `static` member functions? Well, we can also use the dot `.` **on an object of the class** to do the same.
```cpp
struct Foo() {
  static void Bar() {}
}

int main() {
  Foo foo;
  // The next two lines do exactly the same thing
  Foo::Bar();
  foo.Bar();  // 😱 Don't use this syntax.
}
```

If you ask me, this makes everything a bit more confusing, but the opportunity is there :shrug:. Think about it, as we've just learnt, the `static` function has nothing to do with the class *object* data and yet it looks like it is called on an object with this syntax. Confusing, eh? I don't know of any situation where this would be useful, but if you do - please tell me!

Now we're through!

## Using `static` class data
But what about `static` class data? Well, the idea is the same: the data is associated to the class type rather than to any particular object of such a class. Technically, on an idea level, this is everything anybody needs to know.

What makes this a slightly complicated topic is that the way such data was declared and defined has been changing in the recent years, which adds quite a bit of confusion to the process.

The good news is that we're now **in a good place**! There is an easy-to-use fool-proof best practice for declaring your class-`static` data:

> 🚨 **Always define your class `static` data in place by using `static inline` or `static constexpr` (which in this case implies `static inline`)**.

<!--
`CPP_SETUP_START`
$PLACEHOLDER
int main() {
  Foo::any_static_data;
  Foo::kWord;
  Foo::kNumber;
}
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` static_inline_examples/main.cpp
`CPP_RUN_CMD` CWD:static_inline_examples c++ -std=c++17 -c main.cpp
-->
```cpp
struct AnyType{};

class Foo {
  public:
    static inline AnyType any_static_data{};
    static inline const std::string kWord{"hello"};
    static constexpr int kNumber{}; // implicitly inline
};
```

If you stick to this rule, your life is going to be much simpler.
<!-- You can thank me by subscribing to this channel and telling your friends when you're ready :wink: -->

The ones of you, who already watched the video about using `static` outside of classes might be very confused now. Just one video ago, I was talking about using `inline` _instead of_ `static` but here, I suggest to use _both_ together? What is going on here? If you haven't watched that video yet - do so to be just as confused :wink: As an answer, I need to explicitly state here that:
> 🚨 **Words `inline` and `constexpr` mean very different things inside and outside of classes, so do not confuse these cases!**


To complicate things further, we only got the opportunity to use `inline` for `static` class data from C++17 on. Before that things were much more messy. And guess what? There is still a lot of code that is left from those times! So we'll have to dive head-first into the mess of `static` data out-of-class definition requirements!

<!-- TODO: complicated examples -->


<!--

What I want to talk about:

The name of any static data member and static member function must be different from the name of the containing class.

- data can be const and non-const.
  - If data is not inline - needs an out-of-class definition, even if initialized
  - If inline - does not need anything
  - Constexpr is implicitly inline
- Obeys access rules
- Methods cannot be const (think of why)

- Declaration vs definition
  - By default static data is just declared, not defined
  - Use constexpr or inline to define it in place
  - Static is only used in the declaration but not in definition

The confusing parts:
- Const declaration of some data with initializer - linker error


Static functions are much more alike to normal functions than they are to class methods.

Static data members of a class in namespace scope have external linkage, which means that the combination of namespace::Class::kData should be unique in the whole program.

An example could be a class that counts all its copies. Maybe a Rick'n'Morty reference? Like Rick that dives into multiple times/universes and needs to keep track of how many Ricks exist?
 -->
