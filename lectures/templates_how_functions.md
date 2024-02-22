<!-- Talk about static_assert -->

How to write template functions in C++
--

<p align="center">
  <a href="https://youtu.be/blah"><img src="https://img.youtube.com/vi/blah/maxresdefault.jpg" alt="Video" align="right" width=50% style="margin: 0.5rem"></a>
</p>

By now we talked about **why** we might want to use templates, **what** happens under the hood when we use them and today we can finally start talking about **how** to use them.

While there is a lot of intricacies related to templates that often turn the C++ beginners away, I'm going to try to present all (well, ok, most) of the relevant information in the following couple of lectures. For this one in particular, my ambition is to make this your one-stop shop for all the basics you need to know about writing and using function templates for any kind of generic programming. That being said, I strongly urge you to go and look at the [**why**](templates_why.md) and the [**what**](templates_what.md) lectures before if you haven't already. I believe it will make this lecture much easier to digest.

After you're done with those, you should be ready to hear about all the stuff we will cover today, namely:
- [How to write template functions in C++](#how-to-write-template-functions-in-c)
- [Function templates and their template parameters](#function-templates-and-their-template-parameters)
  - [Template parameters that represent types](#template-parameters-that-represent-types)
  - [Parameters representing non-type values](#parameters-representing-non-type-values)
  - [Same situation with class methods](#same-situation-with-class-methods)
- [Passing the template parameters](#passing-the-template-parameters)
  - [Template parameters appear as function argument types](#template-parameters-appear-as-function-argument-types)
  - [Template parameters DO NOT appear as function argument types](#template-parameters-do-not-appear-as-function-argument-types)
  - [Mixing both cases](#mixing-both-cases)
- [Full function template specialization and why function overloading is better](#full-function-template-specialization-and-why-function-overloading-is-better)
- [Separating definition from declaration of function and class templates](#separating-definition-from-declaration-of-function-and-class-templates)
- [Typical error messages when using templates and how to read them](#typical-error-messages-when-using-templates-and-how-to-read-them)
    - [Full template specialization](#full-template-specialization)
    - [Partial template specialization](#partial-template-specialization)
  - [Templates with header files and explicit template instantiation](#templates-with-header-files-and-explicit-template-instantiation)


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
There is one very important thing that we can do with any template - we can specialize it for certain types. There are two kinds of specialization: **full** and **partial**. In today's lecture we will look at both in-depth but we will start with the [full specialization](https://en.cppreference.com/w/cpp/language/template_specialization) now.

> 🚨 Functions only allow for full specialization and even that is probably [not what we want to actually do](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#t144-dont-specialize-function-templates).

Let's unpack this statement. First of all, let's try to understand what does full template specialization mean and what we would potentially want to use it for.

Let us say that we have a function `Log` that just prints a value it gets to the terminal. Not the smartest function, but hopefully illustrative enough. This function would have a template parameter `typename T` to be able to print a parameter of any type ([code](https://godbolt.org/z/bnbsbqcTn)):
```cpp
#include <iostream>

template<typename T>
void Log(T parameter) { std::cout << parameter << std::endl; }

int main() {
    Log(42);      // Calls Log(int).
    Log(42.42);   // Calls Log(double).
    return 0;
}
```

So far so good. Now imagine that we have some custom type `CustomType` that we would also want to print. There are many ways to do that, one being to overload the operator `<<` for this type but for now we will focus on making sure a different `Log` function gets called if a `CustomType` argument is passed to it. One way to do that is to **specialize** this function for our `CustomType` to have a separate implementation. The syntax for this is to repeat the function definition, changing the prefix to `template <>` and then using the concrete types in the rest of the function.
```cpp
#include <iostream>

struct CustomType { int num; };

template <typename T>
void Log(T parameter) {
    std::cout << "Generic value: " << parameter << std::endl;
}

// 😱 Probably not what we would want to do.
template <>
void Log(CustomType parameter) {
    std::cout << "CustomType value: " << parameter.num << std::endl;
}

int main() {
    Log(42);              // Calls Log(int).
    Log(42.42);           // Calls Log(double).
    Log(CustomType{23});  // Calls Log(CustomType) specialization.
    return 0;
}
```

Here is what happens under the hood. The compiler sees the call to `Foo` function with `CustomType`, so it performs the function overload resolution and figures that our function template `Foo` with `T == CustomType` fits. The compiler then looks for a specialization that would match our types **exactly**. If it finds one, like in our case, it picks it, so the output of the code will be:
```
Generic value: 42
Generic value: 42.42
CustomType value: 23
```

While it seems to be working just fine, there is a subtle issue with this code. The issue happens if we look at our `Log` function specialization and think: "aha, we learned that we must use a `const` reference for complex types to avoid copying!". Now if we modify our `Log` function specialization to have a `const CustomType&` as its input:
```cpp
// 😱 Probably not what we would want to do.
template <>
void Log(const CustomType& parameter) {
    std::cout << "CustomType value: " << parameter.num << std::endl;
}
```
Suddenly the code stops compiling with a loong error:

<details>
<summary>Looong error message</summary>

```
<source>:7:36: error: invalid operands to binary expression ('basic_ostream<char, char_traits<char>>' and 'CustomType')
    7 |     std::cout << "Generic value: " << parameter << std::endl;
      |     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ^  ~~~~~~~~~
<source>:19:5: note: in instantiation of function template specialization 'Log<CustomType>' requested here
   19 |     Log(CustomType{23});  // Calls Log(CustomType) specialization.
      |     ^
/opt/compiler-explorer/gcc-13.2.0/lib/gcc/x86_64-linux-gnu/13.2.0/../../../../include/c++/13.2.0/cstddef:124:5: note: candidate function template not viable: no known conversion from 'basic_ostream<char, char_traits<char>>' to 'byte' for 1st argument
  124 |     operator<<(byte __b, _IntegerType __shift) noexcept
      |     ^          ~~~~~~~~
/opt/compiler-explorer/gcc-13.2.0/lib/gcc/x86_64-linux-gnu/13.2.0/../../../../include/c++/13.2.0/system_error:339:5: note: candidate function template not viable: no known conversion from 'CustomType' to 'const error_code' for 2nd argument
  339 |     operator<<(basic_ostream<_CharT, _Traits>& __os, const error_code& __e)
      |     ^                                                ~~~~~~~~~~~~~~~~~~~~~
/opt/compiler-explorer/gcc-13.2.0/lib/gcc/x86_64-linux-gnu/13.2.0/../../../../include/c++/13.2.0/ostream:564:5: note: candidate function template not viable: no known conversion from 'CustomType' to 'char' for 2nd argument
  564 |     operator<<(basic_ostream<_CharT, _Traits>& __out, char __c)
      |     ^                                                 ~~~~~~~~
/opt/compiler-explorer/gcc-13.2.0/lib/gcc/x86_64-linux-gnu/13.2.0/../../../../include/c++/13.2.0/ostream:570:5: note: candidate function template not viable: no known conversion from 'CustomType' to 'char' for 2nd argument
  570 |     operator<<(basic_ostream<char, _Traits>& __out, char __c)
      |     ^                                               ~~~~~~~~
/opt/compiler-explorer/gcc-13.2.0/lib/gcc/x86_64-linux-gnu/13.2.0/../../../../include/c++/13.2.0/ostream:581:5: note: candidate function template not viable: no known conversion from 'CustomType' to 'signed char' for 2nd argument
  581 |     operator<<(basic_ostream<char, _Traits>& __out, signed char __c)
      |     ^                                               ~~~~~~~~~~~~~~~
/opt/compiler-explorer/gcc-13.2.0/lib/gcc/x86_64-linux-gnu/13.2.0/../../../../include/c++/13.2.0/ostream:586:5: note: candidate function template not viable: no known conversion from 'CustomType' to 'unsigned char' for 2nd argument
  586 |     operator<<(basic_ostream<char, _Traits>& __out, unsigned char __c)
      |     ^                                               ~~~~~~~~~~~~~~~~~
/opt/compiler-explorer/gcc-13.2.0/lib/gcc/x86_64-linux-gnu/13.2.0/../../../../include/c++/13.2.0/ostream:662:5: note: candidate function template not viable: no known conversion from 'CustomType' to 'const char *' for 2nd argument
  662 |     operator<<(basic_ostream<char, _Traits>& __out, const char* __s)
      |     ^                                               ~~~~~~~~~~~~~~~
/opt/compiler-explorer/gcc-13.2.0/lib/gcc/x86_64-linux-gnu/13.2.0/../../../../include/c++/13.2.0/ostream:675:5: note: candidate function template not viable: no known conversion from 'CustomType' to 'const signed char *' for 2nd argument
  675 |     operator<<(basic_ostream<char, _Traits>& __out, const signed char* __s)
      |     ^                                               ~~~~~~~~~~~~~~~~~~~~~~
/opt/compiler-explorer/gcc-13.2.0/lib/gcc/x86_64-linux-gnu/13.2.0/../../../../include/c++/13.2.0/ostream:680:5: note: candidate function template not viable: no known conversion from 'CustomType' to 'const unsigned char *' for 2nd argument
  680 |     operator<<(basic_ostream<char, _Traits>& __out, const unsigned char* __s)
      |     ^                                               ~~~~~~~~~~~~~~~~~~~~~~~~
/opt/compiler-explorer/gcc-13.2.0/lib/gcc/x86_64-linux-gnu/13.2.0/../../../../include/c++/13.2.0/bits/ostream.tcc:307:5: note: candidate function template not viable: no known conversion from 'CustomType' to 'const char *' for 2nd argument
  307 |     operator<<(basic_ostream<_CharT, _Traits>& __out, const char* __s)
      |     ^                                                 ~~~~~~~~~~~~~~~
/opt/compiler-explorer/gcc-13.2.0/lib/gcc/x86_64-linux-gnu/13.2.0/../../../../include/c++/13.2.0/ostream:554:5: note: candidate template ignored: deduced conflicting types for parameter '_CharT' ('char' vs. 'CustomType')
  554 |     operator<<(basic_ostream<_CharT, _Traits>& __out, _CharT __c)
      |     ^
/opt/compiler-explorer/gcc-13.2.0/lib/gcc/x86_64-linux-gnu/13.2.0/../../../../include/c++/13.2.0/string_view:760:5: note: candidate template ignored: could not match 'basic_string_view<_CharT, _Traits>' against 'CustomType'
  760 |     operator<<(basic_ostream<_CharT, _Traits>& __os,
      |     ^
/opt/compiler-explorer/gcc-13.2.0/lib/gcc/x86_64-linux-gnu/13.2.0/../../../../include/c++/13.2.0/bits/basic_string.h:4020:5: note: candidate template ignored: could not match 'basic_string<_CharT, _Traits, _Alloc>' against 'CustomType'
 4020 |     operator<<(basic_ostream<_CharT, _Traits>& __os,
      |     ^
/opt/compiler-explorer/gcc-13.2.0/lib/gcc/x86_64-linux-gnu/13.2.0/../../../../include/c++/13.2.0/ostream:645:5: note: candidate template ignored: could not match 'const _CharT *' against 'CustomType'
  645 |     operator<<(basic_ostream<_CharT, _Traits>& __out, const _CharT* __s)
      |     ^
/opt/compiler-explorer/gcc-13.2.0/lib/gcc/x86_64-linux-gnu/13.2.0/../../../../include/c++/13.2.0/ostream:801:5: note: candidate template ignored: requirement '__and_<std::is_class<std::basic_ostream<char, std::char_traits<char>> &>, std::__not_<std::is_same<std::basic_ostream<char, std::char_traits<char>> &, std::ios_base>>, std::is_convertible<std::basic_ostream<char, std::char_traits<char>> *, std::ios_base *>>::value' was not satisfied [with _Ostream = basic_ostream<char, char_traits<char>> &, _Tp = CustomType]
  801 |     operator<<(_Ostream&& __os, const _Tp& __x)
      |     ^
/opt/compiler-explorer/gcc-13.2.0/lib/gcc/x86_64-linux-gnu/13.2.0/../../../../include/c++/13.2.0/ostream:110:7: note: candidate function not viable: no known conversion from 'CustomType' to '__ostream_type &(*)(__ostream_type &)' (aka 'basic_ostream<char, std::char_traits<char>> &(*)(basic_ostream<char, std::char_traits<char>> &)') for 1st argument
  110 |       operator<<(__ostream_type& (*__pf)(__ostream_type&))
      |       ^          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/opt/compiler-explorer/gcc-13.2.0/lib/gcc/x86_64-linux-gnu/13.2.0/../../../../include/c++/13.2.0/ostream:119:7: note: candidate function not viable: no known conversion from 'CustomType' to '__ios_type &(*)(__ios_type &)' (aka 'basic_ios<char, std::char_traits<char>> &(*)(basic_ios<char, std::char_traits<char>> &)') for 1st argument
  119 |       operator<<(__ios_type& (*__pf)(__ios_type&))
      |       ^          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/opt/compiler-explorer/gcc-13.2.0/lib/gcc/x86_64-linux-gnu/13.2.0/../../../../include/c++/13.2.0/ostream:129:7: note: candidate function not viable: no known conversion from 'CustomType' to 'ios_base &(*)(ios_base &)' for 1st argument
  129 |       operator<<(ios_base& (*__pf) (ios_base&))
      |       ^          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/opt/compiler-explorer/gcc-13.2.0/lib/gcc/x86_64-linux-gnu/13.2.0/../../../../include/c++/13.2.0/ostream:168:7: note: candidate function not viable: no known conversion from 'CustomType' to 'long' for 1st argument
  168 |       operator<<(long __n)
      |       ^          ~~~~~~~~
/opt/compiler-explorer/gcc-13.2.0/lib/gcc/x86_64-linux-gnu/13.2.0/../../../../include/c++/13.2.0/ostream:172:7: note: candidate function not viable: no known conversion from 'CustomType' to 'unsigned long' for 1st argument
  172 |       operator<<(unsigned long __n)
      |       ^          ~~~~~~~~~~~~~~~~~
/opt/compiler-explorer/gcc-13.2.0/lib/gcc/x86_64-linux-gnu/13.2.0/../../../../include/c++/13.2.0/ostream:176:7: note: candidate function not viable: no known conversion from 'CustomType' to 'bool' for 1st argument
  176 |       operator<<(bool __n)
      |       ^          ~~~~~~~~
/opt/compiler-explorer/gcc-13.2.0/lib/gcc/x86_64-linux-gnu/13.2.0/../../../../include/c++/13.2.0/ostream:180:7: note: candidate function not viable: no known conversion from 'CustomType' to 'short' for 1st argument
  180 |       operator<<(short __n);
      |       ^          ~~~~~~~~~
/opt/compiler-explorer/gcc-13.2.0/lib/gcc/x86_64-linux-gnu/13.2.0/../../../../include/c++/13.2.0/ostream:183:7: note: candidate function not viable: no known conversion from 'CustomType' to 'unsigned short' for 1st argument
  183 |       operator<<(unsigned short __n)
      |       ^          ~~~~~~~~~~~~~~~~~~
/opt/compiler-explorer/gcc-13.2.0/lib/gcc/x86_64-linux-gnu/13.2.0/../../../../include/c++/13.2.0/ostream:191:7: note: candidate function not viable: no known conversion from 'CustomType' to 'int' for 1st argument
  191 |       operator<<(int __n);
      |       ^          ~~~~~~~
/opt/compiler-explorer/gcc-13.2.0/lib/gcc/x86_64-linux-gnu/13.2.0/../../../../include/c++/13.2.0/ostream:194:7: note: candidate function not viable: no known conversion from 'CustomType' to 'unsigned int' for 1st argument
  194 |       operator<<(unsigned int __n)
      |       ^          ~~~~~~~~~~~~~~~~
/opt/compiler-explorer/gcc-13.2.0/lib/gcc/x86_64-linux-gnu/13.2.0/../../../../include/c++/13.2.0/ostream:203:7: note: candidate function not viable: no known conversion from 'CustomType' to 'long long' for 1st argument
  203 |       operator<<(long long __n)
      |       ^          ~~~~~~~~~~~~~
/opt/compiler-explorer/gcc-13.2.0/lib/gcc/x86_64-linux-gnu/13.2.0/../../../../include/c++/13.2.0/ostream:207:7: note: candidate function not viable: no known conversion from 'CustomType' to 'unsigned long long' for 1st argument
  207 |       operator<<(unsigned long long __n)
      |       ^          ~~~~~~~~~~~~~~~~~~~~~~
/opt/compiler-explorer/gcc-13.2.0/lib/gcc/x86_64-linux-gnu/13.2.0/../../../../include/c++/13.2.0/ostream:222:7: note: candidate function not viable: no known conversion from 'CustomType' to 'double' for 1st argument
  222 |       operator<<(double __f)
      |       ^          ~~~~~~~~~~
/opt/compiler-explorer/gcc-13.2.0/lib/gcc/x86_64-linux-gnu/13.2.0/../../../../include/c++/13.2.0/ostream:226:7: note: candidate function not viable: no known conversion from 'CustomType' to 'float' for 1st argument
  226 |       operator<<(float __f)
      |       ^          ~~~~~~~~~
/opt/compiler-explorer/gcc-13.2.0/lib/gcc/x86_64-linux-gnu/13.2.0/../../../../include/c++/13.2.0/ostream:234:7: note: candidate function not viable: no known conversion from 'CustomType' to 'long double' for 1st argument
  234 |       operator<<(long double __f)
      |       ^          ~~~~~~~~~~~~~~~
/opt/compiler-explorer/gcc-13.2.0/lib/gcc/x86_64-linux-gnu/13.2.0/../../../../include/c++/13.2.0/ostream:292:7: note: candidate function not viable: no known conversion from 'CustomType' to 'const void *' for 1st argument; take the address of the argument with &
  292 |       operator<<(const void* __p)
      |       ^          ~~~~~~~~~~~~~~~
/opt/compiler-explorer/gcc-13.2.0/lib/gcc/x86_64-linux-gnu/13.2.0/../../../../include/c++/13.2.0/ostream:297:7: note: candidate function not viable: no known conversion from 'CustomType' to 'nullptr_t' (aka 'std::nullptr_t') for 1st argument
  297 |       operator<<(nullptr_t)
      |       ^          ~~~~~~~~~
/opt/compiler-explorer/gcc-13.2.0/lib/gcc/x86_64-linux-gnu/13.2.0/../../../../include/c++/13.2.0/ostream:330:7: note: candidate function not viable: no known conversion from 'CustomType' to '__streambuf_type *' (aka 'basic_streambuf<char, std::char_traits<char>> *') for 1st argument
  330 |       operator<<(__streambuf_type* __sb);
      |       ^          ~~~~~~~~~~~~~~~~~~~~~~
1 error generated.
Compiler returned: 1
```

</details>

The main reason for this error is convoluted and I will only tell my understanding of what happens here so that we can all get the idea that it is _complicated_ to figure out. Before we all get too scared, there is a better way that avoids these issues.

Anyway, here is why the specialization is not chosen. When the compiler tries to figure out which function to call it performs a search for any template function that fits. Now when it does it, it strips the cv-qualifiers (like `const`) and references from the actual argument type. So, in our case, we pass a temporary object, which will have the type `CustomType&&`. The compiler will then look for a `Log` template that can accept the `CustomType` (note the absence of the `&&`). Which it will find and will pick the function `void Log<CustomType>` as a suitable fit for the task. It will then look for any potential specializations and will see our `template<> void Log(const CustomType&)` specialization. It might seem logical, that it would be happy to take it, but nope. It sees that if it instantiates a `Log(CustomType)` it will fit perfectly for what it looks for, while to fit our specialization it would need to add `const` and a reference to the argument it has. So that's approximately why the example above fails. Does your head hurt? Mine does!

Anyway, there is a much better option to deal with all of this. Following the suggestion in the [C++ Core Guidelines](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#t144-dont-specialize-function-templates) we should **NOT** specialize functions but [**overload**](functions.md#function-overloading---writing-functions-with-the-same-names) them instead. These overloads will participate directly in the overload resolution, so directly in the first step of the compiler searching for a suitable function. And should such an overload fit to the call it will be chosen rather than a template function ([code](https://godbolt.org/z/Tr7c6rv8q)):
```cpp
#include <iostream>

struct CustomType { int num; };

template <typename T>
void Log(T parameter) {
    std::cout << "Generic value: " << parameter << std::endl;
}

void Log(const CustomType& parameter) {
    std::cout << "CustomType value: " << parameter.num << std::endl;
}

int main() {
    Log(42);              // Calls Log(int).
    Log(42.42);           // Calls Log(double).
    Log(CustomType{23});  // Calls Log(CustomType) overload.
    return 0;
}
```
So in most cases when we have a function template and we want a different behavior for certain argument types, we should prefer overloading our functions rather than specializing the template.

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


## Separating definition from declaration of function and class templates

## Typical error messages when using templates and how to read them

#### Full template specialization


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
