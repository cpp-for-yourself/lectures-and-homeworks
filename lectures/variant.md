
`std::variant` in Modern C++
--

<p align="center">
  <a href="https://youtu.be/dummy_link"><img src="https://img.youtube.com/vi/dummy_link/maxresdefault.jpg" alt="Video Thumbnail" align="right" width=50% style="margin: 0.5rem"></a>
</p>

When people think about runtime polymorphism in C++ they usually think about `virtual` functions and pointer or reference semantics. But in modern C++ we seem to embrace *value* semantics more and more for its efficiency and clarity.

So a natural question comes up: what do we do if we want that runtime power without giving up value semantics?

And, as you might have already guessed, there’s a modern, elegant solution for exactly that, and its name is `std::variant`!

Oh, and as a bonus, remember `std::optional` and `std::expected` from the previous lecture? It turns out those can be implemented using `std::variant` too!

<!-- Intro -->

When we talked about *static* polymorphism we learnt how to use templates (and concepts) to be able to work with objects of different types that all conform to some common interface.

Think of various image classes that all have a `Save` method and a function `SaveImage` taking a template that we assume to have a `Save` method:

```cpp
#include <iostream>
#include <string>

struct PngImage {
  void Save(const std::string& file_name) const {
    std::cout << "Saving " << file_name << ".png\n";
  }
  // Some private image data would go here.
};

struct JpegImage {
  void Save(const std::string& file_name) const {
    std::cout << "Saving " << file_name << ".jpg\n";
  }
  // Some private image data would go here.
};

template <typename Image>
void SaveImage(const Image& image, const std::string& file_name) {
  image.Save(file_name);
}

int main() {
  SaveImage(PngImage{}, "output");
  SaveImage(JpegImage{}, "output");
}
```

But this pattern is not very useful if we want to decide which format an image has at runtime - all the code using all the right types needs to be visible to the compiler, well, at compile time!

Furthermore, it would be awesome to be able to store a bunch of different images into a vector, potentially populating this vector at runtime, and save them all using their common `Save` method. But our images have different types so we can't put them into a vector in a naïve way!

<!--
`CPP_SKIP_SNIPPET`
-->
```cpp
// ❌ Can't store objects of different types in a vector!
const std::vector<???> images{PngImage{}, JpegImage{}, ...};
```

Aha, I hear you say, we can create an interface class and store pointers to objects deriving from this interface in our vector, using the textbook *dynamic polymorphism* that we covered when we talked about inheritance!

Indeed, we can create a class, say `Saveable`, that has a single pure `virtual` function `Save`. We can then inherit from this class in our `PngImage` and `JpegImage` that override `Save` with their respective implementations:

<!--
`CPP_SETUP_START`

struct Noncopyable {
  Noncopyable() = default;
  Noncopyable(const Noncopyable&) = delete;
  Noncopyable(Noncopyable&&) = delete;
  Noncopyable& operator=(const Noncopyable&) = delete;
  Noncopyable& operator=(Noncopyable&&) = delete;
  ~Noncopyable() = default;
};

$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` variant_images/main.cpp
`CPP_RUN_CMD` CWD:variant_images c++ -std=c++17 main.cpp
-->
```cpp
#include <iostream>
#include <memory>
#include <string>
#include <vector>

// 💡 See lecture on inheritance for Noncopyable implementation.
struct Saveable {
  virtual void Save(const std::string& file_name) const = 0;
  virtual ~Saveable() = default;
};

struct PngImage : public Saveable {
  void Save(const std::string& file_name) const override {
    std::cout << "Saving " << file_name << ".png\n";
  }
  // Some private image data would go here.
};

struct JpegImage : public Saveable {
  void Save(const std::string& file_name) const override {
    std::cout << "Saving " << file_name << ".jpg\n";
  }
  // Some private image data would go here.
};

void SaveImage(const Saveable& image, const std::string& file_name) {
  image.Save(file_name);
}

int main() {
  // A bunch of image pointers that can be put here at runtime.
  std::vector<std::unique_ptr<Saveable>> images;
  images.push_back(std::make_unique<PngImage>());
  images.push_back(std::make_unique<JpegImage>());
  for (const auto& image : images) SaveImage(*image, "output");
}
```

This *does* allow us to store a bunch of image pointers in a vector and process all of them in a for loop without regard to their actual type! Is it polymorphism? Yes! Is it dynamic? Yes again!

But we *did* have to give up certain things. Now our image classes inherit from a common rigid interface class. This dependency will be hard to change down the line if it turns out to be a bad design decision. We are also forced to embrace reference and pointer semantics rather than value semantics, meaning that our classes are now designed to be accessed by a pointer to them and we cannot easily copy or move the actual objects around, thus the use of `Noncopyable` base class. For a refresher on this, please refer to our lecture about [inheritance](inheritance.md#delete-other-special-methods-for-polymorphic-classes).

Another potential issue with having to allocate *pointers* rather than concrete objects is that it usually means that we have to allocate them on the heap. Typically this is not a big issue but can become one if we need to allocate many objects in a performance-critical context as they can land in different areas of our memory and finding a good place for them in memory takes some time.
<!-- Watch a video on the heap for a more in-depth look into this topic. -->

This is where `std::variant` comes to the rescue. It allows us to keep using templates just like we originally wanted, but adds a twist. We can store a **variant** of our types in a vector and use `std::visit` to call our `SaveImage` on any type from the ones we allow in the variant:

```cpp
#include <iostream>
#include <string>
#include <variant>
#include <vector>

struct PngImage {
  void Save(const std::string& file_name) const {
    std::cout << "Saving " << file_name << ".png\n";
  }
  // Some private image data would go here.
};

struct JpegImage {
  void Save(const std::string& file_name) const {
    std::cout << "Saving " << file_name << ".jpg\n";
  }
  // Some private image data would go here.
};

using Image = std::variant<PngImage, JpegImage>;

void SaveImage(const Image& image, const std::string& file_name) {
  std::visit([&](const auto& img) { img.Save(file_name); }, image);
}

int main() {
  const std::vector<Image> images = {PngImage{}, JpegImage{}};
  for (const auto& image : images) SaveImage(image, "output");
}
```

Note, how we create the vector in exactly the way that we dreamed about before! We also call the same `SaveImage` function just like we did when using `virtual` functions and pointers!

However, it is hard not to notice that there is a bit more syntax present here. There is the `std::variant` as well as `std::visit` being used and we have not really looked into those before. So let's do so now.

## Basics of what `std::variant` is

The class `std::variant` is a so-called type-safe `union` type introduced in C++17. A variable of such a variant type holds one value out of a defined set of types.

For instance, if a variable's type is `std::variant<int, std::string>` it means that this variable can hold either an `int` or a `std::string` value. We can set our variable's value by simply assigning it a value of any of our selected types with a value of the *first* type being stored by default:

```cpp
#include <variant>
#include <iostream>

int main() {
  // There can be many more types in std::variant.
  std::variant<int, std::string> value{};
  // By default, variant stores a value of the first type.
  std::cout << "Integer: " << std::get<int>(value) << '\n';
  value = "Hello, variant!";  // Value now holds a string.
  std::cout << "String: " << std::get<std::string>(value) << '\n';
  value = 42;                // Value holds an int.
  std::cout << "Integer: " << std::get<int>(value) << '\n';
  return 0;
}
```

Do note though, that once we put one type into variant, `get`ting another type is undefined behavior, so don't do that.

<img src="images/variant_memory.png" alt="Variant memory" align="right" width=50% style="margin: 0.5rem">

The values of different types, when stored as a variant, occupy the same memory, which means that the amount of memory allocated for the whole variant needs to be enough to store the biggest type potentially stored in it (plus some memory to store an index of which value is stored, more on that later). In our previous example, even when we write an `int` into our variant object, the object still allocates enough memory needed for a `std::string`.

And just as I hinted at in the intro, this is also how `std::optional` and `std::expected` that we talked about in the previous lecture work too.

## How to use `std::variant` with `std::visit` in practice

But this tiny example might feel quite limited. Think about it, we somehow have to *know* which type our `std::variant` holds to use it. Which almost feels like it defeats the purpose. And, well, it does. If we need to know the type we want to use at compile time, we could as well just use that type and not bother with `std::variant` at all.

But we already saw that there is this function `std::visit` that we can use to magically access the stored type:

```cpp
#include <iostream>
#include <string>
#include <variant>

struct Printer {
  void operator()(int value) const {
    std::cout << "Integer: " << value << '\n';
  }
  void operator()(const std::string& value) const {
    std::cout << "String: " << value << '\n';
  }
};

int main() {
  const Printer printer{};
  std::variant<int, std::string> value{};
  std::visit(printer, value);
  value = "Hello, variant!";
  std::visit(printer, value);
  value = 42;
  std::visit(printer, value);
}
```

Here, `std::visit` applies a [function object](lambdas.md#before-lambdas-we-had-function-objects-or-functors) to the value contained in the variant. Should our variant hold a string - the operator that accepts a string is called, and should it hold an integer - the operator that accepts an integer is called instead.

And while we used an explicit function object here, we could as well use a lambda function of course:

```cpp
#include <iostream>
#include <string>
#include <variant>

int main() {
  const auto Print = [](auto value) { std::cout << value << std::endl; };

  std::variant<int, std::string> value{};
  std::visit(Print, value);
  value = "Hello, variant!";
  std::visit(Print, value);
  value = 42;
  std::visit(Print, value);
}
```

Note how in this example we use `auto` for a type of our `value` in a lambda. This `auto` will become different types depending on which type is actually stored in a variant and the whole example works here because `std::cout` is able to accept any of the types we use here.

Such almost automatic type selection might seem magical, but, as always, it is nothing but a clever implementation. The exact details of how `std::visit` is implemented are probably beyond the scope of today's lecture, but we can quote cppreference.com to get the gist of how the appropriate function is selected when `std::visit` is called:

> Implementations usually generate a table equivalent to a possibly multidimensional array of function pointers for every specialization of `std::visit`, which is similar to the implementation of virtual functions.
> On typical implementations, the time complexity of the invocation of the callable can be considered equal to that of access to an element in a possibly multidimensional array or execution of a switch statement.

That is to say: selecting the right function is usually pretty fast but still takes *some* tiny amount of time **at runtime**. And the more different `std::visit` calls there are the slower every call will become.

But the main thing here is that with this tiny example we *did* implement dynamic polymorphism that still lets us use value semantics (and even built-in types)! 🎉

### All paths must be covered

One important pitfall of `std::visit` that I see many beginners fall into, is that we need to ensure that *all* the types in a variant are covered in the function object we provide into the `std::visit`. The code won't compile otherwise.

This might seem confusing at the beginning: why do we have to cover cases that we never aim to use? However, the reason why it was designed this way becomes easier to see if we look at a slightly more complex example.

Imagine for a moment that we have a class `Foo` that holds some `std::variant` member variable and a function `Print`. Let's say the declaration of this class lives in a `foo.hpp` file:

`foo.hpp`
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` variant/foo.hpp
-->
```cpp
#pragma once

#include <variant>

// Using struct for simplicity here.
struct Foo {
    void Print() const;

    std::variant<int, double> value{};
};

```

We implement its `Print` function in a corresponding `foo.cpp` file and, because we want to print the value stored in a `std::variant` we need to use `std::visit` with, say, `BadPrinter` function object passed to it. We call it "bad" because this particular printer class does not handle all of the types that we can store in our variant:

`foo.cpp`
<!--
`CPP_SKIP_SNIPPET`
-->
```cpp
#include "foo.hpp"

#include <iostream>
#include <variant>

namespace {

// ❌ Won't compile. Does not handle double.
struct BadPrinter {
    void operator()(int value) const {
        std::cout << "Integer: " << value << '\n';
    }
};

}  // namespace


void Foo::Print() const { std::visit(BadPrinter{}, value); }
```

If we try to compile this code we won't succeed with an error that says something along the lines of not being able to find a "matching function for call to `invoke(BadPrinter, const std::string&)`". This happens because the compiler wants us to cover *all* the types of our variant in the `BadPrinter` class.

<details>
<summary>Approximate error message</summary>

```output
In file included from <source>:1:
/cefs/22/22e6cdc013c8541ce3d1548e_consolidated/compilers_c++_x86_gcc_15.2.0/include/c++/15.2.0/variant: In instantiation of 'constexpr bool std::__detail::__variant::__check_visitor_results(std::index_sequence<_Ind ...>) [with _Visitor = BadPrinter; _Variant = const std::variant<int, std::__cxx11::basic_string<char, std::char_traits<char>, std::allocator<char> > >&; long unsigned int ..._Idxs = {0, 1}; std::index_sequence<_Ind ...> = std::integer_sequence<long unsigned int, 0, 1>]':
/cefs/22/22e6cdc013c8541ce3d1548e_consolidated/compilers_c++_x86_gcc_15.2.0/include/c++/15.2.0/variant:1944:44:   required from 'constexpr std::__detail::__variant::__visit_result_t<_Visitor, _Variants ...> std::visit(_Visitor&&, _Variants&& ...) [with _Visitor = BadPrinter; _Variants = {const variant<int, __cxx11::basic_string<char, char_traits<char>, allocator<char> > >&}; __detail::__variant::__visit_result_t<_Visitor, _Variants ...> = void]'
 1943 |           constexpr bool __visit_rettypes_match = __detail::__variant::
      |                                                   ~~~~~~~~~~~~~~~~~~~~~
 1944 |             __check_visitor_results<_Visitor, _Vp>(
      |             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^
 1945 |               make_index_sequence<variant_size_v<remove_reference_t<_Vp>>>());
      |               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
<source>:19:37:   required from here
   19 | void Foo::Print() const { std::visit(BadPrinter{}, value); }
      |                           ~~~~~~~~~~^~~~~~~~~~~~~~~~~~~~~
/cefs/22/22e6cdc013c8541ce3d1548e_consolidated/compilers_c++_x86_gcc_15.2.0/include/c++/15.2.0/variant:1129:14: error: no type named 'type' in 'struct std::invoke_result<BadPrinter, const std::__cxx11::basic_string<char, std::char_traits<char>, std::allocator<char> >&>'
 1129 |       return __same_types<
      |              ^~~~~~~~~~~~~
 1130 |         invoke_result_t<_Visitor, __get_t<_Idxs, _Variant>>...
      |         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 1131 |         >;
      |         ~
/cefs/22/22e6cdc013c8541ce3d1548e_consolidated/compilers_c++_x86_gcc_15.2.0/include/c++/15.2.0/variant: In instantiation of 'constexpr std::__detail::__variant::__visit_result_t<_Visitor, _Variants ...> std::visit(_Visitor&&, _Variants&& ...) [with _Visitor = BadPrinter; _Variants = {const variant<int, __cxx11::basic_string<char, char_traits<char>, allocator<char> > >&}; __detail::__variant::__visit_result_t<_Visitor, _Variants ...> = void]':
<source>:19:37:   required from here
   19 | void Foo::Print() const { std::visit(BadPrinter{}, value); }
      |                           ~~~~~~~~~~^~~~~~~~~~~~~~~~~~~~~
/cefs/22/22e6cdc013c8541ce3d1548e_consolidated/compilers_c++_x86_gcc_15.2.0/include/c++/15.2.0/variant:1948:29: error: non-constant condition for static assertion
 1948 |               static_assert(__visit_rettypes_match,
      |                             ^~~~~~~~~~~~~~~~~~~~~~
/cefs/22/22e6cdc013c8541ce3d1548e_consolidated/compilers_c++_x86_gcc_15.2.0/include/c++/15.2.0/variant: In instantiation of 'static constexpr decltype(auto) std::__detail::__variant::__gen_vtable_impl<std::__detail::__variant::_Multi_array<_Result_type (*)(_Visitor, _Variants ...)>, std::integer_sequence<long unsigned int, __indices ...> >::__visit_invoke(_Visitor&&, _Variants ...) [with _Result_type = std::__detail::__variant::__deduce_visit_result<void>; _Visitor = BadPrinter&&; _Variants = {const std::variant<int, std::__cxx11::basic_string<char, std::char_traits<char>, std::allocator<char> > >&}; long unsigned int ...__indices = {1}]':
/cefs/22/22e6cdc013c8541ce3d1548e_consolidated/compilers_c++_x86_gcc_15.2.0/include/c++/15.2.0/variant:1892:5:   required from 'constexpr decltype(auto) std::__do_visit(_Visitor&&, _Variants&& ...) [with _Result_type = __detail::__variant::__deduce_visit_result<void>; _Visitor = BadPrinter; _Variants = {const variant<int, __cxx11::basic_string<char, char_traits<char>, allocator<char> > >&}]'
 1892 |                   _GLIBCXX_VISIT_CASE(1)
      |                   ^~~~~~~~~~~~~~~~~~~
/cefs/22/22e6cdc013c8541ce3d1548e_consolidated/compilers_c++_x86_gcc_15.2.0/include/c++/15.2.0/variant:1954:34:   required from 'constexpr std::__detail::__variant::__visit_result_t<_Visitor, _Variants ...> std::visit(_Visitor&&, _Variants&& ...) [with _Visitor = BadPrinter; _Variants = {const variant<int, __cxx11::basic_string<char, char_traits<char>, allocator<char> > >&}; __detail::__variant::__visit_result_t<_Visitor, _Variants ...> = void]'
 1954 |             return std::__do_visit<_Tag>(
      |                    ~~~~~~~~~~~~~~~~~~~~~^
 1955 |               std::forward<_Visitor>(__visitor),
      |               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 1956 |               static_cast<_Vp>(__variants)...);
      |               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
<source>:19:37:   required from here
   19 | void Foo::Print() const { std::visit(BadPrinter{}, value); }
      |                           ~~~~~~~~~~^~~~~~~~~~~~~~~~~~~~~
/cefs/22/22e6cdc013c8541ce3d1548e_consolidated/compilers_c++_x86_gcc_15.2.0/include/c++/15.2.0/variant:1055:31: error: no matching function for call to '__invoke(BadPrinter, const std::__cxx11::basic_string<char>&)'
 1055 |           return std::__invoke(std::forward<_Visitor>(__visitor),
      |                  ~~~~~~~~~~~~~^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 1056 |               __element_by_index_or_cookie<__indices>(
      |               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 1057 |                 std::forward<_Variants>(__vars))...);
      |                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/cefs/22/22e6cdc013c8541ce3d1548e_consolidated/compilers_c++_x86_gcc_15.2.0/include/c++/15.2.0/variant:1055:31: note: there is 1 candidate
In file included from /cefs/22/22e6cdc013c8541ce3d1548e_consolidated/compilers_c++_x86_gcc_15.2.0/include/c++/15.2.0/variant:47:
/cefs/22/22e6cdc013c8541ce3d1548e_consolidated/compilers_c++_x86_gcc_15.2.0/include/c++/15.2.0/bits/invoke.h:92:5: note: candidate 1: 'template<class _Callable, class ... _Args> constexpr typename std::__invoke_result<_Functor, _ArgTypes>::type std::__invoke(_Callable&&, _Args&& ...)'
   92 |     __invoke(_Callable&& __fn, _Args&&... __args)
      |     ^~~~~~~~
/cefs/22/22e6cdc013c8541ce3d1548e_consolidated/compilers_c++_x86_gcc_15.2.0/include/c++/15.2.0/bits/invoke.h:92:5: note: template argument deduction/substitution failed:
/cefs/22/22e6cdc013c8541ce3d1548e_consolidated/compilers_c++_x86_gcc_15.2.0/include/c++/15.2.0/bits/invoke.h: In substitution of 'template<class _Callable, class ... _Args> constexpr typename std::__invoke_result<_Functor, _ArgTypes>::type std::__invoke(_Callable&&, _Args&& ...) [with _Callable = BadPrinter; _Args = {const std::__cxx11::basic_string<char, std::char_traits<char>, std::allocator<char> >&}]':
/cefs/22/22e6cdc013c8541ce3d1548e_consolidated/compilers_c++_x86_gcc_15.2.0/include/c++/15.2.0/variant:1055:24:   required from 'static constexpr decltype(auto) std::__detail::__variant::__gen_vtable_impl<std::__detail::__variant::_Multi_array<_Result_type (*)(_Visitor, _Variants ...)>, std::integer_sequence<long unsigned int, __indices ...> >::__visit_invoke(_Visitor&&, _Variants ...) [with _Result_type = std::__detail::__variant::__deduce_visit_result<void>; _Visitor = BadPrinter&&; _Variants = {const std::variant<int, std::__cxx11::basic_string<char, std::char_traits<char>, std::allocator<char> > >&}; long unsigned int ...__indices = {1}]'
 1055 |           return std::__invoke(std::forward<_Visitor>(__visitor),
      |                  ~~~~~~~~~~~~~^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 1056 |               __element_by_index_or_cookie<__indices>(
      |               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 1057 |                 std::forward<_Variants>(__vars))...);
      |                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/cefs/22/22e6cdc013c8541ce3d1548e_consolidated/compilers_c++_x86_gcc_15.2.0/include/c++/15.2.0/variant:1892:5:   required from 'constexpr decltype(auto) std::__do_visit(_Visitor&&, _Variants&& ...) [with _Result_type = __detail::__variant::__deduce_visit_result<void>; _Visitor = BadPrinter; _Variants = {const variant<int, __cxx11::basic_string<char, char_traits<char>, allocator<char> > >&}]'
 1892 |                   _GLIBCXX_VISIT_CASE(1)
      |                   ^~~~~~~~~~~~~~~~~~~
/cefs/22/22e6cdc013c8541ce3d1548e_consolidated/compilers_c++_x86_gcc_15.2.0/include/c++/15.2.0/variant:1954:34:   required from 'constexpr std::__detail::__variant::__visit_result_t<_Visitor, _Variants ...> std::visit(_Visitor&&, _Variants&& ...) [with _Visitor = BadPrinter; _Variants = {const variant<int, __cxx11::basic_string<char, char_traits<char>, allocator<char> > >&}; __detail::__variant::__visit_result_t<_Visitor, _Variants ...> = void]'
 1954 |             return std::__do_visit<_Tag>(
      |                    ~~~~~~~~~~~~~~~~~~~~~^
 1955 |               std::forward<_Visitor>(__visitor),
      |               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 1956 |               static_cast<_Vp>(__variants)...);
      |               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
<source>:19:37:   required from here
   19 | void Foo::Print() const { std::visit(BadPrinter{}, value); }
      |                           ~~~~~~~~~~^~~~~~~~~~~~~~~~~~~~~
/cefs/22/22e6cdc013c8541ce3d1548e_consolidated/compilers_c++_x86_gcc_15.2.0/include/c++/15.2.0/bits/invoke.h:92:5: error: no type named 'type' in 'struct std::__invoke_result<BadPrinter, const std::__cxx11::basic_string<char, std::char_traits<char>, std::allocator<char> >&>'
   92 |     __invoke(_Callable&& __fn, _Args&&... __args)
      |     ^~~~~~~~
Compiler returned: 1
```

</details>

To understand why the compiler insists on it, let us for a moment assume that it *would* be allowed to compile this code into a library without covering all the variant types in the provided function object.

In that case, there will be no way for the compiled library binary file to handle the missing `std::string` type as the binary code for this would never be generated.

Now imagine what would happen if at some point down the line someone would write an executable, link it to our code, try to store a `std::string` in the variant, and call `Print` on our `foo` object!

<!--
`CPP_SETUP_START`
#include "foo.hpp"

#include <iostream>
#include <variant>

namespace {

struct Printer {
    void operator()(int value) const {
        std::cout << "Integer: " << value << '\n';
    }
    void operator()(const std::string& value) const {
        std::cout << "String: " << value << '\n';
    }
};

}  // namespace

void Foo::Print() const { std::visit(Printer{}, value); }
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` variant/main.cpp
`CPP_RUN_CMD` CWD:variant c++ -std=c++17 main.cpp
-->
```cpp
#include "foo.hpp"

int main() {
    Foo foo{};
    foo.value = "Hello, variant!";
    foo.Print();
}
```

The behavior of this code would be undefined as our library's binary file would have no idea about how to print a string stored in the variant of the `Foo` class object.

To the degree of my understanding this is *the* reason why the standard requires a function object passed into `std::visit` to be able to handle all the types that can be stored inside of a given `std::variant` object.

## `std::monostate`

One last thing to cover about `std::variant` is a special type `std::monostate` that we sometimes see used as the first type of its type list.

As I mentioned before, when we create a variable of a variant type, by default, a default value of the first type in its type list is stored as a value of our variable. This might not always be desirable or, indeed, even possible. Imagine that we store only types that do not have a default constructor in the first place.

<!--
`CPP_SKIP_SNIPPET`
-->
```cpp
// ❌ Can't compile if first type is not default constructible.
std::variant<NonDefaultConstructibleType, OtherCustomType> v;
```

For this purpose there is a type `std::monostate` in the standard library. This is an empty type that is default constructible and we can define our variant type using `std::monostate` as its first type in the list should we want our variant to hold no value by default:

<!--
`CPP_SETUP_START`
#include <variant>
using SomeType = int;
using SomeOtherType = double;
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` variant_monostate/main.cpp
`CPP_RUN_CMD` CWD:variant_monostate c++ -std=c++17 -c main.cpp
-->
```cpp
std::variant<std::monostate, SomeType, SomeOtherType> value{};
// value holds an instance of std::monostate now.
```

Note that it probably means that we'll need to differentiate between our variant holding the `std::monostate` value or some other value in the `std::visit` that we will inevitably use at a later point in time.

## Use it with an `std::vector`

And this brings us back to our original example. We now know that declaring `Image` to be a variant allows us to store any kind of image in a vector of `Image`s.

At the same time, the use of `std::visit` with a tiny lambda allows us to call `Save` on any concrete image class, thus achieving dynamic polymorphism keeping our value semantics completely intact:

```cpp
#include <iostream>
#include <string>
#include <variant>
#include <vector>

struct PngImage {
  void Save(const std::string& file_name) const {
    std::cout << "Saving " << file_name << ".png\n";
  }
  // Some private image data would go here.
};

struct JpegImage {
  void Save(const std::string& file_name) const {
    std::cout << "Saving " << file_name << ".jpg\n";
  }
  // Some private image data would go here.
};

using Image = std::variant<PngImage, JpegImage>;

void SaveImage(const Image& image, const std::string& file_name) {
  std::visit([&](const auto& img) { img.Save(file_name); }, image);
}

int main() {
  const std::vector<Image> images = {PngImage{}, JpegImage{}};
  for (const auto& image : images) SaveImage(image, "output");
}
```

<!-- TODO: add part about overloaded -->

## **Summary**

Overall, `std::variant` is extremely important for modern C++. If we embrace value semantics and implement our code largely using templates or concepts and need to enable dynamic polymorphism based on some values provided at runtime, there is probably no way around using `std::variant`. Which also means that we probably also need to use `std::visit`.

For whatever reason, these tools are still not considered first-class citizens when C++ is taught in schools and universities, which *is* a shame. I hope that after this lecture, you'll be able to embrace the power that these tools provide and be better informed about the options you have when in need of implementing dynamic polymorphism in modern C++.
