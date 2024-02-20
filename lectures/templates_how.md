How to use templates
--

<p align="center">
  <a href="https://youtu.be/blah"><img src="https://img.youtube.com/vi/blah/maxresdefault.jpg" alt="Video" align="right" width=50% style="margin: 0.5rem"></a>
</p>

- [What templates do under the hood](#what-templates-do-under-the-hood)
- [Compilation process recap](#compilation-process-recap)
- [Compiler uses templates to generate code](#compiler-uses-templates-to-generate-code)
- [Hands-on example](#hands-on-example)
- [Try it out!](#try-it-out)
- [Compiler is lazy](#compiler-is-lazy)
- [Summary](#summary)

Now that we are on the same page as to **why** we might want to use templates as well as **what** happens under the hood when we use them, we have to talk about **how** to use them. And there is a lot of intricacies here that often turn the C++ beginners away. But I'm going to try to present all (well, ok, most) of the relevant information here, in one lecture within a meaningful structure. My ambition is to make this your one-stop lecture for everything related to how you can use templates.

This involves talking about:
- Function and class template parameters and how to pass them
- Template type aliases
- Declaration and definition of templates
- Full and partial template specialization
- Typical error messages when using templates and how to read them
- Using template functions on template arguments

### The basics of writing templated functions and classes
Whenever we want to create a class or function template, we prefix their declaration (and definition) with the keyword `template` followed by a list of [**template parameters**](https://en.cppreference.com/w/cpp/language/template_parameters).

These template parameters can be of various kinds:
1. Parameters representing types, just like in our `Maximum` function we had `typename NumberType`. These can be specified using either the keyword `typename` or the word `class` and in most cases there is no difference between the two ways but there are people with very strong opinion on the matter out there :wink: <!-- Please tell me which one you prefer :wink: -->
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
// Please use either typename or class (just one) consistently
template<class T1, int kN1, typename T2, typename T3, std::size_t kN2>
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

One easy way to think about it is this:
> 🚨 When we specify the template arguments explicitly, we are specifying them **from left to right**. Then, when the compiler doesn't see any more explicit template parameters, it looks at the function arguments and tries to figure out the rest.
```cpp
template<class One, int kTwo, class Three, class Four, class Five>
void SomeFunc(Three three, Four four, Five five) {
  // Some implementation;
}

int main() {
  // The types guessed in this call:
  // One = float
  // kTwo = 42
  // Three = double
  // Four = int
  // Five = float
  SomeFunc<float, 42>(42.42, 23, 23.23F);
}
```
If the compiler fails to figure out the template parameters it will throw an error at us. Just for the sake of example, if we try to call our function without the last argument:
<!--
`CPP_SKIP_SNIPPET`
-->
```cpp
SomeFunc<float>(42.42, 23, 23.23F);
```
we will get an error message that says something about the compiler not being able to deduce the template parameters:
```css
<source>: In function 'int main()':
<source>:13:18: error: no matching function for call to 'SomeFunc<float>(double, int, float)'
   13 |   SomeFunc<float>(42.42, 23, 23.23F);
      |   ~~~~~~~~~~~~~~~^~~~~~~~~~~~~~~~~~~
<source>:2:6: note: candidate: 'template<class One, int kTwo, class Three, class Four, class Five> void SomeFunc(Three, Four, Five)'
    2 | void SomeFunc(Three three, Four four, Five five) {
      |      ^~~~~~~~
<source>:2:6: note:   template argument deduction/substitution failed:
<source>:13:18: note:   couldn't deduce template parameter 'kTwo'
   13 |   SomeFunc<float>(42.42, 23, 23.23F);
      |   ~~~~~~~~~~~~~~~^~~~~~~~~~~~~~~~~~~
Compiler returned: 1
```

Feel free to experiment with various error messages here to get a feeling for them but we'll also talk about how to read such messages towards the end of today's lecture.

Generally speaking, template type deduction is a [very complex topic](https://en.cppreference.com/w/cpp/language/template_argument_deduction) with many details to consider, so you probably won't ever know all of these rules, but as long as you try to write simple code you should get by with what we've just discussed.

### Creating instances of templated classes and structs
When we instantiate our templated classes and structs the situation is very similar to how we call functions. That is if we use C++17 and later because C++17 introduced the [**C**lass **T**emplate **A**rgument **D**eduction (CTAD)](https://en.cppreference.com/w/cpp/language/class_template_argument_deduction). Before that version you would have to specify all the types manually. Let's see how it works on a simple example.
```cpp
template<class FirstType, class SecondType>
struct MyStruct {
  // We _need_ a constructor for CTAD to work
  // Arguments can appear in any order as long as all
  // template arguments are covered by constructor arguments
  MyStruct(SecondType one, FirstType two, SecondType three) {}
};

int main() {
  // Types are deduced (needs C++17 and up):
  //   FirstType = int
  //   SecondType = double
  MyStruct guessed{42.42, 23, 23.23};

  // Types are provided explicitly.
  // Must use before C++17.
  MyStruct<int, double> provided{42.42, 23, 23.23};
  return 0;
}
```
Note that we **must** have a constructor for this to work and this constructor's arguments **must** cover all of the template arguments. That being said, the arguments in the constructor can appear in any order and the compiler will figure it out.

I use it all the time, but this is a bit of a controversial topic. If you look into the Google Code Style for C++ at least as of the date of recording this video, they [suggest to steer away from using CTAD](https://google.github.io/styleguide/cppguide.html#CTAD) because it might fail to deduce the type you expect it to. We _can_ provide explicit type deduction guides (more on it [here](https://en.cppreference.com/w/cpp/language/class_template_argument_deduction) under "User-defined deduction guides
") but we won't cover it here. I believe that once you really need to use it, you'll know enough about C++ to read about it on your own.

### Template specialization
Now, returning back to less esoteric topic, let's talk about template specialization. This is a feature of templates that is used a lot and it allows to, well, **specialize** a template to do something different for a specific set of types or conditions.

This is a very important technique, used all over STL and in many other places. It is also a cornerstone of template meta-programming so it is important to learn well.

Thankfully, this topic is not that complicated at all! Largely speaking, template specialization can be of two kinds:
- Full template specialization and
- Partial template specialization

#### Full template specialization
When talking about full template specialization, we are talking about specializing all of the template arguments. We can fully specialize pretty much everything, be it a class, a function, a member function, or data. But this probably feels slightly too abstract, so let's dive into another example.

Let's assume that we have a logging function `Log` that we use to log any value to the terminal.
<!--
`CPP_SETUP_START`
#pragma once
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` full_specialization/log_template.hpp
-->
```cpp
#include <iostream>

template <typename ValueType>
void Log(const ValueType& value) {
    std::cout << "Value: " << value << std::endl;
}
```
<!--
`CPP_SETUP_START`
#include "log_template.hpp"
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` full_specialization/simple_main.cpp
`CPP_RUN_CMD` CWD:full_specialization c++ -std=c++17 simple_main.cpp
-->
```cpp
int main() {
    Log(42);
    Log(3.14);
    return 0;
}
```
This is not the smartest function in the world, but it does its job well. At least for simple types that it. Now, if we have some type `ComplexType` that hides its value under the `value` field, our function won't work as the `<<` operator doesn't know how to deal with this. Now, there are many ways to deal with this but we want to illustrate how full specialization works, so we can specialize our function for this.

To do this, we will have to write an **specialization** for our template function. Such a specialization looks exactly as a normal templated function with just one crucial difference, we prefix it with `template<>` keyword with the empty brackets. Otherwise, we write some code into this function (which can be totally different from the general template `Log` function) and we're good to go:
<!--
`CPP_SETUP_START`
#pragma once
#include "log_template.hpp"
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` full_specialization/log_complex.hpp
-->
```cpp
#include <iostream>

struct ComplexType{
    int value{};
};

template <>
void Log(const ComplexType& value) {
    std::cout << "Complex value: " << value.value << std::endl;
}
```
<!--
`CPP_SETUP_START`
#include "log_complex.hpp"
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` full_specialization/complex_main.cpp
`CPP_RUN_CMD` CWD:full_specialization c++ -std=c++17 complex_main.cpp
-->
```cpp
int main() {
    Log(42);
    Log(3.14);
    Log(ComplexType{42});
    return 0;
}
```
What this tells to the compiler is that whenever it encounters a call to `Log` with the argument of the `const ComplexType&` type it should call our specialization instead of the general template function `Log`. And if we run this code we see that it does.

Doesn't look too complicated does it? And the basics are really as simple as this. But as always in C++, things can get a lot more advanced and complex.

For example, a specialization can be a template itself. Think of what we would need to do if we wanted to call our `Log` function on a `std::vector` of values. We could use full specialization just like before but then we would need to provide an explicit type, which is not very generic:
<!--
`CPP_SETUP_START`
#pragma once
#include "log_complex.hpp"
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` full_specialization/log_vector.hpp
-->
```cpp
#include <vector>

// 😱 Not a great idea, what if a vector has other type?
template <>
void Log(const std::vector<int>& vector) {
    std::cout << "Vector of values: [ ";
    for (const auto& v : vector) {
        std::cout << v << ' ';
    }
    std::cout << ']';
}
```
<!--
`CPP_SETUP_START`
#include "log_vector.hpp"
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` full_specialization/vector_main.cpp
`CPP_RUN_CMD` CWD:full_specialization c++ -std=c++17 vector_main.cpp
-->
```cpp
int main() {
    Log(42);
    Log(3.14);
    Log(ComplexType{42});
    // Note how vector uses CTAD here 😉
    Log(std::vector{1, 2, 3});
    return 0;
}
```
But this is probably not the best idea - if our vector contains anything but `int` values we would need to write another specialization, and another, and another...

Well, there is a solution, where we actually add a _new_ template parameter to our specialization:
<!--
`CPP_SETUP_START`
#pragma once
#include "log_complex.hpp"
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` full_specialization/log_generic_vector.hpp
-->
```cpp
#include <vector>

template <typename ValueType>
void Log(const std::vector<ValueType>& vector) {
    std::cout << "Vector of values: [ ";
    for (const auto& v : vector) {
        std::cout << v << ' ';
    }
    std::cout << ']';
}
```
This function **is a specialization** of our general `Log` function template because it **does** contain a concrete type among its parameters - the `std::vector`. But it is _also_ a template function templated on the values inside our `std::vector`. How neat is that? We can now use this function for any vectors with any types inside of them!
<!--
`CPP_SETUP_START`
#include "log_generic_vector.hpp"
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` full_specialization/generic_vector_main.cpp
`CPP_RUN_CMD` CWD:full_specialization c++ -std=c++17 generic_vector_main.cpp
-->
```cpp
int main() {
    Log(42);
    Log(3.14);
    Log(ComplexType{42});
    Log(std::vector{1, 2, 3});
    Log(std::vector{1.1, 2.2, 3.3});
    return 0;
}
```

And you know what? Even though our `Log` function is a bit silly, it is very similar to the way the `<<` operator is implemented for the `std::ostream` which allows `std::cout` to take any simple value as an input. So, with that said, I would strongly recommend you to do this small homework.

<details>
<summary>Small homework</summary>

Given that the `std::ostream` `<<` operator is a function that already exists in the `<iostream>` header and looks something like this:
<!--
`CPP_SETUP_START`
#include <vector>
#include <iostream>

template<class T>
std::ostream& operator<<(std::ostream& os, const std::vector<T>& vector) {
    for (const auto& v : vector) {
        os << v << ' ';
    }
    return os;
}

`CPP_SETUP_END`
`CPP_COPY_SNIPPET` cout/cout.hpp
-->
```cpp
template<class T>
std::ostream& operator<<(std::ostream& os, const T& obj) {
    // Write obj to stream
    return os;
}
```
Implement a full specialization of this function to print a `std::vector` to the `std::ostream`.

> Hint: you can use the `os << value` operator for individual values in your `std::vector`.

In the end the following code (adding needed includes) should compile:
<!--
`CPP_SETUP_START`
#include "cout.hpp"

int main() {
  $PLACEHOLDER
}
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` cout/main.cpp
`CPP_RUN_CMD` CWD:cout c++ -std=c++17 main.cpp
-->
```cpp
std::cout << std::vector{1, 2, 3} << std::endl;
std::cout << std::vector{1.1, 2.2, 3.3} << std::endl;
```

If you have any questions just write them in the comments and I'll try to help out :wink:

</details>

#### Partial template specialization

### Templates with header files and explicit template instantiation
<!--
It is crucially important to understand that this all happens **at compile time** and the compiler will **always** have to compile **the whole function**, which is a cause for a typical error many beginners make illustrated by [this Stack Overflow question](https://stackoverflow.com/questions/50253286/using-stdis-same-why-my-function-still-cant-work-for-2-types) that, slightly adapted, looks like this:
```
#include <iostream>
#include <string>
#include <type_traits>
using std::string_literals::operator""s;

template <typename T>
void PrintLength(const T& argument) {
  if (std::is_same_v<T, std::string>) {
    std::cout << argument.size() << std::endl;
  } else {
    std::cout << 1 << std::endl;
  }
}

int main() {
  PrintLength("some_string"s);
  PrintLength(42);
}
```
We try to print length of various arguments and if we got `std::string` we want to print its `.size()` and print `"1"` for any other type. However, if we try to compile this, we'll get an error complaining about argument being a non-class type:
```css
<source>: In instantiation of 'void PrintLength(const T&) [with T = int]':
<source>:17:14:   required from here
<source>:9:27: error: request for member 'size' in 'argument', which is of non-class type 'const int'
    9 |     std::cout << argument.size() << std::endl;
      |                  ~~~~~~~~~^~~~
Compiler returned: 1
```
The reason for this is that the compiler does not care about the logic in our function, it still needs to compile the function as a whole even if you, as a programmer, know that you never call the code that won't work. Try removing the `PrintLength("some_string"s)` line to see this for yourself. So, when the compiler tries to compile the whole function it cannot compile it for `int`.

 -->
