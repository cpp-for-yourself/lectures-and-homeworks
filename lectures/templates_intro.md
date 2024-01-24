Introduction to templates
---

<p align="center">
  <a href="https://youtu.be/blah"><img src="https://img.youtube.com/vi/blah/maxresdefault.jpg" alt="Video" align="right" width=50% style="margin: 0.5rem"></a>
</p>

[Templates](https://en.cppreference.com/w/cpp/language/templates) are definitely one of the features that make C++ so popular and powerful. They provide an extremely versatile mechanism to write truly generic code and allow building meaningful abstractions only paying for these benefits with some compilation time (well, at least in theory)!
<!-- Link Chandler's talk -->

Speaking of compilation time, using templates rigorously in our code makes sure that we catch most of the logic errors at compile time, before our code gets shipped to any users! If you'd ask me, I'd say that compile-time errors are the best errors to be had.

However, with great power come long error messages, so historically, templates were met with fear and anxiety by the beginners in C++. Which is a pity because I believe that templates are **the** way to write modern C++ code. Oh, and speaking of modern C++, if your main flavor of C++ is C++20, then you'll probably use concepts as opposed to raw templates most of your time. We'll probably talk about this soon too.

But today I want to start with templates, what they are useful for, and how to avoid typical pitfalls when using them.

<!-- Intro -->

## Why we want to use templates
Ok, so, as always, let's start with **why**. To put it simply:
> 🚨 Templates are used to abstract algorithms (or logic) away from a concrete implementation, which improves code reusability and readability while having little to no runtime impact.

Such abstractions can take various forms of different complexity, varying on **what** we abstract away and **how** we create our abstractions. These range from abstracting away the type for some simple algorithms to a full fledged abstraction of a whole algorithm conditioned on some compile-time computed logic.

These statements might feel overly dry and somewhat confusing, so let's have a look at a couple examples.

### Generic functions
The first, somewhat classical use-case, allows us to abstract our function logic from the actual argument types. For example, think about a `Max` function that must compute a maximum of two numbers. These numbers can of course be of various types, like `int`, `float`, `double` or any other type for which `Max` makes sense. Naively, we would need to explicitly implement this function for any type we want to use:
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
Due to function overloading that we touched upon before, the compiler will be able to pick the correct function for each of our function calls. But think what will happen if we ever need to change the name of this function, say to `Maximum`. We would have to make sure that we change it everywhere and don't miss a single implementation. And while in this case it looks easy, believe me that this is one of the major sources of errors in the real-world big projects. I, for one, don't trust myself on this, so it would be cool to reduce such repetitions.

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
This is what makes this function **generic**, i.e., one that takes any type. The `typename NumberType` is a [template parameter](https://en.cppreference.com/w/cpp/language/template_parameters) that represents a type to be used in our function. We called this type `NumberType` but this name is just for our convenience, compiler does not care about it. It just knows that this is a definition of a function `Maximum` with two parameters of the same type `NumberType` which will be guessed by the compiler based on the types of the provided parameters. And as long as the code inside of this function compiles for any given type `NumberType` it will do what it is supposed to do. So now, when we call our `Maximum` function with parameters of `int`, `float`, or `double` it just magically works! Neat, right?

We will talk about all of the details a bit later. At this point, I want to make sure that we are on the same page about templates allowing us to write the code once that will work for many different types as long as they logically fit to what we want to do.

### Generic classes
The same story holds for generic classes too. As an example, think about the  `std::array` class that we touched upon before. By the way, this class is part of STL, which stands for **S**tandard **T**emplate **L**ibrary :wink:. We want to be able to store **any** type of data in an array and we don't want to have a separate implementation for all of those situations:
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
Note how we have two template parameters here instead of one. The first one is a type and the second one is a `std::size_t` number. There can be any number of such parameters, but more on that later in this lecture.

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
    template <typename SavingStrategy>
    void Save(const SavingStrategy& strategy) const {
      strategy.Save(pixels_);
    }
    // Skipping any other class details for the sake of example.

  private:
    std::vector<Color> pixels_{};
};
```
This way we could have two (or even more) different classes, say `JpegSavingStrategy` and `PngSavingStrategy` that would implement their own logic to save an array of pixels to disk and the reason we want this is that as long as they have their own `Save` method, we would not need to touch our `Image` class should we want to change how the images are stored to disk at some point in the future.
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
While not the most elegant implementation it still separates the concerns of these classes while maintaining code readability and having little to no runtime overhead. There are other ways to implement similar behaviors in C++ without using templates, by embracing Object Oriented Programming and we will talk about this extensively later, but there are other trade-offs to be made there and I believe that in modern C++ we embrace templates more and more.

Anyway, stay tuned for more about this and similar concepts.

### Compile-time meta programming
Finally, we can also do really advanced things, like compile-time meta-programming, but I won't talk about it at the moment because this is a bit of an esoteric and advanced knowledge. It probably warrants a separate lecture on its own some time in the future.

### All of the above provide zero-runtime-cost abstractions
Anyway, even without going into the details, I hope that it was easy to grasp why we would want to have a mechanism like this. I also hope, that looking at those functions and classes the syntax was more or less self explanatory. If you understand the above logic, then you understand why templates are so important.

## How templates actually work

## How to use templates
Now that we are on the same page as to **why** we might want to use templates, we have to talk about **how** we can use them. And there is a lot of intricacies here that often turn the C++ beginners away. But I'm going to try to present all the relevant information here, in one lecture within a meaningful structure.

### The basics of writing templated functions and classes
Whenever we want to create a templated class or function, we prefix the declaration (and definition) of such a class or a function with the keyword `template` followed by a list of [**template parameters**](https://en.cppreference.com/w/cpp/language/template_parameters).

These template parameters can be of various kinds:
1. Parameters representing types, just like in our `Maximum` function we had `typename NumberType`. These can be specified using either the keyword `typename` or the word `class` and generally there is no difference between the two ways but there are people with very strong opinion on the matter out there :wink: <!-- Please tell me which one you prefer :wink: -->
2. Parameters representing values, like `std::size_t kSize` in our `Array` class example. In most cases these parameters are of integer and enum types but as of C++20 can also be floating point type and more. Oh, and such values can be computed as a compile-time expression, see [`std::is_integral`](https://en.cppreference.com/w/cpp/types/is_integral) for an example.
3. Parameters representing a list of either of the above, the so-called **variadic templates**, more on these some other time.
4. Parameters representing types that have `template` parameters of their own, the so-called `template template` parameters, but these are not used that often in my experience so we will probably touch upon those some other time.

Today we focus on the first two - the template parameters representing types and ones representing simple numbers. Technically speaking there can be any number of any of these in any order. And, just like with function parameters, they can have a default value, although in most cases I would recommend not to use such default values.

<!--
`CPP_SETUP_START`
#include <string>
#include <vector>
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` templates_example/main.cpp
`CPP_RUN_CMD` CWD:templates_example c++ -std=c++17 main.cpp
-->
```cpp
// For illustration purposes only,
// Please use typename or class consistently
template<class T1, int N1, typename T2, typename T3, std::size_t N2>
void SomeFunc() {
  // Some function implementation.
}

template<class T1, typename T2, class T3>
struct SomeStruct {
  // Some struct implementation.
};

int main() {
  SomeFunc<int, 42, std::string, std::vector<int>, 23UL>();
  SomeStruct<int, double, std::string> instance;
  return 0;
}
```

### Calling templated functions
Being able to define templated functions is great, but we want to know how to use them too. And the good news is that the basics are very simple. Largely speaking we can and probably should:
- Let the compiler figure out the template parameters it can figure out
- Specify the rest of the template parameters explicitly

The bad news is that the order in which we introduce our template parameters and the function arguments matters. But let's not get ahead of ourselves and start small. Remember our `Maximum` function?
```cpp
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
Here, we call it just like a normal function. There is no way to tell it is a template function at the call site. The reason for this is that we have a single template parameter that specifies the type of the input arguments, both of which have this `NumberType` type. This makes it easy for the compiler to figure out which template function instantiation to use without us giving it any hints. So when it sees two integers it knows to instantiate the function:
<!--
`CPP_SETUP_START`
$PLACEHOLDER
int main() {
  Maximum(42, 23);
}
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` simple_max/main.cpp
`CPP_RUN_CMD` CWD:simple_max c++ -std=c++17 main.cpp
-->
```cpp
int Maximum(int first, int second) {
  if (first < second) { return second; }
  return first;
}
```
And uses that function.

So far so good. Now, if we have a template parameter that does not appear in the arguments of the function, we will have to tell the compiler which type we want to see there. As an example, let's consider a function that simply returns a default value.
```cpp
template<class T>
T GetDefaultValue() {
  return T{};
}

int main() {
  auto default_int = GetDefaultValue<int>();
  auto default_double = GetDefaultValue<double>();
  return 0;
}
```
Here, the compiler cannot guess the needed type on its own (remember that the return type is not part of the function signature, so cannot be used to guess the template parameter). So we provide help by calling a function with the explicit type we want `GetDefaultValue<int>`.

This all gets slightly more complex when we mix the two cases - when we have some template parameters that the compiler is able to guess and some that it cannot. The complications arise because the compiler's ability to guess the types depends partially on the order of function arguments as well as on the order of the template parameters.

Now, a way to think about it is that when you specify the template arguments explicitly, you are specifying them from left to right. Then, when the compiler doesn't see any more explicit template parameters, it looks at the function arguments and tries to figure out the rest. If it fails, you will notice when it spits out a loooong error message at you. We'll talk about how to read such messages towards the end of today's lecture.

Generally speaking, template type deduction is a [very complex topic](https://en.cppreference.com/w/cpp/language/template_argument_deduction) with many details to consider, so you probably won't ever know all of these rules, but as long as you try to write simple code you should get by with what we've just discussed.

### Full template specialization
### Partial template specialization

### Explicit template instantiation
