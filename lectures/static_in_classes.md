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
  - [Using `static` member functions](#using-static-member-functions)
  - [Using `static` member data](#using-static-member-data)
- [Conclusion](#conclusion)


The keyword [`static`](https://en.cppreference.com/w/cpp/keyword/static) is a very important keyword in C++ and is used a lot. Honestly, because of a very general name, it is probably a bit _overused_. Largely speaking, it can be used outside and inside of classes and these two cases are very different. Today we focus on the *latter* - using `static` inside of classes. If you are interested in how and when (khm-khm... *not*) to use `static` _outside_ of classes, I'm linking that [lecture right here](static_outside_classes.md).

Now, as opposed to that, `static` _within_ classes is actually quite useful and is used quite often. If you just want to understand the gist of what `static` is used for within classes, here is a very concise summary [taken verbatim from cppreference.com](https://en.cppreference.com/w/cpp/language/static): static members of a class are **not associated with the objects of the class**: they are independent variables with static storage duration or regular functions. So much so that we can nearly think of them as being normal variables and functions in the namespace that represents the class with a small additional feature that they respect class access modifiers.

If this sounds a bit confusing - don't worry. I, as always, have examples for you that hopefully will clear things up a bit :wink:

<!-- Intro -->

As you might have already understood, `static` can be applied to class methods or to class data. Both of these cases are actually quite useful.

We'll start with the class methods and talk about the data later as there are some minor complications with how such data can be declared and defined.

## Using `static` class methods
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
  static void InlineBar() { std::cout << "InlineBar()" << std::endl; }
  static void Bar();
};

void Bar() { std::cout << "Bar()" << std::endl; }
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

Essentially, the simplest way to think about `static` class methods is to think about them as just normal general functions and treat their surrounding class as a sort of a *namespace* for these functions. This way of thinking is of course stretching the concept a bit but is a useful mental model in my opinion. To show that these are mostly equivalent to general functions, we can show that we can store a pointer to such a `static` member function interchangeably with a pointer to a general function:
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` static_and_other_methods/main.cpp
`CPP_RUN_CMD` CWD:static_and_other_methods c++ -std=c++17 -c main.cpp
-->
```cpp
#include <iostream>

class Foo {
 public:
  static void InlineBar() { std::cout << "InlineBar()" << std::endl; }
};

void FreeStandingFunction() {
  std::cout << "FreeStandingFunction()" << std::endl;
}

int main() {
  // Store the function address in a variable
  auto* function_ptr = &Foo::InlineBar;
  (*function_ptr)();
  // Note that we do not change the type!
  function_ptr = &FreeStandingFunction;
  (*function_ptr)();
  return 0;
}
```
Here, we use the `&` to take the address of each of our functions and store them as a function pointer. It does not _really_ matter here what exactly that type is as long as it is the same in both cases. If we call these functions through our `function_ptr` variable by dereferencing the pointer (`*function_ptr`) and calling the underlying function with the round brackets, we should be able to call both of our functions resulting in the output that we expect.
```
InlineBar()
FreeStandingFunction()
```

:bulb: Don't worry if this seems a bit complex, there is no need to fully understand everything here just now. At this point, I just wanted to illustrate that a pointer to a general function and one to a `static` class method can be stored in the same variable, which means that they are more or less equivalent.

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
  static void PublicStaticFunction() { PrivateStaticFunction(); }

  void NormalFunction() { Foo::PrivateStaticFunction(); }

 private:
  static void PrivateStaticFunction() {}
};
```
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` weird_calling/main.cpp
`CPP_RUN_CMD` CWD:weird_calling c++ -std=c++17 -c main.cpp
-->
```cpp
#include "foo.hpp"

int main() {
  Foo::PublicStaticFunction();
  Foo foo;
  foo.NormalFunction();
  // ❌ Cannot call private function!
  // Foo::PrivateStaticFunction();
}
```
Note how we don't need to (but still can) explicitly specify which class the `PrivateStaticFunction` is from if we call it from within the class it is declared in.

However, if we try to call our `PrivateStaticFunction` from outside our class, we will get a compilation error that tells us why in a pretty much straightforward fashion:
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
struct Foo {
  static void Bar() {}
};

int main() {
  Foo foo;
  // The next two lines do exactly the same thing
  Foo::Bar();
  foo.Bar();  // 😱 Don't use this syntax.
}
```

Think about it, as we've just learnt, the `static` function has nothing to do with the class *object* data and yet it looks like it is called on an object with this syntax. Confusing, eh? I don't know of any situation where this would be useful, but if you do - please tell me!
<!-- In the comments below this video! -->

## Using `static` class data
Now it's time we talked about `static` class data. The underlying idea is the same: the data is associated to the class type rather than to any particular object of such a class. Technically, on an idea level, this is everything anybody needs to know.

What makes this a slightly complicated topic is that the way such data is declared and defined has been changing in the recent years, which adds quite a bit of confusion to the process.

The good news is that we're now **in a good place**! There is an easy-to-use fool-proof best practice for declaring your class-`static` data:

> 🚨 **Always define your class `static` data in-place by using `static inline` or `static constexpr` (`constexpr` in this case implies `inline`)**.

So, all of these definitions are good-to-go:
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
#include <string>

struct AnyType {};

class Foo {
 public:
  static inline AnyType any_static_data{};
  static inline const std::string kWord{"hello"};
  static constexpr int kNumber{};  // implicitly inline
};
```
We can use `static inline` for any complex types regardless of the variable being `const` or not and we can use `static constexpr` on any literal type such as an `int` in this case.

**If you stick to this rule, your life is going to be much simpler.**
<!-- You can thank me by subscribing to this channel and telling your friends when you're ready :wink: Really, my data shows me that only 20% of people watching these videos are subscribed. It would mean the world to me if you helped me out with this issue :wink: -->

This rule is a lifesaver, but the ones of you, who already watched [the lecture about using `static` outside of classes](static_outside_classes.md) might be very confused now. Just one video ago, I was talking about using `inline` _instead of_ `static` but here, I suggest to use _both_ together? What is going on here? If you haven't watched that video yet - do so to be just as confused :wink:. As an answer, I need to explicitly state here that:
> 🚨 **Words `static`, `inline` and `constexpr` mostly mean very different things inside and outside of classes, so do not confuse these cases. The best suggestion I can give is to not apply anything you know about one case to another. Think that these could have been different keywords altogether!**

And while this train of thought is a bit extreme, I'd say it is quite helpful.

To complicate things further, we only got the opportunity to use `inline` for `static` class data from C++17 on. Before that things were much more messy. And guess what? There is still a lot of code that is left from those times! So we'll have to dive head-first into the mess of (drumroll 🥁) `static` class data out-of-class definition requirements!

### Out-of-class definitions for `static` data
Remember, how usually, data declaration is also its definition? Well, not so for `static` class data. The declaration of such data is **not** a definition by default. So we can **declare** a `static` variable in the class and **define** it outside of class, which is called an **out-of-class** definition:
<!--
`CPP_SETUP_START`
$PLACEHOLDER
int main() {
  Foo::number;
}
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` foo_number/main.cpp
`CPP_RUN_CMD` CWD:foo_number c++ -std=c++17 -c main.cpp
-->
```cpp
struct Foo {
  // 😱 Use static inline instead!
  // Declaration, not a definition!
  static int number;
};

// Definition, does not use static
int Foo::number = 42;
```
Note how we only use `static` in the declaration but not in definition.

> :bulb: Until C++17 introduced `inline` for use with data, we **had** to have an out-of-class definition for **every** `static` class variable or constant. With its introduction we can define them directly during declaration as we just discussed before. In the remainder of this lecture we will talk about how things were **before** `inline` could be used in such a way, i.e., before C++17.

Here is where it gets more confusing. If we declare a `const static` class data, we _could_ also provide its definition at the same time. And the confusing part is that we **still need an out-of-class definition in such a case**. Here is how it would look for a simple example of storing a number as a class `static` data member and printing a minimum of this number and, say 100:
```cpp
#include <algorithm>
#include <iostream>

struct Foo {
  static const int number = 42;
};

// This is the out-of-class definition!
const int Foo::number;

int main() { std::cout << std::min(Foo::number, 100) << std::endl; }

```

If we fail to provide the out-of-class definition we will get a **linker** error!
```css
<source>:11: undefined reference to `Foo::number'
collect2: error: ld returned 1 exit status
```

Very annoying and a lot of people (including myself more times than I'd like to admit) have forgotten this in their code and took some time to figure out why the linker error pops up. The situation is made worse by only happening _sometimes_, as it only occurs if `Foo::number` is, so-called, ODR-used. Now, this term ODR-used is quite convoluted, so we will skip the details here but you might have recognized the "ODR" part and that should indicate that it has something to do with [ODR, or One Definition Rule](https://en.cppreference.com/w/cpp/language/definition). I went into some details about it [in the previous lecture](static_outside_classes.md#dont-define-functions-and-data-as-static-in-header-files-use-inline-instead). Anyway, in many cases, for example with `std::cout`, we can use our `Foo::number` and the linker will *not* complain. Until we call our variable in such a way that it does. Long story short, always use `inline` in modern C++ and you will never have such issues.

## What is `static` in classes useful for?
Ok, I bored you enough with the details like these. Let's actually go back to how `static` can be used in classes - what does it allow us to do? I wouldn't say there is a clearly defined rule here. But let's have a look at a couple of use-cases that come to mind.

### Using `static` member functions
The `static` class member functions are mostly used for manipulating `static` class data, for creating objects in a special way, in logging or testing libraries as well as for meta-programming, which we will probably touch upon later in the course.

Just to give a concrete example, we can look at our `Image` class from the ["Image Pixelator"](../homeworks/homework_5/homework.md#pixelatorimage-class) project that you've hopefully done before. If you haven't done that project, I do urge you to give it a go :wink:. Anyway, there we created an image empty, and set its pixels afterwards:
<!--
`CPP_SETUP_START`
namespace ftxui {
struct Color {
  static Color RGB(int, int, int) { return Color{}; }
};
}

struct Image {
  int rows;
  int cols;
  ftxui::Color at(int r, int c) { return ftxui::Color{}; }
};

int main() {
  $PLACEHOLDER
}
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` image_1/main.cpp
`CPP_RUN_CMD` CWD:image_1 c++ -std=c++17 -c main.cpp
-->
```cpp
const auto rows{42};
const auto cols{23};
Image image{rows, cols};
image.at(4, 2) = ftxui::Color::RGB(255, 0, 0);
```

What if we wanted to set it to, say, a red color upon creation? Well, we _could_ have a specific constructor that would set the color to the whole matrix, but there is a couple of issues with such an approach.
1. The constructor does not introduce a new name, so our intent of _how_ we want to create an object remains to be inferred from the parameters:
   <!--
   `CPP_SKIP_SNIPPET`
   -->
   ```cpp
   Image image{rows, cols, color};
   ```
   Such an interface might or might not make sense to you, but in more complex situations it quickly gets out of hands
2. Furthermore, if we want to do something different while still providing the same parameters we simply cannot. This severely limits our capabilities
3. Finally, sometimes we would like to give such functions that create objects the ability to fail. We could use exceptions for this (stay tuned), but in certain code bases those are forbidden

These reasons nudge us to follow a different path. We could use a `static` function to create our object instead! A naive implementation of such a function could be a `static` member function `FilledWithColor` that would take the image size and the color we want to set and would create an image inside of it, filling every pixel of it with color afterwards.
<!--
`CPP_SETUP_START`
namespace ftxui {
struct Color {
  static Color RGB(int, int, int) { return Color{}; }
};
}

$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` image_fill/image.hpp
-->
```cpp
#include <algorithm>
#include <vector>

// This is not a full useful implementation.
// It just illustrates the things I want to talk about.
class Image {
 public:
  Image(int rows, int cols) : pixels_(rows * cols, ftxui::Color{}) {}

  static Image FilledWithColor(int rows, int cols, const ftxui::Color& color) {
    Image image{rows, cols};
    std::fill(image.pixels_.begin(), image.pixels_.end(), color);
    return image;
  }

  // Other important stuff lives here

 private:
  std::vector<ftxui::Color> pixels_{};
};
```

Note also how we can use the `private` data of our object directly because we are using it from within our class `Image`.

> :bulb: Fun fact, there is a version of this function in some of the most used linear algebra and computer vision libraries I am aware of: [Eigen](https://gitlab.com/libeigen/eigen/-/blob/master/Eigen/src/Core/DenseBase.h#L326) has a function `Constant`, [OpenCV](https://docs.opencv.org/2.4/modules/core/doc/basic_structures.html#mat-ones) has a function `ones` etc. Using these functions usually provides us with convenience and allows to write more readable code that shows intent better. When we read how these functions are called we know what happens without the need to see the implementation details:
<!--
`CPP_SETUP_START`
#include "image.hpp"

int main() {
  $PLACEHOLDER
}
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` image_fill/main.cpp
`CPP_RUN_CMD` CWD:image_fill c++ -std=c++17 -c main.cpp
-->
```cpp
// Somewhere in the code
auto red_color = ftxui::Color::RGB(255, 0, 0);
auto red_image = Image::FilledWithColor(42, 23, red_color);
```
There is a number of situations when such `static` member functions are useful. Keep your eyes peeled for such situations in the code you read. Oh, and by the way, did you notice something? The [`ftxui::Color::RGB(255, 0, 0)`](https://arthursonzogni.github.io/FTXUI/classftxui_1_1Color.html#aacec69e0aa1063fbec2cc305e7b076dd) from an awesome FTXUI library is nothing else than a call to a `static` member function of the `ftxui::Color` type!

### Using `static` member data
Now let's talk about `static` class data. We will stick with the `Image` class for our examples here too.

First, let's look at how simple constant `static` class data can be used.
Let's say when we create an image without additional parameters provided we would want it to be set to a certain color, the "default color". While there are many ways about it, we could set a `static const` member of the class `Image` along the lines of `kDefaultColor` and use it when filling our image:
<!--
`CPP_SETUP_START`
namespace ftxui {
struct Color {
  static Color RGB(int, int, int) { return Color{}; }
};
}

$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` image_default_color/main.cpp
`CPP_RUN_CMD` CWD:image_default_color c++ -std=c++17 -c main.cpp
-->
```cpp
#include <vector>

class Image {
 public:
  static inline const ftxui::Color kDefaultColor{ftxui::Color::RGB(10, 10, 10)};
  // Treat this as an idea, not the full implementation
  Image(int rows, int cols) : pixels_(rows * cols, kDefaultColor) {}
  // other important stuff lives here

 private:
  std::vector<ftxui::Color> pixels_{};
};
```

Pretty straightforward, isn't it? This is not that much different from having such a constant at the namespace scope, but as it is only used within the `Image` class it kinda makes sense to have it stored there.

Now, to `static` class non-const data. This is one of those rare cases when it's ok to use non-const data outside of a tight local scope. We can have `static` non-const class data that we use to compute anything that must have visibility or that must be used by all instances of this class. This can be a pool of memory or of some stuff, modified and reused by the objects of our class or some form of bookkeeping that involves all objects of the class.

Just as an illustration, let's see how such data can be used within our `Image` class as an example. Let's say, we wanted to know how many `Image` instances are present at any time in our program. We would then extend our class with a `static` counter:
<!--
`CPP_SETUP_START`
$PLACEHOLDER

int main() {
  Image::instance_counter;
}
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` instance_counter_simple/main.cpp
`CPP_RUN_CMD` CWD:instance_counter_simple c++ -std=c++17 -c main.cpp
-->
```cpp
class Image {
 public:
  static inline int instance_counter{};
  // Rest of the methods and data
};
```

Having this `static` data is cool and all but it does not count the number of objects we have. The way to achieve what we want is, of course, to tap into the way our images get constructed, destructed, copied and moved. In a simplified way, we would increment our `instance_counter` in any constructor apart from the move one and decrement in the destructor:
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` instance_counter/image.hpp
-->
```cpp
class Image {
 public:
  static inline int instance_counter{};

  Image() { instance_counter++; }
  Image(const Image&) { instance_counter++; }
  Image(Image&&) = default;
  Image& operator=(const Image&) = default;
  Image& operator=(Image&&) = default;
  ~Image() { instance_counter--; }
};
```
Note, how we have to implement all of the special functions following the rule of "all or nothing" - we had to touch the copy constructor and the destructor, which means that we have to implement the rest of the copy and move constructors and operators. If you are confused about why, we had [a lecture about this before](all_or_nothing.md).
<!-- Which you can watch by clicking over here -->

Now, we can create an image, copy it within some scope, printing the number of instances of `Image` class along the way in various locations:
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` instance_counter/main.cpp
`CPP_RUN_CMD` CWD:instance_counter c++ -std=c++17 -c main.cpp
-->
```cpp
#include "image.hpp"

#include <iostream>

int main() {
  std::cout << "Current count: " << Image::instance_counter << std::endl;
  Image image;
  std::cout << "Current count: " << Image::instance_counter << std::endl;
  {
    Image image_copy{image};
    std::cout << "Current count: " << Image::instance_counter << std::endl;
  }
  std::cout << "Current count: " << Image::instance_counter << std::endl;
  return 0;
}
```
Note how we also use the double-colon symbol just like we did with functions to refer to our class `static` data.

With any luck we should get the following output:
```
Current count: 0
Current count: 1
Current count: 2
Current count: 1
```

I would say that this pattern is not used very often but when it is, it is doing important work. We will talk about smart pointers a bit later and the `std::shared_ptr` that allows sharing the ownership over some data is implemented following conceptually the exact same ideas. You will also meet these ideas beyond standard C++ library. If you venture into robotics or computer vision it is only a matter of time till you find yourself using OpenCV. One of the main classes from OpenCV is their matrix class `cv::Mat` and, you guessed it, it also uses this pattern, being a bit similar to the `std::shared_ptr` I just mentioned in how it manages the data stored in it.

Anyway, hope this example gives you an idea of how such `static` class data can be used. Please do not hesitate to experiment yourself, as you can see, you can find out a lot already using very simple examples.

## Conclusion
Overall, as opposed to using `static` outside of classes, using `static` _inside_ of classes allows to achieve certain things that are impossible to achieve in any other way. So use it when needed without hesitation. If you need a single guideline to remember in order to understand in which situation `static` might be useful for you, remember that it associates data and methods to the class itself, not to any of its instances. So, use `static` class data and functions when they need to work with **all** objects of your class rather than any single one. That being said, the line between `static` class data and methods and the free-standing data and functions is quite thin with the differences that mostly come down to encapsulation in most cases. Meaning that if your function or data is always going to be related to a single class - put it within that class.

<!-- Anyway, that's about everything I wanted to say about using `static` in classes. These videos take a lot of my time and if you would like to support this work, please subscribe and comment below this video, I'd love to hear from you!

Now, if you want to watch when **not** to use static outside of classes watch this video, and if you would like to refresh your knowledge on the rule of all or nothing, then click over here instead.

Thanks again for watching! See you in the next one, bye!
-->
