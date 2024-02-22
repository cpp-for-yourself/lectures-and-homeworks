<!-- Talk about static_assert -->

How to use templates in C++
--

<p align="center">
  <a href="https://youtu.be/blah"><img src="https://img.youtube.com/vi/blah/maxresdefault.jpg" alt="Video" align="right" width=50% style="margin: 0.5rem"></a>
</p>

- [How to use templates in C++](#how-to-use-templates-in-c)
- [Function templates and their template parameters](#function-templates-and-their-template-parameters)
  - [Template parameters that represent types](#template-parameters-that-represent-types)
  - [Parameters representing non-type values](#parameters-representing-non-type-values)
  - [Same situation with class methods](#same-situation-with-class-methods)
- [Passing the template parameters](#passing-the-template-parameters)
  - [Template parameters appear as function argument types](#template-parameters-appear-as-function-argument-types)
  - [Template parameters DO NOT appear as function argument types](#template-parameters-do-not-appear-as-function-argument-types)
  - [Mixing both cases](#mixing-both-cases)
- [Full function template specialization and why function overloading is better](#full-function-template-specialization-and-why-function-overloading-is-better)
  - [Creating instances of templated classes and structs](#creating-instances-of-templated-classes-and-structs)
  - [Template specialization](#template-specialization)
    - [Full template specialization](#full-template-specialization)
    - [Partial template specialization](#partial-template-specialization)
  - [Templates with header files and explicit template instantiation](#templates-with-header-files-and-explicit-template-instantiation)


This video is the third video about templates. In the first video we talked about **why** we might want to use templates. Second video focused on **what** happens under the hood when we use them and today we can finally talk about **how** to use them.

While there is a lot of intricacies related to templates that often turn the C++ beginners away, I'm going to try to present all (well, ok, most) of the relevant information here, in one lecture. My ambition is to make this your one-stop shop for all the basics you need to know about using templates for any kind of generic programming. That being said, I strongly urge you to go and look at the [**why**](templates_why.md) and the [**what**](templates_what.md) lectures before if you haven't already. I believe it will make this lecture much easier to digest.

After you're done with those, you should be ready to hear about all the stuff we will cover today, namely:
- Function templates and their template parameters
- How to pass template parameters
- Full function template specialization and why function overloading is better
- Separating definition from declaration of function and class templates
- Typical error messages when using templates and how to read them

- Class templates and their template parameters
- Partial template specialization
- Combining class and function templates
- Template type aliases

- Using template functions on template arguments

## Function templates and their template parameters
Whenever we want to declare a function template, we prefix its declaration with the keyword `template` followed by a list of [**template parameters**](https://en.cppreference.com/w/cpp/language/template_parameters). Let's see an [example](https://godbolt.org/z/fof843d4j):

```cpp
#include <iostream>
#include <typeinfo>

template <typename T>
void Foo() {
    std::cout << "Got one template parameter: " << typeid(T).name()
              << std::endl;
}

template <int kNumber>
void Foo() {
    std::cout << "Got one template parameter: " << typeid(kNumber).name()
              << " with value " << kNumber << std::endl;
}

template <typename T>
void Foo(const T& p) {
    std::cout << "Got one parameter: " << typeid(p).name() << " with value "
              << p << std::endl;
}

template <typename T1, class T2>
void Foo(const T1& p1, T2 p2) {
    std::cout << "Got two parameters: " << typeid(p1).name() << " with value "
              << p1 << ", " << typeid(p2).name() << " with value " << p2
              << std::endl;
}

int main() {
    Foo<int>();
    Foo<42>();
    Foo(42.42);
    Foo(42, 42.42);
    Foo(42.42, 42.42F);
    return 0;
}
```
Running this example gives us the following output:
```
Got one template parameter: i
Got one template parameter: i with value 42
Got one parameter: d with value 42.42
Got two parameters: i with value 42, d with value 42.42
Got two parameters: d with value 42.42, f with value 42.42
```

The template parameters can be of various kinds. In this example, they either represent **types**, like the `typename T`, and are prefixed by the `typename` or `class` keyword, or **non-types**, like the `int kNumber`. There are more options of what can be passed as template parameters but let us start with just these.

### Template parameters that represent types
First on our list are parameters representing types, shown as `typename T`, `typename T1`, `class T2` in our example above:
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` foo_declarations/main.cpp
`CPP_RUN_CMD` CWD:foo_declarations c++ -std=c++17 -c main.cpp
-->
```cpp
template <typename T>
void Foo();

template <typename T>
void Foo(const T& p);

template <typename T1, class T2>
void Foo(const T1& p1, T2 p2);
```
Such template parameters can be specified using either the keyword `typename` or the keyword `class` and in most cases these. I prefer the `typename` because it indicates that it can stand for any **type**, while `class` seems to suggest that it must be, well, a `class`, or a user-defined type. But there are people with very strong opinion on the matter in either way out there :wink: <!-- Please tell me which one you prefer :wink: -->

Anyway, regardless what keyword we use our template parameters `T`, `T1`, and `T2`, when their corresponding function is called, take up a certain type. There are two cases how the compiler knows which type to set to our template parameter.

We can provide this type explicitly:
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` foo_explicit/main.cpp
`CPP_RUN_CMD` CWD:foo_explicit c++ -std=c++17 -c main.cpp
-->
```cpp
template <typename T>
void Foo();

int main() {
  // We explicitly set type T to be int.
  Foo<int>();
  return 0;
}
```
Or the compiler can figure it out from the function arguments:
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` foo_implicit/main.cpp
`CPP_RUN_CMD` CWD:foo_implicit c++ -std=c++17 -c main.cpp
-->
```cpp
template <typename T>
void Foo(const T& p);

int main() {
  // Compiler figures out that T is double from argument 42.42.
  Foo(42.42);
  return 0;
}
```

Also, as you might have noticed, we can work with these types just like with any other built-in or user-defined types we've seen before. Which means that we can pass the arguments of these types by copy or by reference or in any other way we've seen before:
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` foo_two_types/main.cpp
`CPP_RUN_CMD` CWD:foo_two_types c++ -std=c++17 -c main.cpp
-->
```cpp
template <typename T1, class T2>
void Foo(const T1& p1, T2 p2);
```

<!-- TODO: talk about which types the compiler actually figures out here -->

### Parameters representing non-type values
Another type of template parameters we can provide represents non-type values, like `int kNumber` in our example above.
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` explicit_number/number.hpp
-->
```cpp
template <int kNumber>
void Foo();
```
In C++17 these parameters must be of integer and enum types but as of C++20 can also be floating point type and more. Oh, and such values actually enable what is called **template meta-programming** as they can be computed as a compile-time expression, see [`std::is_integral`](https://en.cppreference.com/w/cpp/types/is_integral) for an example, but more on that later.

There is no way for a compiler to figure out which numbers we mean without us explicitly passing a number to our function, so that's what we see in the example:
<!--
`CPP_SETUP_START`
#include "number.hpp"
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` explicit_number/main.cpp
`CPP_RUN_CMD` CWD:explicit_number c++ -std=c++17 -c main.cpp
-->
```cpp
int main() {
  Foo<42>();
  return 0;
}
```

### Same situation with class methods
All of the stuff that we just discussed works in _exactly_ the same way for class methods. They can be templated just like any other function and there is really no difference on that front.
```cpp
// Using struct here, but could be a class.
// Also showing declarations only, no definitions.
struct Foo {
  template <typename T>
  static StaticFunc();

  // We can use any modifier we would normally use.
  template <typename T>
  void Func() const;

  template <typename T>
  void FuncWithParameter(const T& param);
};

int main() {
  Foo::StaticFunc<int>();       // T = int
  Foo foo{};
  foo.Func<float>();            // T = float
  foo.FuncWithParameter(42.42); // T = double
  foo.FuncWithParameter(42);    // T = int
  return 0;
}
```
Note here that we only talk about class method templates here, not the class templates. That we will talk about soon enough too.

## Passing the template parameters
Actually, we should talk some more about calling our function templates and how we can and should specify template arguments when doing so. The good news is that the basics are very simple. Largely speaking we probably should:
- Let the compiler figure out the template parameters it can figure out
- Specify the rest of the template parameters explicitly

The bad news is that the order in which we introduce our template parameters and the function arguments matters and it is one of the things that has historically been quite confusing to the beginners.

### Template parameters appear as function argument types
But let's not get ahead of ourselves and start small. Remember our `Maximum` function?
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
Here, we call it just like a normal function. There is no way to tell it is a template function at the call site. The reason for this is that we have a single template parameter `NumberType` that specifies the type of the input arguments, both of which have this `NumberType` type. This makes it easy for the compiler to figure out which template function instantiation to use without us giving it any hints. So when it sees two integers it knows to instantiate the function:
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

### Template parameters DO NOT appear as function argument types
So far so good. Now, if we have a template parameter that does not appear in the arguments of the function, we will have to tell the compiler which type we want to see there. As an example, let's consider a function that simply returns a default value.
```cpp
template<class T>
T GetDefaultValue() {
  return T{};
}

int main() {
  int default_int = GetDefaultValue<int>();
  double default_double = GetDefaultValue<double>();
  return 0;
}
```
Here, the compiler cannot guess the needed type on its own (remember that the return type is not part of the function signature, so cannot be used to guess the template parameter). So we provide help by calling a function with the explicit type we want `GetDefaultValue<int>`.

### Mixing both cases
This all gets slightly more complex when we mix both cases - when we have some template parameters that the compiler is able to guess from arguments and some that it cannot. The complications arise because the compiler's ability to guess the types depends partially on the order of function arguments as well as on the order of the template parameters.

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

<!-- TODO: don't like this phrase -->
Generally speaking, template type deduction is a [very complex topic](https://en.cppreference.com/w/cpp/language/template_argument_deduction) with many details to consider, so you probably won't ever know all of these rules, but as long as you try to write simple code you should get by with what we've just discussed.

## Full function template specialization and why function overloading is better
There is one very important thing that we can do with any template - we can specialize it for certain types. There are two kinds of specialization: **full** and **partial**. In today's lecture we will look at both in-depth but we will start with the full specialization now.

> 🚨 Functions only allow for full specialization and even that is probably [not what we want to actually do](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#t144-dont-specialize-function-templates).

Let's unpack this statement. First of all, let's try to understand what does full template specialization mean.

If we have a function template `Foo` with, say a template parameter `typename T`, we can **specialize** this function for a certain type, say `T=float` to have a separate implementation. The syntax for this is to repeat the function definition, changing the prefix to `template <>` and then using the concrete types in the rest of the function.
```cpp
// Showing declarations only, no implementation.
template<typename T>
void Foo(T param);

// 😱 Probably not what we would want to do.
template<>
void Foo(double param);

int main() {
    Foo(42); // Calls generic Foo.
    Foo(42.42);  // Calls the specialization.
}
```
The compiler sees the calls to the `Foo` functions and prefers the specialization if it matches the types, like in the case when we pass a `double` number `42.42` into it.

While it seems to be working just fine, there is a subtle issue with this code. The issue is that functions have another powerful mechanism that we talked about: [**overloading**](functions.md#function-overloading---writing-functions-with-the-same-names). And template specializations **do not participate in overload resolution**. In human speak it means that if there is a function overload that fits better than a template specialization it is always going to be preferred like in [this example](https://godbolt.org/z/YTzrzM5s9):
```cpp
// Showing declarations only, no implementation.
template<typename T>
void Foo(T param);

// 😱 Probably not what we would want to do.
template<>
void Foo(double param);

// ✅ Function overload, probably what we actually want.
void Foo(double param);

int main() {
    Foo(42); // Calls generic Foo.
    Foo(42.42);  // Calls the double function overload.
}
```
So in most cases when we have a function template and we want a different behavior for certain argument types, we should prefer overloading our functions rather than specializing the template. Which is also what is suggested in the [C++ Core Guidelines](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#t144-dont-specialize-function-templates).

On some rare occasion it might be useful to specialize a function template that has no function arguments but we mostly want to specialize a class template instead, which we will discuss very soon.

Anyway, one example that comes to mind would be having a function that should get a certain `enum` value depending on the provided type:
```cpp
enum class Type {
  kNone, kFloat, kInt
};

template <typename T>
Type Convert() { return kNone; }

template <>
Type Convert<float>() { return kFloat; }

template <>
Type Convert<int>() { return kInt; }
```
But even here it is much more conceivable that we will actually get a value as a function argument which would bring us to the previous situation and to function overloading being a better solution.


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
