Intro
---

<p align="center">
  <a href="https://youtu.be/blah"><img src="https://img.youtube.com/vi/blah/maxresdefault.jpg" alt="Video" align="right" width=50% style="margin: 0.5rem"></a>
</p>

- [Intro](#intro)
- [Why we want to use templates](#why-we-want-to-use-templates)
  - [Generic functions](#generic-functions)
  - [Generic classes](#generic-classes)
  - [Generic algorithms and design patterns](#generic-algorithms-and-design-patterns)
  - [All of the above provide zero-runtime-cost abstractions](#all-of-the-above-provide-zero-runtime-cost-abstractions)
  - [Compile-time meta programming](#compile-time-meta-programming)
- [Summary](#summary)


[Templates](https://en.cppreference.com/w/cpp/language/templates) are definitely one of the features that make C++ so popular and powerful. They provide an extremely versatile mechanism to write truly generic code and allow building meaningful abstractions only paying for these benefits with some compilation time and little to no run time (well, [at least in theory](https://www.youtube.com/watch?v=rHIkrotSwcc))!

However, with great power come long error messages so historically, templates were met with fear and anxiety by the beginners in C++. Which is a pity because I believe that templates are **the** way to write modern C++ code, especially with concepts available in C++20 and beyond.

And while we will talk about concepts at some point, I would like to start with templates as an important building block in our C++ understanding. Because this is quite a big topic, I decided to split it into the **why**, **what** and **how** parts:
- In this lecture we talk about **why** we might want to use templates in the first place
- Next we'll talk about **what** happens under the hood when we use templates
- And finally we'll talk about all the details in a lecture about **how** these templates can be used.

<!-- Intro -->

## Why we want to use templates
Ok, so, to start I'll try to squeeze the answer to the question **why use templates** into an overly generic statement that should provide a very short overview:
> 🚨 Templates are used to abstract algorithms (or logic) away from a concrete implementation, which improves code reusability and readability. Templates allow to do all of this at compile time having little to no runtime impact[*](https://www.youtube.com/watch?v=rHIkrotSwcc).

Such abstractions can take various forms of different complexity, varying on **what** we abstract away and **how** we create our abstractions. These range from abstracting away the type for some simple algorithms or containers to a full fledged abstraction of a whole algorithm conditioned on some compile-time computed logic.

And you've already seen (and used) templates in this very course! Remember `std::array` and other STL containers? Or maybe a function like `std::max`? Well, they are all implemented as class and function templates which allows them to store and process any type you throw at them.

Anyway, one thing is to know that _somebody_ can write function and class templates and another thing is to know that we can do it ourselves, so let's have a look at a couple simple examples. Again, today, I just want to illustrate the purpose of templates, not talk about all the possible details. That lecture comes shortly after.

### Generic functions
The first, somewhat classical use-case, allows us to abstract our function logic away from the actual argument types. For example, think about a `Max` function that must compute a maximum of two numbers. These numbers can of course be of various types, like `int`, `float`, `double` or any other type for which `Max` makes sense. Naïvely, we would need to explicitly implement this function for any type we want to use with it:
```cpp
// Not a great idea to repeat the code so many times! 😱
// Imagine changing the implementation later!
int Max(int first, int second) {
  if (first < second) { return second; }
  return first;
}
float Max(float first, float second) {
  if (first < second) { return second; }
  return first;
}
double Max(double first, double second) {
  if (first < second) { return second; }
  return first;
}
// And so on for any other type we care about 😱

int main() {
  Max(42, 23);
  Max(3.14F, 42.42F);
  Max(3.14, 42.42);
}
```
<img src="images/templates_meme.jpg" alt="Meme about writing code" align="right" width=20% style="margin: 0.5rem">

<!-- Animate rename to Maximum one by one -->
Due to [function overloading](functions.md#function-overloading---writing-functions-with-the-same-names) that we touched upon before, the compiler will be able to pick the correct function for each of our function calls. But think what happens if we ever need to change the name of this function, say to `Maximum`. We would have to make sure that we change it everywhere and don't miss a single implementation. And while in this case it looks easy, believe me that these type of actions are one of the major sources of errors in the real-world big projects. I, for one, don't trust myself on this. Whenever there are manual actions to be taken, I can guarantee you that I will make a mistake, so it would be cool to reduce such manual repetitions and let something else do our work for us.

<!-- Animate by removing code from before -->
It turns out that this is one of those typical situations when templates come to the rescue! Look how neatly we can rewrite it all using the keyword `template`:
```cpp
// Works for any type as long as the implementation compiles ✅
template <typename NumberType>
NumberType Maximum(NumberType first, NumberType second) {
  if (first < second) { return second; }
  return first;
}

int main() {
  Maximum(42, 23);          // int
  Maximum(3.14F, 42.42F);   // float
  Maximum(3.14, 42.42);     // double
}
```
Let's unpack what we see. The body of the function looks just as before. The only difference is the part **before** the function:
<!--
`CPP_SKIP_SNIPPET`
-->
```cpp
template <typename NumberType>
```
This is what makes this a **function template**. The `typename NumberType` is a [template parameter](https://en.cppreference.com/w/cpp/language/template_parameters) that represents a type to be used in our function. We called this type `NumberType` but this name is just for our convenience, the compiler does not care about it. It just knows that this is a definition of a function template `Maximum` with two parameters of the same type `NumberType` which in this case is guessed by the compiler based on the types of the provided parameters. And as long as the code inside of this function compiles for any given type `NumberType` it will do what it is supposed to do. And by the way, because `NumberType` represents a type, we will name it as we name our types, using `PascalCase`. So now, when we call our `Maximum` function with parameters of `int`, `float`, or `double` it just magically works! Neat, right?

At this point, I just want to make sure that we are on the same page about templates allowing us to write the code once that will work for many different types as long as they logically fit to what we want to do. We will talk about all of the details later.

### Generic classes
The same story holds for generic classes too. As an example, think about the `std::array` class that we touched upon before. By the way, this class is part of STL, which stands for **S**tandard **T**emplate **L**ibrary :wink:. For such a class, we want to be able to store **any** type of data in it and we don't want to have a separate implementation for all of those situations:
<!--
`CPP_SETUP_START`
#include <cstddef>
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` array/main.cpp
`CPP_RUN_CMD` CWD:array c++ -std=c++17 main.cpp
-->
```cpp
template <typename UnderlyingType, std::size_t kSize>
struct Array {
  // Some implementation
};

int main() {
  Array<int, 20> int_array;
  Array<double, 20> double_array;
}
```
<!-- Talk about naming -->
Note how we have two template parameters here instead of one. The first one, `UnderlyingType` is a type and the second one, `kSize`, is a `std::size_t` number. There can be any number of such parameters, but more on that later. Oh, and we name the number-like template parameters just like constants: in `CamelCase` with the prefix `k`, following the [Google C++ Style Guide](https://google.github.io/styleguide/cppguide.html#General_Naming_Rules).

### Generic algorithms and design patterns
Anyway, apart from these "simple" abstractions, templates can be used for so much more, like implementing abstract design ideas in a composable and separable fashion. Just to give you one concrete example, we could think about an `Image` class, just like the one that we implemented in this course before, and implement a method `Save` for this class that takes in the `SavingStrategy` instance which will take care of the actual saving logic, separating the concerns of our classes better:
<!--
`CPP_SETUP_START`
#include <vector>
using Color = int;
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` image/image.hpp
-->
```cpp
class Image {
  public:
    // Note how a member function can also be a template function
    template <typename SavingStrategy>
    void Save(const SavingStrategy& strategy) const {
      strategy.Save(pixels_);
    }
    // Skipping any other class details for the sake of example.

  private:
    std::vector<Color> pixels_{};
};
```
This way we could have two (or more) different classes, say `JpegSavingStrategy` and `PngSavingStrategy` that would implement their own logic to save an array of pixels to disk and the reason we want this is that as long as they have their own `Save` method, the `Image` class would need to have no knowledge about how such saving actually is done. Which means that we would not need to touch our `Image` class should we want to change how the images are stored to disk at some point in the future.

For completeness, let's have a look an example implementation of one of these strategies and see how it ties into our new `Image` class. I will omit the actual saving to disk as this is not important to understand the topic that we have at hand right now.
<!--
`CPP_SETUP_START`
#include "image.hpp"
#include <filesystem>
#include <vector>
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` image/main.cpp
`CPP_RUN_CMD` CWD:image c++ -std=c++17 main.cpp
-->
```cpp
class JpegSavingStrategy {
  public:
    JpegSavingStrategy(const std::filesystem::path& path) : path_{path} {}

    void Save(const std::vector<Color>& pixels) const {
      // Logic to save pixels to path_ as jpeg data.
    }

  private:
    std::filesystem::path path_{};
};

int main() {
  Image image{}; // Somehow create an image.
  image.Save(JpegSavingStrategy{"image.jpg"});
  return 0;
}
```
While maybe not the most elegant implementation it still separates the concerns of these classes while maintaining code readability and having little to no runtime overhead. Here, we pass a `JpegSavingStrategy` object into our `Image` class, so the image does not need to know anything about such a strategy apart from the fact that it needs to have a method `Save`. As always with C++, there are many other ways to implement similar behaviors in C++ with or without templates. One example of introducing similar abstractions without using patterns is by embracing **O**bject **O**riented **P**rogramming (OOP) and we will talk about this extensively later, but there are other trade-offs to be made there and I believe that in modern C++ we embrace templates more and more over time, especially when we move towards using concepts in C++20.


### All of the above provide zero-runtime-cost abstractions
There is one huge benefit for designing these abstractions using template-like mechanism - runtime. All of the work that templates do happens at compile time. So, if we **can** fix our abstract code design at compile time, by using templates it is very likely that we reduce the runtime of our code in comparison to other design paradigms. Or at least we don't introduce a huge runtime overhead.

Speaking of stuff that happens at compilation time, using templates rigorously makes sure that we catch most of our design and logic bugs also at compile time, even before our code gets to run, let alone shipped to any users! If you ask me, I'd say that compile-time errors are the best errors to be had.

In the next lecture we're going to see why templates work at compile time and dig into what it is that enables this near-zero runtime-overhead by looking at what happens under the hood when we use templates.

One final thing to mention is that it's not all perfect as we do pay for all of the above benefits with some design rigidity and with the compilation times which might become problematic for bigger projects. There are ways to mitigate this to a degree that we will discuss in one of the follow-up lectures too.

### Compile-time meta programming
Finally, digging even deeper into the compile-time design that templates enable, we can also do really advanced things, like compile-time meta-programming, but I won't talk about it much at the moment because this is a bit of an advanced and maybe even somewhat esoteric knowledge.

But, just to not leave you hanging, it allows us to create complex logic that happens **during compilation**, allowing to further reduce the runtime of our programs. Think about computing lots of values and storing them into a table that is then available at runtime and similar examples.

There are many dedicated keywords in this topic like SFINAE (a C++ paradigm that allows conditional compilation), type traits (that allow to tell certain things about types, like `std::is_integral` etc.) and many more but these do add complexity to our code and the resulting code is generally less readable, so I'll leave it for some future time as it probably warrants a separate lecture in the future and I will have to think about good examples really hard. That being said, I believe that these advanced features have paved a way to the C++20 concepts which are much more pleasant to use and we will definitely talk about those too.

## Summary
Anyway, even without going into the details, I hope that it was easy to grasp why we would want to have a mechanism like this. I also hope, that looking at those functions and classes the syntax was more or less self explanatory. If you understand the gist of what we've just talked about, then you understand why templates are so important.

So stay tuned for what comes next, as we're about to also talk about **what** the templates do under the hood, which is very important to understand to avoid any confusion when using them as well as **how** we can use templates, including most of the details on their usage that we might need in our day to day C++ life.

<!-- Thanks for watching as always and see you in the next one! Bye! -->
