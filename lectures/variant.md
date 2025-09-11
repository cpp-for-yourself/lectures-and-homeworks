
`std::variant` in Modern C++
--

<p align="center">
  <a href="https://youtu.be/dummy_link"><img src="https://img.youtube.com/vi/dummy_link/maxresdefault.jpg" alt="Video Thumbnail" align="right" width=50% style="margin: 0.5rem"></a>
</p>

In the last lecture we talked about `std::optional` and `std::expected` types that make our life better when we want to handle errors. Both of these types can store multiple values in the same memory. It might be useful to understand _how_ they can store two values of different types in the same memory. We can get a glimpse into this by understanding how `std::variant` works. Furthermore, we can store many more types than two in it.

But, probably even more importantly, `std::variant` also happens to be the key to achieving a form of dynamic polymorphism when using templates.

<!-- Intro -->

## Why use `std::variant`?

`std::variant` is a type-safe `union` type introduced in C++17. It allows a variable to hold one value out of a defined set of types.

For instance, if a variable can hold either an integer or a string, we can use `std::variant<int, std::string>` and put any value in it:

```cpp
#include <variant>
#include <iostream>
#include <string>

int main() {
  // This compiles
  std::variant<int, std::string> value;
  value = 42;   // value holds an int.
  std::cout << "Integer: " << std::get<int>(value) << '\n';
  value = "42"  // value now holds a string.
  std::cout << "String: " << std::get<std::string>(value) << '\n';
  return 0;
}
```

Do note though, that once we put one type into variant, `get`ting another type is undefined behavior, so don't do that.

<!-- TODO: talk about memory? -->

<!-- Can we store more than one same type? -->

## How `std::variant` is used in practice?

While cool already, the current tiny example might feel quite limited. Think about it, we somehow have to _know_ which type our `std::variant` holds to use it. Which almost feels like it defeats the purpose. And, well, it does. If we need to know the type we want to use at compile time, we could as well just use that type and not bother with `std::variant` at all.

But we should not despair, this is C++ after all, there are options for us to use to make sure that we can work with _any_ type that the variant holds. This option is to use a visitor pattern through the use of the `std::visit` function:

```cpp
#include <variant>
#include <iostream>
#include <string>

struct Printer {
  void operator(int value) const {
    std::cout << "Integer: " << value << '\n';
  }
  void operator(const std::string& value) const {
    std::cout << "String: " << value << '\n';
  }
};

int main() {
  const Printer printer{};
  std::variant<int, std::string> value = "Hello, Variant!";
  std::visit(printer, value);
  value = 42;
  std::visit(printer, value);
}
```

Here, `std::visit` applies a [function object](lambdas.md#before-lambdas-we-had-function-objects-or-functors) to the value contained in the variant. Should our variant hold a string, the operator that accepts a string is called and should it hold an integer, the operator that accepts an integer is called instead.

<!-- Talk about it all happening at runtime and the cost -->

Note, that a typical pitfall that beginners make is to forget that all of the checks for this code happen at compile time _without taking into account the runtime logic of our code_.

<!-- TODO: change the below to just drop one operator from `Printer` -->
If, for example, we would change our `Printer` function object to a `LengthPrinter` function object that only knows how to print length of objects, our code would not compile even though we only ever actually store a `std::string` in our variant:

```cpp
#include <variant>
#include <iostream>
#include <string>

struct LengthPrinter {
  void operator(const std::string& value) const {
    std::cout << "String length: " << value.size() << '\n';
  }
};

int main() {
  // ❌ Does not compile!
  std::variant<int, std::string> value = "Hello, Variant!";
  std::visit(LengthPrinter{}, value);
}
```

This _is_ confusing. It might seem strange that we have to cover a case that we never aim to use. However, the reason why it was designed the way it was designed becomes easier to see if we look at a slightly more complex example.

Imagine that our `variant` is part of some class `Foo` that we design. The header file `foo.hpp` contains a declaration of our `Foo` class with a function `Print`:

`foo.hpp`

```cpp
#pragma once

#include <string>
#include <variant>

// Using struct for simplicity here.
struct Foo {
    void Print() const;

    std::variant<int, std::string> value{};
};

```

We implement this `Print` function in a corresponding `foo.cpp` file and, because we want to print the value stored in a `std::variant` we need to use `std::visit` with, say, `BadPrinter` function object passed to it. We call it "bad" because it does not handle all of the types in our variant.

`foo.cpp`

```cpp
#include "foo.hpp"

#include <iostream>
#include <string>
#include <variant>

namespace {

// 😱 Does not handle std::string.
struct BadPrinter {
    void operator()(int value) const {
        std::cout << "Integer: " << value << '\n';
    }
};

}  // namespace


void Foo::Print() const { std::visit(BadPrinter{}, value); }

```

If we try to compile this code it won't - the compiler wants us to cover all the types of our variant in the `BadPrinter` class. However, let us for a moment assume that it _would_ be allowed by the standard and we would be able to compile this code into a library.

In that case, the code that we compile would be generated and stored in our library binary file. Without the code for handling `std::string` in `BadPrinter` that is.

Now imagine what would happen if at some point down the line someone would write an executable, link it to our code, try to store a `std::string` in the variant, and call `Print` on our `foo` object!

```cpp
#include "foo.hpp"

int main() {
    Foo foo{};
    foo.value = "Some string";
    foo.Print();
}
```

The behavior of this code would be undefined as our library's binary file would have no way to print a string stored in the variant inside the `Foo` class.

To the degree of my understanding this is the reason why the standard requires a function object passed into `std::visit` to be able to handle all the types that can be stored inside of a given `std::variant` object.

## Use it with an `std::vector`

Now with that out of the way, I want to talk about arguably the most important thing that `std::visit` allows us to do with `std::variant`. You see, we can now have a **vector of variants**.

Think about [dynamic polymorphism](inheritance.md#simple-polymorphic-class-example-following-best-practices) that we talked about before. The coolest thing about it was our ability to put multiple pointers to some interface class into a vector and then work with them without regard of which concrete type we're using. Here, with variant, we can do a very similar thing!

```cpp
#include <iostream>
#include <string>
#include <variant>
#include <vector>

struct Printer {
    void operator()(int v) const { std::cout << "int: " << v << '\n'; }
    void operator()(float v) const { std::cout << "float: " << v << '\n'; }
    void operator()(const std::string& v) const {std::cout << "str: " << v << '\n';}
};

int main() {
    std::vector<std::variant<int, float, std::string>> stuff{};
    stuff.emplace_back(42);
    stuff.emplace_back(42.42F);
    stuff.emplace_back("Some string");
    const Printer printer{};
    for (const auto& element : stuff) {
        std::visit(printer, element);
    }
}
```

We get to store any type from the allowed list of types and then we can process them in a uniform way using the `std::visit` pattern. Note that all of these values are set at runtime! This means that we can set these values from user input or from reading some file etc. And so we achieve dynamic polymorphism while using strong types and templated code.

## `std::monostate`

One last thing to cover about `std::variant` is a caveat that this type has. When we create a variable of this type, by default, a default value of the first type in its type list is stored. This might not always be desirable or, indeed, even possible. Imagine that we store only types that do not have a default constructor in the first place.

For this purpose there is a type `std::monostate` in the standard library. This is an empty type that is default constructible and we can define our variant type using `std::monostate` as its first type in the list should we want our variant to hold no value by default:

```cpp
std::variant<std::monostate, SomeType, SomeOtherType> value{};
// value holds an instance of std::monostate now.
```

Note that it probably means that we'll need to differentiate between our variant holding the `std::monostate` value or some other value in the `std::visit` that we will inevitably use at a later point in time.

## **Summary**

Overall, `std::variant` is extremely important for modern C++. If we implement our code largely using templates or concepts and need to enable dynamic polymorphism based on some values provided at runtime, there is probably no way around using `std::variant`. Which also means that we probably also need to use `std::visit`. These things might well be confusing from the get go but I hope that the explanations that we've covered just now will suffice to break the ice and using `std::variant` and `std::visit` in actual code will clear up any remaining issues.
