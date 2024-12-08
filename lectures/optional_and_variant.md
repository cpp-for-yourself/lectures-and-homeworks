
`std::variant` in Modern C++
--

<p align="center">
  <a href="https://youtu.be/dummy_link"><img src="https://img.youtube.com/vi/dummy_link/maxresdefault.jpg" alt="Video Thumbnail" align="right" width=50% style="margin: 0.5rem"></a>
</p>

In the last lecture we talked about `std::optional` and `std::expected` types that make our life better. It might be useful to understand _how_ they can store two values of different types in the same memory. We can get a glimpse into this by understanding how `std::variant` works. Furthermore, we can store many more types than two in it. This, incidentally also happens to be the key to mimicking dynamic polymorphism when using templates.

<!-- Intro -->

## Why use `std::variant`?

`std::variant` is a type-safe `union` type introduced in C++17. It allows a variable to hold one value out of a defined set of types.

For instance, if a variable can hold either an integer or a string, you can use `std::variant<int, std::string>` and put any value in it:
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

### How `std::variant` is used in practice?
While cool already, the current tiny example might feel quite limited. Think about it, we somehow have to _know_ which type our `std::variant` holds to use it. Which almost feels like it defeats the purpose. And to a degree it does.

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
    std::variant<int, std::string> value = "Hello, Variant!";
    std::visit(Printer{}, value);
    value = 42;
    std::visit(Printer{}, value);
}
```
Here, `std::visit` applies a [function object](lambdas.md#before-lambdas-we-had-function-objects-or-functors) to the value contained in the variant. Should our variant hold a string, the operator that accepts a string is called and should it hold an integer instead, the operator that accepts an integer is called instead.

Note, that a typical pitfall that beginners make is to forget that all of the checks for this code happen at compile time without taking into account the runtime logic of our code.

If, for example, we would change our `Printer` function object to a `LengthPrinter` function object that only knows how to print length of objects, our code will not compile even though we only ever actually store an `std::string` in our variant:
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
This happens because the compiler must guarantee that all the code paths compile because it does not know which other code might be called. This might happen if some dynamic library gets linked to our code after it gets compiled. If that dynamic library actually stores an `int` in our variant the compiled code must know how to deal with it.

Many people find this confusing and get burned by this at least a couple of times until it becomes very intuitive and please remember that it just takes time.

## `std::monostate`
Whenever we create a new `std::variant` object we actually initialize it to storing some uninitialized value of the type that is first in the list of types that the variant can store. Sometimes it might be undesirable and we want the variant to be initialized in an "empty" state. For this purpose there is a type `std::monostate` in the standard library and we can define our variant type using `std::monostate` as its first type in the list.
```cpp
std::variant<std::monostate, SomeType, SomeOtherType> value{};
// value holds an instance of std::monostate now.
```

Note that it probably means that we'll need to differentiate between our variant holding the `std::monostate` value or some other value in the `std::visit` that we will inevitably use at a later point in time.


## **Summary**

Overall, `std::variant` is extremely important for modern C++. If we implement our code largely using templates or concepts and need to enable polymorphic behavior based on some values provided at runtime, there is probably no way for us to avoid using it. Which also means that we probably also will need to use `std::visit`. These things might well be confusing from the get go but after we've looked into how function objects and lambdas work we should have no issues using all of this machinery.
