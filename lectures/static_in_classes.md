Keyword `static` inside classes
---

<p align="center">
  <a href="https://youtu.be/blah"><img src="https://img.youtube.com/vi/blah/maxresdefault.jpg" alt="Video" align="right" width=50% style="margin: 0.5rem"></a>
</p>

- [Keyword `static` inside classes](#keyword-static-inside-classes)
- [Using `static` class methods](#using-static-class-methods)
- [Using `static` class data](#using-static-class-data)
  - [Out-of-class definitions for `static` data](#out-of-class-definitions-for-static-data)
- [What is `static` in classes useful for?](#what-is-static-in-classes-useful-for)


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
Note how we don't need to explicitly specify which class the `PrivateStaticFunction` is from if we call it from within the class it is defined in.

However, if we try to call our `PrivateStaticFunction` from outside our class, we will get a compilation error.
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

The ones of you, who already watched the video about using `static` outside of classes might be very confused now. Just one video ago, I was talking about using `inline` _instead of_ `static` but here, I suggest to use _both_ together? What is going on here? If you haven't watched that video yet - do so to be just as confused :wink:. As an answer, I need to explicitly state here that:
> 🚨 **Words `inline` and `constexpr` mean very different things inside and outside of classes, so do not confuse these cases!**

To complicate things further, we only got the opportunity to use `inline` for `static` class data from C++17 on. Before that things were much more messy. And guess what? There is still a lot of code that is left from those times! So we'll have to dive head-first into the mess of `static` data out-of-class definition requirements!

### Out-of-class definitions for `static` data
Remember, how usually, data declaration is also its definition? Well, not so for `static` class data. The declaration of such data is **not** a definition by default. So we can **declare** a `static` variable in the class and **define** it outside of class, which is called an **out-of-class** definition:
```cpp
struct Foo {
  // Declaration, not a definition!
  static int number;
};

// Definition, does not use static
int Foo::number = 42;
```
Note how we only use `static` in the declaration but not in definition.

> :bulb: Until C++17 introduced `inline` for use with data, we had to have an out-of-class definition for **every** `static` class variable or constant. With its introduction we can define them directly during declaration as we just discussed before. In the remainder of this lecture we will talk about how things were **before** `inline` could be used in such a way, i.e., before C++17.

This does not yet sound confusing, does it? We have seen this pattern many times before with functions. So now we also have to use it with `static` class data, no big deal, right?

Here is where it gets more confusing. If we declare a `const static` class data, we _could_ also provide its definition at the same time. And the confusing part is that we _still_ need a definition in such a case. Here is how it would look like for a simple example of storing a number as a class `static` data member and printing a minimum of this number and, say 100:
```cpp
#include <algorithm>
#include <iostream>

struct Foo {
  static const int number = 42;
};

// This is the out-of-class definition!
const int Foo::number;

int main() {
  std::cout << std::min(Foo::number, 100) << std::endl;
}
```

If we fail to provide the out-of-class definition we will get a **linker** error!
```css
<source>:11: undefined reference to `Foo::number'
collect2: error: ld returned 1 exit status
```

Very annoying and a lot of people (including myself more times than I care to admit) have forgotten this in their code and took some time to figure out why the linker error pops up. The situation is made worse by only happening _sometimes_, as it only occurs if `Foo::number` is ODR-used. Now, this term ODR-used is quite complex, so we will skip the details here but you might have recognized the "ODR" part and that should indicate that it has something to do with ODR, or One Definition Rule. I went into some details about it in the previous video. Anyway, in many cases, we can use our `Foo::number` and the linker will not complain. Until it does. Long story short, always use `inline` in modern C++ and you will never have such issues.

## What is `static` in classes useful for?
Ok, I bored you enough with the details like these. Let's actually go back to how `static` can be used in classes - what does it allow us to do? I wouldn't say there is a clearly defined rule here. For `static` class data I see a couple use-cases:
- To define class-specific constants that should be shared across all instances of a class and logically "belong" to such a class
- To define non-constant variables that are shared across all instances of the class and are used for kind of bookkeeping, like how many objects of this class exist or alike.

And as for `static` class member functions, these are mostly used for creating objects in a special way, in logging or testing libraries as well as for meta-programming, which we will probably touch upon later.

Just to give you a concrete example, we can look at one of great open source libraries for linear algebra, Eigen. Matrices take a center place in that library. We've already implemented a class that was very similar to those matrices: our `Image` class from the ["Image Pixelator"](../homeworks/homework_5/homework.md#pixelatorimage-class) homework. If you haven't done that homework, I do urge you to give it a go :wink:. Anyway, there we created an image empty, and set its pixels afterwards:
```cpp
const auto rows{42};
const auto cols{23};
pixelator::Image image{rows, cols};
image.at(4, 2) = ftxui::Color::RGB(255, 0, 0);
```

What if we wanted to set it to red color upon creation? Well, we would need to use a `static` function for that! A naive implementation of such a function could be a `static` member function `Constant` that would take the image size and the color we want to set and would create an image inside of it, filling every pixel of it with color afterwards.
```cpp
class Image {
 public:
   // other important stuff goes here
   static Image Constant(int rows, int cols, const ftxui::Color& color) {
    Image image{rows, cols};
    for (auto row = 0; row < rows; ++row) {
      for (auto col = 0; col < cols; ++col) {
        image.at(row, col) = color;
      }
    }
    return image;
   }
};
```
In fact there is a version of this function in one of the most used linear algebra libraries I am aware of: [Eigen](https://gitlab.com/libeigen/eigen/-/blob/master/Eigen/src/Core/DenseBase.h#L326). Using these functions usually provides us with convenience and allowing to write a more readable code that shows intent better. When we read how this function is called we know what happens without the need to see the implementation details:
```cpp
// Somewhere in the code
auto red_image = pixelator::Image::Constant(
  42, 23, ftxui::Color::RGB(255, 0, 0));
```
There is a number of situations when such `static` member functions are useful and are used quite often. Keep your eyes peeled for such situations in the code you read at work or during your studies. Oh, and by the way, did you notice something? The `ftxui::Color::RGB(255, 0, 0)` is nothing else then a call to `static` member function of the


To illustrate this example, let's go on a short journey along with Rick Sanchez, from Rick and Morty. Let us imagine that Rick, a `MultiverseExplorer` invents a `StrangeMachine`, which, upon activation generates a copy of Rick, sampling the copy from another dimension. Now, to make sure things don't get out of hand, the original Rick has to get rid of all other Ricks. We will observe how he could design his own class to help him in this endeavor.

First of all, the `MultiverseExplorer` by which Rick has modeled himself has  a `static` variable `total_rick_count` that counts all his copes in his dimension. Such a counter would be incremented on every copy, meaning that we need a custom copy constructor. As we discussed when we talked about the rule of "all or nothing" this means we have to implement the rest of the constructors and operators too:

```cpp

class MultiverseExplorer {
public:
    MultiverseExplorer(const MultiverseExplorer& other) = delete;
    MultiverseExplorer(MultiverseExplorer&& other) = delete;
    MultiverseExplorer& operator=(const MultiverseExplorer& other) = delete;
    MultiverseExplorer& operator=(MultiverseExplorer&& other) = delete;

    ~MultiverseExplorer() {
      if (!id_.empty()) { total_rick_count_--; }
    }

    bool CopiesExist() const { return total_rick_count_ > 1; }

private:
    static inline std::map<std::string, int> total_rick_count_{};

    std::string id_;
};

int main() {
    MultiverseExplorer rick("C-137");
    StrangeMachine machine{};
    City city{};

    auto rick_copies = strange_machine.DoTheThing();

    MultiverseExplorer rick2("D-716");
    MultiverseExplorer rick3("J-22");

    rick1.showStatus();
    rick2.showStatus();
    rick3.showStatus();

    std::cout << "Total Ricks Across the Multiverse: " << MultiverseExplorer::totalRicks << std::endl;

    return 0;
}
```

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
